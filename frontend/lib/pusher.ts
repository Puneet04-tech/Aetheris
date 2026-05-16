import Pusher from 'pusher-js';

// Client-side Pusher initialization
const pusherConfig = {
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
};

// Check if Pusher is configured
export const isPusherConfigured = !!pusherConfig.key;

let pusherInstance: Pusher | null = null;

export const getPusherClient = () => {
  if (!isPusherConfigured) {
    console.warn('[Pusher Client Mock] Pusher is not configured. Real-time features will be disabled.');
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher(pusherConfig.key, {
      cluster: pusherConfig.cluster,
    });
  }
  
  return pusherInstance;
};
