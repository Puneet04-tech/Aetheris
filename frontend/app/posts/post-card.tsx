'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Eye,
  Code,
  Image,
  FileText,
  Link,
  Clock,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from '../utils';

interface PostCardProps {
  post: {
    id: string;
    type: 'REPO' | 'GALLERY' | 'ARTICLE' | 'PULSE' | 'JOB' | 'QUESTION';
    title: string;
    content: string;
    imageUrl?: string;
    codeUrl?: string;
    codeLanguage?: string;
    linkUrl?: string;
    author: {
      id: string;
      name: string;
      image?: string;
      role?: string;
    };
    community?: {
      id: string;
      name: string;
      slug: string;
    };
    upvotes: number;
    downvotes: number;
    viewCount: number;
    comments: number;
    tags: string[];
    createdAt: Date;
    isPinned?: boolean;
  };
}

export function PostCard({ post }: PostCardProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      if (type === 'up') {
        setUpvotes(upvotes - 1);
      } else {
        setDownvotes(downvotes - 1);
      }
    } else {
      const previousVote = userVote;
      setUserVote(type);
      
      if (type === 'up') {
        setUpvotes(upvotes + 1);
        if (previousVote === 'down') {
          setDownvotes(downvotes - 1);
        }
      } else {
        setDownvotes(downvotes + 1);
        if (previousVote === 'up') {
          setUpvotes(upvotes - 1);
        }
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REPO':
        return <Code className="h-4 w-4" />;
      case 'GALLERY':
        return <Image className="h-4 w-4" />;
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />;
      case 'PULSE':
        return <MessageSquare className="h-4 w-4" />;
      case 'JOB':
        return <Briefcase className="h-4 w-4" />;
      case 'QUESTION':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REPO':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'GALLERY':
        return 'text-amethyst-400 bg-amethyst-500/20 border-amethyst-500/30';
      case 'ARTICLE':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'PULSE':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'JOB':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'QUESTION':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <Card className="glass-morphism border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{post.author.name}</span>
                {post.author.role && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role}
                  </Badge>
                )}
                {post.isPinned && (
                  <Badge className="bg-amethyst-500/20 text-amethyst-400 border-amethyst-500/30">
                    📌 Pinned
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {post.community && (
                  <>
                    <span>in</span>
                    <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                      r/{post.community.slug}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getTypeColor(post.type)}>
              {getTypeIcon(post.type)}
              <span className="ml-1">{post.type}</span>
            </Badge>
            <h3 className="text-xl font-semibold text-white hover:text-emerald-400 cursor-pointer transition-colors">
              {post.title}
            </h3>
          </div>
          
          <CardDescription className="text-gray-300 leading-relaxed">
            {post.content}
          </CardDescription>
        </div>

        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {post.codeUrl && (
          <div className="bg-charcoal-900 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-400 font-mono">
                {post.codeLanguage || 'code'}
              </span>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{post.codeUrl}</code>
            </pre>
          </div>
        )}

        {post.linkUrl && (
          <div className="flex items-center gap-2 p-3 bg-charcoal-800 rounded-lg border border-white/10">
            <Link className="h-4 w-4 text-emerald-400" />
            <a 
              href={post.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 text-sm truncate"
            >
              {post.linkUrl}
            </a>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={`p-1 ${userVote === 'up' ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'}`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className={`text-sm font-medium ${userVote === 'up' ? 'text-emerald-400' : userVote === 'down' ? 'text-red-400' : 'text-gray-300'}`}>
                {upvotes - downvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className={`p-1 ${userVote === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MessageSquare className="h-4 w-4 mr-1" />
              {post.comments}
            </Button>
            
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
