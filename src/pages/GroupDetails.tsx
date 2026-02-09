
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import Layout from '../components/Layout'
import './Groups.css' // Reusing groups styles
import './Assets.css' // Reusing assets styles for the list

const client = generateClient<Schema>()

export default function GroupDetails() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const [group, setGroup] = useState<any>(null)
    const [subGroups, setSubGroups] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (groupId) {
            fetchGroupDetails()
        }
    }, [groupId])

    const fetchGroupDetails = async () => {
        setLoading(true)
        try {
            // 1. Fetch Group Info
            const groupResult = await client.models.AssetGroup.get({ id: groupId! })
            setGroup(groupResult.data)

            // 2. Fetch Sub-groups (children)
            // Note: Schema has `childGroups` hasMany, but list with filter is often safer/easier to reason about in client
            const subGroupsResult = await client.models.AssetGroup.list({
                filter: { parentGroupId: { eq: groupId } }
            })
            setSubGroups(subGroupsResult.data)

            // 3. Fetch Assets in this Group
            // We need to query the membership table
            const membershipResult = await client.models.AssetGroupMembership.list({
                filter: { groupId: { eq: groupId } },
                selectionSet: ['assetId', 'asset.*'] // Attempt to get linked asset data
            })

            // If selectionSet works perfectly, we have assets. 
            // If not, we might need manual fetch, but let's try mapping first.
            // The V6 client usually returns the relation if requested or lazily. 
            // For now, let's assume we might get partial data or need a second pass if selectionSet isn't fully supported in this version.
            // Actually, for simplicity and robustness in this demo, let's do:
            // Fetch all memberships, then fetch assets if needed. 
            // But `selectionSet` is the modern way. Let's try to rely on what `asset()` returns if it's a dedicated method or property.

            // Simplest robust approach for now without complex selection sets debugging:
            const memberships = membershipResult.data
            const assetPromises = memberships.map(m => m.asset())
            const assetsData = await Promise.all(assetPromises)
            // Filter out any nulls (deleted assets?)
            setAssets(assetsData.map(a => a.data).filter(Boolean))

        } catch (error) {
            console.error('Error fetching group details:', error)
        } finally {
            setLoading(false)
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
                <div className="page-container loading-container">
                    <div className="spinner"></div>
                    <p>Loading details...</p>
                </div>
            </Layout>
        )
    }

    if (!group) {
        return (
            <Layout>
                <div className="page-container">
                    <div className="empty-state">
                        <h3>Group not found</h3>
                        <button className="btn btn-primary" onClick={() => navigate('/groups')}>Back to Groups</button>
                    </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <Link to="/groups" className="btn btn-ghost btn-sm">← Back to Groups</Link>
                            {group.parentGroupId && (
                                <Link to={`/groups/${group.parentGroupId}`} className="btn btn-ghost btn-sm">
                                    ↑ Up to Parent
                                </Link>
                            )}
                        </div>
                        <h1>
                            {group.icon && <span style={{ marginRight: '10px' }}>{group.icon}</span>}
                            {group.name}
                        </h1>
                        <p className="page-subtitle">{group.description || 'No description'}</p>
                    </div>
                    <div>
                        {getGroupTypeBadge(group.groupType)}
                    </div>
                </div>

                {/* Sub-Groups Section */}
                <section className="details-section">
                    <h2 className="section-title">Sub-Groups ({subGroups.length})</h2>
                    {subGroups.length > 0 ? (
                        <div className="groups-grid">
                            {subGroups.map((subGroup) => (
                                <Link key={subGroup.id} to={`/groups/${subGroup.id}`} className="group-card card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="group-header">
                                        <div className="group-icon">
                                            {subGroup.groupType === 'location' ? '📍' :
                                                subGroup.groupType === 'system' ? '⚙️' :
                                                    subGroup.groupType === 'category' ? '🏷️' : '📁'}
                                        </div>
                                        <div className="group-title">
                                            <h3>{subGroup.name}</h3>
                                            {getGroupTypeBadge(subGroup.groupType)}
                                        </div>
                                    </div>
                                    {subGroup.description && (
                                        <p className="group-description">{subGroup.description}</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary">No sub-groups found.</p>
                    )}
                </section>

                <hr className="divider" />

                {/* Assets Section */}
                <section className="details-section">
                    <h2 className="section-title">Assets ({assets.length})</h2>
                    {assets.length > 0 ? (
                        <div className="assets-grid">
                            {assets.map((asset) => (
                                <Link key={asset.id} to={`/assets/${asset.id}`} className="asset-card card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="asset-header">
                                        <h3>{asset.name}</h3>
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
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-secondary">No assets assigned to this group.</p>
                    )}
                </section>
            </div>
        </Layout>
    )
}
