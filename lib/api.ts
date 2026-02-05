/**
 * API Client for Django Backend
 * Centralized axios configuration for all API requests
 */
import axios from 'axios';

const API_BASE_URL = 'https://web-production-2dab7.up.railway.app/api/v1';

// Store CSRF token in memory
let csrfToken: string | null = null;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for session authentication
});

// Function to fetch CSRF token from backend
export async function fetchCSRFToken(): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/csrf/`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    if (!csrfToken) {
      throw new Error('CSRF token not received from server');
    }
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

// Function to set CSRF token directly (used after login)
export function setCSRFToken(token: string): void {
  csrfToken = token;
  console.log('[API Client] CSRF token set:', token?.substring(0, 20) + '...');
}

// Request interceptor to add CSRF token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    // Skip CSRF token for these endpoints
    const skipCSRF = config.url?.includes('/auth/csrf/') ||
                     config.url?.includes('/auth/login/') ||
                     config.url?.includes('/auth/register/');

    if (skipCSRF) {
      console.log('[API Client] Skipping CSRF for:', config.url);
      return config;
    }

    // Fetch CSRF token if not already available (only for authenticated requests)
    if (!csrfToken) {
      try {
        console.log('[API Client] No CSRF token in memory, fetching...');
        await fetchCSRFToken();
        console.log('[API Client] CSRF token fetched:', csrfToken?.substring(0, 20) + '...');
      } catch (error) {
        console.error('[API Client] Could not get CSRF token:', error);
        // Don't block the request, let it fail and handle the 403
      }
    }

    // Add CSRF token to request headers
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
      console.log('[API Client] ✓ CSRF token added to:', config.method?.toUpperCase(), config.url);
    } else {
      console.warn('[API Client] ⚠ No CSRF token available for:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('[API Client] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login
      console.error('[API Client] 401 Unauthorized - redirecting to login');

      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // If CSRF token is invalid, refetch it
    if (error.response?.status === 403) {
      console.error('[API Client] 403 Forbidden - CSRF token may be invalid');
      console.error('[API Client] Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
      csrfToken = null; // Clear invalid token

      // Redirect to login if session expired
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('[API Client] Session may have expired - redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
