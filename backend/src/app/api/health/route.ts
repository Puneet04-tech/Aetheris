import { NextResponse } from 'next/server';
import { addCorsHeaders, corsOptions } from '../../../lib/cors-utils';

export async function GET() {
  try {
    // Basic health check without database dependency
    return addCorsHeaders(NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'aetheris-backend'
    }));
  } catch (error) {
    console.error('Health check failed:', error);
    return addCorsHeaders(NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'aetheris-backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptions();
}
