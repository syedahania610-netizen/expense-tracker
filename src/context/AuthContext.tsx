import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseDb } from '../services/supabaseDb';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  currency?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  idToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: (email?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('app_passport_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [idToken, setIdToken] = useState<string | null>(() => {
    return localStorage.getItem('app_passport_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Check URL query parameters for OAuth callback tokens or errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackToken = urlParams.get('auth_token');
    
    if (callbackToken) {
      setIdToken(callbackToken);
      localStorage.setItem('app_passport_token', callbackToken);

      // Clean URL query
      window.history.replaceState({}, document.title, window.location.pathname);

      // Fetch user profile
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${callbackToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            const u: UserProfile = {
              uid: data.user.uid,
              email: data.user.email,
              displayName: data.user.displayName,
              photoURL: data.user.photoURL,
              currency: data.user.currency,
            };
            setUser(u);
            localStorage.setItem('app_passport_user', JSON.stringify(u));
            supabaseDb.syncUser(u).catch(console.warn);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Validate existing token
      if (idToken) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        })
          .then((res) => {
            if (!res.ok) {
              // Token expired or invalid
              setUser(null);
              setIdToken(null);
              localStorage.removeItem('app_passport_token');
              localStorage.removeItem('app_passport_user');
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    return idToken;
  }, [idToken]);

  // Google Sign In via Google Identity Services or Passport OAuth
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // 1. Try to open Google Identity Services popup / redirect
      const googleClientId = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) || '';

      if ((window as any).google?.accounts?.id && googleClientId) {
        // Initialize Google One Tap / prompt
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              const res = await fetch('/api/auth/google/verify-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              });
              if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setIdToken(data.token);
                localStorage.setItem('app_passport_token', data.token);
                localStorage.setItem('app_passport_user', JSON.stringify(data.user));
                supabaseDb.syncUser(data.user).catch(console.warn);
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        // Fallback: Use standard Passport Google OAuth endpoint
        window.location.href = '/api/auth/google';
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      // Fallback to seamless testing login
      await signInWithDemo();
    } finally {
      setLoading(false);
    }
  };

  // Demo Sign-In (frictionless access without needing pre-configured GCP OAuth client ID)
  const signInWithDemo = async (email = 'syedahania610@gmail.com', name = 'Syeda Hania') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName: name }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIdToken(data.token);
        localStorage.setItem('app_passport_token', data.token);
        localStorage.setItem('app_passport_user', JSON.stringify(data.user));
        supabaseDb.syncUser(data.user).catch(console.warn);
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setIdToken(null);
    localStorage.removeItem('app_passport_token');
    localStorage.removeItem('app_passport_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        loading,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
