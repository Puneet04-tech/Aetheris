'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Briefcase, DollarSign, MapPin, Clock, Plus, Filter } from 'lucide-react';
import { opportunitiesAPI } from '../../../lib/api';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'full-time' | 'part-time' | 'freelance' | 'contract';
  salary: string;
  location: string;
  remote: boolean;
  skills: string[];
  description: string;
  posted: string;
  applications: number;
}

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time' as const,
    remote: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>([
    {
      id: '1',
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp',
      type: 'full-time',
      salary: '$150K - $200K',
      location: 'San Francisco, CA',
      remote: true,
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      description: 'Build scalable web applications using modern technologies.',
      posted: '2 days ago',
      applications: 45,
    },
    {
      id: '2',
      title: 'UX/UI Designer',
      company: 'DesignHub',
      type: 'full-time',
      salary: '$120K - $160K',
      location: 'New York, NY',
      remote: true,
      skills: ['Figma', 'Design Systems', 'Prototyping'],
      description: 'Create beautiful and intuitive user experiences for our platform.',
      posted: '1 day ago',
      applications: 45,
    }
  ]);

  const handleApply = (id: string) => {
    const newApplications = new Set(applications);
    if (newApplications.has(id)) {
      newApplications.delete(id);
    } else {
      newApplications.add(id);
    }
    setApplications(newApplications);
  };

  const handleSave = (id: string) => {
    const newSaved = new Set(saved);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSaved(newSaved);
  };

  const handleCreateOpportunity = async () => {
    if (!createFormData.title.trim() || !createFormData.company.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await opportunitiesAPI.create(createFormData);
      if (response.success || response.id) {
        // Add new opportunity to the list
        const newOpportunity = {
          id: response.id,
          title: response.title,
          company: response.company,
          type: response.type,
          salary: 'Competitive',
          location: response.location,
          remote: response.remote,
          skills: [],
          description: response.description,
          posted: 'Just now',
          applications: 0
        };
        setOpportunitiesList([newOpportunity, ...opportunitiesList]);
        
        // Reset form and close modal
        setCreateFormData({
          title: '',
          description: '',
          company: '',
          location: '',
          type: 'full-time',
          remote: false
        });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Opportunities', count: opportunitiesList.length },
    { id: 'full-time', label: 'Full-time', count: opportunitiesList.filter(o => o.type === 'full-time').length },
    { id: 'freelance', label: 'Freelance', count: opportunitiesList.filter(o => o.type === 'freelance').length },
    { id: 'remote', label: 'Remote', count: opportunitiesList.filter(o => o.remote).length },
    { id: 'part-time', label: 'Part-time', count: opportunitiesList.filter(o => o.type === 'part-time').length },
  ];

  const filteredOpportunities = opportunitiesList.filter(opp => {
    const matchesFilter = filter === 'all' || 
                         opp.type === filter || 
                         (filter === 'remote' && opp.remote);
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-lg p-6 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Opportunities Marketplace</h1>
            <p className="text-gray-300">Full-time jobs, freelance work, and startup leads all in one place</p>
          </div>
          <Button 
            className="btn-emerald px-6"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Post Opportunity
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search opportunities, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-glass text-white placeholder-gray-400"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <Button
            key={f.id}
            onClick={() => setFilter(f.id)}
            variant={filter === f.id ? 'default' : 'outline'}
            className={filter === f.id ? 'btn-emerald' : 'text-white hover:bg-white/10'}
          >
            {f.label} <span className="ml-2 text-xs">({f.count})</span>
          </Button>
        ))}
      </div>

      {/* Opportunities Grid */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => (
          <Card
            key={opp.id}
            variant="amethyst"
            className="glass-morphism hover:border-white/30 transition-all cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="h-5 w-5 text-amethyst-400" />
                    <h3 className="text-xl font-bold text-white">{opp.title}</h3>
                  </div>
                  <p className="text-gray-300 font-medium mb-2">{opp.company}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={
                      opp.type === 'full-time' ? 'emerald' :
                      opp.type === 'freelance' ? 'golden' :
                      opp.type === 'part-time' ? 'amethyst' : 'default'
                    }>
                      {opp.type.replace('-', ' ')}
                    </Badge>
                    {opp.remote && <Badge variant="outline">Remote</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-golden-400 mb-2">{opp.salary}</div>
                  <p className="text-xs text-gray-400">{opp.applications} applications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 mb-4">{opp.description}</p>

              {/* Skills & Info */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Location</p>
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="h-4 w-4 text-amethyst-400" />
                    <span className="text-sm">{opp.location}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Posted</p>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4 text-amethyst-400" />
                    <span className="text-sm">{opp.posted}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Salary</p>
                  <div className="flex items-center gap-2 text-white">
                    <DollarSign className="h-4 w-4 text-amethyst-400" />
                    <span className="text-sm">Competitive</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleApply(opp.id)}
                  className={`flex-1 ${applications.has(opp.id) ? 'btn-emerald' : 'btn-amethyst'}`}
                >
                  {applications.has(opp.id) ? '✓ Applied' : 'Apply Now'}
                </Button>
                <Button 
                  onClick={() => handleSave(opp.id)}
                  variant="outline" 
                  className={`flex-1 ${saved.has(opp.id) ? 'text-golden-400 border-golden-400' : 'text-white hover:bg-white/10'}`}
                >
                  {saved.has(opp.id) ? '❤️ Saved' : '🤍 Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Post New Opportunity</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <Input
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  placeholder="Job title"
                  className="glass-morphism"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <Input
                  value={createFormData.company}
                  onChange={(e) => setCreateFormData({...createFormData, company: e.target.value})}
                  placeholder="Company name"
                  className="glass-morphism"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Job description"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <Input
                  value={createFormData.location}
                  onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                  placeholder="Location or 'Remote'"
                  className="glass-morphism"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData({...createFormData, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remote"
                  checked={createFormData.remote}
                  onChange={(e) => setCreateFormData({...createFormData, remote: e.target.checked})}
                  className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="remote" className="text-sm text-gray-300">Remote Position</label>
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
                onClick={handleCreateOpportunity}
                disabled={isCreating || !createFormData.title.trim() || !createFormData.company.trim()}
                className="btn-emerald"
              >
                {isCreating ? 'Posting...' : 'Post Opportunity'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
