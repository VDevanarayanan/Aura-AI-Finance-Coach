import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const { registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
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
            Create Account
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Start tracking and budgeting with AI insights
          </p>
        </div>

        <Card className="shadow-2xl border-zinc-800 bg-zinc-900/40">
          <Card.Header>
            <Card.Title>Sign Up</Card.Title>
            <Card.Description className="text-zinc-400">
              Provide details below to set up your personal finance workspace
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
                label="Full Name"
                type="text"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                id="password"
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                isLoading={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-5 text-center text-xs">
              <span className="text-zinc-400">
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-bold text-zinc-50 hover:underline"
              >
                Sign In
              </button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};
