'use client';

import Link from 'next/link';
import { Loader2, LogIn, LogOut, UserCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <header className="py-4 px-6 border-b flex justify-between items-center bg-background shadow-sm sticky top-0 z-50">
      <Link
        href="/"
        className="text-2xl font-headline font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        TheoremGuess
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {loading ? (
          <Button variant="ghost" size="sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : user ? (
          <div className="flex items-center gap-3">
            <UserCircle className="text-foreground h-6 w-6" />
            <span
              className="text-sm text-foreground hidden sm:inline"
              title={user.email || undefined}
            >
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut size={16} className="mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sr-only sm:hidden">Logout</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={signInWithGoogle}
          >
            <LogIn size={16} className="mr-2" /> Login with Google
          </Button>
        )}
      </div>
    </header>
  );
}
