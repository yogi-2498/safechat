import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reply, Heart, Pin, MoreHorizontal, Smile } from 'lucide-react'
import { Button } from '../ui/Button'
import { EmojiPicker } from '../EmojiPicker'

interface MessageActionsProps {
  messageId: string
  isOwnMessage: boolean
  isPinned: boolean
  reactions: Record<string, string[]>
  onReply: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
  onPin: (messageId: string) => void
  onClose: () => void
  position: { x: number; y: number }
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  isOwnMessage,
  isPinned,
  reactions,
  onReply,
  onReact,
  onPin,
  onClose,
  position
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const quickEmojis = ['❤️', '😍', '😘', '🥰', '💕', '💖', '🔥', '👍']

  const handleEmojiSelect = (emoji: string) => {
    onReact(messageId, emoji)
    setShowEmojiPicker(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-50 bg-white/95 backdrop-blur-xl border border-pink-200/50 rounded-2xl shadow-2xl p-2"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.max(position.y - 100, 10)
        }}
      >
        {/* Quick Emoji Reactions */}
        <div className="flex items-center space-x-1 mb-2 p-2 bg-pink-50/50 rounded-xl">
          {quickEmojis.map((emoji) => (
            <motion.button
              key={emoji}
              onClick={() => handleEmojiSelect(emoji)}
              className="p-2 hover:bg-pink-100 rounded-lg transition-colors text-lg"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {emoji}
            </motion.button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-pink-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReply(messageId)
              onClose()
            }}
            className="justify-start text-gray-700 hover:bg-pink-50"
          >
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="justify-start text-gray-700 hover:bg-pink-50"
          >
            <Smile className="w-4 h-4 mr-2" />
            React
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onPin(messageId)
              onClose()
            }}
            className="justify-start text-gray-700 hover:bg-pink-50"
          >
            <Pin className={`w-4 h-4 mr-2 ${isPinned ? 'text-pink-500' : ''}`} />
            {isPinned ? 'Unpin' : 'Pin'} Message
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}