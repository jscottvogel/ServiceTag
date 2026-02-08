/**
 * @fileoverview Documents page - Store and organize important documents
 */

import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import { uploadData, getUrl } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Documents.css'

const client = generateClient<Schema>()

export default function Documents() {
    const [documents, setDocuments] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [newDocument, setNewDocument] = useState({
        documentName: '',
        documentType: 'manual',
        description: '',
        fileUrl: '',
        assetId: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [documentsData, assetsData] = await Promise.all([
                client.models.Document.list({}),
                client.models.Asset.list({}),
            ])
            setDocuments(documentsData.data)
            setAssets(assetsData.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            // Auto-fill document name if empty
            if (!newDocument.documentName) {
                setNewDocument({ ...newDocument, documentName: file.name })
            }
        }
    }

    const uploadFileToS3 = async (file: File): Promise<string> => {
        try {
            setUploading(true)
            setUploadProgress(0)

            const fileName = `documents/${Date.now()}-${file.name}`

            await uploadData({
                path: fileName,
                data: file,
                options: {
                    onProgress: ({ transferredBytes, totalBytes }) => {
                        if (totalBytes) {
                            const progress = Math.round((transferredBytes / totalBytes) * 100)
                            setUploadProgress(progress)
                        }
                    },
                },
            }).result

            // Get the URL for the uploaded file
            const urlResult = await getUrl({
                path: fileName,
            })

            return urlResult.url.toString()
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let fileUrl = newDocument.fileUrl

            // Upload file to S3 if selected
            if (selectedFile) {
                fileUrl = await uploadFileToS3(selectedFile)
            }

            await client.models.Document.create({
                documentName: newDocument.documentName,
                documentType: newDocument.documentType as any,
                description: newDocument.description || undefined,
                fileUrl: fileUrl || undefined,
                assetId: newDocument.assetId || undefined,
                uploadDate: new Date().toISOString(),
            })

            setShowAddModal(false)
            setNewDocument({
                documentName: '',
                documentType: 'manual',
                description: '',
                fileUrl: '',
                assetId: '',
            })
            setSelectedFile(null)
            fetchData()
        } catch (error) {
            console.error('Error creating document:', error)
            alert('Failed to create document. Please try again.')
        }
    }

    const getDocumentTypeBadge = (type?: string) => {
        const types: Record<string, { label: string; icon: string; color: string }> = {
            manual: { label: 'Manual', icon: '📖', color: 'info' },
            warranty: { label: 'Warranty', icon: '✅', color: 'success' },
            receipt: { label: 'Receipt', icon: '🧾', color: 'warning' },
            invoice: { label: 'Invoice', icon: '💰', color: 'warning' },
            insurance: { label: 'Insurance', icon: '🛡️', color: 'info' },
            registration: { label: 'Registration', icon: '📋', color: 'info' },
            inspection: { label: 'Inspection', icon: '🔍', color: 'success' },
            other: { label: 'Other', icon: '📄', color: '' },
        }
        const typeInfo = types[type || 'other'] || types.other
        return (
            <span className={`badge ${typeInfo.color ? `badge-${typeInfo.color}` : ''}`}>
                {typeInfo.icon} {typeInfo.label}
            </span>
        )
    }

    const getAssetName = (assetId?: string) => {
        if (!assetId) return 'No asset linked'
        const asset = assets.find(a => a.id === assetId)
        return asset?.name || 'Unknown Asset'
    }

    const groupDocumentsByType = () => {
        const grouped: Record<string, any[]> = {}
        documents.forEach(doc => {
            const type = doc.documentType || 'other'
            if (!grouped[type]) {
                grouped[type] = []
            }
            grouped[type].push(doc)
        })
        return grouped
    }

    const groupedDocuments = groupDocumentsByType()

    return (
        <Layout>
            <div className="page-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Documents</h1>
                        <p className="page-subtitle">Store and organize all your important documents</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <span>➕</span>
                        Add Document
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-content">
                            <div className="stat-value">{documents.length}</div>
                            <div className="stat-label">Total Documents</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📖</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {documents.filter(d => d.documentType === 'manual').length}
                            </div>
                            <div className="stat-label">Manuals</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {documents.filter(d => d.documentType === 'warranty').length}
                            </div>
                            <div className="stat-label">Warranties</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🧾</div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {documents.filter(d => d.documentType === 'receipt' || d.documentType === 'invoice').length}
                            </div>
                            <div className="stat-label">Receipts</div>
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <h3>No documents yet</h3>
                        <p>Upload your first document to get started</p>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            Upload Your First Document
                        </button>
                    </div>
                ) : (
                    <div className="documents-container">
                        {Object.entries(groupedDocuments).map(([type, docs]) => (
                            <div key={type} className="document-group">
                                <h2 className="group-title">
                                    {getDocumentTypeBadge(type)}
                                    <span className="group-count">({docs.length})</span>
                                </h2>
                                <div className="documents-grid">
                                    {docs.map((doc) => (
                                        <div key={doc.id} className="document-card card">
                                            <div className="document-icon">
                                                {type === 'manual' && '📖'}
                                                {type === 'warranty' && '✅'}
                                                {type === 'receipt' && '🧾'}
                                                {type === 'invoice' && '💰'}
                                                {type === 'insurance' && '🛡️'}
                                                {type === 'registration' && '📋'}
                                                {type === 'inspection' && '🔍'}
                                                {type === 'other' && '📄'}
                                            </div>
                                            <div className="document-info">
                                                <h3>{doc.documentName}</h3>
                                                {doc.description && (
                                                    <p className="document-description">{doc.description}</p>
                                                )}
                                                <div className="document-meta">
                                                    <span className="meta-item">
                                                        🏠 {getAssetName(doc.assetId)}
                                                    </span>
                                                    {doc.uploadDate && (
                                                        <span className="meta-item">
                                                            📅 {new Date(doc.uploadDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="document-actions">
                                                {doc.fileUrl ? (
                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                        View
                                                    </a>
                                                ) : (
                                                    <button className="btn btn-secondary btn-sm" disabled>
                                                        No file
                                                    </button>
                                                )}
                                                <button className="btn btn-ghost btn-sm">Edit</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Document Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add Document</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleAddDocument} className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="documentName">Document Name *</label>
                                    <input
                                        id="documentName"
                                        type="text"
                                        className="input"
                                        value={newDocument.documentName}
                                        onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                                        placeholder="e.g., Owner's Manual"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="documentType">Document Type *</label>
                                        <select
                                            id="documentType"
                                            className="input"
                                            value={newDocument.documentType}
                                            onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                                            required
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="warranty">Warranty</option>
                                            <option value="receipt">Receipt</option>
                                            <option value="invoice">Invoice</option>
                                            <option value="insurance">Insurance</option>
                                            <option value="registration">Registration</option>
                                            <option value="inspection">Inspection</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="assetId">Link to Asset</label>
                                        <select
                                            id="assetId"
                                            className="input"
                                            value={newDocument.assetId}
                                            onChange={(e) => setNewDocument({ ...newDocument, assetId: e.target.value })}
                                        >
                                            <option value="">No asset</option>
                                            {assets.map((asset) => (
                                                <option key={asset.id} value={asset.id}>
                                                    {asset.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="input"
                                        value={newDocument.description}
                                        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                                        placeholder="Brief description of the document"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fileUpload">Upload File</label>
                                    <input
                                        id="fileUpload"
                                        type="file"
                                        className="input"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                    />
                                    {selectedFile && (
                                        <p className="form-hint">
                                            📎 Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                    {uploading && (
                                        <div className="upload-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <p className="progress-text">Uploading... {uploadProgress}%</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fileUrl">Or Paste File URL</label>
                                    <input
                                        id="fileUrl"
                                        type="url"
                                        className="input"
                                        value={newDocument.fileUrl}
                                        onChange={(e) => setNewDocument({ ...newDocument, fileUrl: e.target.value })}
                                        placeholder="https://example.com/document.pdf"
                                        disabled={!!selectedFile}
                                    />
                                    <p className="form-hint">
                                        💡 Upload a file above or paste a URL to an existing document
                                    </p>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={uploading}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Add Document'}
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
