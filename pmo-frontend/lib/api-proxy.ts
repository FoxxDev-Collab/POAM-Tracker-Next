/**
 * API Proxy Utilities for Next.js Route Handlers
 *
 * Provides standardized request proxying to the backend with proper
 * auth handling, error responses, and type safety.
 */

import { NextRequest, NextResponse } from 'next/server';
import { api, buildApiUrl, getServerAuthHeaders } from './api-client';

// ============================================================================
// Types
// ============================================================================

interface ProxyConfig {
  /**
   * Transform the request before forwarding (optional)
   */
  transformRequest?: (req: NextRequest) => Promise<unknown> | unknown;

  /**
   * Transform the response before returning (optional)
   */
  transformResponse?: (data: unknown) => unknown;

  /**
   * Custom error handler (optional)
   */
  onError?: (error: unknown) => NextResponse;
}

// ============================================================================
// Generic Proxy Handler
// ============================================================================

/**
 * Creates a standardized proxy handler for Next.js Route Handlers
 *
 * @example
 * export const GET = createProxyHandler('packages');
 * export const POST = createProxyHandler('packages', {
 *   transformRequest: async (req) => {
 *     const body = await req.json();
 *     return { ...body, createdAt: new Date() };
 *   }
 * });
 */
export function createProxyHandler(
  backendPath: string,
  config: ProxyConfig = {}
) {
  return async (req: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      const method = req.method;
      const url = new URL(req.url);

      // Extract dynamic params if they exist
      let finalPath = backendPath;
      if (context?.params) {
        const params = await context.params;
        Object.entries(params).forEach(([key, value]) => {
          finalPath = finalPath.replace(`[${key}]`, String(value));
        });
      }

      // Append query params
      if (url.searchParams.toString()) {
        finalPath += `?${url.searchParams.toString()}`;
      }

      // Handle different HTTP methods
      let response;

      switch (method) {
        case 'GET':
          response = await api.get(finalPath);
          break;

        case 'POST': {
          const contentType = req.headers.get('content-type');

          // Handle multipart/form-data
          if (contentType?.includes('multipart/form-data')) {
            const formData = await req.formData();
            response = await api.upload(finalPath, formData);
          } else {
            // Handle JSON
            let body = null;
            try {
              body = await req.json();
            } catch {
              // No body or invalid JSON
            }

            if (config.transformRequest) {
              body = await config.transformRequest(req);
            }

            response = await api.post(finalPath, body);
          }
          break;
        }

        case 'PATCH': {
          let body = null;
          try {
            body = await req.json();
          } catch {
            // No body
          }

          if (config.transformRequest) {
            body = await config.transformRequest(req);
          }

          response = await api.patch(finalPath, body);
          break;
        }

        case 'PUT': {
          let body = null;
          try {
            body = await req.json();
          } catch {
            // No body
          }

          if (config.transformRequest) {
            body = await config.transformRequest(req);
          }

          response = await api.put(finalPath, body);
          break;
        }

        case 'DELETE':
          response = await api.delete(finalPath);
          break;

        default:
          return NextResponse.json(
            { error: `Method ${method} not allowed` },
            { status: 405 }
          );
      }

      // Handle error response
      if (!response.ok) {
        if (config.onError) {
          return config.onError(response.error);
        }
        return NextResponse.json(
          { error: response.error || 'Request failed' },
          { status: response.status || 500 }
        );
      }

      // Transform response if needed
      let data = response.data;
      if (config.transformResponse) {
        data = config.transformResponse(data);
      }

      return NextResponse.json(data);
    } catch (error) {
      console.error('Proxy handler error:', error);

      if (config.onError) {
        return config.onError(error);
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// ============================================================================
// Simplified Proxy for Direct Backend Passthrough
// ============================================================================

/**
 * Creates a simple passthrough proxy that directly forwards requests
 * to the backend with minimal processing.
 *
 * @example
 * export const GET = proxyToBackend('packages');
 * export const POST = proxyToBackend('packages');
 */
export function proxyToBackend(backendPath: string) {
  return createProxyHandler(backendPath);
}

// ============================================================================
// Manual Proxy Helper (for complex Route Handlers)
// ============================================================================

/**
 * Manually proxy a request to the backend API
 * Use this when you need full control over the request/response
 */
export async function proxyRequest(
  backendPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = buildApiUrl(backendPath);
  const headers = await getServerAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}
