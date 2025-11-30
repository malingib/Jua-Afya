import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { supabaseAuth } from '../utils/supabase';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Auth Context for global access to authentication state
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Custom hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to child components
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedSession = localStorage.getItem('auth_session');
        
        if (storedSession) {
          const session = JSON.parse(storedSession);
          setAccessToken(session.accessToken);
          setRefreshToken(session.refreshToken);
          
          // Try to fetch user from Supabase
          if (session.accessToken) {
            try {
              const userData = await supabaseAuth.getSession(session.accessToken);
              if (userData) {
                setUser({
                  id: userData.id,
                  email: userData.email,
                  name: userData.user_metadata?.name,
                  avatar: userData.user_metadata?.avatar,
                  role: userData.user_metadata?.role,
                });
              }
            } catch (err) {
              console.error('Failed to fetch user session:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await supabaseAuth.signUp(email, password, metadata);
      
      if (response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: metadata?.name,
          avatar: metadata?.avatar,
          role: metadata?.role,
        });
        
        // Store session
        if (response.session?.access_token) {
          setAccessToken(response.session.access_token);
          setRefreshToken(response.session.refresh_token);
          localStorage.setItem('auth_session', JSON.stringify({
            accessToken: response.session.access_token,
            refreshToken: response.session.refresh_token,
          }));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await supabaseAuth.signIn(email, password);
      
      if (response.access_token) {
        setAccessToken(response.access_token);
        setRefreshToken(response.refresh_token);
        
        // Fetch user data
        const userData = await supabaseAuth.getSession(response.access_token);
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.user_metadata?.name,
            avatar: userData.user_metadata?.avatar,
            role: userData.user_metadata?.role,
          });
        }
        
        // Store session
        localStorage.setItem('auth_session', JSON.stringify({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      if (accessToken) {
        await supabaseAuth.signOut(accessToken);
      }
      
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('auth_session');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;
    
    try {
      const response = await supabaseAuth.refreshToken(refreshToken);
      
      if (response.access_token) {
        setAccessToken(response.access_token);
        setRefreshToken(response.refresh_token);
        localStorage.setItem('auth_session', JSON.stringify({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      // Clear session on refresh failure
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('auth_session');
    }
  }, [refreshToken]);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    
    try {
      await supabaseAuth.resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    accessToken,
    refreshToken,
    signUp,
    signIn,
    signOut,
    refreshAccessToken,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
