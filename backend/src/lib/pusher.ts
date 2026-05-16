import Pusher from 'pusher';

// Initialize Pusher for server-side
// Use environment variables or fallback to mock mode if not provided
const pusherConfig = {
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
};

// Check if Pusher is configured
const isPusherConfigured = 
  pusherConfig.appId && 
  pusherConfig.key && 
  pusherConfig.secret;

export const pusherServer = isPusherConfigured 
  ? new Pusher(pusherConfig)
  : null;

/**
 * Trigger a real-time event
 */
export async function triggerRealtimeEvent(channel: string, event: string, data: any) {
  if (!pusherServer) {
    console.warn(`[Pusher Mock] Triggered ${event} on ${channel}:`, data);
    return null;
  }

  try {
    return await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return null;
  }
}
