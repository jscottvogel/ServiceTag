import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAuthenticator } from '@aws-amplify/ui-react'
import App from '../App'

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', async () => {
    const actual = await vi.importActual('@aws-amplify/ui-react')
    return {
        ...actual,
        Authenticator: ({ children, components }: any) => {
            // Render the Footer to test our custom component logic
            if (components?.SignIn?.Footer) {
                const Footer = components.SignIn.Footer
                return (
                    <div data-testid="authenticator">
                        <Footer />
                        {typeof children === 'function' ? children({ signOut: vi.fn(), user: null }) : children}
                    </div>
                )
            }
            return <div data-testid="authenticator">{children}</div>
        },
        useAuthenticator: vi.fn(() => ({
            toForgotPassword: vi.fn(),
            user: null,
            authStatus: 'unauthenticated'
        }))
    }
})

describe('Authentication Flow', () => {
    it('renders the forgot password link in the footer', async () => {
        // App uses BrowserRouter internally.
        // We set the route to /auth before rendering
        window.history.pushState({}, 'Auth', '/auth')

        render(<App />)

        // Check if Authenticator is rendered
        await waitFor(() => {
            const authElement = screen.getByTestId('authenticator')
            expect(authElement).toBeInTheDocument()

            // Check for "Forgot your password?" button
            expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
        })
    })
    it('calls toForgotPassword when the link is clicked', async () => {
        const toForgotPasswordMock = vi.fn()

        // Override the mock for this test
        vi.mocked(useAuthenticator).mockReturnValue({
            toForgotPassword: toForgotPasswordMock,
            user: null,
            authStatus: 'unauthenticated'
        } as any)

        window.history.pushState({}, 'Auth', '/auth')
        render(<App />)

        await waitFor(() => {
            const button = screen.getByText('Forgot your password?')
            fireEvent.click(button)
            expect(toForgotPasswordMock).toHaveBeenCalled()
        })
    })
})
