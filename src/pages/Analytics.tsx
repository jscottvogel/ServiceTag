import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import './Analytics.css'

const client = generateClient<Schema>()

interface CostData {
    month: string
    totalCost: number
    maintenanceCost: number
    contractCost: number
}

interface AssetHealthData {
    assetName: string
    healthStatus: string
    lastCheck: string
    maintenanceCost: number
}

export default function Analytics() {
    const [assets, setAssets] = useState<any[]>([])
    const [_maintenanceTasks, setMaintenanceTasks] = useState<any[]>([])
    const [_serviceRecords, setServiceRecords] = useState<any[]>([])
    const [_contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Calculated metrics
    const [totalAssetValue, setTotalAssetValue] = useState(0)
    const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0)
    const [totalContractCost, setTotalContractCost] = useState(0)
    const [avgMonthlySpend, setAvgMonthlySpend] = useState(0)
    const [costTrend, setCostTrend] = useState<CostData[]>([])
    const [healthBreakdown, setHealthBreakdown] = useState<AssetHealthData[]>([])

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch all data in parallel
            const [assetsRes, tasksRes, recordsRes, contractsRes] = await Promise.all([
                client.models.Asset.list({}),
                client.models.MaintenanceTask.list({}),
                client.models.ServiceRecord.list({}),
                client.models.ServiceContract.list({})
            ])

            const assetsData = assetsRes.data || []
            const tasksData = tasksRes.data || []
            const recordsData = recordsRes.data || []
            const contractsData = contractsRes.data || []

            setAssets(assetsData)
            setMaintenanceTasks(tasksData)
            setServiceRecords(recordsData)
            setContracts(contractsData)

            // Calculate metrics
            calculateMetrics(assetsData, recordsData, contractsData)
            calculateCostTrend(recordsData, contractsData)
            calculateHealthBreakdown(assetsData, recordsData)

        } catch (error) {
            console.error('Error fetching analytics data:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateMetrics = (assetsData: any[], recordsData: any[], contractsData: any[]) => {
        // Total asset value
        const assetValue = assetsData.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0)
        setTotalAssetValue(assetValue)

        // Total maintenance cost
        const maintenanceCost = recordsData.reduce((sum, record) => sum + (record.totalCost || 0), 0)
        setTotalMaintenanceCost(maintenanceCost)

        // Total contract cost (annual)
        const contractCost = contractsData.reduce((sum, contract) => {
            if (contract.costType === 'monthly' && contract.costAmount) {
                return sum + (contract.costAmount * 12)
            } else if (contract.costType === 'annual' && contract.costAmount) {
                return sum + contract.costAmount
            } else if (contract.costType === 'one_time' && contract.costAmount) {
                return sum + contract.costAmount
            }
            return sum
        }, 0)
        setTotalContractCost(contractCost)

        // Average monthly spend (maintenance + contracts)
        const monthlyContractCost = contractsData.reduce((sum, contract) => {
            if (contract.costType === 'monthly' && contract.costAmount) {
                return sum + contract.costAmount
            }
            return sum
        }, 0)
        const avgMonthly = (maintenanceCost / 12) + monthlyContractCost
        setAvgMonthlySpend(avgMonthly)
    }

    const calculateCostTrend = (recordsData: any[], contractsData: any[]) => {
        // Generate last 6 months of data
        const months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

            // Calculate maintenance cost for this month
            const maintenanceCost = recordsData
                .filter(record => {
                    if (!record.serviceDate) return false
                    const recordDate = new Date(record.serviceDate)
                    return recordDate.getMonth() === date.getMonth() &&
                        recordDate.getFullYear() === date.getFullYear()
                })
                .reduce((sum, record) => sum + (record.totalCost || 0), 0)

            // Calculate contract cost for this month
            const contractCost = contractsData
                .filter(contract => contract.costType === 'monthly' && contract.isActive)
                .reduce((sum, contract) => sum + (contract.costAmount || 0), 0)

            months.push({
                month: monthStr,
                maintenanceCost,
                contractCost,
                totalCost: maintenanceCost + contractCost
            })
        }

        setCostTrend(months)
    }

    const calculateHealthBreakdown = (assetsData: any[], recordsData: any[]) => {
        const healthData = assetsData.map(asset => {
            // Calculate total maintenance cost for this asset
            const assetMaintenanceCost = recordsData
                .filter(record => record.assetId === asset.id)
                .reduce((sum, record) => sum + (record.totalCost || 0), 0)

            // Find last service record
            const lastRecord = recordsData
                .filter(record => record.assetId === asset.id)
                .sort((a, b) => {
                    const dateA = new Date(a.serviceDate || 0).getTime()
                    const dateB = new Date(b.serviceDate || 0).getTime()
                    return dateB - dateA
                })[0]

            return {
                assetName: asset.name,
                healthStatus: asset.healthStatus || 'good',
                lastCheck: lastRecord?.serviceDate || 'Never',
                maintenanceCost: assetMaintenanceCost
            }
        })

        setHealthBreakdown(healthData)
    }

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return '#10b981'
            case 'good': return '#3b82f6'
            case 'attention': return '#f59e0b'
            case 'critical': return '#ef4444'
            default: return '#6b7280'
        }
    }

    const getHealthStatusEmoji = (status: string) => {
        switch (status) {
            case 'excellent': return '✨'
            case 'good': return '✅'
            case 'attention': return '⚠️'
            case 'critical': return '🚨'
            default: return '❓'
        }
    }

    const healthStatusCounts = {
        excellent: assets.filter(a => a.healthStatus === 'excellent').length,
        good: assets.filter(a => a.healthStatus === 'good').length,
        attention: assets.filter(a => a.healthStatus === 'attention').length,
        critical: assets.filter(a => a.healthStatus === 'critical').length
    }

    const maxCost = Math.max(...costTrend.map(d => d.totalCost), 1)

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading">Loading analytics...</div>
            </div>
        )
    }

    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1>📊 Analytics</h1>
                <p>Cost insights and asset health trends</p>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <div className="metric-label">Total Asset Value</div>
                        <div className="metric-value">${totalAssetValue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">🔧</div>
                    <div className="metric-content">
                        <div className="metric-label">Total Maintenance Cost</div>
                        <div className="metric-value">${totalMaintenanceCost.toLocaleString()}</div>
                        <div className="metric-subtitle">Lifetime</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">📋</div>
                    <div className="metric-content">
                        <div className="metric-label">Annual Contract Cost</div>
                        <div className="metric-value">${totalContractCost.toLocaleString()}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                        <div className="metric-label">Avg Monthly Spend</div>
                        <div className="metric-value">${avgMonthlySpend.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Cost Trend Chart */}
            <div className="chart-section">
                <h2>💸 Cost Trends (Last 6 Months)</h2>
                <div className="chart-container">
                    <div className="bar-chart">
                        {costTrend.map((data, index) => (
                            <div key={index} className="bar-group">
                                <div className="bar-stack">
                                    <div
                                        className="bar bar-maintenance"
                                        style={{
                                            height: `${(data.maintenanceCost / maxCost) * 200}px`,
                                            minHeight: data.maintenanceCost > 0 ? '4px' : '0px'
                                        }}
                                        title={`Maintenance: $${data.maintenanceCost.toFixed(0)}`}
                                    />
                                    <div
                                        className="bar bar-contract"
                                        style={{
                                            height: `${(data.contractCost / maxCost) * 200}px`,
                                            minHeight: data.contractCost > 0 ? '4px' : '0px'
                                        }}
                                        title={`Contracts: $${data.contractCost.toFixed(0)}`}
                                    />
                                </div>
                                <div className="bar-label">{data.month}</div>
                                <div className="bar-value">${data.totalCost.toFixed(0)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span>Maintenance</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
                            <span>Contracts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Status Overview */}
            <div className="health-section">
                <h2>🏥 Asset Health Overview</h2>
                <div className="health-stats">
                    <div className="health-stat excellent">
                        <div className="health-stat-icon">✨</div>
                        <div className="health-stat-count">{healthStatusCounts.excellent}</div>
                        <div className="health-stat-label">Excellent</div>
                    </div>
                    <div className="health-stat good">
                        <div className="health-stat-icon">✅</div>
                        <div className="health-stat-count">{healthStatusCounts.good}</div>
                        <div className="health-stat-label">Good</div>
                    </div>
                    <div className="health-stat attention">
                        <div className="health-stat-icon">⚠️</div>
                        <div className="health-stat-count">{healthStatusCounts.attention}</div>
                        <div className="health-stat-label">Needs Attention</div>
                    </div>
                    <div className="health-stat critical">
                        <div className="health-stat-icon">🚨</div>
                        <div className="health-stat-count">{healthStatusCounts.critical}</div>
                        <div className="health-stat-label">Critical</div>
                    </div>
                </div>
            </div>

            {/* Asset Health Breakdown */}
            <div className="breakdown-section">
                <h2>🔍 Asset Health Breakdown</h2>
                {healthBreakdown.length === 0 ? (
                    <div className="empty-state">
                        <p>No assets to analyze</p>
                    </div>
                ) : (
                    <div className="health-table">
                        <div className="health-table-header">
                            <div>Asset</div>
                            <div>Health Status</div>
                            <div>Last Service</div>
                            <div>Total Cost</div>
                        </div>
                        {healthBreakdown.map((item, index) => (
                            <div key={index} className="health-table-row">
                                <div className="asset-name">{item.assetName}</div>
                                <div className="health-status">
                                    <span
                                        className="health-badge"
                                        style={{
                                            backgroundColor: getHealthStatusColor(item.healthStatus),
                                            color: 'white'
                                        }}
                                    >
                                        {getHealthStatusEmoji(item.healthStatus)} {item.healthStatus}
                                    </span>
                                </div>
                                <div className="last-check">
                                    {item.lastCheck === 'Never' ? 'Never' : new Date(item.lastCheck).toLocaleDateString()}
                                </div>
                                <div className="cost">${item.maintenanceCost.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cost Efficiency Insights */}
            <div className="insights-section">
                <h2>💡 Insights</h2>
                <div className="insights-grid">
                    {totalMaintenanceCost > 0 && (
                        <div className="insight-card">
                            <div className="insight-icon">📊</div>
                            <div className="insight-content">
                                <h3>Maintenance vs Asset Value</h3>
                                <p>
                                    You've spent <strong>{((totalMaintenanceCost / totalAssetValue) * 100).toFixed(1)}%</strong> of
                                    your total asset value on maintenance
                                </p>
                            </div>
                        </div>
                    )}

                    {healthStatusCounts.critical > 0 && (
                        <div className="insight-card warning">
                            <div className="insight-icon">⚠️</div>
                            <div className="insight-content">
                                <h3>Critical Assets</h3>
                                <p>
                                    <strong>{healthStatusCounts.critical}</strong> asset{healthStatusCounts.critical > 1 ? 's' : ''} need{healthStatusCounts.critical === 1 ? 's' : ''} immediate attention
                                </p>
                            </div>
                        </div>
                    )}

                    {avgMonthlySpend > 0 && (
                        <div className="insight-card">
                            <div className="insight-icon">💰</div>
                            <div className="insight-content">
                                <h3>Annual Projection</h3>
                                <p>
                                    Based on current spending, you'll spend approximately <strong>${(avgMonthlySpend * 12).toLocaleString()}</strong> this year
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
