/**
 * @fileoverview Navigation component with responsive mobile menu
 * @description Provides the main navigation bar for authenticated users.
 * Includes desktop navigation, mobile hamburger menu, and sign-out functionality.
 * Highlights the currently active route.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires framer-motion
 * @requires aws-amplify/auth
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'aws-amplify/auth'
import './Navigation.css'

/**
 * Navigation item interface
 * @interface NavItem
 * @property {string} path - Route path for the navigation item
 * @property {string} label - Display label for the navigation item
 * @property {string} icon - Emoji icon for visual representation
 */
interface NavItem {
    path: string
    label: string
    icon: string
}

/**
 * Navigation items configuration
 * @constant {NavItem[]} NAV_ITEMS
 * @description Defines all navigation menu items with their routes and labels
 */
const NAV_ITEMS: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tags', label: 'Tags', icon: '🏷️' },
    { path: '/profile', label: 'Profile', icon: '👤' },
]

/**
 * Navigation Component
 * @component
 * @description Main navigation bar with responsive design.
 * Features:
 * - Desktop horizontal navigation
 * - Mobile hamburger menu
 * - Active route highlighting
 * - Sign out functionality
 * - Smooth animations
 * 
 * @returns {JSX.Element} Rendered navigation component
 * 
 * @example
 * <Navigation />
 */
export default function Navigation() {
    // State for mobile menu toggle
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

    // Hooks for routing
    const location = useLocation()
    const navigate = useNavigate()

    /**
     * Check if a route is currently active
     * @function isActive
     * @param {string} path - Route path to check
     * @returns {boolean} True if the path matches current location
     */
    const isActive = (path: string): boolean => {
        return location.pathname === path
    }

    /**
     * Handle user sign out
     * @async
     * @function handleSignOut
     * @description Signs out the user via Amplify Auth and redirects to landing page
     * @returns {Promise<void>}
     */
    const handleSignOut = async (): Promise<void> => {
        try {
            await signOut()
            navigate('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    /**
     * Toggle mobile menu visibility
     * @function toggleMobileMenu
     * @description Opens/closes the mobile navigation menu
     */
    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    /**
     * Close mobile menu
     * @function closeMobileMenu
     * @description Closes the mobile menu (used when clicking a nav link)
     */
    const closeMobileMenu = (): void => {
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="navigation" role="navigation" aria-label="Main navigation">
            <div className="nav-container">
                {/* Logo Section */}
                <Link to="/dashboard" className="logo" aria-label="ServiceTag Home">
                    <div className="logo-icon">🏷️</div>
                    <span className="logo-text">ServiceTag</span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="nav-links desktop-only" role="menubar">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            role="menuitem"
                            aria-current={isActive(item.path) ? 'page' : undefined}
                        >
                            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Sign Out Button */}
                <button
                    className="btn btn-secondary desktop-only"
                    onClick={handleSignOut}
                    aria-label="Sign out of your account"
                >
                    Sign Out
                </button>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="mobile-menu-toggle mobile-only"
                    onClick={toggleMobileMenu}
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    <span className="hamburger-icon">
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        className="mobile-menu"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        role="menu"
                    >
                        {/* Mobile Navigation Links */}
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                                role="menuitem"
                                aria-current={isActive(item.path) ? 'page' : undefined}
                            >
                                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* Mobile Sign Out Button */}
                        <button
                            className="btn btn-secondary mobile-sign-out"
                            onClick={() => {
                                closeMobileMenu()
                                handleSignOut()
                            }}
                            role="menuitem"
                            aria-label="Sign out of your account"
                        >
                            Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
