import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import React from 'react'

// Cleanup after each test case
afterEach(() => {
    cleanup()
})

// Mock Amplify modules
vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(() => ({
        models: {
            ServiceTag: {
                list: vi.fn().mockResolvedValue({ data: [] }),
                create: vi.fn().mockResolvedValue({ data: {} }),
                update: vi.fn().mockResolvedValue({ data: {} }),
                delete: vi.fn().mockResolvedValue({ data: {} }),
            },
            UserProfile: {
                list: vi.fn().mockResolvedValue({ data: [] }),
                create: vi.fn().mockResolvedValue({ data: {} }),
                update: vi.fn().mockResolvedValue({ data: {} }),
            },
            Activity: {
                list: vi.fn().mockResolvedValue({ data: [] }),
                create: vi.fn().mockResolvedValue({ data: {} }),
            },
        },
    })),
}))

vi.mock('aws-amplify/auth', () => ({
    getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser', userId: '123', signInDetails: { loginId: 'test@example.com' } }),
    signOut: vi.fn().mockResolvedValue(undefined),
    signIn: vi.fn().mockResolvedValue({ isSignedIn: true }),
    signUp: vi.fn().mockResolvedValue({ isSignUpComplete: true }),
    confirmSignUp: vi.fn().mockResolvedValue({ isSignUpComplete: true }),
}))

vi.mock('aws-amplify', () => ({
    Amplify: {
        configure: vi.fn(),
    },
}))

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (_, prop) => {
            return ({ children, ...props }: any) => {
                // Filter out framer-motion specific props
                const {
                    initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants,
                    whileHover: _whileHover, whileTap: _whileTap, whileFocus: _whileFocus, whileDrag: _whileDrag,
                    drag: _drag, dragConstraints: _dragConstraints, onAnimationComplete: _onAnimationComplete,
                    ...domProps
                } = props
                return React.createElement(prop as string, domProps, children)
            }
        }
    }),
    AnimatePresence: ({ children }: any) => children,
}))

// Mock React Router
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/' }),
    }
})

// Global test utilities
// Global test utilities
vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
})))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
