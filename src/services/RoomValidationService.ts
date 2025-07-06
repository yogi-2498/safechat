import { supabase } from '../lib/supabase'

export class RoomValidationService {
  // Validate room code format
  static validateFormat(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
  }

  // Validate room exists and can be joined
  static async validateRoom(code: string): Promise<{ 
    valid: boolean; 
    message: string; 
    canJoin: boolean; 
    userCount: number 
  }> {
    const upperCode = code.toUpperCase()
    
    if (!this.validateFormat(upperCode)) {
      return {
        valid: false,
        message: 'Invalid room code format. Must be exactly 6 characters.',
        canJoin: false,
        userCount: 0
      }
    }

    try {
      console.log(`🔍 Validating room: ${upperCode}`)
      const validation = (supabase as any).validateRoom(upperCode)
      
      console.log('✅ Validation result:', validation)
      
      if (!validation.exists) {
        return {
          valid: false,
          message: `Room "${upperCode}" not found. Please check the code.`,
          canJoin: false,
          userCount: 0
        }
      }

      if (!validation.canJoin) {
        return {
          valid: false,
          message: validation.message,
          canJoin: false,
          userCount: validation.userCount
        }
      }

      return {
        valid: true,
        message: `Room ${upperCode} is available (${validation.userCount}/2 users)`,
        canJoin: true,
        userCount: validation.userCount
      }
    } catch (error) {
      console.error('❌ Room validation error:', error)
      return {
        valid: false,
        message: 'Failed to validate room. Please try again.',
        canJoin: false,
        userCount: 0
      }
    }
  }

  // Create a new room
  static async createRoom(userId: string, userName: string): Promise<{ 
    roomCode: string; 
    success: boolean; 
    message: string 
  }> {
    try {
      console.log(`🏗️ Creating room for user: ${userId} (${userName})`)
      
      const result = (supabase as any).createRoom(userId, userName)
      
      console.log('✅ Create room result:', result)
      
      if (result.error) {
        return {
          roomCode: '',
          success: false,
          message: result.error.message || 'Failed to create room'
        }
      }

      const roomCode = result.data.roomCode
      console.log(`🎉 Successfully created room: ${roomCode}`)

      return {
        roomCode,
        success: true,
        message: `Room ${roomCode} created successfully!`
      }
    } catch (error) {
      console.error('❌ Create room error:', error)
      return {
        roomCode: '',
        success: false,
        message: 'Failed to create room. Please try again.'
      }
    }
  }

  // Join an existing room
  static async joinRoom(roomCode: string, userId: string, userName: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      console.log(`👥 User ${userId} (${userName}) joining room: ${roomCode}`)
      
      const result = (supabase as any).joinRoom(roomCode.toUpperCase(), userId, userName)
      
      console.log('✅ Join room result:', result)
      
      if (result.error) {
        return {
          success: false,
          message: result.error.message
        }
      }

      return {
        success: true,
        message: `Successfully joined room ${roomCode.toUpperCase()}`
      }
    } catch (error) {
      console.error('❌ Join room error:', error)
      return {
        success: false,
        message: 'Failed to join room. Please try again.'
      }
    }
  }

  // Debug function
  static async debugGetAllRooms() {
    try {
      const result = (supabase as any).getAllRooms()
      console.log('🐛 All rooms debug:', result)
      return result
    } catch (error) {
      console.error('❌ Error getting all rooms:', error)
      return { rooms: [], count: 0, listeners: 0 }
    }
  }
}