// Mock Supabase client for development
interface MockUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

interface MockAuthResponse {
  data: {
    user: MockUser | null;
    session: MockSession | null;
  };
  error: Error | null;
}

class MockSupabaseAuth {
  private currentUser: MockUser | null = null;
  private currentSession: MockSession | null = null;
  private listeners: ((event: string, session: MockSession | null) => void)[] = [];

  async getSession(): Promise<{ data: { session: MockSession | null } }> {
    return { data: { session: this.currentSession } };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<MockAuthResponse> {
    // Mock authentication - accept any email/password
    if (email && password) {
      const user: MockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: email.split('@')[0]
      };
      
      const session: MockSession = {
        user,
        access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9)
      };

      this.currentUser = user;
      this.currentSession = session;

      // Notify listeners
      this.listeners.forEach(listener => listener('SIGNED_IN', session));

      return {
        data: { user, session },
        error: null
      };
    }

    return {
      data: { user: null, session: null },
      error: new Error('Invalid credentials')
    };
  }

  async signInWithOAuth({ provider }: { provider: string }): Promise<MockAuthResponse> {
    // Mock Google OAuth sign-in
    if (provider === 'google') {
      const mockGoogleUser: MockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar_url: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
      };
      
      const session: MockSession = {
        user: mockGoogleUser,
        access_token: 'mock-google-token-' + Math.random().toString(36).substr(2, 9)
      };

      this.currentUser = mockGoogleUser;
      this.currentSession = session;

      // Notify listeners
      this.listeners.forEach(listener => listener('SIGNED_IN', session));

      return {
        data: { user: mockGoogleUser, session },
        error: null
      };
    }

    return {
      data: { user: null, session: null },
      error: new Error('Provider not supported')
    };
  }

  async signUp({ email, password }: { email: string; password: string }): Promise<MockAuthResponse> {
    // Mock sign up - same as sign in for demo
    return this.signInWithPassword({ email, password });
  }

  async signOut(): Promise<{ error: Error | null }> {
    this.currentUser = null;
    this.currentSession = null;

    // Notify listeners
    this.listeners.forEach(listener => listener('SIGNED_OUT', null));

    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    this.listeners.push(callback);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
}

class MockSupabaseClient {
  auth: MockSupabaseAuth;

  constructor() {
    this.auth = new MockSupabaseAuth();
  }
}

// Export mock client
export const supabase = new MockSupabaseClient();