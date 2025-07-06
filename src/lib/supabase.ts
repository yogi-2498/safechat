// Simple working room system
class WorkingRoomSystem {
  private rooms = new Map()
  private listeners = new Map()

  generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  createRoom(userId, userName) {
    const roomCode = this.generateRoomCode()
    const room = {
      id: roomCode,
      users: [{ id: userId, name: userName }],
      messages: [],
      pinnedMessages: [],
      createdAt: new Date().toISOString()
    }
    this.rooms.set(roomCode, room)
    console.log('Room created:', roomCode)
    return { roomCode, success: true }
  }

  validateRoom(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) {
      return { exists: false, canJoin: false, userCount: 0, message: 'Room not found' }
    }
    return { 
      exists: true, 
      canJoin: room.users.length < 2, 
      userCount: room.users.length,
      message: `Room found (${room.users.length}/2 users)`
    }
  }

  joinRoom(roomCode, userId, userName) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return { success: false, error: 'Room not found' }
    if (room.users.length >= 2) return { success: false, error: 'Room full' }
    
    if (!room.users.find(u => u.id === userId)) {
      room.users.push({ id: userId, name: userName })
    }
    return { success: true }
  }

  addMessage(roomCode, message) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return null

    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    room.messages.push(newMessage)
    
    // Notify listeners
    const listeners = this.listeners.get(roomCode.toUpperCase())
    if (listeners) {
      listeners.forEach(callback => callback({ type: 'new_message', data: newMessage }))
    }
    
    return newMessage
  }

  getMessages(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase())
    return room ? room.messages : []
  }

  getPinnedMessages(roomCode) {
    const room = this.rooms.get(roomCode.toUpperCase())
    return room ? room.pinnedMessages : []
  }

  pinMessage(roomCode, messageId) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (!room) return { success: false }
    
    const message = room.messages.find(m => m.id === messageId)
    if (!message) return { success: false }
    
    const alreadyPinned = room.pinnedMessages.find(p => p.id === messageId)
    if (alreadyPinned) {
      room.pinnedMessages = room.pinnedMessages.filter(p => p.id !== messageId)
    } else {
      room.pinnedMessages.push({ ...message, pinned_at: new Date().toISOString() })
    }
    
    return { success: true }
  }

  subscribe(roomCode, callback) {
    const upperCode = roomCode.toUpperCase()
    if (!this.listeners.has(upperCode)) {
      this.listeners.set(upperCode, new Set())
    }
    this.listeners.get(upperCode).add(callback)
    
    return () => {
      const listeners = this.listeners.get(upperCode)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  leaveRoom(roomCode, userId) {
    const room = this.rooms.get(roomCode.toUpperCase())
    if (room) {
      room.users = room.users.filter(u => u.id !== userId)
      if (room.users.length === 0) {
        this.rooms.delete(roomCode.toUpperCase())
      }
    }
  }

  getAllRooms() {
    return { count: this.rooms.size, rooms: Array.from(this.rooms.keys()) }
  }
}

const roomSystem = new WorkingRoomSystem()

export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }) => {
      const user = { id: Math.random().toString(36).substr(2, 9), email, user_metadata: { name: email.split('@')[0] } }
      return { data: { user, session: { user } }, error: null }
    },
    signInWithOAuth: async () => {
      const user = { id: Math.random().toString(36).substr(2, 9), email: 'user@gmail.com', user_metadata: { name: 'User' } }
      return { data: { user, session: { user } }, error: null }
    },
    signUp: async ({ email, password }) => {
      const user = { id: Math.random().toString(36).substr(2, 9), email, user_metadata: { name: email.split('@')[0] } }
      return { data: { user, session: { user } }, error: null }
    },
    signOut: async () => ({ error: null })
  },

  createRoom: (userId, userName) => {
    const result = roomSystem.createRoom(userId, userName)
    return { data: { roomCode: result.roomCode }, error: null }
  },

  validateRoom: (roomCode) => roomSystem.validateRoom(roomCode),

  joinRoom: (roomCode, userId, userName) => {
    const result = roomSystem.joinRoom(roomCode, userId, userName)
    return { data: result.success ? {} : null, error: result.success ? null : new Error(result.error) }
  },

  addMessage: (roomCode, message) => {
    const result = roomSystem.addMessage(roomCode, message)
    return { data: result, error: null }
  },

  getRoomMessages: (roomCode) => {
    const messages = roomSystem.getMessages(roomCode)
    return { data: messages, error: null }
  },

  getPinnedMessages: (roomCode) => {
    const pinnedMessages = roomSystem.getPinnedMessages(roomCode)
    return { data: pinnedMessages, error: null }
  },

  pinMessage: (roomCode, messageId) => {
    const result = roomSystem.pinMessage(roomCode, messageId)
    return { data: result.success ? {} : null, error: null }
  },

  subscribeToRoom: (roomCode, callback) => roomSystem.subscribe(roomCode, callback),

  leaveRoom: (roomCode, userId) => {
    roomSystem.leaveRoom(roomCode, userId)
    return { data: { success: true }, error: null }
  },

  getAllRooms: () => roomSystem.getAllRooms()
}