'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Search, 
  Plus, 
  Lock, 
  Globe,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const mockCommunities = [
  {
    id: '1',
    name: 'Web Development',
    slug: 'web-dev',
    description: 'Everything web development - React, Vue, Angular, and more!',
    memberCount: 15420,
    isPrivate: false,
    postCount: 892,
    trending: true
  },
  {
    id: '2',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Discuss the latest in AI, ML, deep learning, and data science.',
    memberCount: 12850,
    isPrivate: false,
    postCount: 654,
    trending: true
  },
  {
    id: '3',
    name: 'Startup Founders',
    slug: 'startup-founders',
    description: 'Private community for startup founders and entrepreneurs.',
    memberCount: 3420,
    isPrivate: true,
    postCount: 234,
    trending: false
  },
  {
    id: '4',
    name: 'Design Systems',
    slug: 'design-systems',
    description: 'Building and maintaining scalable design systems.',
    memberCount: 8760,
    isPrivate: false,
    postCount: 445,
    trending: false
  },
  {
    id: '5',
    name: 'DevOps & Cloud',
    slug: 'devops-cloud',
    description: 'Infrastructure, deployment, and cloud architecture discussions.',
    memberCount: 9830,
    isPrivate: false,
    postCount: 567,
    trending: true
  },
  {
    id: '6',
    name: 'Mobile Development',
    slug: 'mobile-dev',
    description: 'iOS, Android, React Native, Flutter development.',
    memberCount: 11200,
    isPrivate: false,
    postCount: 723,
    trending: false
  }
];

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'trending'>('all');

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'trending') {
      return matchesSearch && community.trending;
    }
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Communities</h1>
          <p className="text-gray-300">
            Discover and join communities that match your interests
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-amethyst-600 hover:from-emerald-600 hover:to-amethyst-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 glass-morphism border-white/10 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'glass' : 'ghost'}
            onClick={() => setFilter('all')}
            className="text-white"
          >
            All
          </Button>
          <Button
            variant={filter === 'trending' ? 'glass' : 'ghost'}
            onClick={() => setFilter('trending')}
            className="text-white"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={filter === 'joined' ? 'glass' : 'ghost'}
            onClick={() => setFilter('joined')}
            className="text-white"
          >
            <Users className="mr-2 h-4 w-4" />
            Joined
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <Card key={community.id} className="glass-morphism border-white/10 hover:border-white/20 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amethyst-600 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>r/{community.slug}</span>
                      {community.isPrivate ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Globe className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
                {community.trending && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 mb-4">
                {community.description}
              </CardDescription>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {community.memberCount.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {community.postCount}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full glass-morphism border-white/20 text-white hover:bg-white/10"
                variant="outline"
              >
                {community.isPrivate ? 'Request to Join' : 'Join Community'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No communities found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
