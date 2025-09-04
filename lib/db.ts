// API Client for NestJS Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Mock database interface to maintain compatibility with existing code
export const db = {
  // Mock functions that return empty results for now
  // These should be replaced with proper API calls to your NestJS backend
  
  prepare: (sql: string) => ({
    all: () => [],
    get: () => null,
    run: () => ({ changes: 0 }),
  }),
  
  exec: (sql: string) => null,
  
  // Helper functions for common operations
  async getPackages() {
    try {
      return await apiRequest('/packages');
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  },

  async getPackage(id: string) {
    try {
      return await apiRequest(`/packages/${id}`);
    } catch (error) {
      console.warn('API not available, returning null:', error);
      return null;
    }
  },

  async getSystems(packageId?: string) {
    try {
      const url = packageId ? `/systems?packageId=${packageId}` : '/systems';
      return await apiRequest(url);
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  },

  async getSystem(id: string) {
    try {
      return await apiRequest(`/systems/${id}`);
    } catch (error) {
      console.warn('API not available, returning null:', error);
      return null;
    }
  },

  async getGroups(packageId?: string) {
    try {
      const url = packageId ? `/groups?packageId=${packageId}` : '/groups';
      return await apiRequest(url);
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  },

  async getGroup(id: string) {
    try {
      return await apiRequest(`/groups/${id}`);
    } catch (error) {
      console.warn('API not available, returning null:', error);
      return null;
    }
  },

  async getPoams(packageId?: string) {
    try {
      const url = packageId ? `/poams?packageId=${packageId}` : '/poams';
      return await apiRequest(url);
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  },

  async getPoam(id: string) {
    try {
      return await apiRequest(`/poams/${id}`);
    } catch (error) {
      console.warn('API not available, returning null:', error);
      return null;
    }
  },

  async getStps(packageId?: string, systemId?: string) {
    try {
      let url = '/stps';
      const params = new URLSearchParams();
      if (packageId) params.append('packageId', packageId);
      if (systemId) params.append('systemId', systemId);
      if (params.toString()) url += `?${params.toString()}`;
      
      return await apiRequest(url);
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  },

  async getStp(id: string) {
    try {
      return await apiRequest(`/stps/${id}`);
    } catch (error) {
      console.warn('API not available, returning null:', error);
      return null;
    }
  },

  async getVulnerabilities(systemId?: string) {
    try {
      const url = systemId ? `/vulnerabilities/stig-findings?systemId=${systemId}` : '/vulnerabilities/stig-findings';
      return await apiRequest(url);
    } catch (error) {
      console.warn('API not available, returning empty array:', error);
      return [];
    }
  }
};

export default db;