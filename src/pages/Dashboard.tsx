/**
 * @fileoverview Dashboard - Main overview page
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import './Dashboard.css'

const client = generateClient<Schema>()

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalAssets: 0,
        healthyAssets: 0,
        attentionAssets: 0,
        criticalAssets: 0,
        upcomingMaintenance: 0,
        overdueTask: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [assetsData, tasksData] = await Promise.all([
                client.models.Asset.list({}),
                client.models.MaintenanceTask.list({}),
            ])

            const assets = assetsData.data
            const tasks = tasksData.data

            const now = new Date()

            // Calculate upcoming tasks (due in next 30 days)
            const upcomingTasks = tasks.filter((t: any) => {
                if (!t.nextDueDate || !t.isActive) return false
                const dueDate = new Date(t.nextDueDate)
                const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                return daysUntil >= 0 && daysUntil <= 30
            })

            // Calculate overdue tasks
            const overdueTasks = tasks.filter((t: any) => {
                if (!t.nextDueDate || !t.isActive) return false
                const dueDate = new Date(t.nextDueDate)
                // Check if due date is strictly in the past (yesterday or earlier)
                // We'll consider "today" as due, not overdue yet for UX friendliness
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                dueDate.setHours(0, 0, 0, 0)
                return dueDate < today
            })

            setStats({
                totalAssets: assets.length,
                healthyAssets: assets.filter(a => a.healthStatus === 'excellent' || a.healthStatus === 'good').length,
                attentionAssets: assets.filter(a => a.healthStatus === 'attention').length,
                criticalAssets: assets.filter(a => a.healthStatus === 'critical').length,
                upcomingMaintenance: upcomingTasks.length,
                overdueTask: overdueTasks.length,
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="page-subtitle">Welcome to ServiceTag</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Link to="/assets" className="stat-card stat-card-link">
                        <div className="stat-icon">🏠</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalAssets}</div>
                            <div className="stat-label">Total Assets</div>
                        </div>
                    </Link>

                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.healthyAssets}</div>
                            <div className="stat-label">Healthy</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🟡</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.attentionAssets}</div>
                            <div className="stat-label">Need Attention</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.criticalAssets}</div>
                            <div className="stat-label">Critical</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        <Link to="/assets" className="action-card card">
                            <div className="action-icon">🏠</div>
                            <h3>Add Asset</h3>
                            <p>Add a new asset to track</p>
                        </Link>

                        <Link to="/maintenance" className="action-card card">
                            <div className="action-icon">🔧</div>
                            <h3>Schedule Maintenance</h3>
                            <p>Set up maintenance tasks</p>
                        </Link>

                        <Link to="/warranties" className="action-card card">
                            <div className="action-icon">✅</div>
                            <h3>Add Warranty</h3>
                            <p>Register a warranty</p>
                        </Link>

                        <Link to="/documents" className="action-card card">
                            <div className="action-icon">📁</div>
                            <h3>Upload Document</h3>
                            <p>Store important files</p>
                        </Link>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="section">
                    <h2 className="section-title">What You Can Do</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🏠</div>
                            <h3>Asset Management</h3>
                            <p>Track all your assets in one place with detailed information and health monitoring</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔧</div>
                            <h3>Maintenance Tracking</h3>
                            <p>Never miss maintenance with automatic scheduling and smart reminders</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">✅</div>
                            <h3>Warranty Management</h3>
                            <p>Track warranties, registration deadlines, and never void coverage</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📄</div>
                            <h3>Service Contracts</h3>
                            <p>Manage service contracts and know what's covered before you pay</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📁</div>
                            <h3>Document Storage</h3>
                            <p>Store manuals, receipts, and important documents securely</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Cost Tracking</h3>
                            <p>Track maintenance costs and see where your money goes</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
