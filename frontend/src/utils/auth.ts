/**
 * Authentication utility functions
 */

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp < currentTime;
  } catch {
    // Invalid token format
    return true;
  }
}

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns Date object or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get user information from token
 * @param token - JWT token string
 * @returns User info or null if invalid
 */
export function getUserFromToken(token: string): { id: string; email: string } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.userId && payload.email) {
      return {
        id: payload.userId,
        email: payload.email
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if user has valid authentication
 * @returns boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  return !isTokenExpired(token);
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  sessionStorage.removeItem('redirectAfterLogin');
}