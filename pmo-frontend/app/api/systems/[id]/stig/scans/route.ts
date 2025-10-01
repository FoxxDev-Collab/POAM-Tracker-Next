import { proxyToBackend } from "@/lib/api-proxy";

export const GET = proxyToBackend('systems/[id]/stig/scans');