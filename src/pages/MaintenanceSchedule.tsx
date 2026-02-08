/**
 * @fileoverview Maintenance Schedule page - View all upcoming and overdue maintenance
 * @description Displays maintenance tasks grouped by status and asset with expandable/collapsible sections
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './MaintenanceSchedule.css'

const client = generateClient<Schema>()

type TaskStatus = 'overdue-required' | 'overdue-optional' | 'due-soon' | 'upcoming' | 'future'

interface TaskWithAsset {
    task: any
    asset: any
    status: TaskStatus
    daysUntilDue: number
    contractRequirement?: any
}

export default function MaintenanceSchedule() {
    const [tasks, setTasks] = useState<TaskWithAsset[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overdue-required', 'due-soon']))
    const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())

    // Filters
    const [filterAsset, setFilterAsset] = useState<string>('all')
    const [filterPriority, setFilterPriority] = useState<string>('all')
    const [filterTimeRange, setFilterTimeRange] = useState<string>('90')

    const [assets, setAssets] = useState<any[]>([])

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch all active maintenance tasks
            const tasksResponse = await client.models.MaintenanceTask.list({
                filter: { isActive: { eq: true } }
            })

            // Fetch all assets
            const assetsResponse = await client.models.Asset.list({})
            setAssets(assetsResponse.data || [])

            // Fetch contract requirements for each task
            const tasksWithData = await Promise.all(
                (tasksResponse.data || []).map(async (task) => {
                    // Get asset
                    let asset = null
                    if (task.assetId) {
                        const assetResponse = await client.models.Asset.get({ id: task.assetId })
                        asset = assetResponse.data
                    }

                    // Get contract requirement if exists
                    let contractRequirement = null
                    const reqResponse = await client.models.ContractRequirement.list({
                        filter: { maintenanceTaskId: { eq: task.id } }
                    })
                    if (reqResponse.data && reqResponse.data.length > 0) {
                        contractRequirement = reqResponse.data[0]
                    }

                    // Calculate status and days until due
                    const { status, daysUntilDue } = calculateTaskStatus(task)

                    return {
                        task,
                        asset,
                        status,
                        daysUntilDue,
                        contractRequirement
                    }
                })
            )

            setTasks(tasksWithData)
        } catch (error) {
            console.error('Error fetching maintenance schedule:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateTaskStatus = (task: any): { status: TaskStatus; daysUntilDue: number } => {
        if (!task.nextDueDate) {
            return { status: 'future', daysUntilDue: 999 }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.nextDueDate)
        dueDate.setHours(0, 0, 0, 0)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilDue < 0) {
            return {
                status: task.isRequired ? 'overdue-required' : 'overdue-optional',
                daysUntilDue
            }
        } else if (daysUntilDue <= 30) {
            return { status: 'due-soon', daysUntilDue }
        } else if (daysUntilDue <= 90) {
            return { status: 'upcoming', daysUntilDue }
        } else {
            return { status: 'future', daysUntilDue }
        }
    }

    const getFilteredTasks = () => {
        let filtered = tasks

        // Filter by asset
        if (filterAsset !== 'all') {
            filtered = filtered.filter(t => t.asset?.id === filterAsset)
        }

        // Filter by priority
        if (filterPriority === 'required') {
            filtered = filtered.filter(t => t.task.isRequired)
        } else if (filterPriority === 'high') {
            filtered = filtered.filter(t => t.task.priority === 'high' || t.task.isRequired)
        }

        // Filter by time range
        const timeRange = parseInt(filterTimeRange)
        if (timeRange > 0) {
            filtered = filtered.filter(t => t.daysUntilDue <= timeRange)
        }

        return filtered
    }

    const groupTasksByStatus = () => {
        const filtered = getFilteredTasks()

        return {
            'overdue-required': filtered.filter(t => t.status === 'overdue-required'),
            'overdue-optional': filtered.filter(t => t.status === 'overdue-optional'),
            'due-soon': filtered.filter(t => t.status === 'due-soon'),
            'upcoming': filtered.filter(t => t.status === 'upcoming'),
        }
    }

    const groupTasksByAsset = (tasksList: TaskWithAsset[]) => {
        const grouped: Record<string, TaskWithAsset[]> = {}

        tasksList.forEach(taskData => {
            const assetId = taskData.asset?.id || 'no-asset'
            if (!grouped[assetId]) {
                grouped[assetId] = []
            }
            grouped[assetId].push(taskData)
        })

        return grouped
    }

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const toggleAsset = (assetId: string) => {
        const newExpanded = new Set(expandedAssets)
        if (newExpanded.has(assetId)) {
            newExpanded.delete(assetId)
        } else {
            newExpanded.add(assetId)
        }
        setExpandedAssets(newExpanded)
    }

    const getStatusBadge = (status: TaskStatus) => {
        const badges = {
            'overdue-required': { icon: '🔴', text: 'OVERDUE', className: 'badge-error' },
            'overdue-optional': { icon: '🟠', text: 'Overdue', className: 'badge-warning' },
            'due-soon': { icon: '🟡', text: 'Due Soon', className: 'badge-warning' },
            'upcoming': { icon: '🟢', text: 'Upcoming', className: 'badge-success' },
            'future': { icon: '⚪', text: 'Scheduled', className: 'badge-info' },
        }
        const badge = badges[status]
        return <span className={`badge ${badge.className}`}>{badge.icon} {badge.text}</span>
    }

    const getPriorityBadge = (priority?: string) => {
        const badges = {
            'high': { icon: '🔴', className: 'badge-error' },
            'medium': { icon: '🟡', className: 'badge-warning' },
            'low': { icon: '🟢', className: 'badge-success' },
        }
        const badge = badges[priority || 'medium']
        return <span className={`badge ${badge.className}`}>{badge.icon} {priority || 'Medium'}</span>
    }

    const handleMarkComplete = async (_taskId: string) => {
        // TODO: Implement mark complete functionality
        alert('Mark complete functionality coming soon!')
    }

    const handleReschedule = async (_taskId: string) => {
        // TODO: Implement reschedule functionality
        alert('Reschedule functionality coming soon!')
    }

    const groupedTasks = groupTasksByStatus()
    const stats = {
        overdue: groupedTasks['overdue-required'].length,
        dueSoon: groupedTasks['due-soon'].length,
        upcoming: groupedTasks['upcoming'].length,
        optional: groupedTasks['overdue-optional'].length,
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Maintenance Schedule</h1>
                        <p className="page-subtitle">Track all upcoming and overdue maintenance tasks</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div
                        className="stat-card clickable"
                        onClick={() => {
                            setFilterTimeRange('0')
                            setFilterPriority('required')
                        }}
                    >
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.overdue}</div>
                            <div className="stat-label">Overdue</div>
                        </div>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => {
                            setFilterTimeRange('30')
                            setFilterPriority('all')
                        }}
                    >
                        <div className="stat-icon">🟡</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.dueSoon}</div>
                            <div className="stat-label">Due Soon</div>
                        </div>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => {
                            setFilterTimeRange('90')
                            setFilterPriority('all')
                        }}
                    >
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.upcoming}</div>
                            <div className="stat-label">Upcoming</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚪</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.optional}</div>
                            <div className="stat-label">Optional</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="schedule-filters">
                    <div className="filter-group">
                        <label htmlFor="filterAsset">Asset:</label>
                        <select
                            id="filterAsset"
                            className="input"
                            value={filterAsset}
                            onChange={(e) => setFilterAsset(e.target.value)}
                        >
                            <option value="all">All Assets</option>
                            {assets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="filterPriority">Priority:</label>
                        <select
                            id="filterPriority"
                            className="input"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="required">Required Only</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="filterTimeRange">Time Range:</label>
                        <select
                            id="filterTimeRange"
                            className="input"
                            value={filterTimeRange}
                            onChange={(e) => setFilterTimeRange(e.target.value)}
                        >
                            <option value="0">Overdue Only</option>
                            <option value="7">Next 7 Days</option>
                            <option value="30">Next 30 Days</option>
                            <option value="90">Next 90 Days</option>
                            <option value="999">All Upcoming</option>
                        </select>
                    </div>
                </div>

                {/* Schedule Content */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading maintenance schedule...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No maintenance tasks scheduled</h3>
                        <p>Add maintenance tasks to your assets to see them here</p>
                        <Link to="/assets" className="btn btn-primary">
                            Go to Assets
                        </Link>
                    </div>
                ) : (
                    <div className="schedule-sections">
                        {/* Overdue Required Section */}
                        {groupedTasks['overdue-required'].length > 0 && (
                            <div className="schedule-section section-critical">
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection('overdue-required')}
                                >
                                    <div className="section-title">
                                        <span className="section-icon">{expandedSections.has('overdue-required') ? '▼' : '▶'}</span>
                                        <h2>🔴 OVERDUE REQUIRED MAINTENANCE ({groupedTasks['overdue-required'].length})</h2>
                                    </div>
                                </div>

                                {expandedSections.has('overdue-required') && (
                                    <div className="section-content">
                                        {Object.entries(groupTasksByAsset(groupedTasks['overdue-required'])).map(([assetId, assetTasks]) => {
                                            const asset = assetTasks[0].asset
                                            const isExpanded = expandedAssets.has(assetId)

                                            return (
                                                <div key={assetId} className="asset-group">
                                                    <div
                                                        className="asset-group-header"
                                                        onClick={() => toggleAsset(assetId)}
                                                    >
                                                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                                        <h3>{asset?.name || 'Unknown Asset'} ({assetTasks.length} {assetTasks.length === 1 ? 'task' : 'tasks'})</h3>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="task-list">
                                                            {assetTasks.map(({ task, status, daysUntilDue, contractRequirement }) => (
                                                                <div key={task.id} className="task-card task-overdue">
                                                                    <div className="task-header">
                                                                        <h4>{task.taskName}</h4>
                                                                        <div className="task-badges">
                                                                            {getStatusBadge(status)}
                                                                            {task.isRequired && <span className="badge badge-error">Required</span>}
                                                                        </div>
                                                                    </div>

                                                                    <div className="task-details">
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Due Date:</span>
                                                                            <span className="detail-value">
                                                                                {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'Not set'}
                                                                                {daysUntilDue < 0 && (
                                                                                    <span className="overdue-text"> ({Math.abs(daysUntilDue)} days overdue)</span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Priority:</span>
                                                                            <span className="detail-value">{getPriorityBadge(task.priority)}</span>
                                                                        </div>
                                                                        {contractRequirement && (
                                                                            <div className="task-detail warning-detail">
                                                                                <span className="detail-label">⚠️ Contract:</span>
                                                                                <span className="detail-value">Linked to service contract</span>
                                                                            </div>
                                                                        )}
                                                                        {contractRequirement?.consequenceIfMissed && (
                                                                            <div className="task-warning">
                                                                                ⚠️ WARNING: {contractRequirement.consequenceIfMissed}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="task-actions">
                                                                        <button
                                                                            className="btn btn-sm btn-primary"
                                                                            onClick={() => handleMarkComplete(task.id)}
                                                                        >
                                                                            Mark Complete
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() => handleReschedule(task.id)}
                                                                        >
                                                                            Reschedule
                                                                        </button>
                                                                        <Link
                                                                            to={`/assets/${asset?.id}`}
                                                                            className="btn btn-sm btn-ghost"
                                                                        >
                                                                            View Asset
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Due Soon Section */}
                        {groupedTasks['due-soon'].length > 0 && (
                            <div className="schedule-section section-warning">
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection('due-soon')}
                                >
                                    <div className="section-title">
                                        <span className="section-icon">{expandedSections.has('due-soon') ? '▼' : '▶'}</span>
                                        <h2>🟡 DUE SOON (Next 30 Days) - {groupedTasks['due-soon'].length} Tasks</h2>
                                    </div>
                                </div>

                                {expandedSections.has('due-soon') && (
                                    <div className="section-content">
                                        {Object.entries(groupTasksByAsset(groupedTasks['due-soon'])).map(([assetId, assetTasks]) => {
                                            const asset = assetTasks[0].asset
                                            const isExpanded = expandedAssets.has(assetId)

                                            return (
                                                <div key={assetId} className="asset-group">
                                                    <div
                                                        className="asset-group-header"
                                                        onClick={() => toggleAsset(assetId)}
                                                    >
                                                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                                        <h3>{asset?.name || 'Unknown Asset'} ({assetTasks.length} {assetTasks.length === 1 ? 'task' : 'tasks'})</h3>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="task-list">
                                                            {assetTasks.map(({ task, status, daysUntilDue, contractRequirement }) => (
                                                                <div key={task.id} className="task-card">
                                                                    <div className="task-header">
                                                                        <h4>{task.taskName}</h4>
                                                                        <div className="task-badges">
                                                                            {getStatusBadge(status)}
                                                                            {task.isRequired && <span className="badge badge-warning">Required</span>}
                                                                        </div>
                                                                    </div>

                                                                    <div className="task-details">
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Due Date:</span>
                                                                            <span className="detail-value">
                                                                                {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'Not set'}
                                                                                {daysUntilDue >= 0 && (
                                                                                    <span className="due-text"> (in {daysUntilDue} days)</span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Priority:</span>
                                                                            <span className="detail-value">{getPriorityBadge(task.priority)}</span>
                                                                        </div>
                                                                        {contractRequirement && (
                                                                            <div className="task-detail">
                                                                                <span className="detail-label">📋 Contract:</span>
                                                                                <span className="detail-value">Required by service contract</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="task-actions">
                                                                        <button
                                                                            className="btn btn-sm btn-primary"
                                                                            onClick={() => handleMarkComplete(task.id)}
                                                                        >
                                                                            Mark Complete
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() => handleReschedule(task.id)}
                                                                        >
                                                                            Reschedule
                                                                        </button>
                                                                        <Link
                                                                            to={`/assets/${asset?.id}`}
                                                                            className="btn btn-sm btn-ghost"
                                                                        >
                                                                            View Asset
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upcoming Section */}
                        {groupedTasks['upcoming'].length > 0 && (
                            <div className="schedule-section section-info">
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection('upcoming')}
                                >
                                    <div className="section-title">
                                        <span className="section-icon">{expandedSections.has('upcoming') ? '▼' : '▶'}</span>
                                        <h2>🟢 UPCOMING (31-90 Days) - {groupedTasks['upcoming'].length} Tasks</h2>
                                    </div>
                                </div>

                                {expandedSections.has('upcoming') && (
                                    <div className="section-content">
                                        {Object.entries(groupTasksByAsset(groupedTasks['upcoming'])).map(([assetId, assetTasks]) => {
                                            const asset = assetTasks[0].asset
                                            const isExpanded = expandedAssets.has(assetId)

                                            return (
                                                <div key={assetId} className="asset-group">
                                                    <div
                                                        className="asset-group-header"
                                                        onClick={() => toggleAsset(assetId)}
                                                    >
                                                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                                                        <h3>{asset?.name || 'Unknown Asset'} ({assetTasks.length} {assetTasks.length === 1 ? 'task' : 'tasks'})</h3>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="task-list">
                                                            {assetTasks.map(({ task, status, daysUntilDue }) => (
                                                                <div key={task.id} className="task-card">
                                                                    <div className="task-header">
                                                                        <h4>{task.taskName}</h4>
                                                                        <div className="task-badges">
                                                                            {getStatusBadge(status)}
                                                                        </div>
                                                                    </div>

                                                                    <div className="task-details">
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Due Date:</span>
                                                                            <span className="detail-value">
                                                                                {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'Not set'}
                                                                                {daysUntilDue >= 0 && (
                                                                                    <span className="due-text"> (in {daysUntilDue} days)</span>
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="task-detail">
                                                                            <span className="detail-label">Priority:</span>
                                                                            <span className="detail-value">{getPriorityBadge(task.priority)}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="task-actions">
                                                                        <Link
                                                                            to={`/assets/${asset?.id}`}
                                                                            className="btn btn-sm btn-ghost"
                                                                        >
                                                                            View Asset
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Results */}
                        {Object.values(groupedTasks).every(group => group.length === 0) && (
                            <div className="empty-state">
                                <div className="empty-icon">✅</div>
                                <h3>No tasks match your filters</h3>
                                <p>Try adjusting your filter settings</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}
