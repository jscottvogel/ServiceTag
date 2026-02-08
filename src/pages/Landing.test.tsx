import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Landing from './Landing'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('Landing Page', () => {
    const renderLanding = () => {
        return render(
            <BrowserRouter>
                <Landing />
            </BrowserRouter>
        )
    }

    it('renders hero title', () => {
        renderLanding()
        expect(screen.getByText(/Manage Your Services/i)).toBeInTheDocument()
        expect(screen.getByText(/Like Never Before/i)).toBeInTheDocument()
    })

    it('renders hero description', () => {
        renderLanding()
        expect(
            screen.getByText(/Experience the future of service management/i)
        ).toBeInTheDocument()
    })

    it('renders get started button', () => {
        renderLanding()
        expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    })

    it('renders watch demo button', () => {
        renderLanding()
        expect(screen.getByText('Watch Demo')).toBeInTheDocument()
    })

    it('navigates to auth page when get started is clicked', () => {
        renderLanding()
        const getStartedButton = screen.getByText('Get Started Free')

        fireEvent.click(getStartedButton)

        expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    it('renders all feature cards', () => {
        renderLanding()
        expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
        expect(screen.getByText('Secure by Default')).toBeInTheDocument()
        expect(screen.getByText('Mobile First')).toBeInTheDocument()
        expect(screen.getByText('Real-time Sync')).toBeInTheDocument()
    })

    it('renders feature card descriptions', () => {
        renderLanding()
        expect(
            screen.getByText(/Built on AWS App Runner/i)
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Enterprise-grade security/i)
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Stunning responsive design/i)
        ).toBeInTheDocument()
        expect(
            screen.getByText(/DynamoDB-powered/i)
        ).toBeInTheDocument()
    })

    it('renders stats section', () => {
        renderLanding()
        expect(screen.getByText('99.9%')).toBeInTheDocument()
        expect(screen.getByText('Uptime')).toBeInTheDocument()
        expect(screen.getByText('<100ms')).toBeInTheDocument()
        expect(screen.getByText('Response Time')).toBeInTheDocument()
        expect(screen.getByText('∞')).toBeInTheDocument()
        expect(screen.getByText('Scalability')).toBeInTheDocument()
        expect(screen.getByText('24/7')).toBeInTheDocument()
        expect(screen.getByText('Support')).toBeInTheDocument()
    })

    it('renders professional service management badge', () => {
        renderLanding()
        expect(screen.getByText(/Professional Service Management/i)).toBeInTheDocument()
    })

    it('has correct structure for SEO', () => {
        renderLanding()
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
    })
})
