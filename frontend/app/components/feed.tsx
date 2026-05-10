'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { StatusRibbon } from '../ui/status-ribbon';
import {
  Code2,
  Image,
  BookOpen,
  Zap,
  Briefcase,
  HelpCircle,
  Heart,
  MessageCircle,
  Share,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface FeedPost {
  id: string;
  type: 'REPO' | 'GALLERY' | 'ARTICLE' | 'PULSE' | 'JOB' | 'QUESTION';
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role?: 'ceo' | 'expert' | 'verified';
  };
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  image?: string;
  codeLanguage?: string;
  company?: string;
}

const PostTypeIcon: Record<string, React.ComponentType<{ size?: number }>> = {
  REPO: Code2,
  GALLERY: Image,
  ARTICLE: BookOpen,
  PULSE: Zap,
  JOB: Briefcase,
  QUESTION: HelpCircle,
};

const PostTypeColor: Record<string, 'emerald' | 'amethyst' | 'golden'> = {
  REPO: 'emerald',
  GALLERY: 'amethyst',
  ARTICLE: 'amethyst',
  PULSE: 'golden',
  JOB: 'emerald',
  QUESTION: 'golden',
};

const PostTypeLabel: Record<string, string> = {
  REPO: 'Repository',
  GALLERY: 'Portfolio',
  ARTICLE: 'Article',
  PULSE: 'Update',
  JOB: 'Opportunity',
  QUESTION: 'Question',
};

interface FeedProps {
  posts?: FeedPost[];
}

export function Feed({ posts = [] }: FeedProps) {
  const defaultPosts: FeedPost[] = [
    {
      id: '1',
      type: 'REPO',
      title: 'Nexus - Open Source Professional Network',
      content: 'A full-stack TypeScript application combining LinkedIn, GitHub, Behance, and Discord. Features include multi-hyphenate profiles, real-time discussions, and project vaults.',
      author: {
        name: 'Sarah Chen',
        avatar: 'SC',
        role: 'verified',
      },
      tags: ['TypeScript', 'Next.js', 'PostgreSQL', 'Real-time'],
      upvotes: 342,
      downvotes: 5,
      comments: 28,
      timestamp: '2 hours ago',
      codeLanguage: 'typescript',
    },
    {
      id: '2',
      type: 'GALLERY',
      title: 'UI/UX Case Study: Executive Aurora Design System',
      content: 'A deep dive into designing a premium interface for CEO-level users. Featuring Glassmorphism, Mesh Gradients, and a jewelry-like button aesthetic.',
      author: {
        name: 'Marcus Johnson',
        avatar: 'MJ',
        role: 'expert',
      },
      tags: ['Design System', 'UI/UX', 'Figma'],
      upvotes: 156,
      downvotes: 2,
      comments: 14,
      timestamp: '5 hours ago',
      image: 'https://via.placeholder.com/400x250?text=Design+System',
    },
    {
      id: '3',
      type: 'ARTICLE',
      title: 'Scaling PostgreSQL for Millions of Users: Lessons Learned',
      content: 'A comprehensive guide on database optimization, sharding strategies, and connection pooling based on our experience scaling Nexus to 100k+ users.',
      author: {
        name: 'Alex Rodriguez',
        avatar: 'AR',
        role: 'verified',
      },
      tags: ['Database', 'Performance', 'DevOps'],
      upvotes: 487,
      downvotes: 8,
      comments: 45,
      timestamp: '1 day ago',
    },
    {
      id: '4',
      type: 'PULSE',
      title: 'Just shipped: Real-time Notifications Engine 🚀',
      content: 'Implemented WebSocket-based notifications with automatic fallback to polling. Reduced latency from 2s to 150ms average delivery time.',
      author: {
        name: 'Jessica Lee',
        avatar: 'JL',
        role: 'ceo',
      },
      tags: ['WebSocket', 'Real-time', 'Infrastructure'],
      upvotes: 234,
      downvotes: 1,
      comments: 32,
      timestamp: '3 hours ago',
    },
    {
      id: '5',
      type: 'JOB',
      title: 'Senior Full-Stack Engineer - Nexus',
      content: 'We are hiring! Join our team to build the next generation of professional networking. Remote-first, competitive equity, health benefits.',
      author: {
        name: 'Engineering Team',
        avatar: 'ET',
      },
      tags: ['Full-time', 'Remote', 'Startup', 'Equity'],
      upvotes: 89,
      downvotes: 0,
      comments: 12,
      timestamp: 'Posted today',
      company: 'Nexus Inc.',
    },
    {
      id: '6',
      type: 'QUESTION',
      title: 'Best practices for implementing real-time collaboration in web apps?',
      content: 'What are the current best practices for building collaborative features like simultaneous editing, presence awareness, and conflict resolution?',
      author: {
        name: 'David Wong',
        avatar: 'DW',
      },
      tags: ['Collaboration', 'Real-time', 'Architecture'],
      upvotes: 156,
      downvotes: 2,
      comments: 18,
      timestamp: '6 hours ago',
    },
  ];

  const displayPosts = posts.length > 0 ? posts : defaultPosts;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {displayPosts.map((post) => {
        const Icon = PostTypeIcon[post.type];
        const variant = PostTypeColor[post.type];
        const label = PostTypeLabel[post.type];

        return (
          <Card key={post.id} variant={variant} glow={false}>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-amethyst-600 flex items-center justify-center text-white font-bold">
                    {post.author.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white hover:text-emerald-400 cursor-pointer transition-colors">
                        {post.author.name}
                      </p>
                      {post.author.role && (
                        <StatusRibbon
                          label={post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1)}
                          type={post.author.role}
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={20} />}
                  <Badge variant={variant}>
                    {label}
                  </Badge>
                </div>
              </div>

              <CardTitle variant="default" className="mb-2">
                {post.title}
              </CardTitle>
              {post.company && (
                <CardDescription>
                  <Briefcase className="inline mr-1" size={14} />
                  {post.company}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-900">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.codeLanguage && (
                <div className="mb-4 p-4 rounded-lg bg-black/50 font-mono text-sm border border-white/10">
                  <div className="text-gray-400 mb-2">📝 {post.codeLanguage}</div>
                  <div className="text-emerald-400">const nexus = new OmniPlatform();</div>
                  <div className="text-emerald-400">nexus.connect(professionals);</div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <ArrowUp size={16} />
                    <span>{post.upvotes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                    <ArrowDown size={16} />
                    <span>{post.downvotes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-amethyst-400 transition-colors">
                    <MessageCircle size={16} />
                    <span>{post.comments}</span>
                  </button>
                </div>
                <button className="flex items-center gap-1 text-gray-400 hover:text-golden-400 transition-colors">
                  <Share size={16} />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
