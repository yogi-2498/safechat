export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  content: string;
  encryptedContent: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'file' | 'audio';
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  pinned_at?: string;
  reactions?: Record<string, Array<{ userId: string; emoji: string }>>;
}

export interface MessageInput {
  content: string;
  type: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
}

export interface Room {
  id: string;
  code: string;
  createdAt: string;
  participants: string[];
  isActive: boolean;
}