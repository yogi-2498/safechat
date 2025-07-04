import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Enhanced mock Supabase client with real-time room validation
class MockSupabaseClient {
  private rooms = new Map<string, { id: string; users: string[]; created_at: string; expires_at: string }>()
  private messages = new Map<string, any[]>()

  constructor() {
    // Initialize with some demo rooms
    const demoRooms = ['ABC123', 'TEST01', 'DEMO99', 'SECURE', 'CHAT01', 'LOVE01', 'HEART2', 'KISS99']
    demoRooms.forEach(code => {
      this.rooms.set(code, {
        id: code,
        users: [],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      this.messages.set(code, [])
    })
  }

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

  // Enhanced room validation
  validateRoom = async (roomCode: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { exists: false, canJoin: false, userCount: 0 }
    }

    const now = new Date()
    const expiresAt = new Date(room.expires_at)
    
    if (now > expiresAt) {
      this.rooms.delete(roomCode.toUpperCase())
      return { exists: false, canJoin: false, userCount: 0 }
    }

    return {
      exists: true,
      canJoin: room.users.length < 2,
      userCount: room.users.length
    }
  }

  // Create new room
  createRoom = async (roomCode: string, userId: string) => {
    const room = {
      id: roomCode,
      users: [userId],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    this.rooms.set(roomCode, room)
    this.messages.set(roomCode, [])
    return { data: room, error: null }
  }

  // Join room
  joinRoom = async (roomCode: string, userId: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: new Error('Room not found') }
    }

    if (room.users.length >= 2) {
      return { data: null, error: new Error('Room is full') }
    }

    if (!room.users.includes(userId)) {
      room.users.push(userId)
    }

    return { data: room, error: null }
  }

  // Get room messages
  getRoomMessages = async (roomCode: string) => {
    const messages = this.messages.get(roomCode.toUpperCase()) || []
    return { data: messages, error: null }
  }

  // Add message to room
  addMessage = async (roomCode: string, message: any) => {
    const messages = this.messages.get(roomCode.toUpperCase()) || []
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }
    messages.push(newMessage)
    this.messages.set(roomCode.toUpperCase(), messages)
    return { data: newMessage, error: null }
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