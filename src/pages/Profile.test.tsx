import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Profile from './Profile'
import { getCurrentUser } from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data'

const mockClient = generateClient<any>()

describe('Profile Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderProfile = () => {
        return render(
            <BrowserRouter>
                <Profile />
            </BrowserRouter>
        )
    }

    const mockUser = {
        username: 'testuser',
        signInDetails: {
            loginId: 'test@example.com',
        },
    }

    const mockProfile = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        bio: 'Test bio',
    }

    it('shows loading spinner initially', () => {
        renderProfile()
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    })

    it('renders user information after loading', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })
    })

    it('displays active status badge', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText('Active')).toBeInTheDocument()
        })
    })

    it('shows user bio when available', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText('Test bio')).toBeInTheDocument()
        })
    })

    it('shows default message when no bio', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [{ ...mockProfile, bio: '' }],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText(/No bio provided yet/i)).toBeInTheDocument()
        })
    })

    it('enters edit mode when edit button is clicked', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            const editButton = screen.getByText('Edit Profile')
            fireEvent.click(editButton)
        })

        expect(screen.getByPlaceholderText('Enter your display name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument()
    })

    it('cancels edit mode when cancel is clicked', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            const editButton = screen.getByText('Edit Profile')
            fireEvent.click(editButton)
        })

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(screen.queryByPlaceholderText('Enter your display name')).not.toBeInTheDocument()
    })

    it('updates profile when save is clicked', async () => {
        const user = userEvent.setup()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })
        mockClient.models.UserProfile.update = vi.fn().mockResolvedValue({
            data: { ...mockProfile, displayName: 'Updated Name' },
        })

        renderProfile()

        await waitFor(() => {
            const editButton = screen.getByText('Edit Profile')
            fireEvent.click(editButton)
        })

        const displayNameInput = screen.getByPlaceholderText('Enter your display name')
        await user.clear(displayNameInput)
        await user.type(displayNameInput, 'Updated Name')

        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockClient.models.UserProfile.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    displayName: 'Updated Name',
                })
            )
        })
    })

    it('creates new profile if none exists', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [],
        })
        mockClient.models.UserProfile.create = vi.fn().mockResolvedValue({
            data: mockProfile,
        })

        renderProfile()

        await waitFor(() => {
            const editButton = screen.getByText('Edit Profile')
            fireEvent.click(editButton)
        })

        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockClient.models.UserProfile.create).toHaveBeenCalled()
        })
    })

    it('displays user avatar with first letter', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText('T')).toBeInTheDocument() // First letter of "Test User"
        })
    })

    it('displays stat cards', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
        mockClient.models.UserProfile.list = vi.fn().mockResolvedValue({
            data: [mockProfile],
        })

        renderProfile()

        await waitFor(() => {
            expect(screen.getByText('Total Tags')).toBeInTheDocument()
            expect(screen.getByText('Completed')).toBeInTheDocument()
            expect(screen.getByText('Active')).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

        vi.mocked(getCurrentUser).mockRejectedValue(new Error('Auth Error'))

        renderProfile()

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled()
        })

        consoleError.mockRestore()
    })
})
