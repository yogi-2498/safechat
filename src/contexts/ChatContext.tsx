import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Message, MessageInput } from '../types';
import { EncryptionService } from '../services/EncryptionService';
import toast from 'react-hot-toast';

interface ChatContextType {
  messages: Message[];
  sendMessage: (messageInput: MessageInput) => void;
  isConnected: boolean;
  connectedUsers: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);

  useEffect(() => {
    if (!user || !roomCode) return;

    const initializeRoom = async () => {
      try {
        // Initialize encryption for the room
        await EncryptionService.initializeRoom(roomCode);
        setIsConnected(true);
        setConnectedUsers(Math.floor(Math.random() * 2) + 1); // Mock 1-2 users
        toast.success(`Connected to room ${roomCode}`);
      } catch (error) {
        console.error('Error initializing room:', error);
        toast.error('Failed to connect to room');
      }
    };

    initializeRoom();

    return () => {
      EncryptionService.cleanup();
    };
  }, [user, roomCode]);

  const sendMessage = async (messageInput: MessageInput) => {
    if (!user) return;

    try {
      // Encrypt message content
      const encryptedContent = await EncryptionService.encryptMessage(messageInput.content);
      
      const message: Message = {
        id: Date.now().toString(),
        content: messageInput.content, // Store decrypted for demo
        encryptedContent,
        senderId: user.id,
        senderName: user.name || user.email,
        type: messageInput.type,
        timestamp: new Date().toISOString(),
        fileUrl: messageInput.fileUrl,
        fileName: messageInput.fileName,
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const value = {
    messages,
    sendMessage,
    isConnected,
    connectedUsers,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};