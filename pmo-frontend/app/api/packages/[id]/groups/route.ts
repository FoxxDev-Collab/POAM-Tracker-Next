import { createProxyHandler } from "@/lib/api-proxy";

// GET /api/packages/:id/groups -> GET /api/groups?packageId=:id
export const GET = createProxyHandler('groups', {
  transformRequest: async (req) => {
    // Query params are automatically forwarded
    return null;
  }
});

// POST /api/packages/:id/groups -> POST /api/groups with packageId in body
export const POST = createProxyHandler('groups', {
  transformRequest: async (req) => {
    const url = new URL(req.url);
    const packageId = url.pathname.split('/')[3]; // Extract ID from /api/packages/:id/groups
    const body = await req.json();

    return {
      ...body,
      packageId: parseInt(packageId)
    };
  }
});
