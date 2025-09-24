import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for potential BullMQ integration
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual BullMQ job status lookup
    // For now, return a simulated response

    // Simulate job progression
    const mockJobData = {
      id: jobId,
      name: 'stig-import',
      status: 'active', // 'waiting', 'active', 'completed', 'failed'
      progress: Math.floor(Math.random() * 100),
      data: {
        systemId: parseInt(request.nextUrl.searchParams.get('systemId') || '0'),
        fileName: 'sample-stig.ckl',
        steps: [
          {
            id: 'file-processing',
            name: 'File Processing',
            status: 'completed',
            progress: 100
          },
          {
            id: 'data-extraction',
            name: 'Data Extraction',
            status: 'active',
            progress: 65
          },
          {
            id: 'cci-mapping',
            name: 'CCI Mapping',
            status: 'pending',
            progress: 0
          },
          {
            id: 'score-calculation',
            name: 'Score Calculation',
            status: 'pending',
            progress: 0
          }
        ]
      },
      returnvalue: null,
      opts: {
        attempts: 1,
        maxAttempts: 3
      },
      attemptsMade: 0,
      processedOn: Date.now() - 30000,
      finishedOn: null,
      failedReason: null
    };

    // TODO: Implement actual BullMQ integration like this:
    /*
    const { Queue } = await import('bullmq');
    const { getRedisClient } = await import('@/lib/redis');

    const redis = getRedisClient();
    const queue = new Queue('stig-import', { connection: redis });

    const job = await queue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = {
      id: job.id,
      name: job.name,
      status: await job.getState(),
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      opts: job.opts,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason
    };
    */

    return NextResponse.json(mockJobData);

  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}