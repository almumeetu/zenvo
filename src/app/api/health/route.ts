/**
 * /api/health — System health, ping, and backend connectivity status API
 */

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let backendStatus = 'UNKNOWN';
  let backendLatencyMs = 0;

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    backendLatencyMs = Date.now() - startTime;
    backendStatus = res.ok ? 'ONLINE' : 'DEGRADED';
  } catch (err: any) {
    backendStatus = 'OFFLINE';
    backendLatencyMs = Date.now() - startTime;
  }

  return NextResponse.json({
    status: 'HEALTHY',
    frontend: 'OK',
    timestamp: new Date().toISOString(),
    backend: {
      url: API_BASE_URL,
      status: backendStatus,
      latencyMs: backendLatencyMs,
    },
  });
}
