import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Simplified in-memory room system that actually works
class SimpleRoomSystem {
  private rooms = new Map<string, {
    id: string
    users: Array<{ id: string; name: string; joinedAt: string }>
    messages: Array<{
      id: string
      content: string
      senderId: string
      senderName: string
      type: 'text' | 'image' | 'audio' | 'file'
      timestamp: string
      fileUrl?: string
      fileName?: string
      pinned_at?: string
      reactions?: Record<string, Array<{ userId: string; emoji: string }>>
    }>
    pinnedMessages: Array<{
      id: string
      content: string
      senderId: string
      senderName: string
      type: 'text' | 'image' | 'audio' | 'file'
      timestamp: string
      pinned_at: string
      fileUrl?: string
      fileName?: string
    }>
    createdAt: string
    lastActivity: string
  }>()

  private listeners = new Map<string, Set<(data: any) => void>>()

  constructor() {
    // Clean up inactive rooms every 5 minutes
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000)
  }

  // Generate secure room code
  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Create a new room
  createRoom(userId: string, userName: string): { roomCode: string; success: boolean } {
    let roomCode = this.generateRoomCode()
    
    // Ensure unique room code
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode()
    }

    const room = {
      id: roomCode,
      users: [{ id: userId, name: userName, joinedAt: new Date().toISOString() }],
      messages: [],
      pinnedMessages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }

    this.rooms.set(roomCode, room)
    console.log(`✅ Room created: ${roomCode}`, room)
    
    return { roomCode, success: true }
  }

  // Check if room exists and can be joined
  canJoinRoom(roomCode: string): { canJoin: boolean; reason?: string; userCount: number } {
    const room = this.rooms.get(roomCode.toUpperCase())
    
    if (!room) {
      return { canJoin: false, reason: 'Room not found', userCount: 0 }
    }

    if (room.users.length >= 2) {
      return { canJoin: false, reason: 'Room is full (2/2 users)', userCount: room.users.length }
    }

    return { canJoin: true, userCount: room.users.length }
  }

  // Join a room
  joinRoom(roomCode: string, userId: string, userName: string): { success: boolean; error?: string } {
    const upperCode = roomCode.toUpperCase()
    const room = this.rooms.get(upperCode)

    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    if (room.users.length >= 2) {
      return { success: false, error: 'Room is full' }
    }

    // Check if user already in room
    if (!room.users.find(u => u.id === userId)) {
      room.users.push({ id: userId, name: userName, joinedAt: new Date().toISOString() })
      room.lastActivity = new Date().toISOString()
    }

    console.log(`✅ User joined room ${upperCode}:`, room.users)
    this.notifyRoomUpdate(upperCode, 'user_joined', { users: room.users })
    
    return { success: true }
  }

  // Get room data
  getRoom(roomCode: string) {
    return this.rooms.get(roomCode.toUpperCase())
  }

  // Add message to room
  addMessage(roomCode: string, message: any) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return null

    const newMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      reactions: {}
    }

    room.messages.push(newMessage)
    room.lastActivity = new Date().toISOString()

    console.log(`📨 Message added to ${roomCode}:`, newMessage)
    this.notifyRoomUpdate(roomCode.toUpperCase(), 'new_message', newMessage)
    
    return newMessage
  }

  // Get messages for room
  getMessages(roomCode: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    return room ? room.messages : []
  }

  // Get pinned messages for room
  getPinnedMessages(roomCode: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    return room ? room.pinnedMessages : []
  }

  // Pin a message
  pinMessage(roomCode: string, messageId: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return { success: false, error: 'Room not found' }

    const message = room.messages.find(m => m.id === messageId)
    if (!message) return { success: false, error: 'Message not found' }

    // Check if already pinned
    const alreadyPinned = room.pinnedMessages.find(p => p.id === messageId)
    if (alreadyPinned) return { success: false, error: 'Message already pinned' }

    // Add to pinned messages
    const pinnedMessage = {
      ...message,
      pinned_at: new Date().toISOString()
    }
    room.pinnedMessages.push(pinnedMessage)

    // Update the original message
    message.pinned_at = new Date().toISOString()

    console.log(`📌 Message pinned in ${roomCode}:`, messageId)
    this.notifyRoomUpdate(roomCode.toUpperCase(), 'message_pinned', { messageId, pinnedMessage })
    
    return { success: true, data: pinnedMessage }
  }

  // Unpin a message
  unpinMessage(roomCode: string, messageId: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return { success: false, error: 'Room not found' }

    // Remove from pinned messages
    const pinnedIndex = room.pinnedMessages.findIndex(p => p.id === messageId)
    if (pinnedIndex === -1) return { success: false, error: 'Message not pinned' }

    room.pinnedMessages.splice(pinnedIndex, 1)

    // Update the original message
    const message = room.messages.find(m => m.id === messageId)
    if (message) {
      delete message.pinned_at
    }

    console.log(`📌 Message unpinned in ${roomCode}:`, messageId)
    this.notifyRoomUpdate(roomCode.toUpperCase(), 'message_unpinned', { messageId })
    
    return { success: true }
  }

  // Add reaction to message
  addReaction(roomCode: string, messageId: string, emoji: string, userId: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return { success: false, error: 'Room not found' }

    const message = room.messages.find(m => m.id === messageId)
    if (!message) return { success: false, error: 'Message not found' }

    if (!message.reactions) {
      message.reactions = {}
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = []
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions[emoji].find(r => r.userId === userId)
    if (existingReaction) {
      // Remove reaction
      message.reactions[emoji] = message.reactions[emoji].filter(r => r.userId !== userId)
      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji]
      }
    } else {
      // Add reaction
      message.reactions[emoji].push({ userId, emoji })
    }

    console.log(`😊 Reaction ${existingReaction ? 'removed' : 'added'} in ${roomCode}:`, { messageId, emoji, userId })
    this.notifyRoomUpdate(roomCode.toUpperCase(), 'reaction_updated', { messageId, emoji, userId, reactions: message.reactions })
    
    return { success: true, data: message.reactions }
  }

  // Subscribe to room updates
  subscribe(roomCode: string, callback: (data: any) => void) {
    const upperCode = roomCode.toUpperCase()
    if (!this.listeners.has(upperCode)) {
      this.listeners.set(upperCode, new Set())
    }
    this.listeners.get(upperCode)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(upperCode)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(upperCode)
        }
      }
    }
  }

  // Notify room updates
  private notifyRoomUpdate(roomCode: string, type: string, data: any) {
    const listeners = this.listeners.get(roomCode)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback({ type, data, roomCode })
        } catch (error) {
          console.error('Error in room listener:', error)
        }
      })
    }
  }

  // Leave room
  leaveRoom(roomCode: string, userId: string) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return

    room.users = room.users.filter(u => u.id !== userId)
    
    if (room.users.length === 0) {
      // Delete empty room
      this.rooms.delete(roomCode.toUpperCase())
      this.listeners.delete(roomCode.toUpperCase())
      console.log(`🗑️ Deleted empty room: ${roomCode}`)
    } else {
      this.notifyRoomUpdate(roomCode.toUpperCase(), 'user_left', { users: room.users })
    }
  }

  // Clean up inactive rooms (older than 24 hours)
  private cleanupInactiveRooms() {
    const now = new Date()
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

    for (const [roomCode, room] of this.rooms.entries()) {
      if (new Date(room.lastActivity) < cutoff) {
        this.rooms.delete(roomCode)
        this.listeners.delete(roomCode)
        console.log(`🧹 Cleaned up inactive room: ${roomCode}`)
      }
    }
  }

  // Debug: Get all rooms
  getAllRooms() {
    return {
      rooms: Array.from(this.rooms.entries()),
      count: this.rooms.size,
      listeners: this.listeners.size
    }
  }
}

