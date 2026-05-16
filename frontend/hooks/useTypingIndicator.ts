import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '../lib/pusher';
import { postsAPI } from '../lib/api';

export function useTypingIndicator(postId: string, currentUserName: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`post-${postId}`);
    
    channel.bind('typing-event', (data: { userName: string; isTyping: boolean }) => {
      // Don't show ourselves in the typing list
      if (data.userName === currentUserName) return;

      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (prev.includes(data.userName)) return prev;
          return [...prev, data.userName];
        } else {
          return prev.filter((user) => user !== data.userName);
        }
      });
    });

    return () => {
      pusher.unsubscribe(`post-${postId}`);
    };
  }, [postId, currentUserName]);

  const handleTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      postsAPI.sendTypingEvent(postId, currentUserName, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      postsAPI.sendTypingEvent(postId, currentUserName, false);
    }, 3000);
  };

  return { typingUsers, handleTyping };
}
