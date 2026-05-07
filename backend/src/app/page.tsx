import { NextResponse } from 'next/server';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        Aetheris Backend API
      </h1>
      <p className="text-gray-300 mb-8">
        Welcome to the Aetheris Backend API Server
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">API Endpoints</h2>
          <ul className="space-y-2 text-gray-300">
            <li><code className="text-emerald-400">GET /api/health</code> - Health check</li>
            <li><code className="text-emerald-400">GET /api/posts</code> - Get posts</li>
            <li><code className="text-emerald-400">POST /api/posts</code> - Create post</li>
            <li><code className="text-emerald-400">GET /api/communities</code> - Get communities</li>
            <li><code className="text-emerald-400">POST /api/communities</code> - Create community</li>
            <li><code className="text-emerald-400">GET /api/opportunities</code> - Get opportunities</li>
            <li><code className="text-emerald-400">POST /api/opportunities</code> - Create opportunity</li>
          </ul>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Database Status</h2>
          <div className="space-y-2">
            <p className="text-gray-300">
              <span className="text-emerald-400">●</span> PostgreSQL Connected
            </p>
            <p className="text-gray-300">
              <span className="text-emerald-400">●</span> Drizzle ORM Ready
            </p>
            <p className="text-gray-300">
              <span className="text-emerald-400">●</span> NextAuth Configured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
