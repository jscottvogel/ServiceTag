/**
 * @fileoverview Warranties page - Manage warranties and registration
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Warranties.css'

const client = generateClient<Schema>()

export default function Warranties() {
    const [warranties, setWarranties] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newWarranty, setNewWarranty] = useState({
        warrantyName: '',
        warrantyType: 'manufacturer',
        provider: '',
        warrantyNumber: '',
        startDate: '',
        endDate: '',
        coverageScope: '',
        registrationStatus: 'not_required',
        registrationDeadline: '',
        assetId: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [warrantiesData, assetsData] = await Promise.all([
                client.models.Warranty.list({}),
                client.models.Asset.list({}),
            ])
            setWarranties(warrantiesData.data)
            setAssets(assetsData.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddWarranty = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const warranty = await client.models.Warranty.create({
                warrantyName: newWarranty.warrantyName,
                warrantyType: newWarranty.warrantyType as any,
                provider: newWarranty.provider,
                warrantyNumber: newWarranty.warrantyNumber || undefined,
                startDate: newWarranty.startDate || undefined,
                endDate: newWarranty.endDate || undefined,
                coverageScope: newWarranty.coverageScope || undefined,
                registrationStatus: newWarranty.registrationStatus as any,
                registrationDeadline: newWarranty.registrationDeadline || undefined,
                isActive: true,
            })

            // Link to asset if selected
            if (newWarranty.assetId && warranty.data) {
                await client.models.AssetWarranty.create({
                    assetId: newWarranty.assetId,
                    warrantyId: (warranty.data as any).id,
                    isPrimaryWarranty: true,
                })
            }

            setShowAddModal(false)
            setNewWarranty({
                warrantyName: '',
                warrantyType: 'manufacturer',
                provider: '',
                warrantyNumber: '',
                startDate: '',
                endDate: '',
                coverageScope: '',
                registrationStatus: 'not_required',
                registrationDeadline: '',
                assetId: '',
            })
            fetchData()
        } catch (error) {
            console.error('Error creating warranty:', error)
        }
    }

    const getRegistrationBadge = (status?: string) => {
        switch (status) {
            case 'registered':
                return <span className="badge badge-success">✅ Registered</span>
            case 'registration_required':
                return <span className="badge badge-error">⚠️ Registration Required</span>
            case 'pending':
                return <span className="badge badge-warning">🟡 Pending</span>
            case 'expired':
                return <span className="badge">⚪ Expired</span>
            default:
                return <span className="badge">Not Required</span>
        }
    }

    const getWarrantyTypeBadge = (type?: string) => {
        const types: Record<string, { label: string; icon: string }> = {
            manufacturer: { label: 'Manufacturer', icon: '🏭' },
            extended: { label: 'Extended', icon: '📅' },
            third_party: { label: 'Third Party', icon: '🏢' },
            dealer: { label: 'Dealer', icon: '🚗' },
            store: { label: 'Store', icon: '🏪' },
            credit_card: { label: 'Credit Card', icon: '💳' },
        }
        const typeInfo = types[type || ''] || { label: 'Unknown', icon: '❓' }
        return (
            <span className="badge badge-info">
                {typeInfo.icon} {typeInfo.label}
            </span>
        )
    }

    const getDaysRemaining = (endDate?: string) => {
        if (!endDate) return null
        const end = new Date(endDate)
        const now = new Date()
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (days < 0) {
            return <span className="badge badge-error">Expired</span>
        } else if (days <= 30) {
            return <span className="badge badge-error">🔴 {days} days left</span>
        } else if (days <= 90) {
            return <span className="badge badge-warning">🟡 {days} days left</span>
        } else {
            return <span className="badge badge-success">🟢 {days} days left</span>
        }
    }

    const getRegistrationDeadlineWarning = (deadline?: string, status?: string) => {
        if (!deadline || status === 'registered') return null

        const deadlineDate = new Date(deadline)
        const now = new Date()
        const days = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (days < 0) {
            return <span className="badge badge-error">⚠️ Deadline Passed</span>
        } else if (days <= 7) {
            return <span className="badge badge-error">🚨 Register in {days} days!</span>
        } else if (days <= 14) {
            return <span className="badge badge-warning">⚠️ Register in {days} days</span>
        }
        return null
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Warranties</h1>
                        <p className="page-subtitle">Manage warranties and never miss registration deadlines</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <span>➕</span>
                        Add Warranty
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{warranties.length}</div>
                            <div className="stat-label">Total Warranties</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {warranties.filter(w => w.isActive).length}
                            </div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {warranties.filter(w => w.registrationStatus === 'registration_required' || w.registrationStatus === 'pending').length}
                            </div>
                            <div className="stat-label">Need Registration</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {warranties.filter(w => {
                                    if (!w.endDate) return false
                                    const days = Math.ceil((new Date(w.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                    return days <= 30 && days >= 0
                                }).length}
                            </div>
                            <div className="stat-label">Expiring Soon</div>
                        </div>
                    </div>
                </div>

                {/* Warranties List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading warranties...</p>
                    </div>
                ) : warranties.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h3>No warranties yet</h3>
                        <p>Add your first warranty to track coverage and registration</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Your First Warranty
                        </button>
                    </div>
                ) : (
                    <div className="warranties-grid">
                        {warranties.map((warranty) => (
                            <div key={warranty.id} className="warranty-card card">
                                <div className="warranty-header">
                                    <h3>{warranty.warrantyName}</h3>
                                    {getWarrantyTypeBadge(warranty.warrantyType)}
                                </div>

                                <div className="warranty-provider">
                                    <span className="provider-label">Provider:</span>
                                    <span className="provider-name">{warranty.provider}</span>
                                </div>

                                <div className="warranty-status">
                                    {getRegistrationBadge(warranty.registrationStatus)}
                                    {warranty.endDate && getDaysRemaining(warranty.endDate)}
                                    {getRegistrationDeadlineWarning(warranty.registrationDeadline, warranty.registrationStatus)}
                                </div>

                                <div className="warranty-details">
                                    {warranty.warrantyNumber && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">Warranty #</span>
                                            <span className="detail-value">{warranty.warrantyNumber}</span>
                                        </div>
                                    )}

                                    {warranty.startDate && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">Start Date</span>
                                            <span className="detail-value">
                                                {new Date(warranty.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {warranty.endDate && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">End Date</span>
                                            <span className="detail-value">
                                                {new Date(warranty.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {warranty.registrationDeadline && warranty.registrationStatus !== 'registered' && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">Registration Deadline</span>
                                            <span className="detail-value">
                                                {new Date(warranty.registrationDeadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {warranty.coverageScope && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">Coverage</span>
                                            <span className="detail-value">{warranty.coverageScope}</span>
                                        </div>
                                    )}

                                    {warranty.totalClaimsMade > 0 && (
                                        <div className="warranty-detail">
                                            <span className="detail-label">Claims Made</span>
                                            <span className="detail-value">{warranty.totalClaimsMade}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="warranty-actions">
                                    <button className="btn btn-primary btn-sm">View Details</button>
                                    {warranty.registrationStatus === 'registration_required' && (
                                        <button className="btn btn-warning btn-sm">Register Now</button>
                                    )}
                                    <button className="btn btn-ghost btn-sm">Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Warranty Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Warranty</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddWarranty} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="warrantyName">Warranty Name *</label>
                                    <input
                                        id="warrantyName"
                                        type="text"
                                        className="input"
                                        value={newWarranty.warrantyName}
                                        onChange={(e) => setNewWarranty({ ...newWarranty, warrantyName: e.target.value })}
                                        placeholder="e.g., Honda Factory Warranty"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="warrantyType">Warranty Type *</label>
                                        <select
                                            id="warrantyType"
                                            className="input"
                                            value={newWarranty.warrantyType}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, warrantyType: e.target.value })}
                                            required
                                        >
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="extended">Extended</option>
                                            <option value="third_party">Third Party</option>
                                            <option value="dealer">Dealer</option>
                                            <option value="store">Store</option>
                                            <option value="credit_card">Credit Card</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="provider">Provider *</label>
                                        <input
                                            id="provider"
                                            type="text"
                                            className="input"
                                            value={newWarranty.provider}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, provider: e.target.value })}
                                            placeholder="e.g., Honda"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="assetId">Link to Asset</label>
                                    <select
                                        id="assetId"
                                        className="input"
                                        value={newWarranty.assetId}
                                        onChange={(e) => setNewWarranty({ ...newWarranty, assetId: e.target.value })}
                                    >
                                        <option value="">Select an asset (optional)</option>
                                        {assets.map((asset) => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="warrantyNumber">Warranty Number</label>
                                    <input
                                        id="warrantyNumber"
                                        type="text"
                                        className="input"
                                        value={newWarranty.warrantyNumber}
                                        onChange={(e) => setNewWarranty({ ...newWarranty, warrantyNumber: e.target.value })}
                                        placeholder="Warranty or policy number"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="startDate">Start Date</label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            className="input"
                                            value={newWarranty.startDate}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="endDate">End Date</label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            className="input"
                                            value={newWarranty.endDate}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="coverageScope">Coverage Details</label>
                                    <textarea
                                        id="coverageScope"
                                        className="input"
                                        value={newWarranty.coverageScope}
                                        onChange={(e) => setNewWarranty({ ...newWarranty, coverageScope: e.target.value })}
                                        placeholder="What's covered by this warranty?"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="registrationStatus">Registration Status</label>
                                        <select
                                            id="registrationStatus"
                                            className="input"
                                            value={newWarranty.registrationStatus}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, registrationStatus: e.target.value })}
                                        >
                                            <option value="not_required">Not Required</option>
                                            <option value="registration_required">Registration Required</option>
                                            <option value="pending">Pending</option>
                                            <option value="registered">Registered</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="registrationDeadline">Registration Deadline</label>
                                        <input
                                            id="registrationDeadline"
                                            type="date"
                                            className="input"
                                            value={newWarranty.registrationDeadline}
                                            onChange={(e) => setNewWarranty({ ...newWarranty, registrationDeadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Warranty
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
