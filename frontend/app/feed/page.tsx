'use client';

import { useState } from 'react';
import { PostCard } from '../posts/post-card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Search, 
  Plus, 
  Filter,
  Code,
  Image,
  FileText,
  MessageSquare,
  Briefcase,
  HelpCircle
} from 'lucide-react';

const mockPosts = [
  {
    id: '1',
    type: 'REPO' as const,
    title: 'Building a Real-time Chat App with Next.js and WebSocket',
    content: 'Just shipped my latest project - a real-time chat application built with Next.js 15, WebSocket, and PostgreSQL. Features include instant messaging, typing indicators, and online status tracking. The code is open source and available on GitHub!',
    codeUrl: 'const socket = new WebSocket("ws://localhost:3001");\nsocket.onmessage = (event) => {\n  const message = JSON.parse(event.data);\n  setMessages(prev => [...prev, message]);\n};',
    codeLanguage: 'JavaScript',
    author: {
      id: '1',
      name: 'Alex Chen',
      image: '/avatars/alex.jpg',
      role: 'Full Stack Developer'
    },
    community: {
      id: '1',
      name: 'Web Development',
      slug: 'web-dev'
    },
    upvotes: 234,
    downvotes: 12,
    viewCount: 1542,
    comments: 45,
    tags: ['Next.js', 'WebSocket', 'PostgreSQL', 'TypeScript'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    isPinned: true
  },
  {
    id: '2',
    type: 'GALLERY' as const,
    title: 'Redesigned Dashboard UI with Glassmorphism Effects',
    content: 'Completed a complete redesign of our analytics dashboard using modern glassmorphism techniques. The new design features dynamic mesh gradients, improved data visualization, and a much more intuitive user experience.',
    imageUrl: '/images/dashboard-redesign.jpg',
    author: {
      id: '2',
      name: 'Sarah Miller',
      image: '/avatars/sarah.jpg',
      role: 'UI/UX Designer'
    },
    community: {
      id: '2',
      name: 'Design Systems',
      slug: 'design-systems'
    },
    upvotes: 189,
    downvotes: 8,
    viewCount: 892,
    comments: 23,
    tags: ['UI Design', 'Glassmorphism', 'Dashboard', 'Figma'],
    createdAt: new Date('2024-01-15T08:15:00Z')
  },
  {
    id: '3',
    type: 'ARTICLE' as const,
    title: 'The Future of AI in Software Development: Opportunities and Challenges',
    content: 'An in-depth analysis of how artificial intelligence is transforming the software development landscape. From code generation to automated testing, AI is reshaping how we build and maintain software. This article explores current tools, future possibilities, and the ethical considerations we need to address.',
    author: {
      id: '3',
      name: 'Dr. Michael Roberts',
      image: '/avatars/michael.jpg',
      role: 'AI Researcher'
    },
    community: {
      id: '3',
      name: 'AI & Machine Learning',
      slug: 'ai-ml'
    },
    upvotes: 412,
    downvotes: 23,
    viewCount: 2341,
    comments: 67,
    tags: ['AI', 'Machine Learning', 'Software Development', 'Ethics'],
    createdAt: new Date('2024-01-14T16:45:00Z')
  },
  {
    id: '4',
    type: 'PULSE' as const,
    title: 'Just got promoted to Senior Developer! 🎉',
    content: 'After 3 years of hard work and continuous learning, I finally got promoted to Senior Developer at my company. Huge thanks to this amazing community for all the support, code reviews, and knowledge sharing. Remember, consistency beats intensity every time!',
    author: {
      id: '4',
      name: 'Emily Johnson',
      image: '/avatars/emily.jpg',
      role: 'Senior Developer'
    },
    community: {
      id: '1',
      name: 'Web Development',
      slug: 'web-dev'
    },
    upvotes: 156,
    downvotes: 3,
    viewCount: 567,
    comments: 89,
    tags: ['Career', 'Promotion', 'Milestone'],
    createdAt: new Date('2024-01-14T12:30:00Z')
  },
  {
    id: '5',
    type: 'JOB' as const,
    title: 'Hiring: Senior Frontend Developer at TechCorp',
    content: 'We are looking for an experienced Frontend Developer to join our growing team. You will work on cutting-edge web applications using React, TypeScript, and modern CSS frameworks. Remote position with competitive salary and great benefits.',
    linkUrl: 'https://techcorp.com/careers/senior-frontend-developer',
    author: {
      id: '5',
      name: 'TechCorp Hiring',
      image: '/avatars/techcorp.jpg',
      role: 'Recruiter'
    },
    community: {
      id: '4',
      name: 'Job Board',
      slug: 'jobs'
    },
    upvotes: 78,
    downvotes: 2,
    viewCount: 423,
    comments: 12,
    tags: ['Hiring', 'Frontend', 'React', 'TypeScript', 'Remote'],
    createdAt: new Date('2024-01-14T09:00:00Z')
  },
  {
    id: '6',
    type: 'QUESTION' as const,
    title: 'Best practices for handling authentication in Next.js 15?',
    content: 'I am building a new application with Next.js 15 and I am confused about the best approach for authentication. Should I use NextAuth.js, Auth0, or build a custom solution? What are the pros and cons of each approach?',
    author: {
      id: '6',
      name: 'James Wilson',
      image: '/avatars/james.jpg',
      role: 'Junior Developer'
    },
    community: {
      id: '1',
      name: 'Web Development',
      slug: 'web-dev'
    },
    upvotes: 45,
    downvotes: 1,
    viewCount: 234,
    comments: 34,
    tags: ['Authentication', 'Next.js', 'Security', 'Best Practices'],
    createdAt: new Date('2024-01-13T14:20:00Z')
  }
];

export default function FeedPage() {
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'top'>('trending');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || post.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'latest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'top':
        return b.viewCount - a.viewCount;
      default:
        return 0;
    }
  });

  const postTypes = [
    { value: 'all', label: 'All Posts', icon: FileText },
    { value: 'REPO', label: 'Code', icon: Code },
    { value: 'GALLERY', label: 'Design', icon: Image },
    { value: 'ARTICLE', label: 'Articles', icon: FileText },
    { value: 'PULSE', label: 'Updates', icon: MessageSquare },
    { value: 'JOB', label: 'Jobs', icon: Briefcase },
    { value: 'QUESTION', label: 'Questions', icon: HelpCircle }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Feed</h1>
          <p className="text-gray-300">
            Discover what's happening in your communities
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-amethyst-600 hover:from-emerald-600 hover:to-amethyst-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts, tags, or communities..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 glass-morphism border-white/10 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'trending' ? 'glass' : 'ghost'}
            onClick={() => setSortBy('trending')}
            className="text-white"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={sortBy === 'latest' ? 'glass' : 'ghost'}
            onClick={() => setSortBy('latest')}
            className="text-white"
          >
            <Clock className="mr-2 h-4 w-4" />
            Latest
          </Button>
          <Button variant="ghost" className="text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {postTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant={filterType === type.value ? 'glass' : 'ghost'}
              onClick={() => setFilterType(type.value)}
              className="text-white whitespace-nowrap flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
