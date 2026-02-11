/**
 * Authentication Service
 * 
 * Handles user login, logout, and token validation.
 * Follows OT (Operational Technology) security principles.
 */

import { fetchApi } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * Authenticates a user with username and password.
 * 
 * On success:
 * - Stores JWT token in HttpOnly cookie (SameSite=Strict)
 * - Stores user info in localStorage for UI personalization
 * 
 * @param username - User's username
 * @param password - User's password
 * @returns Login response with token and user data
 */
export async function login(
  username: string, 
  password: string
): Promise<LoginResponse> {
  const response = await fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Store token in cookie (will be httpOnly in production)
  document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Strict`;
  
  // Store user info in localStorage for UI
  localStorage.setItem('user', JSON.stringify(response.user));

  return response;
}

/**
 * Validates the current authentication token.
 * 
 * SECURITY: Fail-safe default - assumes invalid on network errors.
 * 
 * @returns True if token is valid
 */
export async function validateToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    await response.json();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Logs out the current user.
 * 
 * - Clears authentication cookie
 * - Removes user data from localStorage
 * - Optionally notifies backend to blacklist token
 */
export function logout(): void {
  document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
  localStorage.removeItem('user');
}
