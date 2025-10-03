import { NextRequest } from "next/server";

// Add runtime export for Node.js runtime (required for Redis)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || 'general';

  try {
    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        const send = (data: unknown) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (error) {
            console.error('Error sending SSE data:', error);
          }
        };

        send({ type: 'connected', channel, timestamp: Date.now() });

        // Basic heartbeat (Redis integration temporarily disabled for stability)
        const heartbeat = setInterval(() => {
          send({ type: 'heartbeat', timestamp: Date.now() });
        }, 30000);

        // Cleanup function
        const cleanup = () => {
          clearInterval(heartbeat);
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Store cleanup function for later use
        (controller as unknown as { cleanup: () => void }).cleanup = cleanup;

        // TODO: Re-enable Redis integration once stability issues are resolved
        // For now, just provide basic SSE functionality
        send({ type: 'info', message: 'Basic SSE mode - Redis integration disabled' });
      },

      cancel(this: { cleanup?: () => void }) {
        // Call cleanup if it exists
        if (this.cleanup) {
          this.cleanup();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('SSE route error:', error);
    return new Response('SSE Error', { status: 500 });
  }
}