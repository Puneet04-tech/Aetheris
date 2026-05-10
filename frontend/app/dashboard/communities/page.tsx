'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Users, MessageSquare, TrendingUp, Plus, Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { useState } from 'react';
import { communitiesAPI } from '../../../lib/api';

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  tags: string[];
  icon: string;
  joined: boolean;
}

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    icon: '🚀',
    isPrivate: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Web3 Builders',
      description: 'A community of blockchain developers and entrepreneurs building the future of web3.',
      members: 5234,
      posts: 12450,
      tags: ['Web3', 'Blockchain', 'Development'],
      icon: '⛓️',
      joined: true,
    },
    {
      id: '2',
      name: 'AI Enthusiasts',
      description: 'Discussing latest trends in artificial intelligence, machine learning, and deep learning.',
      members: 8932,
      posts: 24100,
      tags: ['AI', 'ML', 'Deep Learning'],
      icon: '🤖',
      joined: false,
    },
    {
      id: '3',
      name: 'Design Systems',
      description: 'Collaboration space for design system engineers and product designers.',
      members: 3421,
      posts: 8760,
      tags: ['Design', 'Systems', 'UI/UX'],
      icon: '🎨',
      joined: true,
    },
    {
      id: '4',
      name: 'Startup Founders',
      description: 'Exchange ideas, funding strategies, and growth hacks with other founders.',
      members: 6754,
      posts: 15234,
      tags: ['Startup', 'Funding', 'Growth'],
      icon: '🚀',
      joined: false,
    },
    {
      id: '5',
      name: 'Remote Workers',
      description: 'Tips, resources, and community for professionals working remotely worldwide.',
      members: 12450,
      posts: 34567,
      tags: ['Remote', 'Work', 'Lifestyle'],
      icon: '🌍',
      joined: true,
    },
    {
      id: '6',
      name: 'Full Stack Dev',
      description: 'End-to-end development discussions from frontend to backend and DevOps.',
      members: 9876,
      posts: 28900,
      tags: ['Development', 'FullStack', 'DevOps'],
      icon: '💻',
      joined: false,
    },
  ]);

  const handleJoinCommunity = (id: string) => {
    setCommunities(communities.map(c => 
      c.id === id ? { ...c, joined: !c.joined } : c
    ));
  };

  const handleCreateCommunity = async () => {
    if (!createFormData.name.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await communitiesAPI.create(createFormData);
      if (response.success || response.id) {
        // Add new community to the list
        const newCommunity = {
          id: response.id,
          name: response.name,
          description: response.description,
          members: 1,
          posts: 0,
          tags: [],
          icon: response.icon,
          joined: true
        };
        setCommunities([newCommunity, ...communities]);
        
        // Reset form and close modal
        setCreateFormData({
          name: '',
          description: '',
          icon: '🚀',
          isPrivate: false
        });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating community:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const joinedCount = communities.filter(c => c.joined).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-lg p-6 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Communities & Circles</h1>
            <p className="text-gray-300">Join communities aligned with your interests and expertise</p>
          </div>
          <Button 
            className="btn-emerald px-6"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Circle
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-glass text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="emerald">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Communities Joined</p>
                <p className="text-3xl font-bold text-white">{joinedCount}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card variant="amethyst">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Total Members (Joined)</p>
                <p className="text-3xl font-bold text-white">
                  {(communities.filter(c => c.joined).reduce((sum, c) => sum + c.members, 0) / 1000).toFixed(1)}K
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amethyst-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card variant="golden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Active Discussions</p>
                <p className="text-3xl font-bold text-white">
                  {communities.filter(c => c.joined).length * 3}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-golden-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <Card
            key={community.id}
            variant={community.joined ? 'emerald' : 'amethyst'}
            className="glass-morphism cursor-pointer hover:border-white/30 transition-all"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{community.icon}</div>
                {community.joined && (
                  <Badge variant="emerald">Joined</Badge>
                )}
              </div>
              <CardTitle className="text-white">{community.name}</CardTitle>
              <CardDescription className="text-gray-200">{community.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-black/20 rounded">
                  <p className="text-xs text-gray-400">Members</p>
                  <p className="text-lg font-bold text-white">{(community.members / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <p className="text-xs text-gray-400">Posts</p>
                  <p className="text-lg font-bold text-white">{(community.posts / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Join/Leave Button */}
              <Button
                onClick={() => handleJoinCommunity(community.id)}
                className={`w-full ${
                  community.joined
                    ? 'btn-amethyst'
                    : 'btn-emerald'
                }`}
              >
                {community.joined ? 'Leave' : 'Join Community'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Circle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <Input
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                  placeholder="Enter community name"
                  className="glass-morphism"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Describe your community"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <Input
                  value={createFormData.icon}
                  onChange={(e) => setCreateFormData({...createFormData, icon: e.target.value})}
                  placeholder="🚀"
                  className="glass-morphism"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={createFormData.isPrivate}
                  onChange={(e) => setCreateFormData({...createFormData, isPrivate: e.target.checked})}
                  className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="private" className="text-sm text-gray-300">Private Circle</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={isCreating || !createFormData.name.trim()}
                className="btn-emerald"
              >
                {isCreating ? 'Creating...' : 'Create Circle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
