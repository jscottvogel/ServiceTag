/**
 * @fileoverview Root application component with routing and authentication
 * @description Main App component for ServiceTag - Asset & Maintenance Management
 */

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Authenticator, View, Button, useAuthenticator } from '@aws-amplify/ui-react'
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
import Reminders from './pages/Reminders'
import Analytics from './pages/Analytics'

/**
 * Main application component
 */
const authenticatorComponents = {
    SignIn: {
        Footer() {
            const { toForgotPassword } = useAuthenticator();

            const handler = (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                toForgotPassword();
            };

            return (
                <View textAlign="center" >
                    <Button
                        type="button"
                        fontWeight="normal"
                        onClick={handler}
                        size="small"
                        variation="link"
                    >
                        Forgot your password?
                    </Button>
                </View >
            );
        },
    },
};

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

                {/* Authentication Route */}
                <Route
                    path="/auth"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => (
                                <Navigate to="/dashboard" replace />
                            )}
                        </Authenticator>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Dashboard />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/assets"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Assets />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/groups"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Groups />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/reminders"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Reminders />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/assets/:id"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <AssetDetails />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/maintenance"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Maintenance />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/schedule"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <MaintenanceSchedule />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/warranties"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Warranties />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/contracts"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Contracts />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/documents"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Documents />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <Authenticator components={authenticatorComponents}>
                            {() => <Analytics />}
                        </Authenticator>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <Authenticator components={authenticatorComponents}>
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
