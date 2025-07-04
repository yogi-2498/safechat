import { supabase } from '../lib/supabase'

// Enhanced room validation service with real database integration
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
      // Check room in real-time database
      const validation = await (supabase as any).validateRoom(upperCode)
      
      if (!validation.exists) {
        return {
          valid: false,
          message: `Room "${upperCode}" not found or has expired. Please check the code and try again.`,
          canJoin: false,
          userCount: 0
        }
      }

      if (!validation.canJoin) {
        return {
          valid: false,
          message: `Room "${upperCode}" is full (${validation.userCount}/2 users). Please try another room.`,
          canJoin: false,
          userCount: validation.userCount
        }
      }

      return {
        valid: true,
        message: `Successfully validated room ${upperCode}`,
        canJoin: true,
        userCount: validation.userCount
      }
    } catch (error) {
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

  // Create a new room
  static async createRoom(userId: string): Promise<{ roomCode: string; success: boolean; message: string }> {
    try {
      let roomCode = this.generateRoomCode()
      let attempts = 0
      
      // Ensure unique room code
      while (attempts < 10) {
        const validation = await (supabase as any).validateRoom(roomCode)
        if (!validation.exists) {
          break
        }
        roomCode = this.generateRoomCode()
        attempts++
      }

      if (attempts >= 10) {
        return {
          roomCode: '',
          success: false,
          message: 'Failed to generate unique room code. Please try again.'
        }
      }

      // Create room in database
      const result = await (supabase as any).createRoom(roomCode, userId)
      
      if (result.error) {
        return {
          roomCode: '',
          success: false,
          message: 'Failed to create room. Please try again.'
        }
      }

      return {
        roomCode,
        success: true,
        message: `Room ${roomCode} created successfully!`
      }
    } catch (error) {
      return {
        roomCode: '',
        success: false,
        message: 'Failed to create room. Please check your connection.'
      }
    }
  }

  // Join an existing room
  static async joinRoom(roomCode: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await (supabase as any).joinRoom(roomCode.toUpperCase(), userId)
      
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
      return {
        success: false,
        message: 'Failed to join room. Please check your connection.'
      }
    }
  }

  // Get demo room codes for testing
  static getValidCodes(): string[] {
    return ['ABC123', 'TEST01', 'DEMO99', 'SECURE', 'CHAT01', 'LOVE01', 'HEART2', 'KISS99', 'SWEET1', 'HONEY3']
  }
}