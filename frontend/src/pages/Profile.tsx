import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Mail, Calendar, ShieldCheck, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { transactions, budgets, savingsGoals } = useFinance();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
          User Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1.5">
          Manage your personal account profile details and overview stats.
        </p>
      </div>

      {/* Profile Details Card */}
      <Card>
        <Card.Header>
          <Card.Title className="text-lg">Account Profile</Card.Title>
          <Card.Description className="text-zinc-400">Your registered account details</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-zinc-50 text-zinc-900 flex items-center justify-center text-2xl font-bold shadow-sm border border-zinc-800">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-50">
                {user?.name}
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                Personal Account
              </p>
            </div>
          </div>

          <hr className="border-zinc-800" />

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
              <span className="font-semibold text-zinc-400 w-24">
                Full Name
              </span>
              <span className="font-bold text-zinc-200">
                {user?.name}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
              <span className="font-semibold text-zinc-400 w-24">
                Email Address
              </span>
              <span className="font-bold text-zinc-200">
                {user?.email}
              </span>
            </div>

            {/* Member Since */}
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
              <span className="font-semibold text-zinc-400 w-24">
                Member Since
              </span>
              <span className="font-bold text-zinc-200">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      dayNum: 'numeric',
                    } as any)
                  : 'N/A'}
              </span>
            </div>

            {/* Security */}
            <div className="flex items-center space-x-3 text-sm">
              <ShieldCheck className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
              <span className="font-semibold text-zinc-400 w-24">
                Auth Method
              </span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                Secure Account Tokens
              </span>
            </div>
          </div>

          <hr className="border-zinc-800" />

          <Button
            variant="outline"
            onClick={logout}
            className="w-full text-red-400 hover:bg-red-950/20 hover:text-red-300 border-zinc-800 font-bold flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout from Account</span>
          </Button>
        </Card.Content>
      </Card>

      {/* Database Statistics Card */}
      <Card>
        <Card.Header>
          <Card.Title className="text-lg">Workspace Stats</Card.Title>
          <Card.Description className="text-zinc-400">Overview of records stored in database</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-950/45 p-4.5 rounded-2xl border border-zinc-850">
              <span className="text-xl font-black text-zinc-50 block">
                {transactions.length}
              </span>
              <span className="text-3xs uppercase tracking-wider font-bold text-zinc-500 mt-1 block">
                Transactions
              </span>
            </div>
            <div className="bg-zinc-950/45 p-4.5 rounded-2xl border border-zinc-850">
              <span className="text-xl font-black text-zinc-50 block">
                {budgets.length}
              </span>
              <span className="text-3xs uppercase tracking-wider font-bold text-zinc-500 mt-1 block">
                Budgets
              </span>
            </div>
            <div className="bg-zinc-950/45 p-4.5 rounded-2xl border border-zinc-850">
              <span className="text-xl font-black text-zinc-50 block">
                {savingsGoals.length}
              </span>
              <span className="text-3xs uppercase tracking-wider font-bold text-zinc-500 mt-1 block">
                Savings Goals
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};
