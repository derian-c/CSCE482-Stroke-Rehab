import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../pages/Home'
import { useAuth0 } from '@auth0/auth0-react'

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}))

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login page correctly when user is not authenticated', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: vi.fn(),
      logout: vi.fn()
    })

    render(<Home />)
    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })

  it('shows logout button when user is authenticated', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: vi.fn(),
      logout: vi.fn()
    })

    render(<Home />)
    expect(screen.getByText(/logout/i)).toBeInTheDocument()
  })

  it('calls loginWithRedirect when login button is clicked', () => {
    const loginWithRedirectMock = vi.fn()

    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: loginWithRedirectMock,
      logout: vi.fn()
    })

    render(<Home />)
    fireEvent.click(screen.getByText(/login/i))
    expect(loginWithRedirectMock).toHaveBeenCalled()
  })

  it('calls logout when logout button is clicked', () => {
    const logoutMock = vi.fn()

    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: vi.fn(),
      logout: logoutMock
    })

    render(<Home />)
    fireEvent.click(screen.getByText(/logout/i))
    expect(logoutMock).toHaveBeenCalled()
  })

  it('does not display a message when homeMessage prop is not provided', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: vi.fn(),
      logout: vi.fn()
    })

    render(<Home />)
    expect(screen.queryByText(/test message/i)).not.toBeInTheDocument()
  })
})
