import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Message, MessageInput } from '../types'
import { EncryptionService } from '../services/EncryptionService'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface ChatContextType {
  messages: Message[]
  sendMessage: (messageInput: MessageInput) => void
  isConnected: boolean
  connectedUsers: number
  isLoading: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !roomCode) return

    const initializeRoom = async () => {
      try {
        setIsLoading(true)
        
        // Initialize encryption for the room
        await EncryptionService.initializeRoom(roomCode)
        
        // Load existing messages from the room
        const { data: existingMessages } = await (supabase as any).getRoomMessages(roomCode)
        if (existingMessages) {
          const decryptedMessages = await Promise.all(
            existingMessages.map(async (msg: any) => ({
              ...msg,
              content: msg.encryptedContent ? await EncryptionService.decryptMessage(msg.encryptedContent) : msg.content
            }))
          )
          setMessages(decryptedMessages)
        }
        
        setIsConnected(true)
        setConnectedUsers(Math.floor(Math.random() * 2) + 1)
        toast.success(`💕 Connected to room ${roomCode}`)
      } catch (error) {
        console.error('Error initializing room:', error)
        toast.error('Failed to connect to room')
      } finally {
        setIsLoading(false)
      }
    }

    initializeRoom()

    return () => {
      EncryptionService.cleanup()
    }
  }, [user, roomCode])

  const sendMessage = async (messageInput: MessageInput) => {
    if (!user || !roomCode) return

    try {
      // Encrypt message content
      const encryptedContent = await EncryptionService.encryptMessage(messageInput.content)
      
      const messageData = {
        content: messageInput.content,
        encryptedContent,
        senderId: user.id,
        senderName: user.name || user.email,
        type: messageInput.type,
        fileUrl: messageInput.fileUrl,
        fileName: messageInput.fileName,
      }

      // Add to database
      const { data: newMessage } = await (supabase as any).addMessage(roomCode, messageData)
      
      if (newMessage) {
        const message: Message = {
          ...newMessage,
          timestamp: newMessage.created_at
        }
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const value = {
    messages,
    sendMessage,
    isConnected,
    connectedUsers,
    isLoading,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}