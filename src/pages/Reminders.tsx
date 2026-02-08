/**
 * @fileoverview Reminders page - Centralized view of all actionable items
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Reminders.css'

const client = generateClient<Schema>()

type ReminderType = 'maintenance' | 'warranty' | 'contract' | 'registration'

interface ReminderItem {
    id: string
    title: string
    dueDate: string
    type: ReminderType
    status: 'overdue' | 'due_soon' | 'upcoming'
    assetName: string
    details: string
    cost?: number
}

export default function Reminders() {
    const [reminders, setReminders] = useState<ReminderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        fetchReminders()
    }, [])

    const fetchReminders = async () => {
        try {
            // Parallel fetch of all potentially actionable items
            const [tasksData, warrantiesData, contractsData, assetsData] = await Promise.all([
                client.models.MaintenanceTask.list({}),
                client.models.Warranty.list({}),
                client.models.ServiceContract.list({}),
                client.models.Asset.list({}),
            ])

            const assetsMap = new Map(assetsData.data.map(a => [a.id, a.name]))
            const getAsset = (id?: string) => id ? assetsMap.get(id) || 'Unknown Asset' : 'General'

            const allReminders: ReminderItem[] = []
            const now = new Date()
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(now.getDate() + 30)

            // Process Maintenance Tasks
            tasksData.data.forEach((task: any) => {
                if (!task.isActive || !task.nextDueDate) return

                const dueDate = new Date(task.nextDueDate)
                let status: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'

                if (dueDate < now) status = 'overdue'
                else if (dueDate <= thirtyDaysFromNow) status = 'due_soon'
                else return // Skip tasks far in the future for this view

                allReminders.push({
                    id: task.id,
                    title: task.taskName,
                    dueDate: task.nextDueDate,
                    type: 'maintenance',
                    status,
                    assetName: getAsset(task.assetId),
                    details: task.description || 'Routine maintenance',
                    cost: task.estimatedCost
                })
            })

            // Process Warranties (Expirations)
            warrantiesData.data.forEach((warranty: any) => {
                if (!warranty.isActive || !warranty.endDate) return

                const endDate = new Date(warranty.endDate)
                let status: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'

                if (endDate < now) status = 'overdue' // Actually means expired
                else if (endDate <= thirtyDaysFromNow) status = 'due_soon'
                else return

                allReminders.push({
                    id: warranty.id,
                    title: `${warranty.warrantyName} Expiry`,
                    dueDate: warranty.endDate,
                    type: 'warranty',
                    status: status === 'overdue' ? 'overdue' : 'due_soon', // Expired is "overdue" for action
                    assetName: 'Linked Asset', // TODO: Fetch linked asset properly
                    details: `Provider: ${warranty.provider}`,
                })

                // Also check registration deadlines
                if (warranty.registrationStatus === 'registration_required' && warranty.registrationDeadline) {
                    const regDate = new Date(warranty.registrationDeadline)
                    let regStatus: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'

                    if (regDate < now) regStatus = 'overdue'
                    else if (regDate <= thirtyDaysFromNow) regStatus = 'due_soon'

                    if (regStatus !== 'upcoming') {
                        allReminders.push({
                            id: `${warranty.id}_reg`,
                            title: `Register ${warranty.warrantyName}`,
                            dueDate: warranty.registrationDeadline,
                            type: 'registration',
                            status: regStatus,
                            assetName: 'Linked Asset',
                            details: 'Registration required to activate warranty',
                        })
                    }
                }
            })

            // Process Contracts (Renewals)
            contractsData.data.forEach((contract: any) => {
                if (!contract.isActive || !contract.endDate) return

                const endDate = new Date(contract.endDate)
                let status: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming'

                if (endDate < now) status = 'overdue' // Expired
                else if (endDate <= thirtyDaysFromNow) status = 'due_soon'
                else return

                allReminders.push({
                    id: contract.id,
                    title: `${contract.contractName} Renewal`,
                    dueDate: contract.endDate,
                    type: 'contract',
                    status: status === 'overdue' ? 'overdue' : 'due_soon',
                    assetName: 'Linked Asset',
                    details: `Provider: ${contract.provider}. ${contract.autoRenew ? 'Auto-renews' : 'Manual renewal required'}`,
                    cost: contract.annualCost || contract.monthlyPayment
                })
            })

            // Sort by due date (ascending)
            allReminders.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

            setReminders(allReminders)
        } catch (error) {
            console.error('Error fetching reminders:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredReminders = filter === 'all'
        ? reminders
        : reminders.filter(r => r.type === filter)

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'maintenance': return '🔧'
            case 'warranty': return '🛡️'
            case 'contract': return '📄'
            case 'registration': return '📝'
            default: return '🔔'
        }
    }



    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'overdue': return <span className="badge badge-error">Attribute: Overdue</span>
            case 'due_soon': return <span className="badge badge-warning">Due Soon</span>
            case 'upcoming': return <span className="badge badge-info">Upcoming</span>
            default: return null
        }
    }

    return (
        <Layout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Smart Reminders</h1>
                        <p className="page-subtitle">Stay on top of maintenance, renewals, and deadlines</p>
                    </div>
                </div>

                <div className="filters-bar">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setFilter('maintenance')}
                    >
                        Maintenance
                    </button>
                    <button
                        className={`filter-btn ${filter === 'warranty' ? 'active' : ''}`}
                        onClick={() => setFilter('warranty')}
                    >
                        Warranties
                    </button>
                    <button
                        className={`filter-btn ${filter === 'contract' ? 'active' : ''}`}
                        onClick={() => setFilter('contract')}
                    >
                        Contracts
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Scanning for actionable items...</p>
                    </div>
                ) : filteredReminders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h3>You're all caught up!</h3>
                        <p>No upcoming maintenance tasks, warranty expirations, or contract renewals found for the next 30 days.</p>
                    </div>
                ) : (
                    <div className="reminders-list">
                        {filteredReminders.map((reminder) => (
                            <div key={reminder.id} className={`reminder-card card ${reminder.status}`}>
                                <div className="reminder-icon-col">
                                    <div className={`reminder-icon-bg ${reminder.type}`}>
                                        {getTypeIcon(reminder.type)}
                                    </div>
                                </div>
                                <div className="reminder-content">
                                    <div className="reminder-header-row">
                                        <div className="reminder-title-group">
                                            <h3>{reminder.title}</h3>
                                            <span className="reminder-asset">for {reminder.assetName}</span>
                                        </div>
                                        <div className="reminder-status-group">
                                            {getStatusBadge(reminder.status)}
                                            <span className="reminder-date">
                                                {new Date(reminder.dueDate).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="reminder-details">{reminder.details}</p>

                                    <div className="reminder-footer">
                                        {reminder.cost && (
                                            <span className="reminder-cost">
                                                Estimated Cost: <strong>${reminder.cost.toFixed(2)}</strong>
                                            </span>
                                        )}
                                        <div className="reminder-actions">
                                            <button className="btn btn-primary btn-sm">
                                                {reminder.type === 'maintenance' ? 'Log Service' :
                                                    reminder.type === 'registration' ? 'Register Now' :
                                                        reminder.type === 'contract' ? 'Renew' : 'View Details'}
                                            </button>
                                            <button className="btn btn-ghost btn-sm">Dismiss</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}
