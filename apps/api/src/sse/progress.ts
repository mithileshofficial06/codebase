import { Response } from 'express';
import { SSEProgressEvent, SSEStepId } from '../types';

export class ProgressEmitter {
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private res: Response) {
    // Set SSE headers
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no');
    this.res.flushHeaders();

    // Send heartbeat every 15s to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      this.res.write(': heartbeat\n\n');
    }, 15000);
  }

  emitProgress(step: SSEStepId, status: SSEProgressEvent['status'], message?: string) {
    const event: SSEProgressEvent = { step, status, message };
    this.res.write(`event: progress\ndata: ${JSON.stringify(event)}\n\n`);
  }

  emitResult(data: any) {
    this.res.write(`event: result\ndata: ${JSON.stringify(data)}\n\n`);
  }

  emitError(message: string) {
    this.res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  }

  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.res.end();
  }
}
