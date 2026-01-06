import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2 } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow animate-pulse-subtle">
          <Building2 className="h-8 w-8 text-accent-foreground" />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="text-muted-foreground">Loading SmartHostel...</p>
      </div>
    </div>
  );
};

export default Index;
