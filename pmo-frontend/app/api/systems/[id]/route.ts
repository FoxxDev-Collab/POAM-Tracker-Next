import { proxyToBackend } from "@/lib/api-proxy";

export const GET = proxyToBackend('systems/[id]');
export const PATCH = proxyToBackend('systems/[id]');
export const DELETE = proxyToBackend('systems/[id]');