import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface PinnedMessage {
  id: string
  content: string
  senderName: string
  pinned_at: string
}

interface PinnedMessagesProps {
  pinnedMessages: PinnedMessage[]
  onUnpin: (messageId: string) => void
  onClose: () => void
}

export const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages,
  onUnpin,
  onClose
}) => {
  if (pinnedMessages.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="sticky top-16 z-20 p-4 bg-pink-50/95 backdrop-blur-md border-b border-pink-200/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Pin className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700">
              Pinned Messages ({pinnedMessages.length})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-pink-600 hover:bg-pink-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {pinnedMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group"
            >
              <Card className="p-3 bg-white/70 border-pink-200/50 hover:bg-white/90 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{message.content}</p>
                    <p className="text-xs text-pink-600 mt-1">
                      Pinned by {message.senderName}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnpin(message.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-500 hover:bg-pink-100 ml-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}