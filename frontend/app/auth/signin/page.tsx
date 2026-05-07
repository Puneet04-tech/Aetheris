'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import { SignInButton } from '../sign-in-button';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams?.get('message');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-morphism border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Welcome to Aetheris</CardTitle>
          <CardDescription className="text-gray-300">
            The unified professional ecosystem where talent meets opportunity
          </CardDescription>
          {message && (
            <div className="text-green-400 text-sm mt-2">
              {message}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-glass text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-glass text-white placeholder-gray-400"
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full glass-morphism text-white hover:bg-white/20 transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-gray-400 text-sm mb-2">Or continue with</div>
            <SignInButton />
          </div>

          <div className="text-center">
            <div className="text-gray-400 text-sm">
              Don't have an account?
            </div>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full mt-2 glass-morphism text-white hover:bg-white/20 transition-all duration-300">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
