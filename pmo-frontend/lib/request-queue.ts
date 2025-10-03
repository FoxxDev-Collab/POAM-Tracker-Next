interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  timestamp: number;
  retries: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 5;
  private currentRequests: number = 0;
  private batchSize: number = 10;
  private batchDelay: number = 100; // ms
  private maxRetries: number = 3;
  private dedupMap: Map<string, QueuedRequest[]> = new Map();

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      const request: QueuedRequest = {
        id,
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0,
      };

      // Deduplication for GET requests
      if (!options.method || options.method === 'GET') {
        const key = `${url}:${JSON.stringify(options)}`;
        if (this.dedupMap.has(key)) {
          this.dedupMap.get(key)!.push(request);
          return;
        } else {
          this.dedupMap.set(key, [request]);
        }
      }

      this.queue.push(request);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const batch = this.queue.splice(0, this.batchSize);

      for (const request of batch) {
        if (this.currentRequests >= this.maxConcurrent) {
          // Put remaining requests back in queue
          this.queue.unshift(...batch.slice(batch.indexOf(request)));
          break;
        }

        this.currentRequests++;
        this.executeRequest(request);
      }

      // Small delay between batches to prevent overwhelming
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }

    this.processing = false;

    // Continue processing if there are more requests
    if (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      setTimeout(() => this.processQueue(), this.batchDelay);
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const response = await fetch(request.url, {
        ...request.options,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Handle deduplication for GET requests
      const key = `${request.url}:${JSON.stringify(request.options)}`;
      const duplicates = this.dedupMap.get(key) || [request];
      this.dedupMap.delete(key);

      // Resolve all duplicate requests with the same response
      for (const dup of duplicates) {
        dup.resolve(response.clone());
      }

    } catch (error) {
      const shouldRetry = request.retries < this.maxRetries &&
        (error instanceof TypeError || // Network error
         (error as Error)?.name === 'AbortError'); // Timeout

      if (shouldRetry) {
        request.retries++;
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, request.retries), 10000);

        setTimeout(() => {
          this.queue.unshift(request);
          this.processQueue();
        }, delay);
      } else {
        // Handle deduplication for failed requests
        const key = `${request.url}:${JSON.stringify(request.options)}`;
        const duplicates = this.dedupMap.get(key) || [request];
        this.dedupMap.delete(key);

        for (const dup of duplicates) {
          dup.reject(error as Error);
        }
      }
    } finally {
      this.currentRequests--;

      // Continue processing queue
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  // Get queue statistics
  getStats() {
    return {
      queueSize: this.queue.length,
      currentRequests: this.currentRequests,
      dedupMapSize: this.dedupMap.size,
      processing: this.processing,
    };
  }

  // Clear the queue (useful for cleanup)
  clear() {
    for (const request of this.queue) {
      request.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    this.dedupMap.clear();
  }
}

// Global request queue instance
const globalRequestQueue = new RequestQueue(8); // Allow up to 8 concurrent requests

// Enhanced fetch function with queuing
export async function queuedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Check if we're in a client environment
  if (typeof window !== 'undefined') {
    return globalRequestQueue.fetch(url, options);
  } else {
    // Fallback to regular fetch for server-side
    return fetch(url, options);
  }
}

// Export for debugging
export function getQueueStats() {
  return globalRequestQueue.getStats();
}

export function clearQueue() {
  globalRequestQueue.clear();
}