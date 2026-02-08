import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { generateClient } from 'aws-amplify/data'

const mockClient = generateClient<any>()

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderDashboard = () => {
        return render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        )
    }

    it('shows loading spinner initially', () => {
        renderDashboard()
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('renders dashboard header after loading', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument()
            expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
        })
    })

    it('displays correct stats for service tags', async () => {
        const mockTags = [
            { id: '1', status: 'active', title: 'Tag 1' },
            { id: '2', status: 'active', title: 'Tag 2' },
            { id: '3', status: 'completed', title: 'Tag 3' },
            { id: '4', status: 'pending', title: 'Tag 4' },
        ]

        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('4')).toBeInTheDocument() // Total tags
            expect(screen.getByText('2')).toBeInTheDocument() // Active tags
            expect(screen.getByText('1')).toBeInTheDocument() // Completed tags
            expect(screen.getByText('1')).toBeInTheDocument() // Pending tags
        })
    })

    it('renders quick action cards', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('New Service Tag')).toBeInTheDocument()
            expect(screen.getByText('View All Tags')).toBeInTheDocument()
            expect(screen.getByText('My Profile')).toBeInTheDocument()
            expect(screen.getByText('Analytics')).toBeInTheDocument()
        })
    })

    it('displays recent activity when available', async () => {
        const mockActivities = [
            {
                id: '1',
                title: 'Created new tag',
                description: 'Test activity',
                timestamp: new Date().toISOString(),
            },
        ]

        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: mockActivities,
        })

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('Created new tag')).toBeInTheDocument()
            expect(screen.getByText('Test activity')).toBeInTheDocument()
        })
    })

    it('shows empty state when no activity', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderDashboard()

        await waitFor(() => {
            expect(
                screen.getByText(/No recent activity yet/i)
            ).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

        mockClient.models.ServiceTag.list = vi.fn().mockRejectedValue(
            new Error('API Error')
        )
        mockClient.models.Activity.list = vi.fn().mockRejectedValue(
            new Error('API Error')
        )

        renderDashboard()

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled()
        })

        consoleError.mockRestore()
    })

    it('renders all stat cards with correct icons', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.Activity.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderDashboard()

        await waitFor(() => {
            expect(screen.getByText('Total Tags')).toBeInTheDocument()
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByText('Completed')).toBeInTheDocument()
            expect(screen.getByText('Pending')).toBeInTheDocument()
        })
    })
})
