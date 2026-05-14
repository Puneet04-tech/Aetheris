'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Link from 'next/link';

export default function SignInContent() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        setError('Invalid email or password');
        return;
      }

      const userData = await response.json();
      if (userData.success) {
        localStorage.setItem('user', JSON.stringify(userData.user));
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Invalid email or password');
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
                autoComplete="email"
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
                autoComplete="current-password"
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
            <div className="text-gray-400 text-sm">Social login coming soon</div>
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
