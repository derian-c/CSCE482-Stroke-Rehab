import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as jestDomMatchers from '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

expect.extend(jestDomMatchers);

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  }))
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: function Navigate() {
      return React.createElement('div', { 'data-testid': 'navigate' }, 'Redirecting...');
    }
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});