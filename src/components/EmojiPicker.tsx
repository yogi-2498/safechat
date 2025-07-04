import React from 'react'
import { motion } from 'framer-motion'
import { Card } from './ui/Card'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️',
    '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎',
    '💋', '💌', '💐', '🌹', '🌺', '🌸', '🌼', '🌻',
    '✨', '💫', '⭐', '🌟', '💥', '💢', '💦', '💨',
    '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 bg-white/90 backdrop-blur-md border-pink-200/50 max-w-xs shadow-xl">
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {emojis.map((emoji, index) => (
            <motion.button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="p-2 text-lg hover:bg-pink-100 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}