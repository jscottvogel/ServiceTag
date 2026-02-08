/**
 * @fileoverview Maintenance page - Track and schedule maintenance tasks
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Maintenance.css'

const client = generateClient<Schema>()

export default function Maintenance() {
    const [tasks, setTasks] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTask, setNewTask] = useState({
        taskName: '',
        description: '',
        category: '',
        assetId: '',
        intervalType: 'time',
        intervalDays: '',
        intervalMiles: '',
        intervalHours: '',
        estimatedCost: '',
        priority: 'medium',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [tasksData, assetsData] = await Promise.all([
                client.models.MaintenanceTask.list({}),
                client.models.Asset.list({}),
            ])
            setTasks(tasksData.data)
            setAssets(assetsData.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await client.models.MaintenanceTask.create({
                taskName: newTask.taskName,
                description: newTask.description,
                category: newTask.category,
                assetId: newTask.assetId,
                intervalType: newTask.intervalType as any,
                intervalDays: newTask.intervalDays ? parseInt(newTask.intervalDays) : undefined,
                intervalMiles: newTask.intervalMiles ? parseInt(newTask.intervalMiles) : undefined,
                intervalHours: newTask.intervalHours ? parseInt(newTask.intervalHours) : undefined,
                estimatedCost: newTask.estimatedCost ? parseFloat(newTask.estimatedCost) : undefined,
                priority: newTask.priority as any,
                isActive: true,
            })
            setShowAddModal(false)
            setNewTask({
                taskName: '',
                description: '',
                category: '',
                assetId: '',
                intervalType: 'time',
                intervalDays: '',
                intervalMiles: '',
                intervalHours: '',
                estimatedCost: '',
                priority: 'medium',
            })
            fetchData()
        } catch (error) {
            console.error('Error creating task:', error)
        }
    }

    const getUrgencyBadge = (urgency?: string) => {
        switch (urgency) {
            case 'critical':
                return <span className="badge badge-error">🔴 Critical</span>
            case 'overdue':
                return <span className="badge badge-error">⚠️ Overdue</span>
            case 'due':
                return <span className="badge badge-warning">🟡 Due Soon</span>
            case 'upcoming':
                return <span className="badge badge-info">🔵 Upcoming</span>
            default:
                return <span className="badge badge-success">🟢 On Track</span>
        }
    }

    const getPriorityBadge = (priority?: string) => {
        switch (priority) {
            case 'critical':
                return <span className="badge badge-error">Critical</span>
            case 'high':
                return <span className="badge badge-warning">High</span>
            case 'medium':
                return <span className="badge badge-info">Medium</span>
            case 'low':
                return <span className="badge">Low</span>
            default:
                return <span className="badge">Normal</span>
        }
    }

    const getAssetName = (assetId: string) => {
        const asset = assets.find(a => a.id === assetId)
        return asset?.name || 'Unknown Asset'
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Maintenance</h1>
                        <p className="page-subtitle">Track and schedule maintenance tasks</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <span>➕</span>
                        Add Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-content">
                            <div className="stat-value">{tasks.length}</div>
                            <div className="stat-label">Total Tasks</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {tasks.filter(t => t.isActive && !t.isOverdue).length}
                            </div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟡</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {tasks.filter(t => t.urgencyLevel === 'due' || t.urgencyLevel === 'upcoming').length}
                            </div>
                            <div className="stat-label">Due Soon</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {tasks.filter(t => t.isOverdue).length}
                            </div>
                            <div className="stat-label">Overdue</div>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔧</div>
                        <h3>No maintenance tasks yet</h3>
                        <p>Create your first maintenance task to get started</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Your First Task
                        </button>
                    </div>
                ) : (
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-card card">
                                <div className="task-header">
                                    <div>
                                        <h3>{task.taskName}</h3>
                                        <p className="task-asset">{getAssetName(task.assetId)}</p>
                                    </div>
                                    <div className="task-badges">
                                        {getUrgencyBadge(task.urgencyLevel)}
                                        {getPriorityBadge(task.priority)}
                                    </div>
                                </div>

                                {task.description && (
                                    <p className="task-description">{task.description}</p>
                                )}

                                <div className="task-details">
                                    {task.category && (
                                        <div className="task-detail">
                                            <span className="detail-label">Category</span>
                                            <span className="detail-value">{task.category}</span>
                                        </div>
                                    )}

                                    {task.intervalType && (
                                        <div className="task-detail">
                                            <span className="detail-label">Interval</span>
                                            <span className="detail-value">
                                                {task.intervalType === 'time' && task.intervalDays && `Every ${task.intervalDays} days`}
                                                {task.intervalType === 'usage' && task.intervalMiles && `Every ${task.intervalMiles} miles`}
                                                {task.intervalType === 'usage' && task.intervalHours && `Every ${task.intervalHours} hours`}
                                                {task.intervalType === 'date' && 'Specific date'}
                                                {task.intervalType === 'hybrid' && 'Time or usage'}
                                            </span>
                                        </div>
                                    )}

                                    {task.estimatedCost && (
                                        <div className="task-detail">
                                            <span className="detail-label">Estimated Cost</span>
                                            <span className="detail-value">${task.estimatedCost.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {task.nextDueDate && (
                                        <div className="task-detail">
                                            <span className="detail-label">Next Due</span>
                                            <span className="detail-value">
                                                {new Date(task.nextDueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {task.isCoveredByContract && (
                                        <div className="task-detail">
                                            <span className="detail-label">Coverage</span>
                                            <span className="detail-value">
                                                <span className="badge badge-success">✅ Covered by Contract</span>
                                            </span>
                                        </div>
                                    )}

                                    {task.isRequiredByContract && (
                                        <div className="task-detail">
                                            <span className="detail-label">Required</span>
                                            <span className="detail-value">
                                                <span className="badge badge-warning">⚠️ Required by Contract</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="task-actions">
                                    <button className="btn btn-primary btn-sm">Log Service</button>
                                    <button className="btn btn-secondary btn-sm">View History</button>
                                    <button className="btn btn-ghost btn-sm">Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Task Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Maintenance Task</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddTask} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="taskName">Task Name *</label>
                                    <input
                                        id="taskName"
                                        type="text"
                                        className="input"
                                        value={newTask.taskName}
                                        onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                                        placeholder="e.g., Oil Change"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="assetId">Asset *</label>
                                    <select
                                        id="assetId"
                                        className="input"
                                        value={newTask.assetId}
                                        onChange={(e) => setNewTask({ ...newTask, assetId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select an asset</option>
                                        {assets.map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="input"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        placeholder="Task details..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="category">Category</label>
                                        <input
                                            id="category"
                                            type="text"
                                            className="input"
                                            value={newTask.category}
                                            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                            placeholder="e.g., Oil Change, Filter"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="priority">Priority</label>
                                        <select
                                            id="priority"
                                            className="input"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="intervalType">Interval Type</label>
                                    <select
                                        id="intervalType"
                                        className="input"
                                        value={newTask.intervalType}
                                        onChange={(e) => setNewTask({ ...newTask, intervalType: e.target.value })}
                                    >
                                        <option value="time">Time-based (days)</option>
                                        <option value="usage">Usage-based (miles/hours)</option>
                                        <option value="date">Specific date</option>
                                        <option value="hybrid">Time or usage (whichever comes first)</option>
                                    </select>
                                </div>

                                {(newTask.intervalType === 'time' || newTask.intervalType === 'hybrid') && (
                                    <div className="form-group">
                                        <label htmlFor="intervalDays">Interval (Days)</label>
                                        <input
                                            id="intervalDays"
                                            type="number"
                                            className="input"
                                            value={newTask.intervalDays}
                                            onChange={(e) => setNewTask({ ...newTask, intervalDays: e.target.value })}
                                            placeholder="e.g., 90"
                                        />
                                    </div>
                                )}

                                {(newTask.intervalType === 'usage' || newTask.intervalType === 'hybrid') && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="intervalMiles">Interval (Miles)</label>
                                            <input
                                                id="intervalMiles"
                                                type="number"
                                                className="input"
                                                value={newTask.intervalMiles}
                                                onChange={(e) => setNewTask({ ...newTask, intervalMiles: e.target.value })}
                                                placeholder="e.g., 3000"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="intervalHours">Interval (Hours)</label>
                                            <input
                                                id="intervalHours"
                                                type="number"
                                                className="input"
                                                value={newTask.intervalHours}
                                                onChange={(e) => setNewTask({ ...newTask, intervalHours: e.target.value })}
                                                placeholder="e.g., 50"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="estimatedCost">Estimated Cost</label>
                                    <input
                                        id="estimatedCost"
                                        type="number"
                                        className="input"
                                        value={newTask.estimatedCost}
                                        onChange={(e) => setNewTask({ ...newTask, estimatedCost: e.target.value })}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
