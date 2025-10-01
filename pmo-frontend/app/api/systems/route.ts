import { proxyToBackend } from "@/lib/api-proxy";

export const GET = proxyToBackend('systems');
export const POST = proxyToBackend('systems');