import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Groups from './Groups'
import { act } from 'react'

// Mock Amplify Client
const { mockGroupList, mockGroupCreate, mockGroupDelete } = vi.hoisted(() => ({
    mockGroupList: vi.fn(),
    mockGroupCreate: vi.fn(),
    mockGroupDelete: vi.fn(),
}))

vi.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            AssetGroup: {
                list: mockGroupList,
                create: mockGroupCreate,
                delete: mockGroupDelete,
            },
        },
    }),
    Schema: {},
}))

vi.mock('../components/Layout', () => ({
    default: ({ children }: any) => <div>{children}</div>
}))

describe('Groups Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGroupList.mockResolvedValue({ data: [] })
        vi.spyOn(window, 'confirm').mockImplementation(() => true)
    })

    it('renders empty state', async () => {
        await act(async () => {
            render(<BrowserRouter><Groups /></BrowserRouter>)
        })
        await waitFor(() => {
            expect(screen.getByText(/No groups created yet/i)).toBeInTheDocument()
        })
    })

    it('renders groups list', async () => {
        mockGroupList.mockResolvedValue({
            data: [{ id: '1', name: 'Test Group', groupType: 'location' }]
        })
        await act(async () => {
            render(<BrowserRouter><Groups /></BrowserRouter>)
        })
        await waitFor(() => {
            expect(screen.getByText('Test Group')).toBeInTheDocument()
        })
    })

    it('creates group', async () => {
        await act(async () => {
            render(<BrowserRouter><Groups /></BrowserRouter>)
        })
        await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument())

        // Click Add Group
        // Using accessible name should work even with span
        const addBtn = screen.getByRole('button', { name: /Add Group/i })
        fireEvent.click(addBtn)

        // Verify Modal
        expect(screen.getByText('Add Asset Group')).toBeInTheDocument()

        // Fill Form
        fireEvent.change(screen.getByLabelText(/Group Name/i), { target: { value: 'New Group' } })

        // Submit
        const submitBtn = screen.getByText('Create Group', { selector: 'button[type="submit"]' })
        await act(async () => {
            fireEvent.click(submitBtn)
        })

        await waitFor(() => {
            expect(mockGroupCreate).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Group',
                groupType: 'custom'
            }))
        })
    })

    it('deletes group', async () => {
        mockGroupList.mockResolvedValue({
            data: [{ id: '1', name: 'Delete Me', groupType: 'location' }]
        })
        await act(async () => {
            render(<BrowserRouter><Groups /></BrowserRouter>)
        })
        await waitFor(() => {
            expect(screen.getByText('Delete Me')).toBeInTheDocument()
        })

        // Click delete
        const deleteBtn = screen.getByText('Delete')
        await act(async () => {
            fireEvent.click(deleteBtn)
        })

        await waitFor(() => {
            expect(mockGroupDelete).toHaveBeenCalledWith({ id: '1' })
        })
    })
})
