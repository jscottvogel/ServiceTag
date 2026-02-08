import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Assets from './Assets'
import { act } from 'react'

// Mock Amplify Client
const { mockList, mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => {
    return {
        mockList: vi.fn(),
        mockCreate: vi.fn(),
        mockUpdate: vi.fn(),
        mockDelete: vi.fn(),
    }
})

vi.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            Asset: {
                list: mockList,
                create: mockCreate,
                update: mockUpdate,
                delete: mockDelete,
            },
        },
    }),
    Schema: {}, // Just in case
}))

// Mock Layout so we don't render sidebar etc
vi.mock('../components/Layout', () => ({
    default: ({ children }: any) => <div>{children}</div>
}))

// Mock seedData
vi.mock('../utils/seedData', () => ({
    seedDatabase: vi.fn(),
}))

describe('Assets Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default list response
        mockList.mockResolvedValue({ data: [] })
        // Confirm delete dialog automatically
        vi.spyOn(window, 'confirm').mockImplementation(() => true)
    })

    it('renders empty state when no assets', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <Assets />
                </BrowserRouter>
            )
        })

        await waitFor(() => {
            expect(screen.getByText(/No assets yet/i)).toBeInTheDocument()
            expect(screen.getByText(/Generate Sample Data/i)).toBeInTheDocument()
        })
    })

    it('renders assets list', async () => {
        mockList.mockResolvedValue({
            data: [
                { id: '1', name: 'Test Car', category: 'Vehicle', healthStatus: 'good', purchasePrice: 20000 },
            ]
        })

        await act(async () => {
            render(<BrowserRouter><Assets /></BrowserRouter>)
        })

        await waitFor(() => {
            expect(screen.getByText('Test Car')).toBeInTheDocument()
            expect(screen.getByText('Vehicle')).toBeInTheDocument()
        })
    })

    it('opens add modal and creates asset', async () => {
        await act(async () => {
            render(<BrowserRouter><Assets /></BrowserRouter>)
        })

        // Wait for loading to finish
        await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument())

        // Click Add Asset (header button usually first)
        const addBtns = screen.getAllByText('Add Asset')
        fireEvent.click(addBtns[0])

        // Verify Modal Open
        expect(screen.getByText('Add New Asset')).toBeInTheDocument()

        // Fill form
        fireEvent.change(screen.getByLabelText(/Asset Name/i), { target: { value: 'New Test Asset' } })
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test Category' } })
        fireEvent.change(screen.getByLabelText(/Manufacturer/i), { target: { value: 'Test Maker' } })

        // Submit - Find the button in the modal footer
        const submitBtn = screen.getByText('Add Asset', { selector: 'button[type="submit"]' })
        // Since there might be multiple "Add Asset" buttons on screen (header), verify we get the submit one
        // or filter by type="submit"
        // But getByRole 'button' with name 'Add Asset' inside modal should be unique or specific enough?
        // Actually, the button text is "Add Asset" inside the modal submit too.

        await act(async () => {
            fireEvent.click(submitBtn)
        })

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New Test Asset',
                category: 'Test Category',
                manufacturer: 'Test Maker',
                status: 'active'
            }))
        })

        // Modal should close (check title absent)
        expect(screen.queryByText('Add New Asset')).not.toBeInTheDocument()
    })

    it('opens edit modal and updates asset', async () => {
        const testAsset = {
            id: '1',
            name: 'Original Name',
            category: 'Original Cat',
            manufacturer: 'Orig Maker',
            healthStatus: 'good',
            purchasePrice: 100
        }
        mockList.mockResolvedValue({ data: [testAsset] })
        mockUpdate.mockResolvedValue({ data: testAsset }) // Return something

        await act(async () => {
            render(<BrowserRouter><Assets /></BrowserRouter>)
        })

        await waitFor(() => {
            expect(screen.getByText('Original Name')).toBeInTheDocument()
        })

        // Click Edit
        const editBtn = screen.getByText('Edit')
        fireEvent.click(editBtn)

        // Verify Modal Title
        expect(screen.getByText('Edit Asset')).toBeInTheDocument()

        // Verify Form Pre-fill
        expect(screen.getByLabelText(/Asset Name/i)).toHaveValue('Original Name')

        // Change Value
        fireEvent.change(screen.getByLabelText(/Asset Name/i), { target: { value: 'Updated Name' } })

        // Submit
        const saveBtn = screen.getByRole('button', { name: 'Save Changes' })

        await act(async () => {
            fireEvent.click(saveBtn)
        })

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                id: '1',
                name: 'Updated Name',
            }))
        })
    })

    it('deletes asset', async () => {
        const testAsset = { id: '1', name: 'Delete Me', category: 'Cat', healthStatus: 'good' }
        mockList.mockResolvedValue({ data: [testAsset] })

        await act(async () => {
            render(<BrowserRouter><Assets /></BrowserRouter>)
        })

        await waitFor(() => {
            expect(screen.getByText('Delete Me')).toBeInTheDocument()
        })

        // Click Delete
        const deleteBtn = screen.getByText('Delete')

        await act(async () => {
            fireEvent.click(deleteBtn)
        })

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith({ id: '1' })
        })
    })
})
