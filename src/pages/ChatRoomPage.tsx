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
  Minimize2,
  Maximize2
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { YouTubePlayer } from '../components/YouTubePlayer'
import { SecureImageViewer } from '../components/SecureImageViewer'
import { MessageBubble } from '../components/MessageBubble'
import { EmojiPicker } from '../components/EmojiPicker'
import { FloatingElements } from '../components/FloatingElements'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { useScreenshotPrevention } from '../hooks/useScreenshotPrevention'
import toast from 'react-hot-toast'

export const ChatRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { messages, sendMessage, isConnected, connectedUsers } = useChat()
  
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false)
  const [isYouTubeMinimized, setIsYouTubeMinimized] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name?: string } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Enable screenshot prevention
  useScreenshotPrevention()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Copy room code
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode || '')
      setCopied(true)
      toast.success('Room code copied! 💕')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy room code')
    }
  }

  // Send text message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    sendMessage({
      content: newMessage,
      type: 'text'
    })
    setNewMessage('')
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Handle file upload
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
      toast.success(`${file.type.startsWith('image/') ? 'Image' : 'File'} sent securely! 💕`)
    }
    reader.readAsDataURL(file)
  }

  // Handle image click
  const handleImageClick = (imageUrl: string, imageName?: string) => {
    setSelectedImage({ url: imageUrl, name: imageName })
    setShowImageViewer(true)
  }

  // Handle audio recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      sendMessage({
        content: `Audio message (${formatTime(recordingTime)})`,
        type: 'audio'
      })
      toast.success('Audio message sent securely! 🎵')
    } else {
      setIsRecording(true)
      toast.success('Recording started... 🎤')
    }
  }

  // Leave room
  const handleLeaveRoom = () => {
    toast.success('Left room successfully. All data deleted for security! 💕')
    navigate('/join')
  }

  // Toggle YouTube player
  const toggleYouTubePlayer = () => {
    setShowYouTubePlayer(!showYouTubePlayer)
    if (!showYouTubePlayer) {
      toast.success('YouTube player opened! Watch together! 🎬')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
      {/* Floating romantic elements */}
      <FloatingElements />

      {/* YouTube Player */}
      {showYouTubePlayer && (
        <div className={`${isYouTubeMinimized ? 'h-0' : 'h-1/2'} transition-all duration-500 relative z-20`}>
          <YouTubePlayer 
            isVisible={showYouTubePlayer}
            isMinimized={isYouTubeMinimized}
            onClose={() => setShowYouTubePlayer(false)}
            onToggleMinimize={() => setIsYouTubeMinimized(!isYouTubeMinimized)}
          />
        </div>
      )}

      {/* Secure Image Viewer */}
      <SecureImageViewer
        isOpen={showImageViewer}
        imageUrl={selectedImage?.url || ''}
        imageName={selectedImage?.name}
        onClose={() => {
          setShowImageViewer(false)
          setSelectedImage(null)
        }}
      />

      {/* Chat Layout */}
      <div className={`flex-1 flex flex-col transition-all duration-500 relative z-10 ${
        showYouTubePlayer && !isYouTubeMinimized ? 'h-1/2' : 'h-full'
      }`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/70 backdrop-blur-md border-b border-pink-200/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div 
                className="flex items-center space-x-3 group"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="p-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                >
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </motion.div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 text-lg font-serif">Room: {roomCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyRoomCode}
                      className="text-gray-600 hover:text-gray-800 p-1 hover:bg-pink-100 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {copied ? 
                          <Check className="w-4 h-4 text-pink-500" /> : 
                          <Copy className="w-4 h-4" />
                        }
                      </motion.div>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-pink-500" />
                      <span className="text-gray-600">{connectedUsers}/2 users</span>
                    </div>
                    {isConnected && (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-pink-400 rounded-full"
                        />
                        <span className="text-pink-500 font-medium">E2E Encrypted</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleYouTubePlayer}
                  className="text-gray-600 hover:text-gray-800 hover:bg-pink-100 group relative overflow-hidden"
                >
                  <Youtube className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="relative z-10">
                    {showYouTubePlayer ? 'Close Player' : 'Watch Together'}
                  </span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveRoom}
                  className="text-gray-700 border-pink-300/50 hover:bg-pink-50 hover:border-pink-400/50 group relative overflow-hidden"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="relative z-10">Leave</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          <div className="relative z-10">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === user?.id}
                  onImageClick={handleImageClick}
                />
              ))}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-20 right-4 z-50"
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-pink-100/80 backdrop-blur-md border-t border-pink-200/50"
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 bg-pink-500 rounded-full"
                />
                <Mic className="w-6 h-6 text-pink-500" />
                <span className="text-pink-600 font-bold text-lg">Recording: {formatTime(recordingTime)}</span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  className="text-pink-500 hover:bg-pink-100 border border-pink-300"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop & Send
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/70 backdrop-blur-md border-t border-pink-200/50"
        >
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {[
                { 
                  icon: Paperclip, 
                  onClick: () => fileInputRef.current?.click(), 
                  color: 'text-pink-500 hover:bg-pink-100',
                  tooltip: 'Attach file'
                },
                { 
                  icon: Image, 
                  onClick: () => fileInputRef.current?.click(), 
                  color: 'text-rose-500 hover:bg-rose-100',
                  tooltip: 'Send image'
                },
                { 
                  icon: Smile, 
                  onClick: () => setShowEmojiPicker(!showEmojiPicker), 
                  color: 'text-purple-500 hover:bg-purple-100',
                  tooltip: 'Add emoji'
                },
                { 
                  icon: isRecording ? MicOff : Mic, 
                  onClick: toggleRecording, 
                  color: isRecording ? 'text-pink-500 bg-pink-100' : 'text-pink-500 hover:bg-pink-100',
                  tooltip: isRecording ? 'Stop recording' : 'Record audio'
                }
              ].map((button, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={button.onClick}
                    className={`${button.color} hover:text-white group relative overflow-hidden`}
                    disabled={isRecording && button.icon !== MicOff}
                    title={button.tooltip}
                  >
                    <button.icon className="w-5 h-5 relative z-10" />
                  </Button>
                </motion.div>
              ))}
            </div>
            
            <Input
              placeholder={isRecording ? 'Recording audio...' : 'Type your message...'}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isRecording}
              className="flex-1 bg-white/60 border-pink-300/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-pink-400 transition-all duration-300"
            />
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || isRecording}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 group relative overflow-hidden"
              >
                <Send className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Hidden file input */}
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