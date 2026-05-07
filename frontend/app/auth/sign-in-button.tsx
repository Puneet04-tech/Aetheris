'use client';

import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';

export function SignInButton() {
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => {
          // Redirect to backend authentication
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin/google`;
        }}
        className="glass-morphism text-white hover:bg-white/20 transition-all duration-300"
      >
        <Globe className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        onClick={() => {
          // Redirect to backend authentication
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin/github`;
        }}
        className="glass-morphism text-white hover:bg-white/20 transition-all duration-300"
      >
        <span className="mr-2">📦</span>
        Continue with GitHub
      </Button>
    </div>
  );
}
