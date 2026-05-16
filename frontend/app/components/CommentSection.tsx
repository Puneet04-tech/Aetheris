'use client';

import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: { name: string; image?: string };
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[] | undefined;
  userName: string;
  onAddComment: (content: string) => Promise<void>;
  getAvatarInitials: (name?: string) => string;
  getTimeAgo: (date: string) => string;
}

export function CommentSection({
  postId,
  comments,
  userName,
  onAddComment,
  getAvatarInitials,
  getTimeAgo,
}: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState('');
  const { typingUsers: realTypingUsers, handleTyping } = useTypingIndicator(postId, userName);
  const [demoTypingUsers, setDemoTypingUsers] = useState<string[]>([]);

  // Demo simulation for "CEO-grade" wow factor
  useEffect(() => {
    const demos = ['Sarah Chen', 'Marcus Aurelius', 'Elena Rodriguez'];
    const randomUser = demos[Math.floor(Math.random() * demos.length)];
    
    const timeout = setTimeout(() => {
      setDemoTypingUsers([randomUser]);
      
      const stopTimeout = setTimeout(() => {
        setDemoTypingUsers([]);
      }, 4000);
      
      return () => clearTimeout(stopTimeout);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const typingUsers = [...new Set([...realTypingUsers, ...demoTypingUsers])];

  const handleSubmit = async () => {
    if (!commentInput.trim()) return;
    await onAddComment(commentInput);
    setCommentInput('');
  };

  return (
    <div className="pt-4 border-t border-white/10 space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {comments === undefined ? (
          <div className="flex justify-center py-4">
            <Loader size={20} className="animate-spin text-emerald-500" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-2">No comments yet. Be the first to join the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500/20 to-amethyst-500/20 flex items-center justify-center text-xs font-bold text-white">
                {getAvatarInitials(comment.author?.name)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-white">{comment.author?.name || 'Anonymous'}</span>
                  <span className="text-[10px] text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 animate-pulse ml-1">
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce"></span>
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...` 
              : typingUsers.length === 2 
                ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                : 'Several people are typing...'}
          </span>
        </div>
      )}

      {/* Comment Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentInput}
          onChange={(e) => {
            setCommentInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 rounded-lg glass-morphism border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium border border-emerald-500/20"
        >
          Post
        </button>
      </div>
    </div>
  );
}
