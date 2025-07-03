import { createClient } from '@supabase/supabase-js'

// For demo purposes, using mock Supabase client
// In production, replace with actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Mock Supabase client for development
class MockSupabaseClient {
  auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email && password) {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          user_metadata: { name: email.split('@')[0] }
        }
        return { data: { user, session: { user } }, error: null }
      }
      return { data: { user: null, session: null }, error: new Error('Invalid credentials') }
    },
    signInWithOAuth: async ({ provider }: { provider: string }) => {
      if (provider === 'google') {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: 'user@gmail.com',
          user_metadata: { 
            name: 'Google User',
            avatar_url: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
          }
        }
        return { data: { user, session: { user } }, error: null }
      }
      return { data: { user: null, session: null }, error: new Error('Provider not supported') }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      if (email && password) {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          user_metadata: { name: email.split('@')[0] }
        }
        return { data: { user, session: { user } }, error: null }
      }
      return { data: { user: null, session: null }, error: new Error('Invalid data') }
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: Function) => {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }

  from = (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    subscribe: () => ({ on: () => ({ subscribe: () => {} }) })
  })

  channel = (name: string) => ({
    on: () => this,
    subscribe: () => this,
    send: () => this,
    unsubscribe: () => this
  })
}

export const supabase = new MockSupabaseClient()