'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Globe } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/signin?message=Registration successful');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-background">
      <Card className="glass-morphism w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-300">
            Join Aetheris and start your professional journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-glass text-white placeholder-gray-400"
              />
            </div>
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
            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="text-center space-y-2">
            <div className="text-gray-400 text-sm">
              Already have an account?
            </div>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full glass-morphism text-white hover:bg-white/20 transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
