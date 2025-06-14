'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { generateSecureId, getSecureLocalStorageItem } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

// Define a simplified AuthUser type to avoid conflict with the global User type
interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    // Type guard for AuthUser object
    const isValidAuthUser = (value: unknown): value is AuthUser => {
      return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as AuthUser).uid === 'string' &&
        ((value as AuthUser).displayName === null ||
          typeof (value as AuthUser).displayName === 'string') &&
        ((value as AuthUser).email === null || typeof (value as AuthUser).email === 'string') &&
        ((value as AuthUser).photoURL === null || typeof (value as AuthUser).photoURL === 'string')
      );
    };

    const savedUser = getSecureLocalStorageItem('user', isValidAuthUser);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      // For now, create a mock user with secure ID generation
      const mockUser: AuthUser = {
        uid: generateSecureId(16, 'user'),
        displayName: 'Guest User',
        email: 'guest@example.com',
        photoURL: null,
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast({ title: 'Successfully signed in as guest!', duration: 3000 });
    } catch {
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
    } catch {
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
