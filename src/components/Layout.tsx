/**
 * @fileoverview Main layout component with navigation
 */

import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import './Layout.css'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/assets', label: 'Assets', icon: '🏠' },
        { path: '/groups', label: 'Groups', icon: '🗂️' },
        { path: '/reminders', label: 'Reminders', icon: '🔔' },
        { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
        { path: '/schedule', label: 'Schedule', icon: '📅' },
        { path: '/warranties', label: 'Warranties', icon: '✅' },
        { path: '/contracts', label: 'Contracts', icon: '📄' },
        { path: '/documents', label: 'Documents', icon: '📁' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
    ]

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link to="/dashboard" className="logo">
                        <span className="logo-icon">🏷️</span>
                        <span className="logo-text">ServiceTag</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/profile" className="nav-item">
                        <span className="nav-icon">👤</span>
                        <span className="nav-label">Profile</span>
                    </Link>
                    <button onClick={handleSignOut} className="nav-item nav-item-button">
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}
