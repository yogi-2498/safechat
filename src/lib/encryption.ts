// End-to-end encryption utilities using Web Crypto API
export class E2EEncryption {
  private static keyPair: CryptoKeyPair | null = null;
  private static roomKey: CryptoKey | null = null;

  // Generate a new key pair for the user
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    this.keyPair = keyPair;
    return keyPair;
  }

  // Generate a symmetric key for the room
  static async generateRoomKey(): Promise<CryptoKey> {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    this.roomKey = key;
    return key;
  }

  // Export public key to share with other user
  static async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Import public key from other user
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

  // Encrypt message with room key
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

    const encryptedArray = new Uint8Array(encrypted);
    const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
    combinedArray.set(iv);
    combinedArray.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combinedArray));
  }

  // Decrypt message with room key
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

  // Clear all keys (called when leaving room)
  static clearKeys(): void {
    this.keyPair = null;
    this.roomKey = null;
  }
}