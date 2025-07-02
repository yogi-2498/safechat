// End-to-end encryption service using Web Crypto API
export class EncryptionService {
  private static keyPair: CryptoKeyPair | null = null;
  private static roomKey: CryptoKey | null = null;
  private static roomCode: string | null = null;

  // Initialize encryption for a room
  static async initializeRoom(roomCode: string): Promise<void> {
    this.roomCode = roomCode;
    
    // Generate key pair for this session
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate symmetric key for room
    this.roomKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt message content
  static async encryptMessage(message: string): Promise<string> {
    if (!this.roomKey) {
      throw new Error('Room key not available');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.roomKey,
      data
    );

    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encrypted);
    const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
    combinedArray.set(iv);
    combinedArray.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combinedArray));
  }

  // Decrypt message content
  static async decryptMessage(encryptedMessage: string): Promise<string> {
    if (!this.roomKey) {
      throw new Error('Room key not available');
    }

    const combinedArray = new Uint8Array(
      atob(encryptedMessage)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const iv = combinedArray.slice(0, 12);
    const encryptedData = combinedArray.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.roomKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Export public key for sharing
  static async exportPublicKey(): Promise<string> {
    if (!this.keyPair?.publicKey) {
      throw new Error('Key pair not available');
    }

    const exported = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Import public key from another user
  static async importPublicKey(publicKeyString: string): Promise<CryptoKey> {
    const publicKeyData = new Uint8Array(
      atob(publicKeyString)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    return await window.crypto.subtle.importKey(
      'spki',
      publicKeyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }

  // Generate secure room code
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Cleanup encryption keys
  static cleanup(): void {
    this.keyPair = null;
    this.roomKey = null;
    this.roomCode = null;
  }

  // Validate room code format
  static validateRoomCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code);
  }
}