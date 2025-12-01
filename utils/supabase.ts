/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for authentication and database operations
 */

// Using direct HTTP calls instead of @supabase/supabase-js to avoid additional dependencies
// This approach works well for authentication and basic API calls

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Auth features will be unavailable.');
}

/**
 * Supabase Authentication API
 * Provides methods for user authentication without external dependencies
 */
export const supabaseAuth = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResponse> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          user_metadata: metadata || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthSession> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || error.message || 'Sign in failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase signin error:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(accessToken: string): Promise<void> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { ok: true };
    }

    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
  },

  /**
   * Get current user session
   */
  async getSession(accessToken: string): Promise<AuthUser | null> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase get session error:', error);
      return null;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthSession> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase refresh token error:', error);
      throw error;
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ ok: boolean }> {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      return { ok: true };
    } catch (error) {
      console.error('Supabase reset password error:', error);
      throw error;
    }
  },
};

/**
 * Supabase Database API
 * Provides methods for basic CRUD operations
 */
export const supabaseDb = {
  /**
   * Fetch data from a table
   */
  async select(table: string, accessToken: string, query = '*', filters?: string) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      let url = `${SUPABASE_URL}/rest/v1/${table}?select=${query}`;
      if (filters) url += `&${filters}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase select error:', error);
      throw error;
    }
  },

  /**
   * Insert data into a table
   */
  async insert(table: string, data: any, accessToken: string) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to insert into ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
  },

  /**
   * Update data in a table
   */
  async update(table: string, data: any, id: string, accessToken: string) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${table}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
  },

  /**
   * Delete data from a table
   */
  async delete(table: string, id: string, accessToken: string) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase not configured');
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete from ${table}`);
      }

      return { ok: true };
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  },
};

export default supabaseAuth;
