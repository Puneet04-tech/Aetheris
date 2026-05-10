'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Search, Plus, X, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/ui/card';
import { Badge } from '@/app/ui/badge';
import { postsAPI } from '@/lib/api';

interface Post {
  id: string;
  type: 'REPO' | 'GALLERY' | 'ARTICLE' | 'PULSE' | 'JOB' | 'QUESTION';
  title: string;
  content: string;
  authorId?: string;
  author?: { name: string; image?: string };
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'PULSE' });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({});

  const postTypes = [
    { label: 'All Posts', value: 'All' },
    { label: 'Code Repos', value: 'REPO' },
    { label: 'Gallery', value: 'GALLERY' },
    { label: 'Articles', value: 'ARTICLE' },
    { label: 'Pulse', value: 'PULSE' },
    { label: 'Jobs', value: 'JOB' },
    { label: 'Questions', value: 'QUESTION' },
  ];

  // Load posts from API
  useEffect(() => {
    loadPosts();
  }, [filterType]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.list(20, 0);
      if (response.success || response.posts) {
        const postList = response.posts || response.data || [];
        setPosts(postList);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      // Load fallback mock data
      setPosts([
        {
          id: '1',
          type: 'REPO',
          title: 'Building Next.js 15 with Turbopack',
          content: 'Just launched my new project showcasing performance improvements with Next.js 15 Turbopack. Check it out!',
          author: { name: 'Alex Chen' },
          upvotes: 234,
          downvotes: 0,
          commentCount: 45,
          tags: ['Next.js', 'React', 'Performance'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'ARTICLE',
          title: 'Web3 Security Best Practices',
          content: 'A comprehensive guide on securing smart contracts and preventing common vulnerabilities in blockchain applications.',
          author: { name: 'Sarah Kim' },
          upvotes: 567,
          downvotes: 0,
          commentCount: 89,
          tags: ['Web3', 'Security', 'Blockchain'],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setIsCreating(true);
      const response = await postsAPI.create(
        newPost.type,
        newPost.title,
        newPost.content,
        []
      );

      if (response.success) {
        setPosts([response.post, ...posts]);
        setNewPost({ title: '', content: '', type: 'PULSE' });
        setShowCreateModal(false);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = voteType === 'upvote'
        ? await postsAPI.upvote(postId)
        : await postsAPI.downvote(postId);

      if (response.success) {
        // Update local state
        const currentVote = userVotes[postId];
        const newPosts = posts.map((post) => {
          if (post.id === postId) {
            let upvotes = post.upvotes;
            let downvotes = post.downvotes;

            if (currentVote === voteType) {
              // Remove vote
              if (voteType === 'upvote') upvotes = Math.max(0, upvotes - 1);
              else downvotes = Math.max(0, downvotes - 1);
            } else if (currentVote === null) {
              // Add vote
              if (voteType === 'upvote') upvotes += 1;
              else downvotes += 1;
            } else {
              // Change vote
              if (currentVote === 'upvote') upvotes = Math.max(0, upvotes - 1);
              else downvotes = Math.max(0, downvotes - 1);
              
              if (voteType === 'upvote') upvotes += 1;
              else downvotes += 1;
            }

            return { ...post, upvotes, downvotes };
          }
          return post;
        });

        setPosts(newPosts);
        setUserVotes({
          ...userVotes,
          [postId]: currentVote === voteType ? null : voteType,
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  };

  const handleComment = async (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    try {
      const response = await postsAPI.addComment(postId, comment);
      if (response.success) {
        const newPosts = posts.map((post) =>
          post.id === postId
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        );
        setPosts(newPosts);
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const filteredPosts = filterType === 'All' ? posts : posts.filter((p) => p.type === filterType);

  const typeIcons: Record<Post['type'], string> = {
    REPO: '📝',
    GALLERY: '🎨',
    ARTICLE: '📖',
    PULSE: '⚡',
    JOB: '💼',
    QUESTION: '❓',
  };

  const getAvatarInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Feed</h1>
          <p className="text-gray-400 mt-1">Discover content from professionals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-amber-400 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
        >
          <Plus size={20} />
          Create Post
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-3 rounded-lg glass-morphism border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {postTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              filterType === type.value
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-300 hover:text-emerald-400 border border-white/10'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="variant-emerald w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Post Type</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass-morphism border border-white/10 text-white bg-black/50"
                >
                  <option value="PULSE">Pulse (Quick Update)</option>
                  <option value="ARTICLE">Article</option>
                  <option value="REPO">Code Repository</option>
                  <option value="GALLERY">Gallery</option>
                  <option value="JOB">Job Posting</option>
                  <option value="QUESTION">Question</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's your post about?"
                  className="w-full px-4 py-2 rounded-lg glass-morphism border border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg glass-morphism border border-white/10 text-white placeholder-gray-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePost}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-amber-400 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating && <Loader size={18} className="animate-spin" />}
                  {isCreating ? 'Publishing...' : 'Publish Post'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader size={24} className="animate-spin text-emerald-500" />
        </div>
      )}

      {/* Posts */}
      {!loading && (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="variant-default text-center py-8">
              <p className="text-gray-400">No posts found. Create one to get started!</p>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="variant-default hover:border-emerald-500/30 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amethyst-500 flex items-center justify-center text-white font-bold text-sm">
                        {getAvatarInitials(post.author?.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{post.author?.name || 'Anonymous'}</p>
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            {typeIcons[post.type]} {post.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                    <p className="text-gray-300">{post.content}</p>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <Badge key={tag} className="bg-amethyst-500/20 text-amethyst-400 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleVote(post.id, 'upvote')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        userVotes[post.id] === 'upvote'
                          ? 'text-red-400 bg-red-500/20'
                          : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <Heart size={18} fill={userVotes[post.id] === 'upvote' ? 'currentColor' : 'none'} />
                      <span className="text-sm font-medium">{post.upvotes}</span>
                    </button>
                    <button
                      onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">{post.commentCount}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 rounded-lg glass-morphism border border-white/10 text-white placeholder-gray-500 text-sm"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
