import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  Sparkles,
  FileText,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'coach', label: 'AI Coach', icon: Sparkles, badge: 'AI' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/60 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-zinc-50 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-zinc-900" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            Aura Finance
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[69px] z-30 bg-zinc-950 flex flex-col p-6 animate-in slide-in-from-top-10 duration-200">
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 active-scale ${
                    isActive
                      ? 'bg-zinc-50 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${isActive ? 'bg-zinc-200 text-zinc-950' : 'bg-purple-900/40 text-purple-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-4 mt-auto border-t border-zinc-900 text-red-400 hover:text-red-300 font-semibold"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900/45 backdrop-blur-lg border-r border-zinc-800/60 p-6 sticky top-0 h-screen z-20">
        <div className="flex items-center space-x-2.5 mb-8">
          <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="h-5.5 w-5.5 text-zinc-900" />
          </div>
          <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
            Aura Finance
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active-scale ${
                  isActive
                    ? 'bg-zinc-50 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${isActive ? 'bg-zinc-200 text-zinc-950' : 'bg-purple-900/40 text-purple-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800/60">
          <div className="flex items-center space-x-3 mb-4.5">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 border border-zinc-700/50">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-x-hidden bg-zinc-950">
        {children}
      </main>
    </div>
  );
};
