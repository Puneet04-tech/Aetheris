'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="glass-morphism border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-amethyst-600 rounded-lg" />
            <span className="text-xl font-bold text-white">Aetheris</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>
            <Link href="/feed" className="text-gray-300 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Feed
            </Link>
            <Link href="/communities" className="text-gray-300 hover:text-white transition-colors">
              <Users className="w-4 h-4 inline mr-2" />
              Communities
            </Link>
            <Link href="/opportunities" className="text-gray-300 hover:text-white transition-colors">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Opportunities
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button variant="glass" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-morphism border-white/10" align="end">
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      className="text-white hover:bg-white/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button variant="glass">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
