/**
 * @fileoverview Assets page - Manage all assets
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import { seedDatabase } from '../utils/seedData'
import './Assets.css'

const client = generateClient<Schema>()

export default function Assets() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [seeding, setSeeding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        manufacturer: '',
        model: '',
        purchaseDate: '',
        purchasePrice: '',
        inServiceDate: '',
    })

    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        try {
            const { data } = await client.models.Asset.list({})
            setAssets(data)
        } catch (error) {
            console.error('Error fetching assets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSeedData = async () => {
        setSeeding(true)
        try {
            await seedDatabase(client)
            await fetchAssets()
            alert('Sample data generated successfully!')
        } catch (error) {
            console.error('Error seeding data:', error)
            alert('Failed to generate sample data.')
        } finally {
            setSeeding(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
        try {
            await client.models.Asset.delete({ id })
            fetchAssets()
        } catch (error) {
            console.error('Error deleting asset:', error)
            alert('Failed to delete asset.')
        }
    }

    const handleAddClick = () => {
        setEditingId(null)
        setFormData({
            name: '',
            category: '',
            manufacturer: '',
            model: '',
            purchaseDate: '',
            purchasePrice: '',
            inServiceDate: '',
        })
        setShowModal(true)
    }

    const handleEditClick = (asset: any) => {
        setEditingId(asset.id)
        setFormData({
            name: asset.name,
            category: asset.category,
            manufacturer: asset.manufacturer || '',
            model: asset.model || '',
            purchaseDate: asset.purchaseDate || '',
            purchasePrice: asset.purchasePrice?.toString() || '',
            inServiceDate: asset.inServiceDate || '',
        })
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingId(null)
    }

    const handleSaveAsset = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                await client.models.Asset.update({
                    id: editingId,
                    name: formData.name,
                    category: formData.category,
                    manufacturer: formData.manufacturer,
                    model: formData.model,
                    purchaseDate: formData.purchaseDate || undefined,
                    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                    inServiceDate: formData.inServiceDate || undefined,
                })
            } else {
                await client.models.Asset.create({
                    name: formData.name,
                    category: formData.category,
                    manufacturer: formData.manufacturer,
                    model: formData.model,
                    purchaseDate: formData.purchaseDate || undefined,
                    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                    inServiceDate: formData.inServiceDate || undefined,
                    status: 'active',
                })
            }
            setShowModal(false)
            setEditingId(null)
            setFormData({
                name: '',
                category: '',
                manufacturer: '',
                model: '',
                purchaseDate: '',
                purchasePrice: '',
                inServiceDate: '',
            })
            fetchAssets()
        } catch (error) {
            console.error('Error saving asset:', error)
        }
    }

    const getHealthBadge = (status?: string) => {
        switch (status) {
            case 'excellent':
                return <span className="badge badge-success">🟢 Excellent</span>
            case 'good':
                return <span className="badge badge-info">🔵 Good</span>
            case 'attention':
                return <span className="badge badge-warning">🟡 Attention</span>
            case 'critical':
                return <span className="badge badge-error">🔴 Critical</span>
            default:
                return <span className="badge">⚪ Unknown</span>
        }
    }

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Assets</h1>
                        <p className="page-subtitle">Manage your assets and equipment</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        <span>➕</span>
                        Add Asset
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏠</div>
                        <div className="stat-content">
                            <div className="stat-value">{assets.length}</div>
                            <div className="stat-label">Total Assets</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {assets.filter(a => a.healthStatus === 'excellent' || a.healthStatus === 'good').length}
                            </div>
                            <div className="stat-label">Healthy</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🟡</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {assets.filter(a => a.healthStatus === 'attention').length}
                            </div>
                            <div className="stat-label">Need Attention</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {assets.filter(a => a.healthStatus === 'critical').length}
                            </div>
                            <div className="stat-label">Critical</div>
                        </div>
                    </div>
                </div>

                {/* Assets Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading assets...</p>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>No assets yet</h3>
                        <p>Get started by adding your first asset or generating sample data.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleAddClick}>
                                Add Asset
                            </button>
                            <button className="btn btn-secondary" onClick={handleSeedData} disabled={seeding}>
                                {seeding ? 'Generating...' : 'Generate Sample Data'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="assets-grid">
                        {assets.map((asset) => (
                            <div key={asset.id} className="asset-card card">
                                <div className="asset-header">
                                    <h3>
                                        <Link to={`/assets/${asset.id}`} className="asset-title-link">
                                            {asset.name}
                                        </Link>
                                    </h3>
                                    {getHealthBadge(asset.healthStatus)}
                                </div>
                                <div className="asset-details">
                                    <div className="asset-detail">
                                        <span className="detail-label">Category</span>
                                        <span className="detail-value">{asset.category}</span>
                                    </div>
                                    {asset.manufacturer && (
                                        <div className="asset-detail">
                                            <span className="detail-label">Manufacturer</span>
                                            <span className="detail-value">{asset.manufacturer}</span>
                                        </div>
                                    )}
                                    {asset.model && (
                                        <div className="asset-detail">
                                            <span className="detail-label">Model</span>
                                            <span className="detail-value">{asset.model}</span>
                                        </div>
                                    )}
                                    {asset.purchaseDate && (
                                        <div className="asset-detail">
                                            <span className="detail-label">Purchase Date</span>
                                            <span className="detail-value">
                                                {new Date(asset.purchaseDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {asset.inServiceDate && (
                                        <div className="asset-detail">
                                            <span className="detail-label">In-Service Date</span>
                                            <span className="detail-value">
                                                {new Date(asset.inServiceDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="asset-actions">
                                    <Link to={`/assets/${asset.id}`} className="btn btn-secondary btn-sm">View</Link>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleEditClick(asset)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => handleDelete(asset.id, asset.name)}
                                        style={{ marginLeft: 'auto', color: 'var(--error-color)', border: '1px solid var(--error-color)', background: 'transparent' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Asset Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingId ? 'Edit Asset' : 'Add New Asset'}</h2>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSaveAsset} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Asset Name *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., 2020 Honda Civic"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category *</label>
                                    <input
                                        id="category"
                                        type="text"
                                        className="input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g., Vehicle, Appliance, Equipment"
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="manufacturer">Manufacturer</label>
                                        <input
                                            id="manufacturer"
                                            type="text"
                                            className="input"
                                            value={formData.manufacturer}
                                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                            placeholder="e.g., Honda"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="model">Model</label>
                                        <input
                                            id="model"
                                            type="text"
                                            className="input"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="e.g., Civic LX"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="purchaseDate">Purchase Date</label>
                                        <input
                                            id="purchaseDate"
                                            type="date"
                                            className="input"
                                            value={formData.purchaseDate}
                                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="purchasePrice">Purchase Price</label>
                                        <input
                                            id="purchasePrice"
                                            type="number"
                                            className="input"
                                            value={formData.purchasePrice}
                                            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inServiceDate">In-Service Date</label>
                                    <input
                                        id="inServiceDate"
                                        type="date"
                                        className="input"
                                        value={formData.inServiceDate}
                                        onChange={(e) => setFormData({ ...formData, inServiceDate: e.target.value })}
                                    />
                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                                        When the asset was put into service (used for contract maintenance schedules)
                                    </small>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? 'Save Changes' : 'Add Asset'}
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
