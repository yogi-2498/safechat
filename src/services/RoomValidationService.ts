import { supabase } from '../lib/supabase'

export class RoomValidationService {
  static validateFormat(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
  }

  static async validateRoom(code: string) {
    const upperCode = code.toUpperCase()
    
    if (!this.validateFormat(upperCode)) {
      return {
        valid: false,
        message: 'Invalid room code format',
        canJoin: false,
        userCount: 0
      }
    }

    const validation = supabase.validateRoom(upperCode)
    
    return {
      valid: validation.exists,
      message: validation.message,
      canJoin: validation.canJoin,
      userCount: validation.userCount
    }
  }

  static async createRoom(userId: string, userName: string) {
    const result = supabase.createRoom(userId, userName)
    
    return {
      roomCode: result.data?.roomCode || '',
      success: !!result.data,
      message: result.data ? 'Room created' : 'Failed to create room'
    }
  }

  static async joinRoom(roomCode: string, userId: string, userName: string) {
    const result = supabase.joinRoom(roomCode.toUpperCase(), userId, userName)
    
    return {
      success: !result.error,
      message: result.error ? result.error.message : 'Joined successfully'
    }
  }

  static async debugGetAllRooms() {
    return supabase.getAllRooms()
  }
}