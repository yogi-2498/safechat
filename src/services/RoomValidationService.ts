import { supabase } from '../lib/supabase'

// Production room validation service with enhanced error handling
export class RoomValidationService {
  // Validate room code format
  static validateFormat(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
  }

  // Check if room exists and is valid in real-time
  static async validateRoom(code: string): Promise<{ valid: boolean; message: string; canJoin: boolean; userCount: number }> {
    const upperCode = code.toUpperCase()
    
    if (!this.validateFormat(upperCode)) {
      return {
        valid: false,
        message: 'Invalid room code format. Must be exactly 6 characters (letters and numbers only).',
        canJoin: false,
        userCount: 0
      }
    }

    try {
      // Check room in real-time database with detailed logging
      console.log(`Validating room code: ${upperCode}`)
      const validation = await (supabase as any).validateRoom(upperCode)
      
      console.log('Validation result:', validation)
      
      if (!validation.exists) {
        return {
          valid: false,
          message: validation.message || `Room "${upperCode}" not found. Please check the code or create a new room.`,
          canJoin: false,
          userCount: 0
        }
      }

      if (!validation.canJoin) {
        return {
          valid: false,
          message: validation.message || `Room "${upperCode}" is full (${validation.userCount}/2 users). Please try another room.`,
          canJoin: false,
          userCount: validation.userCount
        }
      }

      return {
        valid: true,
        message: validation.message || `Room ${upperCode} is available`,
        canJoin: true,
        userCount: validation.userCount
      }
    } catch (error) {
      console.error('Room validation error:', error)
      return {
        valid: false,
        message: 'Failed to validate room. Please check your connection and try again.',
        canJoin: false,
        userCount: 0
      }
    }
  }

  // Generate a new secure room code
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    const array = new Uint8Array(6)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
    
    return result
  }

  // Create a new room with enhanced error handling
  static async createRoom(userId: string): Promise<{ roomCode: string; success: boolean; message: string }> {
    try {
      console.log(`Creating room for user: ${userId}`)
      
      // Create room in database
      const result = await (supabase as any).createRoom(userId)
      
      console.log('Create room result:', result)
      
      if (result.error) {
        return {
          roomCode: '',
          success: false,
          message: result.error.message || 'Failed to create room. Please try again.'
        }
      }

      const roomCode = result.data.roomCode
      console.log(`Successfully created room: ${roomCode}`)

      return {
        roomCode,
        success: true,
        message: `Room ${roomCode} created successfully!`
      }
    } catch (error) {
      console.error('Create room error:', error)
      return {
        roomCode: '',
        success: false,
        message: 'Failed to create room. Please check your connection.'
      }
    }
  }

  // Join an existing room with enhanced validation
  static async joinRoom(roomCode: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`User ${userId} attempting to join room: ${roomCode}`)
      
      const result = await (supabase as any).joinRoom(roomCode.toUpperCase(), userId)
      
      console.log('Join room result:', result)
      
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
      console.error('Join room error:', error)
      return {
        success: false,
        message: 'Failed to join room. Please check your connection.'
      }
    }
  }

  // Debug function to get all rooms
  static async debugGetAllRooms() {
    try {
      const result = (supabase as any).getAllRooms()
      console.log('All rooms:', result)
      return result
    } catch (error) {
      console.error('Error getting all rooms:', error)
      return { rooms: [], activeRooms: [], count: 0 }
    }
  }

  // No demo codes in production
  static getValidCodes(): string[] {
    return []
  }
}