import { proxyToBackend } from "@/lib/api-proxy";

export const GET = proxyToBackend('systems/[id]/stig/findings');
export const POST = proxyToBackend('systems/[id]/stig/upload');