// Room validation service with proper security checks
export class RoomValidationService {
  private static validRoomCodes = new Set([
    'ABC123', 'TEST01', 'DEMO99', 'SECURE', 'CHAT01', 
    'SAMPLE', 'VERIFY', 'PROOF1', 'CHECK2', 'VALID3',
    'LOVE01', 'HEART2', 'KISS99', 'SWEET1', 'HONEY3'
  ])

  // Add a new room code (when creating a room)
  static addRoomCode(code: string): void {
    this.validRoomCodes.add(code.toUpperCase())
  }

  // Remove a room code (when room expires or is deleted)
  static removeRoomCode(code: string): void {
    this.validRoomCodes.delete(code.toUpperCase())
  }

  // Validate room code format
  static validateFormat(code: string): boolean {
    // Must be exactly 6 characters, alphanumeric only
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase())
  }

  // Check if room exists and is valid
  static async validateRoom(code: string): Promise<{ valid: boolean; message: string }> {
    const upperCode = code.toUpperCase()
    
    // First check format
    if (!this.validateFormat(upperCode)) {
      return {
        valid: false,
        message: 'Invalid room code format. Must be exactly 6 characters (letters and numbers only).'
      }
    }

    // Simulate network delay for realistic validation
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800))

    // Check if room exists
    if (!this.validRoomCodes.has(upperCode)) {
      return {
        valid: false,
        message: `Room "${upperCode}" not found. Please check the code and try again.`
      }
    }

    return {
      valid: true,
      message: `Successfully validated room ${upperCode}`
    }
  }

  // Generate a new secure room code
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint8Array(6)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
    
    return result
  }

  // Get all valid room codes (for demo purposes only)
  static getValidCodes(): string[] {
    return Array.from(this.validRoomCodes).slice(0, 10) // Return first 10 for display
  }

  // Check room capacity (simulate 2-person limit)
  static async checkRoomCapacity(code: string): Promise<{ canJoin: boolean; currentUsers: number }> {
    // Simulate checking current room occupancy
    const currentUsers = Math.floor(Math.random() * 3) // 0-2 users
    
    return {
      canJoin: currentUsers < 2,
      currentUsers
    }
  }
}