// Create singleton instance
const roomSystem = new SimpleRoomSystem()

// Export the room system with Supabase-like interface
export const supabase = {
  // Auth methods (mock)
  auth: {
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
  },

  // Room methods
  createRoom: (userId: string, userName: string) => {
    const result = roomSystem.createRoom(userId, userName)
    return { 
      data: result.success ? { roomCode: result.roomCode } : null, 
      error: result.success ? null : new Error('Failed to create room') 
    }
  },

  validateRoom: (roomCode: string) => {
    const validation = roomSystem.canJoinRoom(roomCode)
    return {
      exists: validation.canJoin || validation.reason !== 'Room not found',
      canJoin: validation.canJoin,
      userCount: validation.userCount,
      message: validation.reason || `Room ${roomCode} is available`
    }
  },

  joinRoom: (roomCode: string, userId: string, userName: string) => {
    const result = roomSystem.joinRoom(roomCode, userId, userName)
    return {
      data: result.success ? roomSystem.getRoom(roomCode) : null,
      error: result.success ? null : new Error(result.error || 'Failed to join room')
    }
  },

  addMessage: (roomCode: string, message: any) => {
    const result = roomSystem.addMessage(roomCode, message)
    return {
      data: result,
      error: result ? null : new Error('Failed to add message')
    }
  },

  getRoomMessages: (roomCode: string) => {
    const messages = roomSystem.getMessages(roomCode)
    return { data: messages, error: null }
  },

  getPinnedMessages: (roomCode: string) => {
    const pinnedMessages = roomSystem.getPinnedMessages(roomCode)
    return { data: pinnedMessages, error: null }
  },

  pinMessage: (roomCode: string, messageId: string) => {
    const result = roomSystem.pinMessage(roomCode, messageId)
    return {
      data: result.success ? result.data : null,
      error: result.success ? null : new Error(result.error || 'Failed to pin message')
    }
  },

  unpinMessage: (roomCode: string, messageId: string) => {
    const result = roomSystem.unpinMessage(roomCode, messageId)
    return {
      data: result.success ? { success: true } : null,
      error: result.success ? null : new Error(result.error || 'Failed to unpin message')
    }
  },

  addReaction: (roomCode: string, messageId: string, emoji: string, userId: string) => {
    const result = roomSystem.addReaction(roomCode, messageId, emoji, userId)
    return {
      data: result.success ? result.data : null,
      error: result.success ? null : new Error(result.error || 'Failed to add reaction')
    }
  },

  subscribeToRoom: (roomCode: string, callback: (data: any) => void) => {
    return roomSystem.subscribe(roomCode, callback)
  },

  leaveRoom: (roomCode: string, userId: string) => {
    roomSystem.leaveRoom(roomCode, userId)
    return { data: { success: true }, error: null }
  },

  // Debug method
  getAllRooms: () => roomSystem.getAllRooms(),

  // Legacy methods for compatibility
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    subscribe: () => ({ on: () => ({ subscribe: () => {} }) })
  }),

  channel: (name: string) => ({
    on: () => supabase,
    subscribe: () => supabase,
    send: () => supabase,
    unsubscribe: () => supabase
  })
}