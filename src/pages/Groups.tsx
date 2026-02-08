/**
 * @fileoverview Groups page - Organize assets into logical groups
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Groups.css'

const client = generateClient<Schema>()

export default function Groups() {
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingGroup, setEditingGroup] = useState<any>(null)
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        groupType: 'custom',
        parentGroupId: '',
    })

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const { data } = await client.models.AssetGroup.list({})
            setGroups(data)
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGroup = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete group "${name}"?`)) return
        try {
            await client.models.AssetGroup.delete({ id })
            fetchGroups()
        } catch (error) {
            console.error('Error deleting group:', error)
            alert('Failed to delete group.')
        }
    }

    const handleAddGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await client.models.AssetGroup.create({
                name: newGroup.name,
                description: newGroup.description || undefined,
                groupType: newGroup.groupType as any,
                parentGroupId: newGroup.parentGroupId || undefined,
            })
            setShowAddModal(false)
            setNewGroup({
                name: '',
                description: '',
                groupType: 'custom',
                parentGroupId: '',
            })
            fetchGroups()
        } catch (error) {
            console.error('Error creating group:', error)
        }
    }

    const handleEditGroup = (group: any) => {
        setEditingGroup({
            id: group.id,
            name: group.name,
            description: group.description || '',
            groupType: group.groupType || 'custom',
            parentGroupId: group.parentGroupId || '',
        })
        setShowEditModal(true)
    }

    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingGroup) return

        try {
            await client.models.AssetGroup.update({
                id: editingGroup.id,
                name: editingGroup.name,
                description: editingGroup.description || undefined,
                groupType: editingGroup.groupType as any,
                parentGroupId: editingGroup.parentGroupId || undefined,
            })
            setShowEditModal(false)
            setEditingGroup(null)
            fetchGroups()
        } catch (error) {
            console.error('Error updating group:', error)
            alert('Failed to update group.')
        }
    }

    const getGroupTypeBadge = (type?: string) => {
        const types: Record<string, { label: string; icon: string }> = {
            location: { label: 'Location', icon: '📍' },
            category: { label: 'Category', icon: '🏷️' },
            system: { label: 'System', icon: '⚙️' },
            custom: { label: 'Custom', icon: '📁' },
        }
        const typeInfo = types[type || 'custom'] || types.custom
        return (
            <span className="badge badge-info group-type-badge">
                {typeInfo.icon} {typeInfo.label}
            </span>
        )
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Asset Groups</h1>
                        <p className="page-subtitle">Organize your assets into collections</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <span>➕</span>
                        Add Group
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🗂️</div>
                        <div className="stat-content">
                            <div className="stat-value">{groups.length}</div>
                            <div className="stat-label">Total Groups</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📍</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {groups.filter(g => g.groupType === 'location').length}
                            </div>
                            <div className="stat-label">Locations</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚙️</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {groups.filter(g => g.groupType === 'system').length}
                            </div>
                            <div className="stat-label">Systems</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {groups.filter(g => g.groupType === 'custom').length}
                            </div>
                            <div className="stat-label">Custom</div>
                        </div>
                    </div>
                </div>

                {/* Groups List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading groups...</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗂️</div>
                        <h3>No groups created yet</h3>
                        <p>Create groups to organize your assets by location, system, or custom categories</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Create Your First Group
                        </button>
                    </div>
                ) : (
                    <div className="groups-grid">
                        {groups.map((group) => (
                            <div key={group.id} className="group-card card">
                                <div className="group-header">
                                    <div className="group-icon">
                                        {group.groupType === 'location' ? '📍' :
                                            group.groupType === 'system' ? '⚙️' :
                                                group.groupType === 'category' ? '🏷️' : '📁'}
                                    </div>
                                    <div className="group-title">
                                        <h3>{group.name}</h3>
                                        {getGroupTypeBadge(group.groupType)}
                                    </div>
                                </div>

                                {group.description && (
                                    <p className="group-description">{group.description}</p>
                                )}

                                <div className="group-footer">
                                    <div className="group-stats">
                                        {/* Placeholder for asset count until we query the relation */}
                                        <span className="stat-pill">Unknown Assets</span>
                                    </div>
                                    <div className="group-actions">
                                        <button className="btn btn-secondary btn-sm">View</button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleEditGroup(group)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleDeleteGroup(group.id, group.name)}
                                            style={{ marginLeft: 'auto', color: 'var(--error-color)', border: '1px solid var(--error-color)', background: 'transparent' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Group Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Asset Group</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddGroup} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="groupName">Group Name *</label>
                                    <input
                                        id="groupName"
                                        type="text"
                                        className="input"
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        placeholder="e.g., Living Room, HVAC System"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="groupType">Group Type *</label>
                                    <select
                                        id="groupType"
                                        className="input"
                                        value={newGroup.groupType}
                                        onChange={(e) => setNewGroup({ ...newGroup, groupType: e.target.value })}
                                        required
                                    >
                                        <option value="custom">Custom Collection</option>
                                        <option value="location">Location (Room, Building)</option>
                                        <option value="system">System (HVAC, Plumbing)</option>
                                        <option value="category">Category</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="parentGroup">Parent Group</label>
                                    <select
                                        id="parentGroup"
                                        className="input"
                                        value={newGroup.parentGroupId}
                                        onChange={(e) => setNewGroup({ ...newGroup, parentGroupId: e.target.value })}
                                    >
                                        <option value="">None (Top Level)</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="input"
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        placeholder="Brief description of this group..."
                                        rows={3}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Group Modal */}
                {showEditModal && editingGroup && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Asset Group</h2>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleUpdateGroup} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="editGroupName">Group Name *</label>
                                    <input
                                        id="editGroupName"
                                        type="text"
                                        className="input"
                                        value={editingGroup.name}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                        placeholder="e.g., Living Room, HVAC System"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editGroupType">Group Type *</label>
                                    <select
                                        id="editGroupType"
                                        className="input"
                                        value={editingGroup.groupType}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, groupType: e.target.value })}
                                        required
                                    >
                                        <option value="custom">Custom Collection</option>
                                        <option value="location">Location (Room, Building)</option>
                                        <option value="system">System (HVAC, Plumbing)</option>
                                        <option value="category">Category</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editParentGroup">Parent Group</label>
                                    <select
                                        id="editParentGroup"
                                        className="input"
                                        value={editingGroup.parentGroupId}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, parentGroupId: e.target.value })}
                                    >
                                        <option value="">None (Top Level)</option>
                                        {groups
                                            .filter(g => g.id !== editingGroup.id) // Don't allow selecting itself as parent
                                            .map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editDescription">Description</label>
                                    <textarea
                                        id="editDescription"
                                        className="input"
                                        value={editingGroup.description}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                                        placeholder="Brief description of this group..."
                                        rows={3}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Group
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
