import { NextRequest, NextResponse } from 'next/server';
import { triggerRealtimeEvent } from '../../../../../lib/pusher';

// Add CORS headers to response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3002');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userName, isTyping } = body;

    if (!userName) {
      return addCorsHeaders(NextResponse.json({ error: 'User name is required' }, { status: 400 }));
    }

    // Trigger typing event via Pusher
    // Channel name includes the postId for isolation
    await triggerRealtimeEvent(
      `post-${postId}`, 
      'typing-event', 
      { userName, isTyping }
    );

    return addCorsHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error in typing API:', error);
    return addCorsHeaders(NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    ));
  }
}
