import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ServiceTags from './ServiceTags'
import { generateClient } from 'aws-amplify/data'

const mockClient = generateClient<any>()

describe('ServiceTags Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderServiceTags = () => {
        return render(
            <BrowserRouter>
                <ServiceTags />
            </BrowserRouter>
        )
    }

    const mockTags = [
        {
            id: '1',
            title: 'Test Tag 1',
            description: 'Description 1',
            status: 'active',
            priority: 'high',
            category: 'Development',
        },
        {
            id: '2',
            title: 'Test Tag 2',
            description: 'Description 2',
            status: 'pending',
            priority: 'medium',
            category: 'Design',
        },
        {
            id: '3',
            title: 'Test Tag 3',
            description: 'Description 3',
            status: 'completed',
            priority: 'low',
        },
    ]

    it('shows loading spinner initially', () => {
        renderServiceTags()
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('renders page header with title', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('Service Tags')).toBeInTheDocument()
            expect(screen.getByText(/Manage all your service tags/i)).toBeInTheDocument()
        })
    })

    it('renders new tag button', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('New Tag')).toBeInTheDocument()
        })
    })

    it('displays all filter buttons', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('All')).toBeInTheDocument()
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByText('Pending')).toBeInTheDocument()
            expect(screen.getByText('Completed')).toBeInTheDocument()
        })
    })

    it('displays all tags when filter is "all"', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('Test Tag 1')).toBeInTheDocument()
            expect(screen.getByText('Test Tag 2')).toBeInTheDocument()
            expect(screen.getByText('Test Tag 3')).toBeInTheDocument()
        })
    })

    it('filters tags by status when filter button is clicked', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('Test Tag 1')).toBeInTheDocument()
        })

        const activeFilter = screen.getByRole('button', { name: 'Active' })
        fireEvent.click(activeFilter)

        expect(screen.getByText('Test Tag 1')).toBeInTheDocument()
        expect(screen.queryByText('Test Tag 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Test Tag 3')).not.toBeInTheDocument()
    })

    it('shows empty state when no tags exist', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('No tags found')).toBeInTheDocument()
            expect(screen.getByText(/Create your first service tag/i)).toBeInTheDocument()
        })
    })

    it('opens create modal when new tag button is clicked', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderServiceTags()

        await waitFor(() => {
            const newTagButton = screen.getByText('New Tag')
            fireEvent.click(newTagButton)
        })

        expect(screen.getByText('Create New Service Tag')).toBeInTheDocument()
    })

    it('closes create modal when cancel is clicked', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })

        renderServiceTags()

        await waitFor(() => {
            const newTagButton = screen.getByText('New Tag')
            fireEvent.click(newTagButton)
        })

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(screen.queryByText('Create New Service Tag')).not.toBeInTheDocument()
    })

    it('creates new tag when form is submitted', async () => {
        const user = userEvent.setup()
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.ServiceTag.create = vi.fn().mockResolvedValue({
            data: { id: '4', title: 'New Tag' },
        })

        renderServiceTags()

        await waitFor(() => {
            const newTagButton = screen.getByText('New Tag')
            fireEvent.click(newTagButton)
        })

        const titleInput = screen.getByPlaceholderText('Enter tag title')
        await user.type(titleInput, 'New Tag')

        const createButton = screen.getByText('Create Tag')
        fireEvent.click(createButton)

        await waitFor(() => {
            expect(mockClient.models.ServiceTag.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'New Tag',
                })
            )
        })
    })

    it('displays tag with correct status badge', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('active')).toBeInTheDocument()
            expect(screen.getByText('pending')).toBeInTheDocument()
            expect(screen.getByText('completed')).toBeInTheDocument()
        })
    })

    it('displays tag priority and category', async () => {
        mockClient.models.ServiceTag.list = vi.fn().mockResolvedValue({
            data: mockTags,
        })

        renderServiceTags()

        await waitFor(() => {
            expect(screen.getByText('high')).toBeInTheDocument()
            expect(screen.getByText('medium')).toBeInTheDocument()
            expect(screen.getByText('Development')).toBeInTheDocument()
            expect(screen.getByText('Design')).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

        mockClient.models.ServiceTag.list = vi.fn().mockRejectedValue(
            new Error('API Error')
        )

        renderServiceTags()

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled()
        })

        consoleError.mockRestore()
    })
})
