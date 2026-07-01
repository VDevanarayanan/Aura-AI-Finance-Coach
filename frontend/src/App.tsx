import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { SavingsGoals } from './pages/SavingsGoals';
import { AICoach } from './pages/AICoach';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Fullscreen boot loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 space-y-4">
        <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-md animate-pulse">
          <Sparkles className="h-6.5 w-6.5 text-zinc-900" />
        </div>
        <p className="text-sm text-zinc-400 font-bold tracking-wide animate-pulse">
          Loading Aura Wealth Workspace...
        </p>
      </div>
    );
  }

  // Not Authenticated: Render Login or Register Page
  if (!isAuthenticated) {
    if (authTab === 'register') {
      return <Register onNavigateToLogin={() => setAuthTab('login')} />;
    }
    return <Login onNavigateToRegister={() => setAuthTab('register')} />;
  }

  // Authenticated: Wrap page inside Layout Sidebar
  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'budgets':
        return <Budgets />;
      case 'goals':
        return <SavingsGoals />;
      case 'coach':
        return <AICoach />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTab()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
