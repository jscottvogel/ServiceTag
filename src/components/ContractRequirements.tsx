/**
 * @fileoverview Contract Requirements Management Component
 * @description Manages maintenance requirements for service contracts
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import './ContractRequirements.css'

const client = generateClient<Schema>()

interface ContractRequirementsProps {
    contractId: string
    contractName: string
    assetId?: string
    onClose: () => void
}

export default function ContractRequirements({
    contractId,
    contractName,
    assetId,
    onClose
}: ContractRequirementsProps) {
    const [requirements, setRequirements] = useState<any[]>([])
    const [tasks, setTasks] = useState<any[]>([])
    const [asset, setAsset] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingRequirement, setEditingRequirement] = useState<any>(null)

    const [formData, setFormData] = useState({
        taskMode: 'existing', // 'existing' or 'new'
        existingTaskId: '',
        newTaskName: '',
        newTaskDescription: '',
        intervalType: 'time',
        intervalDays: '',
        intervalMiles: '',
        intervalHours: '',
        isRequired: true,
        requirementDescription: '',
        consequenceIfMissed: '',
        priority: 'medium',
    })

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractId])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch requirements for this contract
            const reqResponse = await client.models.ContractRequirement.list({
                filter: { contractId: { eq: contractId } }
            })

            // Fetch all maintenance tasks for the asset
            if (assetId) {
                const taskResponse = await client.models.MaintenanceTask.list({
                    filter: { assetId: { eq: assetId } }
                })
                setTasks(taskResponse.data || [])

                // Fetch asset details
                const assetResponse = await client.models.Asset.get({ id: assetId })
                setAsset(assetResponse.data)
            }

            // Fetch task details for each requirement
            const requirementsWithTasks = await Promise.all(
                (reqResponse.data || []).map(async (req) => {
                    if (req.maintenanceTaskId) {
                        const taskResponse = await client.models.MaintenanceTask.get({
                            id: req.maintenanceTaskId
                        })
                        return { ...req, task: taskResponse.data }
                    }
                    return req
                })
            )

            setRequirements(requirementsWithTasks)
        } catch (error) {
            console.error('Error fetching requirements:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddClick = () => {
        setEditingRequirement(null)
        setFormData({
            taskMode: 'existing',
            existingTaskId: '',
            newTaskName: '',
            newTaskDescription: '',
            intervalType: 'time',
            intervalDays: '',
            intervalMiles: '',
            intervalHours: '',
            isRequired: true,
            requirementDescription: '',
            consequenceIfMissed: '',
            priority: 'medium',
        })
        setShowAddModal(true)
    }

    const handleEditClick = (requirement: any) => {
        setEditingRequirement(requirement)
        setFormData({
            taskMode: 'existing',
            existingTaskId: requirement.maintenanceTaskId || '',
            newTaskName: requirement.task?.taskName || '',
            newTaskDescription: requirement.task?.description || '',
            intervalType: requirement.task?.intervalType || 'time',
            intervalDays: requirement.task?.intervalDays?.toString() || '',
            intervalMiles: requirement.task?.intervalMiles?.toString() || '',
            intervalHours: requirement.task?.intervalHours?.toString() || '',
            isRequired: requirement.isRequired !== false,
            requirementDescription: requirement.requirementDescription || '',
            consequenceIfMissed: requirement.consequenceIfMissed || '',
            priority: requirement.task?.priority || 'medium',
        })
        setShowAddModal(true)
    }

    const handleSaveRequirement = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            let taskId = formData.existingTaskId

            // Create new task if needed
            if (formData.taskMode === 'new' && formData.newTaskName) {
                if (!assetId) {
                    alert('Cannot create task without an associated asset')
                    return
                }

                const taskResponse = await client.models.MaintenanceTask.create({
                    taskName: formData.newTaskName,
                    description: formData.newTaskDescription || undefined,
                    assetId: assetId,
                    intervalType: formData.intervalType as any,
                    intervalDays: formData.intervalDays ? parseInt(formData.intervalDays) : undefined,
                    intervalMiles: formData.intervalMiles ? parseInt(formData.intervalMiles) : undefined,
                    intervalHours: formData.intervalHours ? parseInt(formData.intervalHours) : undefined,
                    priority: formData.priority as any,
                    isActive: true,
                    isOverdue: false,
                })

                taskId = (taskResponse.data as any)?.id
            }

            if (!taskId) {
                alert('Please select or create a maintenance task')
                return
            }

            if (editingRequirement) {
                // Update existing requirement
                await client.models.ContractRequirement.update({
                    id: editingRequirement.id,
                    isRequired: formData.isRequired,
                    requirementDescription: formData.requirementDescription || undefined,
                    consequenceIfMissed: formData.consequenceIfMissed || undefined,
                })
            } else {
                // Create new requirement
                await client.models.ContractRequirement.create({
                    contractId: contractId,
                    maintenanceTaskId: taskId,
                    isRequired: formData.isRequired,
                    requirementDescription: formData.requirementDescription || undefined,
                    consequenceIfMissed: formData.consequenceIfMissed || undefined,
                    isCompliant: true,
                    isOverdue: false,
                })
            }

            setShowAddModal(false)
            fetchData()
        } catch (error) {
            console.error('Error saving requirement:', error)
            alert('Failed to save requirement. Please try again.')
        }
    }

    const handleDeleteRequirement = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this requirement?')) return

        try {
            await client.models.ContractRequirement.delete({ id })
            fetchData()
        } catch (error) {
            console.error('Error deleting requirement:', error)
            alert('Failed to delete requirement.')
        }
    }

    const getComplianceStatus = (requirement: any) => {
        if (requirement.isOverdue) {
            return <span className="badge badge-error">⚠️ Overdue</span>
        }
        if (requirement.isCompliant) {
            return <span className="badge badge-success">✅ Compliant</span>
        }
        if (requirement.daysUntilDue !== undefined && requirement.daysUntilDue <= 7) {
            return <span className="badge badge-warning">🟡 Due Soon</span>
        }
        return <span className="badge badge-info">📅 Scheduled</span>
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Contract Requirements</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                            {contractName}
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Asset Info */}
                    {asset && (
                        <div className="requirement-asset-info">
                            <div className="info-row">
                                <span className="info-label">Linked Asset:</span>
                                <span className="info-value">{asset.name}</span>
                            </div>
                            {asset.inServiceDate && (
                                <div className="info-row">
                                    <span className="info-label">In-Service Date:</span>
                                    <span className="info-value">
                                        {new Date(asset.inServiceDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button className="btn btn-primary" onClick={handleAddClick}>
                            ➕ Add Requirement
                        </button>
                    </div>

                    {/* Requirements List */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading requirements...</p>
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No requirements yet</h3>
                            <p>Add maintenance requirements to this contract</p>
                        </div>
                    ) : (
                        <div className="requirements-list">
                            {requirements.map((req) => (
                                <div key={req.id} className="requirement-card">
                                    <div className="requirement-header">
                                        <h3>{req.task?.taskName || 'Unknown Task'}</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {req.isRequired && (
                                                <span className="badge badge-error">Required</span>
                                            )}
                                            {getComplianceStatus(req)}
                                        </div>
                                    </div>

                                    <div className="requirement-details">
                                        {req.task?.intervalType && (
                                            <div className="detail-item">
                                                <span className="detail-label">Interval:</span>
                                                <span className="detail-value">
                                                    {req.task.intervalDays && `Every ${req.task.intervalDays} days`}
                                                    {req.task.intervalMiles && `Every ${req.task.intervalMiles} miles`}
                                                    {req.task.intervalHours && `Every ${req.task.intervalHours} hours`}
                                                </span>
                                            </div>
                                        )}
                                        {req.requirementDescription && (
                                            <div className="detail-item">
                                                <span className="detail-label">Description:</span>
                                                <span className="detail-value">{req.requirementDescription}</span>
                                            </div>
                                        )}
                                        {req.consequenceIfMissed && (
                                            <div className="detail-item warning">
                                                <span className="detail-label">⚠️ If Missed:</span>
                                                <span className="detail-value">{req.consequenceIfMissed}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="requirement-actions">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => handleEditClick(req)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleDeleteRequirement(req.id)}
                                            style={{ color: 'var(--error-color)', border: '1px solid var(--error-color)' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>

                {/* Add/Edit Requirement Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingRequirement ? 'Edit Requirement' : 'Add Requirement'}</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                            </div>

                            <form onSubmit={handleSaveRequirement} className="modal-body">
                                {/* Task Selection */}
                                {!editingRequirement && (
                                    <>
                                        <div className="form-group">
                                            <label>Maintenance Task</label>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="taskMode"
                                                        value="existing"
                                                        checked={formData.taskMode === 'existing'}
                                                        onChange={(e) => setFormData({ ...formData, taskMode: e.target.value })}
                                                    />
                                                    Select Existing Task
                                                </label>
                                                <label className="radio-label">
                                                    <input
                                                        type="radio"
                                                        name="taskMode"
                                                        value="new"
                                                        checked={formData.taskMode === 'new'}
                                                        onChange={(e) => setFormData({ ...formData, taskMode: e.target.value })}
                                                    />
                                                    Create New Task
                                                </label>
                                            </div>
                                        </div>

                                        {formData.taskMode === 'existing' ? (
                                            <div className="form-group">
                                                <label htmlFor="existingTaskId">Select Task *</label>
                                                <select
                                                    id="existingTaskId"
                                                    className="input"
                                                    value={formData.existingTaskId}
                                                    onChange={(e) => setFormData({ ...formData, existingTaskId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">-- Select a task --</option>
                                                    {tasks.map((task) => (
                                                        <option key={task.id} value={task.id}>
                                                            {task.taskName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor="newTaskName">Task Name *</label>
                                                    <input
                                                        id="newTaskName"
                                                        type="text"
                                                        className="input"
                                                        value={formData.newTaskName}
                                                        onChange={(e) => setFormData({ ...formData, newTaskName: e.target.value })}
                                                        placeholder="e.g., Annual Inspection"
                                                        required
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="newTaskDescription">Description</label>
                                                    <textarea
                                                        id="newTaskDescription"
                                                        className="input"
                                                        value={formData.newTaskDescription}
                                                        onChange={(e) => setFormData({ ...formData, newTaskDescription: e.target.value })}
                                                        rows={2}
                                                        placeholder="Task description"
                                                    />
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="intervalType">Interval Type *</label>
                                                        <select
                                                            id="intervalType"
                                                            className="input"
                                                            value={formData.intervalType}
                                                            onChange={(e) => setFormData({ ...formData, intervalType: e.target.value })}
                                                        >
                                                            <option value="time">Time-based</option>
                                                            <option value="usage">Usage-based</option>
                                                            <option value="hybrid">Hybrid</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="priority">Priority</label>
                                                        <select
                                                            id="priority"
                                                            className="input"
                                                            value={formData.priority}
                                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {(formData.intervalType === 'time' || formData.intervalType === 'hybrid') && (
                                                    <div className="form-group">
                                                        <label htmlFor="intervalDays">Interval (Days)</label>
                                                        <input
                                                            id="intervalDays"
                                                            type="number"
                                                            className="input"
                                                            value={formData.intervalDays}
                                                            onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                                                            placeholder="e.g., 365"
                                                        />
                                                    </div>
                                                )}

                                                {(formData.intervalType === 'usage' || formData.intervalType === 'hybrid') && (
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label htmlFor="intervalMiles">Interval (Miles)</label>
                                                            <input
                                                                id="intervalMiles"
                                                                type="number"
                                                                className="input"
                                                                value={formData.intervalMiles}
                                                                onChange={(e) => setFormData({ ...formData, intervalMiles: e.target.value })}
                                                                placeholder="e.g., 5000"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="intervalHours">Interval (Hours)</label>
                                                            <input
                                                                id="intervalHours"
                                                                type="number"
                                                                className="input"
                                                                value={formData.intervalHours}
                                                                onChange={(e) => setFormData({ ...formData, intervalHours: e.target.value })}
                                                                placeholder="e.g., 100"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Requirement Details */}
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.isRequired}
                                            onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                        />
                                        Required (uncheck for recommended)
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="requirementDescription">Requirement Description</label>
                                    <textarea
                                        id="requirementDescription"
                                        className="input"
                                        value={formData.requirementDescription}
                                        onChange={(e) => setFormData({ ...formData, requirementDescription: e.target.value })}
                                        rows={2}
                                        placeholder="e.g., Annual inspection required by contract"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="consequenceIfMissed">Consequence if Missed</label>
                                    <textarea
                                        id="consequenceIfMissed"
                                        className="input"
                                        value={formData.consequenceIfMissed}
                                        onChange={(e) => setFormData({ ...formData, consequenceIfMissed: e.target.value })}
                                        rows={2}
                                        placeholder="e.g., Contract may be voided"
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingRequirement ? 'Update Requirement' : 'Add Requirement'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
