import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navigation from './Navigation'
import { signOut } from 'aws-amplify/auth'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/dashboard' }),
    }
})

describe('Navigation Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderNavigation = () => {
        return render(
            <BrowserRouter>
                <Navigation />
            </BrowserRouter>
        )
    }

    it('renders navigation with logo', () => {
        renderNavigation()
        expect(screen.getByText('ServiceTag')).toBeInTheDocument()
    })

    it('renders all navigation links', () => {
        renderNavigation()
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Tags')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders sign out button', () => {
        renderNavigation()
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('calls signOut when sign out button is clicked', async () => {
        renderNavigation()
        const signOutButton = screen.getByText('Sign Out')

        fireEvent.click(signOutButton)

        await waitFor(() => {
            expect(signOut).toHaveBeenCalled()
        })
    })

    it('toggles mobile menu when hamburger is clicked', () => {
        renderNavigation()
        const mobileMenuButton = screen.getByRole('button', { name: /menu/i })

        fireEvent.click(mobileMenuButton)

        // Mobile menu should be visible
        const mobileLinks = screen.getAllByText('Dashboard')
        expect(mobileLinks.length).toBeGreaterThan(1)
    })

    it('highlights active navigation link', () => {
        renderNavigation()
        const dashboardLink = screen.getAllByText('Dashboard')[0]
        expect(dashboardLink.closest('a')).toHaveClass('active')
    })

    it('navigates to correct route when link is clicked', () => {
        renderNavigation()
        const tagsLink = screen.getAllByText('Tags')[0]

        expect(tagsLink.closest('a')).toHaveAttribute('href', '/tags')
    })

    it('closes mobile menu when link is clicked', () => {
        renderNavigation()
        const mobileMenuButton = screen.getByRole('button', { name: /menu/i })

        // Open mobile menu
        fireEvent.click(mobileMenuButton)

        // Click a mobile link
        const mobileLinks = screen.getAllByText('Dashboard')
        fireEvent.click(mobileLinks[mobileLinks.length - 1])

        // Menu should close (only desktop links visible)
        const remainingLinks = screen.getAllByText('Dashboard')
        expect(remainingLinks.length).toBe(1)
    })
})
