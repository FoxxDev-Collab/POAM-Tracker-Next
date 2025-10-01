/**
 * Unified API Client for POAM Tracker
 *
 * This module provides a centralized, type-safe API client for both
 * server-side and client-side requests to the backend.
 */

import { cookies } from 'next/headers';

// ============================================================================
// Configuration
// ============================================================================

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const API_PREFIX = 'api';

// ============================================================================
// Types
// ============================================================================

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  ok: boolean;
}

// ============================================================================
// URL Construction
// ============================================================================

/**
 * Constructs a properly formatted backend API URL
 * @param path - API endpoint path (without /api prefix)
 * @returns Full URL to backend API endpoint
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const hasApiPrefix = cleanPath.startsWith(`${API_PREFIX}/`);
  const finalPath = hasApiPrefix ? cleanPath : `${API_PREFIX}/${cleanPath}`;
  return `${BACKEND_URL}/${finalPath}`;
}

/**
 * Appends query parameters to a URL
 */
function appendQueryParams(url: string, params?: Record<string, any>): string {
  if (!params) return url;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Gets authentication headers for server-side requests
 * ONLY use in Server Components and Route Handlers
 */
export async function getServerAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  return headers;
}

/**
 * Gets authentication headers for client-side requests
 * Uses browser's automatic cookie handling
 */
export function getClientAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

// ============================================================================
// Core API Client
// ============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Makes an authenticated request to the backend API
   * @param path - API endpoint path
   * @param config - Request configuration
   * @param isServer - Whether this is a server-side request
   */
  private async request<T = any>(
    path: string,
    config: RequestConfig = {},
    isServer: boolean = false
  ): Promise<ApiResponse<T>> {
    const { params, headers: customHeaders, ...fetchConfig } = config;

    // Build URL with query params
    const url = appendQueryParams(buildApiUrl(path), params);

    // Get appropriate auth headers
    const authHeaders = isServer
      ? await getServerAuthHeaders()
      : getClientAuthHeaders();

    // Merge headers
    const headers: HeadersInit = {
      ...authHeaders,
      ...customHeaders,
    };

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      const status = response.status;
      const ok = response.ok;

      // Try to parse JSON response
      let data: any;
      let error: string | undefined;

      try {
        const json = await response.json();
        if (ok) {
          data = json;
        } else {
          error = json.error || json.message || `Request failed with status ${status}`;
        }
      } catch {
        // Response is not JSON or empty
        if (!ok) {
          error = `Request failed with status ${status}`;
        }
      }

      return { data, error, status, ok };
    } catch (err) {
      console.error(`API request failed: ${url}`, err);
      return {
        error: err instanceof Error ? err.message : 'Network request failed',
        status: 0,
        ok: false,
      };
    }
  }

  // HTTP Methods for server-side use
  async get<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'GET' }, true);
  }

  async post<T = any>(path: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, true);
  }

  async patch<T = any>(path: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }, true);
  }

  async put<T = any>(path: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, true);
  }

  async delete<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' }, true);
  }

  // Special method for file uploads
  async upload<T = any>(path: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const { params, ...fetchConfig } = config || {};
    const url = appendQueryParams(buildApiUrl(path), params);
    const headers = await getServerAuthHeaders();

    // Remove Content-Type for FormData (browser will set with boundary)
    delete (headers as Record<string, string>)['Content-Type'];

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        method: 'POST',
        headers,
        body: formData,
      });

      const status = response.status;
      const ok = response.ok;
      let data: any;
      let error: string | undefined;

      try {
        const json = await response.json();
        if (ok) {
          data = json;
        } else {
          error = json.error || json.message || `Upload failed with status ${status}`;
        }
      } catch {
        if (!ok) {
          error = `Upload failed with status ${status}`;
        }
      }

      return { data, error, status, ok };
    } catch (err) {
      console.error(`Upload failed: ${url}`, err);
      return {
        error: err instanceof Error ? err.message : 'Upload failed',
        status: 0,
        ok: false,
      };
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

// Singleton instance for server-side use
export const apiClient = new ApiClient();

// Direct exports for common operations
export const api = {
  get: <T = any>(path: string, config?: RequestConfig) => apiClient.get<T>(path, config),
  post: <T = any>(path: string, body?: any, config?: RequestConfig) => apiClient.post<T>(path, body, config),
  patch: <T = any>(path: string, body?: any, config?: RequestConfig) => apiClient.patch<T>(path, body, config),
  put: <T = any>(path: string, body?: any, config?: RequestConfig) => apiClient.put<T>(path, body, config),
  delete: <T = any>(path: string, config?: RequestConfig) => apiClient.delete<T>(path, config),
  upload: <T = any>(path: string, formData: FormData, config?: RequestConfig) => apiClient.upload<T>(path, formData, config),
};

// Export types
export type { ApiResponse, RequestConfig };
