import { proxyToBackend } from "@/lib/api-proxy";

export const GET = proxyToBackend('packages/[id]');
export const PATCH = proxyToBackend('packages/[id]');
export const DELETE = proxyToBackend('packages/[id]');
