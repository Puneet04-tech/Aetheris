'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Feed } from './components/feed';
import {
  Users,
  Code,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen mesh-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 leading-tight">
            <span className="brand-gradient">Nexus</span>
            <br />
            <span className="text-white">The Omni-Professional Ecosystem</span>
          </h1>
          <p className="text-xl text-white font-medium mb-8 max-w-2xl mx-auto">
            One unified platform combining LinkedIn, GitHub, Behance, Discord, and Reddit.
            Connect, showcase, collaborate, and grow—all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button className="btn-emerald px-8 py-3 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button className="btn-amethyst px-8 py-3 text-lg">
              Explore Platform
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Users,
              title: 'Multi-Hyphenate Profiles',
              description:
                'Show all sides of yourself. Dev, Designer, Founder—one profile, infinite possibilities.',
              color: 'emerald',
            },
            {
              icon: Code,
              title: 'Project Vaults',
              description:
                'Showcase code, portfolios, and case studies with embedded media and syntax highlighting.',
              color: 'amethyst',
            },
            {
              icon: MessageSquare,
              title: 'Real-Time Communities',
              description:
                'Join circles, participate in discussions, and engage with your professional community.',
              color: 'golden',
            },
            {
              icon: Briefcase,
              title: 'Smart Marketplace',
              description:
                'Discover jobs, freelance opportunities, and startup leads all in one place.',
              color: 'emerald',
            },
            {
              icon: TrendingUp,
              title: 'Reputation System',
              description: 'Build credibility through endorsements, expert verification, and community recognition.',
              color: 'amethyst',
            },
            {
              icon: Zap,
              title: 'CEO-Grade Performance',
              description: 'Sub-second page loads, real-time updates, and institutional-grade reliability.',
              color: 'golden',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} variant={feature.color as any}>
                <CardHeader>
                  <Icon className={`h-8 w-8 mb-3 text-${feature.color}-400`} />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-200">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Why Nexus?</h2>
            <ul className="space-y-4">
              {[
                'Zero Platform Fragmentation - One profile, everywhere',
                'Institutional-Grade Security with NextAuth',
                'Lightning-Fast Performance on Next.js 15',
                'Real-Time Collaboration Features',
                'Comprehensive Creator Monetization',
                'AI-Powered Recommendations',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card variant="emerald" glow>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Experience Premium Design</CardTitle>
              <CardDescription className="text-gray-200">Built with Executive Aurora™ design system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 rounded-lg border border-emerald-400/30">
                  <div className="text-emerald-400 font-mono text-sm mb-2">Glassmorphism</div>
                  <div className="text-gray-200 text-xs">Frosted glass effects with backdrop blur</div>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-amethyst-400/30">
                  <div className="text-amethyst-400 font-mono text-sm mb-2">Mesh Gradients</div>
                  <div className="text-gray-200 text-xs">Dynamic gradient backgrounds</div>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-golden-400/30">
                  <div className="text-golden-400 font-mono text-sm mb-2">Status Ribbons</div>
                  <div className="text-gray-200 text-xs">Professional achievement badges</div>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-emerald-400/30">
                  <div className="text-emerald-400 font-mono text-sm mb-2">Animations</div>
                  <div className="text-gray-200 text-xs">Framer Motion-powered interactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Built with Modern Tech</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 15', desc: 'App Router & Server Actions' },
              { name: 'PostgreSQL', desc: 'Neon Serverless Database' },
              { name: 'Drizzle ORM', desc: 'Type-Safe Database Layer' },
              { name: 'NextAuth.js', desc: 'Enterprise Authentication' },
              { name: 'Tailwind CSS', desc: 'Utility-First Styling' },
              { name: 'Framer Motion', desc: 'Smooth Animations' },
              { name: 'TypeScript', desc: '100% Type Safety' },
              { name: 'Radix UI', desc: 'Accessible Components' },
            ].map((tech, i) => (
              <div key={i} className="glass-morphism rounded-lg p-6 text-center hover:border-emerald-400/50 transition-all">
                <h3 className="font-semibold text-white mb-2">{tech.name}</h3>
                <p className="text-sm text-gray-200">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Join the Community</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { number: '10K+', label: 'Active Professionals' },
              { number: '50K+', label: 'Projects Showcased' },
              { number: '1M+', label: 'Daily Interactions' },
            ].map((stat, i) => (
              <Card key={i} variant="amethyst" glow>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-amethyst-400 mb-2">{stat.number}</div>
                  <p className="text-gray-200">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feed Preview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What's Happening</h2>
          <Feed />
        </div>

        {/* CTA Section */}
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Professional Presence?</h2>
          <p className="text-xl text-white font-medium mb-8">Join thousands of professionals building their reputation on Nexus</p>
          <Link href="/auth/signin">
            <Button className="btn-golden px-12 py-4 text-lg">
              Start for Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
