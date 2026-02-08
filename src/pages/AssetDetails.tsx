/**
 * @fileoverview Asset Details page - View full history and details for a single asset
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './AssetDetails.css'

const client = generateClient<Schema>()

export default function AssetDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [asset, setAsset] = useState<any>(null)
    const [tasks, setTasks] = useState<any[]>([])
    const [warranties, setWarranties] = useState<any[]>([])
    const [contracts, setContracts] = useState<any[]>([])
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (id) {
            fetchAssetDetails(id)
        }
    }, [id])

    const fetchAssetDetails = async (assetId: string) => {
        try {
            // Parallel fetch for all related data
            // Note: In a real app with many items, we might paginate or load these on tab switch
            const [
                assetData,
                tasksData,
                warrantiesData,
                contractsData,
                documentsData
            ] = await Promise.all([
                client.models.Asset.get({ id: assetId }),
                client.models.MaintenanceTask.list({
                    filter: { assetId: { eq: assetId } }
                }),
                // For relationships like warranties/contracts which are many-to-many, 
                // we might typically query the junction table. 
                // For simplicity in this MVP, we'll list all and filter in memory or fetch via the asset's lazy loaded relations if configured.
                // Given the schema, let's try direct list with filter if possible or just list all for now (MVP optimization later)
                client.models.Warranty.list({}),
                client.models.ServiceContract.list({}),
                client.models.Document.list({
                    filter: { assetId: { eq: assetId } }
                })
            ])

            setAsset(assetData.data)
            setTasks(tasksData.data)
            setDocuments(documentsData.data)

            // Filter warranties/contracts manually for now as they are many-to-many relationships
            // In a production app with Amplify Gen 2, we'd use the nested selection set or dedicated query
            // For this MVP, we will fetch linked warranties via AssetWarranty
            const assetWarranties = await client.models.AssetWarranty.list({
                filter: { assetId: { eq: assetId } }
            })
            const linkedWarrantyIds = new Set(assetWarranties.data.map(aw => aw.warrantyId))
            setWarranties(warrantiesData.data.filter(w => linkedWarrantyIds.has(w.id)))

            const assetContracts = await client.models.AssetContract.list({
                filter: { assetId: { eq: assetId } }
            })
            const linkedContractIds = new Set(assetContracts.data.map(ac => ac.contractId))
            setContracts(contractsData.data.filter(c => linkedContractIds.has(c.id)))

        } catch (error) {
            console.error('Error fetching asset details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAsset = async () => {
        if (!asset || !window.confirm('Are you sure you want to delete this asset? This cannot be undone.')) return

        try {
            await client.models.Asset.delete({ id: asset.id })
            navigate('/assets')
        } catch (error) {
            console.error('Error deleting asset:', error)
            alert('Failed to delete asset. Please try again.')
        }
    }

    const getHealthBadge = (status?: string) => {
        switch (status) {
            case 'excellent': return <span className="badge badge-success">🟢 Excellent</span>
            case 'good': return <span className="badge badge-info">🔵 Good</span>
            case 'attention': return <span className="badge badge-warning">🟡 Attention</span>
            case 'critical': return <span className="badge badge-error">🔴 Critical</span>
            default: return <span className="badge">⚪ Unknown</span>
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading asset details...</p>
                </div>
            </Layout>
        )
    }

    if (!asset) {
        return (
            <Layout>
                <div className="error-container">
                    <h3>Asset not found</h3>
                    <Link to="/assets" className="btn btn-primary">Back to Assets</Link>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header with Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/assets">Assets</Link> &gt; <span>{asset.name}</span>
                </div>

                <div className="asset-header-card">
                    <div className="asset-header-main">
                        <div className="asset-icon-large">
                            {asset.category === 'Vehicle' ? '🚗' :
                                asset.category === 'Appliance' ? '🔌' : '📦'}
                        </div>
                        <div>
                            <h1>{asset.name}</h1>
                            <div className="asset-meta">
                                <span className="meta-item">{asset.category} {asset.manufacturer ? `• ${asset.manufacturer}` : ''} {asset.model ? `• ${asset.model}` : ''}</span>
                            </div>
                        </div>
                        <div className="asset-status-badge">
                            {getHealthBadge(asset.healthStatus)}
                        </div>
                    </div>
                    <div className="asset-actions">
                        <button className="btn btn-secondary">Edit Details</button>
                        <button className="btn btn-error-outline" onClick={handleDeleteAsset}>Delete</button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="tabs-nav">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        Maintenance <span className="count-badge">{tasks.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
                        onClick={() => setActiveTab('warranty')}
                    >
                        Warranties <span className="count-badge">{warranties.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'contract' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contract')}
                    >
                        Contracts <span className="count-badge">{contracts.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        Documents <span className="count-badge">{documents.length}</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            <div className="detail-card card">
                                <h3>Details</h3>
                                <div className="detail-list">
                                    <div className="detail-row">
                                        <span className="label">Manufacturer</span>
                                        <span className="value">{asset.manufacturer || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Model</span>
                                        <span className="value">{asset.model || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Serial Number</span>
                                        <span className="value">{asset.serialNumber || '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Purchase Date</span>
                                        <span className="value">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Purchase Price</span>
                                        <span className="value">{asset.purchasePrice ? `$${asset.purchasePrice.toFixed(2)}` : '-'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Location</span>
                                        <span className="value">{asset.location || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-card card">
                                <h3>Quick Stats</h3>
                                <div className="quick-stats">
                                    <div className="quick-stat-item">
                                        <span className="stat-label">Total Cost</span>
                                        <span className="stat-value-large">${(asset.totalMaintenanceCost || 0).toFixed(0)}</span>
                                    </div>
                                    <div className="quick-stat-item">
                                        <span className="stat-label">Tasks Due</span>
                                        <span className="stat-value-large">{tasks.filter(t => t.isActive && !t.isOverdue).length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section if needed */}
                            {asset.notes && (
                                <div className="detail-card card full-width">
                                    <h3>Notes</h3>
                                    <p>{asset.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MAINTENANCE TAB */}
                    {activeTab === 'maintenance' && (
                        <div className="tab-section">
                            <div className="section-header">
                                <h2>Maintenance Tasks</h2>
                                <button className="btn btn-primary btn-sm">Add Task</button>
                            </div>
                            {tasks.length === 0 ? (
                                <div className="empty-state-small">No tasks created yet.</div>
                            ) : (
                                <div className="task-list">
                                    {tasks.map(task => (
                                        <div key={task.id} className="task-item card">
                                            <div className="task-info">
                                                <h4>{task.taskName}</h4>
                                                <p>{task.intervalType} • Next due: {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'Not scheduled'}</p>
                                            </div>
                                            <div className="task-status">
                                                {task.isOverdue ? <span className="badge badge-error">Overdue</span> : <span className="badge badge-success">On Track</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* WARRANTY TAB */}
                    {activeTab === 'warranty' && (
                        <div className="tab-section">
                            <div className="section-header">
                                <h2>Warranties</h2>
                                <button className="btn btn-primary btn-sm">Add Warranty</button>
                            </div>
                            {warranties.length === 0 ? (
                                <div className="empty-state-small">No warranties linked.</div>
                            ) : (
                                <div className="warranties-list">
                                    {warranties.map(warranty => (
                                        <div key={warranty.id} className="warranty-item card">
                                            <div className="warranty-info">
                                                <h4>{warranty.warrantyName}</h4>
                                                <p>{warranty.provider} • Expires: {warranty.endDate ? new Date(warranty.endDate).toLocaleDateString() : 'Lifetime'}</p>
                                            </div>
                                            <div className="warranty-status">
                                                <span className="badge badge-info">{warranty.warrantyType}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTRACTS TAB */}
                    {activeTab === 'contract' && (
                        <div className="tab-section">
                            <div className="section-header">
                                <h2>Service Contracts</h2>
                                <button className="btn btn-primary btn-sm">Add Contract</button>
                            </div>
                            {contracts.length === 0 ? (
                                <div className="empty-state-small">No contracts linked.</div>
                            ) : (
                                <div className="contracts-list">
                                    {contracts.map(contract => (
                                        <div key={contract.id} className="contract-item card">
                                            <div className="contract-info">
                                                <h4>{contract.contractName}</h4>
                                                <p>{contract.provider} • {contract.contractType}</p>
                                            </div>
                                            <div className="contract-cost">
                                                <span>{contract.monthlyPayment ? `$${contract.monthlyPayment}/mo` : 'No recurring cost'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DOCUMENTS TAB */}
                    {activeTab === 'documents' && (
                        <div className="tab-section">
                            <div className="section-header">
                                <h2>Documents</h2>
                                <button className="btn btn-primary btn-sm">Upload Document</button>
                            </div>
                            {documents.length === 0 ? (
                                <div className="empty-state-small">No documents uploaded.</div>
                            ) : (
                                <div className="documents-grid-small">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="document-item card">
                                            <div className="doc-icon">📄</div>
                                            <div className="doc-info">
                                                <h4>{doc.documentName}</h4>
                                                <p>{doc.documentType}</p>
                                                {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    )
}
