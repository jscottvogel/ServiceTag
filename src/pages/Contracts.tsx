/**
 * @fileoverview Service Contracts page - Manage service contracts and maintenance plans
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import ContractRequirements from '../components/ContractRequirements'
import './Contracts.css'

const client = generateClient<Schema>()

export default function Contracts() {
    const [contracts, setContracts] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showRequirementsModal, setShowRequirementsModal] = useState(false)
    const [editingContract, setEditingContract] = useState<any>(null)
    const [viewingContract, setViewingContract] = useState<any>(null)
    const [requirementsContract, setRequirementsContract] = useState<any>(null)
    const [newContract, setNewContract] = useState({
        contractName: '',
        contractType: 'extended_warranty',
        provider: '',
        contractNumber: '',
        startDate: '',
        endDate: '',
        coverageScope: '',
        monthlyPayment: '',
        annualCost: '',
        autoRenew: false,
        assetId: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [contractsData, assetsData] = await Promise.all([
                client.models.ServiceContract.list({}),
                client.models.Asset.list({}),
            ])
            setContracts(contractsData.data)
            setAssets(assetsData.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddContract = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const contract = await client.models.ServiceContract.create({
                contractName: newContract.contractName,
                contractType: newContract.contractType as any,
                provider: newContract.provider,
                contractNumber: newContract.contractNumber || undefined,
                startDate: newContract.startDate || undefined,
                endDate: newContract.endDate || undefined,
                coverageScope: newContract.coverageScope || undefined,
                monthlyPayment: newContract.monthlyPayment ? parseFloat(newContract.monthlyPayment) : undefined,
                annualCost: newContract.annualCost ? parseFloat(newContract.annualCost) : undefined,
                autoRenew: newContract.autoRenew,
                isActive: true,
            })

            // Link to asset if selected
            if (newContract.assetId && contract.data) {
                await client.models.AssetContract.create({
                    assetId: newContract.assetId,
                    contractId: (contract.data as any).id,
                    isPrimaryContract: true,
                })
            }

            setShowAddModal(false)
            setNewContract({
                contractName: '',
                contractType: 'extended_warranty',
                provider: '',
                contractNumber: '',
                startDate: '',
                endDate: '',
                coverageScope: '',
                monthlyPayment: '',
                annualCost: '',
                autoRenew: false,
                assetId: '',
            })
            fetchData()
        } catch (error) {
            console.error('Error creating contract:', error)
            alert('Failed to create contract. Please try again.')
        }
    }

    const handleViewContract = (contract: any) => {
        setViewingContract(contract)
        setShowViewModal(true)
    }

    const handleEditContract = (contract: any) => {
        setEditingContract({
            id: contract.id,
            contractName: contract.contractName,
            contractType: contract.contractType || 'extended_warranty',
            provider: contract.provider,
            contractNumber: contract.contractNumber || '',
            startDate: contract.startDate || '',
            endDate: contract.endDate || '',
            coverageScope: contract.coverageScope || '',
            monthlyPayment: contract.monthlyPayment?.toString() || '',
            annualCost: contract.annualCost?.toString() || '',
            autoRenew: contract.autoRenew || false,
            isActive: contract.isActive !== false,
        })
        setShowEditModal(true)
    }

    const handleUpdateContract = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingContract) return

        try {
            await client.models.ServiceContract.update({
                id: editingContract.id,
                contractName: editingContract.contractName,
                contractType: editingContract.contractType as any,
                provider: editingContract.provider,
                contractNumber: editingContract.contractNumber || undefined,
                startDate: editingContract.startDate || undefined,
                endDate: editingContract.endDate || undefined,
                coverageScope: editingContract.coverageScope || undefined,
                monthlyPayment: editingContract.monthlyPayment ? parseFloat(editingContract.monthlyPayment) : undefined,
                annualCost: editingContract.annualCost ? parseFloat(editingContract.annualCost) : undefined,
                autoRenew: editingContract.autoRenew,
                isActive: editingContract.isActive,
            })

            setShowEditModal(false)
            setEditingContract(null)
            fetchData()
        } catch (error) {
            console.error('Error updating contract:', error)
            alert('Failed to update contract. Please try again.')
        }
    }

    const handleDeleteContract = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the contract "${name}"? This action cannot be undone.`)) {
            return
        }

        try {
            await client.models.ServiceContract.delete({ id })
            fetchData()
        } catch (error) {
            console.error('Error deleting contract:', error)
            alert('Failed to delete contract. Please try again.')
        }
    }

    const handleToggleActive = async (contract: any) => {
        try {
            await client.models.ServiceContract.update({
                id: contract.id,
                isActive: !contract.isActive,
            })
            fetchData()
        } catch (error) {
            console.error('Error toggling contract status:', error)
            alert('Failed to update contract status.')
        }
    }

    const handleManageRequirements = (contract: any) => {
        setRequirementsContract(contract)
        setShowRequirementsModal(true)
    }

    const getContractTypeBadge = (type?: string) => {
        const types: Record<string, { label: string; icon: string }> = {
            extended_warranty: { label: 'Extended Warranty', icon: '✅' },
            maintenance_plan: { label: 'Maintenance Plan', icon: '🔧' },
            service_agreement: { label: 'Service Agreement', icon: '📄' },
            subscription: { label: 'Subscription', icon: '🔄' },
            insurance_rider: { label: 'Insurance Rider', icon: '🛡️' },
        }
        const typeInfo = types[type || ''] || { label: 'Unknown', icon: '❓' }
        return (
            <span className="badge badge-info">
                {typeInfo.icon} {typeInfo.label}
            </span>
        )
    }

    const getDaysUntilRenewal = (endDate?: string) => {
        if (!endDate) return null
        const end = new Date(endDate)
        const now = new Date()
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (days < 0) {
            return <span className="badge badge-error">Expired</span>
        } else if (days <= 30) {
            return <span className="badge badge-error">🔴 Renews in {days} days</span>
        } else if (days <= 90) {
            return <span className="badge badge-warning">🟡 Renews in {days} days</span>
        } else {
            return <span className="badge badge-success">🟢 {days} days until renewal</span>
        }
    }

    const getAutoRenewBadge = (autoRenew?: boolean) => {
        if (autoRenew) {
            return <span className="badge badge-info">🔄 Auto-Renew</span>
        }
        return <span className="badge">Manual Renewal</span>
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Service Contracts</h1>
                        <p className="page-subtitle">Track service contracts, maintenance plans, and coverage</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <span>➕</span>
                        Add Contract
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-content">
                            <div className="stat-value">{contracts.length}</div>
                            <div className="stat-label">Total Contracts</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {contracts.filter(c => c.isActive).length}
                            </div>
                            <div className="stat-label">Active</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {contracts.filter(c => c.autoRenew).length}
                            </div>
                            <div className="stat-label">Auto-Renew</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                ${contracts.reduce((sum, c) => sum + (c.monthlyPayment || 0), 0).toFixed(0)}
                            </div>
                            <div className="stat-label">Monthly Cost</div>
                        </div>
                    </div>
                </div>

                {/* Contracts List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading contracts...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>No service contracts yet</h3>
                        <p>Add your first service contract to track coverage and renewals</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Add Your First Contract
                        </button>
                    </div>
                ) : (
                    <div className="contracts-grid">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="contract-card card">
                                <div className="contract-header">
                                    <h3>{contract.contractName}</h3>
                                    {getContractTypeBadge(contract.contractType)}
                                </div>

                                <div className="contract-provider">
                                    <span className="provider-label">Provider:</span>
                                    <span className="provider-name">{contract.provider}</span>
                                </div>

                                <div className="contract-status">
                                    {contract.isActive ? (
                                        <span className="badge badge-success">✅ Active</span>
                                    ) : (
                                        <span className="badge">Inactive</span>
                                    )}
                                    {getAutoRenewBadge(contract.autoRenew)}
                                    {contract.endDate && getDaysUntilRenewal(contract.endDate)}
                                </div>

                                <div className="contract-details">
                                    {contract.contractNumber && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Contract #</span>
                                            <span className="detail-value">{contract.contractNumber}</span>
                                        </div>
                                    )}

                                    {contract.startDate && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Start Date</span>
                                            <span className="detail-value">
                                                {new Date(contract.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {contract.endDate && (
                                        <div className="contract-detail">
                                            <span className="detail-label">End Date</span>
                                            <span className="detail-value">
                                                {new Date(contract.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {contract.monthlyPayment && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Monthly Payment</span>
                                            <span className="detail-value">${contract.monthlyPayment.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {contract.annualCost && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Annual Cost</span>
                                            <span className="detail-value">${contract.annualCost.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {contract.coverageScope && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Coverage</span>
                                            <span className="detail-value">{contract.coverageScope}</span>
                                        </div>
                                    )}

                                    {contract.requiresRegularMaintenance && (
                                        <div className="contract-detail">
                                            <span className="detail-label">Maintenance</span>
                                            <span className="detail-value">
                                                <span className="badge badge-warning">⚠️ Required</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="contract-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleViewContract(contract)}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => handleManageRequirements(contract)}
                                    >
                                        📋 Requirements
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleToggleActive(contract)}
                                    >
                                        {contract.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleEditContract(contract)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => handleDeleteContract(contract.id, contract.contractName)}
                                        style={{ color: 'var(--error-color)', border: '1px solid var(--error-color)', background: 'transparent' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Contract Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Service Contract</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddContract} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="contractName">Contract Name *</label>
                                    <input
                                        id="contractName"
                                        type="text"
                                        className="input"
                                        value={newContract.contractName}
                                        onChange={(e) => setNewContract({ ...newContract, contractName: e.target.value })}
                                        placeholder="e.g., HVAC Maintenance Plan"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="contractType">Contract Type *</label>
                                        <select
                                            id="contractType"
                                            className="input"
                                            value={newContract.contractType}
                                            onChange={(e) => setNewContract({ ...newContract, contractType: e.target.value })}
                                            required
                                        >
                                            <option value="extended_warranty">Extended Warranty</option>
                                            <option value="maintenance_plan">Maintenance Plan</option>
                                            <option value="service_agreement">Service Agreement</option>
                                            <option value="subscription">Subscription</option>
                                            <option value="insurance_rider">Insurance Rider</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="provider">Provider *</label>
                                        <input
                                            id="provider"
                                            type="text"
                                            className="input"
                                            value={newContract.provider}
                                            onChange={(e) => setNewContract({ ...newContract, provider: e.target.value })}
                                            placeholder="e.g., ABC HVAC Services"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="assetId">Link to Asset</label>
                                    <select
                                        id="assetId"
                                        className="input"
                                        value={newContract.assetId}
                                        onChange={(e) => setNewContract({ ...newContract, assetId: e.target.value })}
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
                                    <label htmlFor="contractNumber">Contract Number</label>
                                    <input
                                        id="contractNumber"
                                        type="text"
                                        className="input"
                                        value={newContract.contractNumber}
                                        onChange={(e) => setNewContract({ ...newContract, contractNumber: e.target.value })}
                                        placeholder="Contract or policy number"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="startDate">Start Date</label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            className="input"
                                            value={newContract.startDate}
                                            onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="endDate">End Date</label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            className="input"
                                            value={newContract.endDate}
                                            onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="monthlyPayment">Monthly Payment</label>
                                        <input
                                            id="monthlyPayment"
                                            type="number"
                                            className="input"
                                            value={newContract.monthlyPayment}
                                            onChange={(e) => setNewContract({ ...newContract, monthlyPayment: e.target.value })}
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="annualCost">Annual Cost</label>
                                        <input
                                            id="annualCost"
                                            type="number"
                                            className="input"
                                            value={newContract.annualCost}
                                            onChange={(e) => setNewContract({ ...newContract, annualCost: e.target.value })}
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="coverageScope">Coverage Details</label>
                                    <textarea
                                        id="coverageScope"
                                        className="input"
                                        value={newContract.coverageScope}
                                        onChange={(e) => setNewContract({ ...newContract, coverageScope: e.target.value })}
                                        placeholder="What's covered by this contract?"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newContract.autoRenew}
                                            onChange={(e) => setNewContract({ ...newContract, autoRenew: e.target.checked })}
                                        />
                                        <span>Auto-renew this contract</span>
                                    </label>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Contract
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Contract Modal */}
                {showEditModal && editingContract && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Service Contract</h2>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleUpdateContract} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="editContractName">Contract Name *</label>
                                    <input
                                        id="editContractName"
                                        type="text"
                                        className="input"
                                        value={editingContract.contractName}
                                        onChange={(e) => setEditingContract({ ...editingContract, contractName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editContractType">Contract Type *</label>
                                        <select
                                            id="editContractType"
                                            className="input"
                                            value={editingContract.contractType}
                                            onChange={(e) => setEditingContract({ ...editingContract, contractType: e.target.value })}
                                            required
                                        >
                                            <option value="extended_warranty">Extended Warranty</option>
                                            <option value="maintenance_plan">Maintenance Plan</option>
                                            <option value="service_agreement">Service Agreement</option>
                                            <option value="subscription">Subscription</option>
                                            <option value="insurance_rider">Insurance Rider</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editProvider">Provider *</label>
                                        <input
                                            id="editProvider"
                                            type="text"
                                            className="input"
                                            value={editingContract.provider}
                                            onChange={(e) => setEditingContract({ ...editingContract, provider: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editContractNumber">Contract Number</label>
                                    <input
                                        id="editContractNumber"
                                        type="text"
                                        className="input"
                                        value={editingContract.contractNumber}
                                        onChange={(e) => setEditingContract({ ...editingContract, contractNumber: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editStartDate">Start Date</label>
                                        <input
                                            id="editStartDate"
                                            type="date"
                                            className="input"
                                            value={editingContract.startDate}
                                            onChange={(e) => setEditingContract({ ...editingContract, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editEndDate">End Date</label>
                                        <input
                                            id="editEndDate"
                                            type="date"
                                            className="input"
                                            value={editingContract.endDate}
                                            onChange={(e) => setEditingContract({ ...editingContract, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editMonthlyPayment">Monthly Payment</label>
                                        <input
                                            id="editMonthlyPayment"
                                            type="number"
                                            className="input"
                                            value={editingContract.monthlyPayment}
                                            onChange={(e) => setEditingContract({ ...editingContract, monthlyPayment: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editAnnualCost">Annual Cost</label>
                                        <input
                                            id="editAnnualCost"
                                            type="number"
                                            className="input"
                                            value={editingContract.annualCost}
                                            onChange={(e) => setEditingContract({ ...editingContract, annualCost: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editCoverageScope">Coverage Details</label>
                                    <textarea
                                        id="editCoverageScope"
                                        className="input"
                                        value={editingContract.coverageScope}
                                        onChange={(e) => setEditingContract({ ...editingContract, coverageScope: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingContract.autoRenew}
                                            onChange={(e) => setEditingContract({ ...editingContract, autoRenew: e.target.checked })}
                                        />
                                        <span>Auto-renew this contract</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingContract.isActive}
                                            onChange={(e) => setEditingContract({ ...editingContract, isActive: e.target.checked })}
                                        />
                                        <span>Contract is active</span>
                                    </label>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Contract
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Contract Modal */}
                {showViewModal && viewingContract && (
                    <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{viewingContract.contractName}</h2>
                                <button className="modal-close" onClick={() => setShowViewModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="view-section">
                                    <h3>Contract Information</h3>
                                    <div className="view-grid">
                                        <div className="view-item">
                                            <span className="view-label">Type</span>
                                            <span className="view-value">{getContractTypeBadge(viewingContract.contractType)}</span>
                                        </div>
                                        <div className="view-item">
                                            <span className="view-label">Provider</span>
                                            <span className="view-value">{viewingContract.provider}</span>
                                        </div>
                                        {viewingContract.contractNumber && (
                                            <div className="view-item">
                                                <span className="view-label">Contract Number</span>
                                                <span className="view-value">{viewingContract.contractNumber}</span>
                                            </div>
                                        )}
                                        <div className="view-item">
                                            <span className="view-label">Status</span>
                                            <span className="view-value">
                                                {viewingContract.isActive ? (
                                                    <span className="badge badge-success">✅ Active</span>
                                                ) : (
                                                    <span className="badge">Inactive</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="view-section">
                                    <h3>Coverage Period</h3>
                                    <div className="view-grid">
                                        {viewingContract.startDate && (
                                            <div className="view-item">
                                                <span className="view-label">Start Date</span>
                                                <span className="view-value">
                                                    {new Date(viewingContract.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        {viewingContract.endDate && (
                                            <div className="view-item">
                                                <span className="view-label">End Date</span>
                                                <span className="view-value">
                                                    {new Date(viewingContract.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        {viewingContract.endDate && (
                                            <div className="view-item">
                                                <span className="view-label">Renewal Status</span>
                                                <span className="view-value">{getDaysUntilRenewal(viewingContract.endDate)}</span>
                                            </div>
                                        )}
                                        <div className="view-item">
                                            <span className="view-label">Auto-Renew</span>
                                            <span className="view-value">{getAutoRenewBadge(viewingContract.autoRenew)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="view-section">
                                    <h3>Cost Information</h3>
                                    <div className="view-grid">
                                        {viewingContract.monthlyPayment && (
                                            <div className="view-item">
                                                <span className="view-label">Monthly Payment</span>
                                                <span className="view-value">${viewingContract.monthlyPayment.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {viewingContract.annualCost && (
                                            <div className="view-item">
                                                <span className="view-label">Annual Cost</span>
                                                <span className="view-value">${viewingContract.annualCost.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {viewingContract.coverageScope && (
                                    <div className="view-section">
                                        <h3>Coverage Details</h3>
                                        <p className="view-description">{viewingContract.coverageScope}</p>
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowViewModal(false)
                                            handleEditContract(viewingContract)
                                        }}
                                    >
                                        Edit Contract
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={() => setShowViewModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contract Requirements Modal */}
                {showRequirementsModal && requirementsContract && (
                    <ContractRequirements
                        contractId={requirementsContract.id}
                        contractName={requirementsContract.contractName}
                        assetId={requirementsContract.assetId}
                        onClose={() => {
                            setShowRequirementsModal(false)
                            setRequirementsContract(null)
                        }}
                    />
                )}
            </div>
        </Layout>
    )
}
