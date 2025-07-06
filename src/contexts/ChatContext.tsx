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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        
        // Join room
        const joinResult = supabase.joinRoom(roomCode, user.id, user.name || user.email?.split('@')[0] || 'User')
        if (joinResult.error) {
          toast.error('Failed to join room')
          return
        }

        // Load messages
        const { data: existingMessages } = supabase.getRoomMessages(roomCode)
        if (existingMessages) {
          setMessages(existingMessages)
        }

        // Subscribe to updates
        const unsubscribe = supabase.subscribeToRoom(roomCode, (update) => {
          if (update.type === 'new_message') {
            setMessages(prev => {
              if (prev.find(m => m.id === update.data.id)) return prev
              return [...prev, update.data]
            })
          }
        })

        setIsConnected(true)
        toast.success(`Connected to room ${roomCode}`)
        
        return unsubscribe
      } catch (error) {
        toast.error('Failed to connect')
      } finally {
        setIsLoading(false)
      }
    }

    let cleanup: (() => void) | undefined

    initializeRoom().then((unsubscribe) => {
      cleanup = unsubscribe
    })

    return () => {
      if (cleanup) cleanup()
      if (user?.id && roomCode) {
        supabase.leaveRoom(roomCode, user.id)
      }
    }
  }, [user, roomCode])

  const sendMessage = async (messageInput: MessageInput) => {
    if (!user || !roomCode) return

    const messageData = {
      content: messageInput.content,
      senderId: user.id,
      senderName: user.name || user.email?.split('@')[0] || 'User',
      type: messageInput.type,
      fileUrl: messageInput.fileUrl,
      fileName: messageInput.fileName,
    }

    supabase.addMessage(roomCode, messageData)
  }

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      isConnected,
      connectedUsers,
      isLoading,
    }}>
      {children}
    </ChatContext.Provider>
  )
}