'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock,
  Building,
  Filter,
  Heart,
  ExternalLink
} from 'lucide-react';

const mockOpportunities = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA / Remote',
    type: 'full-time',
    salaryMin: 120000,
    salaryMax: 180000,
    equity: '0.1-0.5%',
    remote: true,
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    postedAt: new Date('2024-01-15'),
    featured: true
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'full-time',
    salaryMin: 100000,
    salaryMax: 150000,
    equity: '0.5-1.5%',
    remote: false,
    tags: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    postedAt: new Date('2024-01-14'),
    featured: true
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Remote',
    type: 'contract',
    salaryMin: 80,
    salaryMax: 120,
    equity: null,
    remote: true,
    tags: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems'],
    postedAt: new Date('2024-01-13'),
    featured: false
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'London, UK / Remote',
    type: 'full-time',
    salaryMin: 110000,
    salaryMax: 160000,
    equity: '0.2-0.8%',
    remote: true,
    tags: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'],
    postedAt: new Date('2024-01-12'),
    featured: false
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppStudio',
    location: 'Remote',
    type: 'part-time',
    salaryMin: 60,
    salaryMax: 90,
    equity: null,
    remote: true,
    tags: ['React Native', 'Flutter', 'iOS', 'Android'],
    postedAt: new Date('2024-01-11'),
    featured: false
  },
  {
    id: '6',
    title: 'Machine Learning Engineer',
    company: 'AILabs',
    location: 'Boston, MA',
    type: 'full-time',
    salaryMin: 140000,
    salaryMax: 200000,
    equity: '0.3-1.0%',
    remote: false,
    tags: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
    postedAt: new Date('2024-01-10'),
    featured: true
  }
];

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null);

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || opportunity.type === typeFilter;
    const matchesRemote = remoteFilter === null || opportunity.remote === remoteFilter;
    
    return matchesSearch && matchesType && matchesRemote;
  });

  const formatSalary = (min: number, max: number, type: string) => {
    if (type === 'contract' || type === 'part-time') {
      return `$${min}-${max}/hr`;
    }
    return `$${(min / 1000).toFixed(0)}-${(max / 1000).toFixed(0)}k`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return `${Math.floor(diffInHours / 168)}w ago`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Opportunities</h1>
          <p className="text-gray-300">
            Discover your next career opportunity or freelance project
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-amethyst-600 hover:from-emerald-600 hover:to-amethyst-700">
          <Briefcase className="mr-2 h-4 w-4" />
          Post Opportunity
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search opportunities, companies, or skills..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10 glass-morphism border-white/10 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg glass-morphism border-white/10 text-white bg-transparent"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
          <Button
            variant={remoteFilter === true ? 'glass' : 'ghost'}
            onClick={() => setRemoteFilter(remoteFilter === true ? null : true)}
            className="text-white"
          >
            Remote
          </Button>
          <Button variant="ghost" className="text-white">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="glass-morphism border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-white text-xl">
                      {opportunity.title}
                    </CardTitle>
                    {opportunity.featured && (
                      <Badge className="bg-amethyst-500/20 text-amethyst-400 border-amethyst-500/30">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{opportunity.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(opportunity.postedAt)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      {formatSalary(opportunity.salaryMin, opportunity.salaryMax, opportunity.type)}
                    </span>
                    {opportunity.equity && (
                      <span className="text-amethyst-400">
                        + {opportunity.equity} equity
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-white border-white/20">
                      {opportunity.type.replace('-', ' ')}
                    </Badge>
                    {opportunity.remote && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Remote
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" className="text-white">
                    View Details
                  </Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-amethyst-600 hover:from-emerald-600 hover:to-amethyst-700">
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {opportunity.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-16">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No opportunities found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
