import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Image, 
  Smile, 
  LogOut, 
  Users, 
  Shield, 
  Copy,
  Check,
  X,
  Paperclip,
  Youtube,
  Heart,
  ArrowDown,
  Moon,
  Sun,
  Pin
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { YouTubePlayer } from '../components/YouTube/YouTubePlayer'
import { SecureImageViewer } from '../components/SecureImageViewer'
import { MessageBubble } from '../components/MessageBubble'
import { EmojiPicker } from '../components/EmojiPicker'
import { FloatingElements } from '../components/FloatingElements'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { useTheme } from '../contexts/ThemeContext'
import { useScreenshotPrevention } from '../hooks/useScreenshotPrevention'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const ChatRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { messages, sendMessage, isConnected, connectedUsers, isLoading } = useChat()
  const { isDark, toggleTheme } = useTheme()
  
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name?: string } | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useScreenshotPrevention()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (roomCode) {
      loadPinnedMessages()
    }
  }, [roomCode])

  const loadPinnedMessages = async () => {
    try {
      const { data } = supabase.getPinnedMessages(roomCode!)
      setPinnedMessages(data || [])
    } catch (error) {
      console.error('Error loading pinned messages:', error)
    }
  }

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode || '')
      setCopied(true)
      toast.success('Room code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy room code')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    sendMessage({
      content: newMessage,
      type: 'text'
    })
    setNewMessage('')
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      sendMessage({
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: result,
        fileName: file.name
      })
      toast.success('File sent!')
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = (imageUrl: string, imageName?: string) => {
    setSelectedImage({ url: imageUrl, name: imageName })
    setShowImageViewer(true)
  }

  const handlePin = async (messageId: string) => {
    try {
      await supabase.pinMessage(roomCode!, messageId)
      await loadPinnedMessages()
      toast.success('Message pinned!')
    } catch (error) {
      toast.error('Failed to pin message')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      sendMessage({
        content: `Audio message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
        type: 'audio'
      })
      setRecordingTime(0)
      toast.success('Audio message sent!')
    } else {
      setIsRecording(true)
      toast.success('Recording started...')
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await supabase.leaveRoom(roomCode!, user?.id!)
      toast.success('Left room successfully!')
      navigate('/join')
    } catch (error) {
      toast.error('Error leaving room')
      navigate('/join')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50'
    }`}>
      <FloatingElements />

      <SecureImageViewer
        isOpen={showImageViewer}
        imageUrl={selectedImage?.url || ''}
        imageName={selectedImage?.name}
        onClose={() => {
          setShowImageViewer(false)
          setSelectedImage(null)
        }}
      />

      <div className="flex-1 flex flex-col relative z-10">
        {showYouTubePlayer && (
          <div className="h-1/2 border-b-2 flex-shrink-0">
            <YouTubePlayer 
              isVisible={showYouTubePlayer}
              onClose={() => setShowYouTubePlayer(false)}
            />
          </div>
        )}

        <div className={`${showYouTubePlayer ? 'h-1/2' : 'h-full'} flex flex-col`}>
          {/* Header */}
          <div className={`p-4 backdrop-blur-md border-b flex-shrink-0 ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-white/80 border-pink-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-lg">
                    <Heart className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Room: {roomCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyRoomCode}
                        className="p-1"
                      >
                        {copied ? <Check className="w-4 h-4 text-pink-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        <span className={isDark ? 'text-white/70' : 'text-gray-600'}>
                          {connectedUsers}/2 users
                        </span>
                      </div>
                      {isConnected && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                          <span className="text-pink-500 font-medium">Connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setShowYouTubePlayer(!showYouTubePlayer)}>
                  <Youtube className="w-5 h-5 mr-2" />
                  {showYouTubePlayer ? 'Close Player' : 'Watch Together'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === user?.id}
                  onImageClick={handleImageClick}
                  supportMarkdown={true}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 z-50">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </AnimatePresence>

          {/* Recording Indicator */}
          {isRecording && (
            <div className={`p-4 backdrop-blur-md border-t ${
              isDark ? 'bg-pink-500/20 border-pink-400/30' : 'bg-pink-100/90 border-pink-200/50'
            }`}>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
                  <Mic className="w-6 h-6 text-pink-500" />
                  <span className="text-pink-600 font-bold text-lg">Recording...</span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleRecording}>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop & Send
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`p-4 backdrop-blur-md border-t ${
            isDark ? 'bg-black/20 border-white/10' : 'bg-white/80 border-pink-200/50'
          }`}>
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-pink-500 hover:bg-pink-100"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-purple-500 hover:bg-purple-100"
                >
                  <Smile className="w-5 h-5" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  className={isRecording ? 'text-pink-500 bg-pink-100' : 'text-pink-500 hover:bg-pink-100'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
              
              <Input
                placeholder={isRecording ? 'Recording audio...' : 'Type your message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isRecording}
                className="flex-1"
              />
              
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || isRecording}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}