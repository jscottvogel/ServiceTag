/**
 * @fileoverview Root application component with routing and authentication
 * @description Main App component for ServiceTag - Asset & Maintenance Management
 */

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './App.css'

// Page imports
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import AssetDetails from './pages/AssetDetails'
import Maintenance from './pages/Maintenance'
import MaintenanceSchedule from './pages/MaintenanceSchedule'
import Warranties from './pages/Warranties'
import Contracts from './pages/Contracts'
import Documents from './pages/Documents'
import Profile from './pages/Profile'
import Groups from './pages/Groups'
import GroupDetails from './pages/GroupDetails'
import Reminders from './pages/Reminders'
import Analytics from './pages/Analytics'

export default function App() {
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500) // Simulate init
    }, [])

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" role="status" aria-label="Loading"></div>
                <p>Loading ServiceTag...</p>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />

                {/* Authentication Route - Explicit Sign In */}
                <Route
                    path="/auth"
                    element={
                        <Authenticator>
                            {({ signOut, user }) => (
                                <Navigate to="/dashboard" replace />
                            )}
                        </Authenticator>
                    }
                />

                {/* Protected Routes - Wrapped in Authenticator */}
                <Route
                    path="/dashboard"
                    element={
                        <Authenticator>
                            {() => <Dashboard />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/assets"
                    element={
                        <Authenticator>
                            {() => <Assets />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/groups"
                    element={
                        <Authenticator>
                            {() => <Groups />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/groups/:groupId"
                    element={
                        <Authenticator>
                            {() => <GroupDetails />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/reminders"
                    element={
                        <Authenticator>
                            {() => <Reminders />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/assets/:id"
                    element={
                        <Authenticator>
                            {() => <AssetDetails />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/maintenance"
                    element={
                        <Authenticator>
                            {() => <Maintenance />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/schedule"
                    element={
                        <Authenticator>
                            {() => <MaintenanceSchedule />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/warranties"
                    element={
                        <Authenticator>
                            {() => <Warranties />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/contracts"
                    element={
                        <Authenticator>
                            {() => <Contracts />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/documents"
                    element={
                        <Authenticator>
                            {() => <Documents />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <Authenticator>
                            {() => <Analytics />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <Authenticator>
                            {() => <Profile />}
                        </Authenticator>
                    }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
