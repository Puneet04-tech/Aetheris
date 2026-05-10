'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/signin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth/signin');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'Feed', path: '/dashboard/feed', icon: '📰' },
    { name: 'Communities', path: '/dashboard/communities', icon: '👥' },
    { name: 'Opportunities', path: '/dashboard/opportunities', icon: '💼' },
    { name: 'Q&A', path: '/dashboard/qa', icon: '❓' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all">
                N
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-amber-400 bg-clip-text text-transparent hidden sm:inline">
                Nexus
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amethyst-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-all flex items-center gap-2 border border-red-500/30"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-300 hover:text-emerald-400 p-2"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-white/10 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span>{item.icon}</span> {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to account for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
