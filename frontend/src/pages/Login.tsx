import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <Sparkles className="h-6.5 w-6.5 text-zinc-900" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight text-zinc-50">
            Welcome Back
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your wealth with Aura Wealth Coach
          </p>
        </div>

        <Card className="shadow-2xl border-zinc-800 bg-zinc-900/40">
          <Card.Header>
            <Card.Title>Sign In</Card.Title>
            <Card.Description className="text-zinc-400">
              Enter your email and password to access your account
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 text-center text-xs">
              <span className="text-zinc-400">
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-bold text-zinc-50 hover:underline"
              >
                Register here
              </button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};
