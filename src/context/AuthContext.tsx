'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define a simplified User type
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      // For now, create a mock user
      const mockUser: User = {
        uid: 'user-' + Math.random().toString(36).substring(2, 9),
        displayName: 'Guest User',
        email: 'guest@example.com',
        photoURL: null,
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast({ title: 'Successfully signed in as guest!', duration: 3000 });
    } catch (error) {
      console.error('Error signing in: ', error);
      toast({
        title: 'Sign-in Error',
        description: 'Failed to sign in. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('user');
      toast({ title: 'Successfully signed out!', duration: 3000 });
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({
        title: 'Sign-out Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
