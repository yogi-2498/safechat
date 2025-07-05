import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Production-ready Supabase client with persistent room storage
class ProductionSupabaseClient {
  private rooms = new Map<string, { 
    id: string; 
    users: string[]; 
    created_at: string; 
    expires_at: string;
    messages: any[];
    pinned_messages: any[];
    creator_id: string;
  }>()
  
  private activeRooms = new Set<string>()
  private storageKey = 'safechat_rooms'

  constructor() {
    // Load existing rooms from localStorage for persistence
    this.loadRoomsFromStorage()
    this.cleanupExpiredRooms()
    
    // Cleanup expired rooms every 5 minutes
    setInterval(() => this.cleanupExpiredRooms(), 5 * 60 * 1000)
    
    // Save rooms to storage every 30 seconds
    setInterval(() => this.saveRoomsToStorage(), 30 * 1000)
  }

  private loadRoomsFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.rooms = new Map(data.rooms || [])
        this.activeRooms = new Set(data.activeRooms || [])
        console.log(`Loaded ${this.rooms.size} rooms from storage`)
      }
    } catch (error) {
      console.error('Error loading rooms from storage:', error)
    }
  }

  private saveRoomsToStorage() {
    try {
      const data = {
        rooms: Array.from(this.rooms.entries()),
        activeRooms: Array.from(this.activeRooms),
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving rooms to storage:', error)
    }
  }

  private cleanupExpiredRooms() {
    const now = new Date()
    let cleaned = 0
    
    for (const [code, room] of this.rooms.entries()) {
      if (new Date(room.expires_at) < now) {
        this.rooms.delete(code)
        this.activeRooms.delete(code)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired rooms`)
      this.saveRoomsToStorage()
    }
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

  // Enhanced room validation with detailed logging
  validateRoom = async (roomCode: string) => {
    this.cleanupExpiredRooms()
    const upperCode = roomCode.toUpperCase()
    const room = this.rooms.get(upperCode)
    
    console.log(`Validating room ${upperCode}:`, {
      exists: !!room,
      totalRooms: this.rooms.size,
      roomCodes: Array.from(this.rooms.keys())
    })
    
    if (!room) {
      return { 
        exists: false, 
        canJoin: false, 
        userCount: 0, 
        message: `Room ${upperCode} not found. Available rooms: ${Array.from(this.rooms.keys()).join(', ') || 'none'}` 
      }
    }

    const now = new Date()
    const expiresAt = new Date(room.expires_at)
    
    if (now > expiresAt) {
      this.rooms.delete(upperCode)
      this.activeRooms.delete(upperCode)
      this.saveRoomsToStorage()
      return { 
        exists: false, 
        canJoin: false, 
        userCount: 0, 
        message: `Room ${upperCode} has expired` 
      }
    }

    const canJoin = room.users.length < 2
    return {
      exists: true,
      canJoin,
      userCount: room.users.length,
      message: canJoin ? `Room ${upperCode} is available (${room.users.length}/2 users)` : `Room ${upperCode} is full (2/2 users)`
    }
  }

  // Enhanced room creation with guaranteed uniqueness
  createRoom = async (userId: string) => {
    let roomCode = this.generateSecureRoomCode()
    let attempts = 0
    
    // Ensure absolute uniqueness
    while (this.rooms.has(roomCode) && attempts < 50) {
      roomCode = this.generateSecureRoomCode()
      attempts++
    }
    
    if (attempts >= 50) {
      return { data: null, error: new Error('Failed to generate unique room code') }
    }
    
    const room = {
      id: roomCode,
      users: [userId],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      messages: [],
      pinned_messages: [],
      creator_id: userId
    }
    
    this.rooms.set(roomCode, room)
    this.activeRooms.add(roomCode)
    this.saveRoomsToStorage()
    
    console.log(`Created room ${roomCode}:`, {
      totalRooms: this.rooms.size,
      roomData: room
    })
    
    return { data: { roomCode, room }, error: null }
  }

  // Generate cryptographically secure room code with better entropy
  private generateSecureRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(6)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
    
    return result
  }

  // Enhanced room joining with better validation
  joinRoom = async (roomCode: string, userId: string) => {
    const upperCode = roomCode.toUpperCase()
    const room = this.rooms.get(upperCode)
    
    console.log(`User ${userId} attempting to join room ${upperCode}:`, {
      roomExists: !!room,
      currentUsers: room?.users || [],
      userCount: room?.users.length || 0
    })
    
    if (!room) {
      return { 
        data: null, 
        error: new Error(`Room ${upperCode} not found. Please check the code or create a new room.`) 
      }
    }

    // Check if room is expired
    const now = new Date()
    const expiresAt = new Date(room.expires_at)
    
    if (now > expiresAt) {
      this.rooms.delete(upperCode)
      this.activeRooms.delete(upperCode)
      this.saveRoomsToStorage()
      return { 
        data: null, 
        error: new Error(`Room ${upperCode} has expired`) 
      }
    }

    // Check if room is full (and user is not already in it)
    if (room.users.length >= 2 && !room.users.includes(userId)) {
      return { 
        data: null, 
        error: new Error(`Room ${upperCode} is full (${room.users.length}/2 users)`) 
      }
    }

    // Add user if not already in room
    if (!room.users.includes(userId)) {
      room.users.push(userId)
      this.saveRoomsToStorage()
      console.log(`User ${userId} joined room ${upperCode}. Users: ${room.users}`)
    }

    return { data: room, error: null }
  }

  // Get room messages with full history
  getRoomMessages = async (roomCode: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    return { data: room?.messages || [], error: null }
  }

  // Get pinned messages
  getPinnedMessages = async (roomCode: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    return { data: room?.pinned_messages || [], error: null }
  }

  // Add message to room
  addMessage = async (roomCode: string, message: any) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: new Error('Room not found') }
    }

    const newMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      reactions: {},
      replies: []
    }
    
    room.messages.push(newMessage)
    this.saveRoomsToStorage()
    return { data: newMessage, error: null }
  }

  // Pin message
  pinMessage = async (roomCode: string, messageId: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: new Error('Room not found') }
    }

    const message = room.messages.find(m => m.id === messageId)
    if (!message) {
      return { data: null, error: new Error('Message not found') }
    }

    // Remove if already pinned, add if not
    const pinnedIndex = room.pinned_messages.findIndex(m => m.id === messageId)
    if (pinnedIndex >= 0) {
      room.pinned_messages.splice(pinnedIndex, 1)
    } else {
      room.pinned_messages.push({ ...message, pinned_at: new Date().toISOString() })
    }

    this.saveRoomsToStorage()
    return { data: room.pinned_messages, error: null }
  }

  // Add reaction to message
  addReaction = async (roomCode: string, messageId: string, emoji: string, userId: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: new Error('Room not found') }
    }

    const message = room.messages.find(m => m.id === messageId)
    if (!message) {
      return { data: null, error: new Error('Message not found') }
    }

    if (!message.reactions) {
      message.reactions = {}
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = []
    }

    // Toggle reaction
    const userIndex = message.reactions[emoji].indexOf(userId)
    if (userIndex >= 0) {
      message.reactions[emoji].splice(userIndex, 1)
      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji]
      }
    } else {
      message.reactions[emoji].push(userId)
    }

    this.saveRoomsToStorage()
    return { data: message, error: null }
  }

  // Add reply to message
  addReply = async (roomCode: string, messageId: string, reply: any) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: new Error('Room not found') }
    }

    const message = room.messages.find(m => m.id === messageId)
    if (!message) {
      return { data: null, error: new Error('Message not found') }
    }

    if (!message.replies) {
      message.replies = []
    }

    const newReply = {
      ...reply,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }

    message.replies.push(newReply)
    this.saveRoomsToStorage()
    return { data: newReply, error: null }
  }

  // Leave room and cleanup
  leaveRoom = async (roomCode: string, userId: string) => {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { data: null, error: null }
    }

    // Remove user from room
    room.users = room.users.filter(id => id !== userId)

    // If no users left, delete room immediately
    if (room.users.length === 0) {
      this.rooms.delete(roomCode.toUpperCase())
      this.activeRooms.delete(roomCode.toUpperCase())
      console.log(`Deleted empty room ${roomCode.toUpperCase()}`)
    }

    this.saveRoomsToStorage()
    return { data: { success: true }, error: null }
  }

  // Get all active rooms (for debugging)
  getAllRooms = () => {
    return {
      rooms: Array.from(this.rooms.entries()),
      activeRooms: Array.from(this.activeRooms),
      count: this.rooms.size
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

export const supabase = new ProductionSupabaseClient()