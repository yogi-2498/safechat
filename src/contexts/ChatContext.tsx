import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Message, MessageInput } from '../types'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface ChatContextType {
  messages: Message[]
  sendMessage: (messageInput: MessageInput) => void
  isConnected: boolean
  connectedUsers: number
  isLoading: boolean
  roomUsers: Array<{ id: string; name: string }>
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
  const [roomUsers, setRoomUsers] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !roomCode) return

    const initializeRoom = async () => {
      try {
        setIsLoading(true)
        console.log(`🚀 Initializing chat for room: ${roomCode}`)
        
        // Join the room
        const joinResult = await (supabase as any).joinRoom(
          roomCode, 
          user.id, 
          user.name || user.email?.split('@')[0] || 'User'
        )
        
        if (joinResult.error) {
          console.error('❌ Failed to join room:', joinResult.error)
          toast.error(joinResult.error.message)
          return
        }

        // Load existing messages
        const { data: existingMessages } = await (supabase as any).getRoomMessages(roomCode)
        if (existingMessages) {
          console.log(`📚 Loaded ${existingMessages.length} existing messages`)
          setMessages(existingMessages)
        }

        // Subscribe to real-time updates
        const unsubscribe = (supabase as any).subscribeToRoom(roomCode, (update: any) => {
          console.log('📡 Room update received:', update)
          
          if (update.type === 'new_message') {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === update.data.id)) {
                return prev
              }
              return [...prev, update.data]
            })
          } else if (update.type === 'user_joined' || update.type === 'user_left') {
            setRoomUsers(update.data.users || [])
            setConnectedUsers(update.data.users?.length || 1)
          }
        })

        setIsConnected(true)
        toast.success(`💕 Connected to room ${roomCode}`)

        return () => {
          unsubscribe()
          (supabase as any).leaveRoom(roomCode, user.id)
        }
      } catch (error) {
        console.error('❌ Error initializing room:', error)
        toast.error('Failed to connect to room')
      } finally {
        setIsLoading(false)
      }
    }

    const cleanup = initializeRoom()

    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [user, roomCode])

  const sendMessage = async (messageInput: MessageInput) => {
    if (!user || !roomCode) return

    try {
      console.log('📤 Sending message:', messageInput)
      
      const messageData = {
        content: messageInput.content,
        senderId: user.id,
        senderName: user.name || user.email?.split('@')[0] || 'User',
        type: messageInput.type,
        fileUrl: messageInput.fileUrl,
        fileName: messageInput.fileName,
      }

      const { data: newMessage } = await (supabase as any).addMessage(roomCode, messageData)
      
      if (newMessage) {
        console.log('✅ Message sent successfully:', newMessage)
        // Message will be added via real-time subscription
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const value = {
    messages,
    sendMessage,
    isConnected,
    connectedUsers,
    roomUsers,
    isLoading,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}