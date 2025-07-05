import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Play, Pause, ImageIcon, Shield, Heart } from 'lucide-react'
import { Message } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  onImageClick?: (imageUrl: string, imageName?: string) => void
  supportMarkdown?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  onImageClick,
  supportMarkdown = false
}) => {
  const { isDark } = useTheme()

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return supportMarkdown ? (
          <div className={`prose prose-sm max-w-none ${
            isOwnMessage 
              ? 'prose-invert' 
              : isDark ? 'prose-invert' : 'prose-gray'
          }`}>
            <ReactMarkdown 
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className={`px-1 py-0.5 rounded text-sm ${
                    isOwnMessage 
                      ? 'bg-white/20 text-white' 
                      : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {children}
                  </code>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`underline hover:no-underline ${
                      isOwnMessage 
                        ? 'text-pink-200 hover:text-white' 
                        : 'text-pink-500 hover:text-pink-600'
                    }`}
                  >
                    {children}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        )
      
      case 'image':
        return (
          <div className="group">
            <motion.div
              className="relative cursor-pointer overflow-hidden rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => onImageClick?.(message.fileUrl!, message.fileName)}
            >
              <img 
                src={message.fileUrl} 
                alt={message.fileName}
                className="rounded-xl max-w-full h-auto mb-2 max-h-64 object-cover transition-all duration-300 group-hover:brightness-110 select-none pointer-events-none"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitUserDrag: 'none',
                  WebkitTouchCallout: 'none'
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
              />
              
              {/* Hover overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                  className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30"
                >
                  <ImageIcon className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Security indicator */}
              <div className="absolute top-2 left-2 bg-pink-500/20 border border-pink-500/30 backdrop-blur-md text-pink-300 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Protected</span>
              </div>
              
              {/* Click indicator */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view
              </div>
            </motion.div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs opacity-70 truncate flex-1">{message.fileName}</p>
              <div className="flex items-center space-x-1 text-xs opacity-60">
                <Shield className="w-3 h-3" />
                <span>No download</span>
              </div>
            </div>
          </div>
        )
      
      case 'file':
        return (
          <motion.div 
            className={`flex items-center space-x-3 p-4 rounded-xl border transition-colors cursor-pointer group ${
              isDark 
                ? 'bg-white/10 border-pink-200/30 hover:bg-white/15' 
                : 'bg-white/10 border-pink-200/30 hover:bg-white/15'
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
              <Download className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isOwnMessage ? 'text-white' : isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {message.fileName}
              </p>
              <a 
                href={message.fileUrl}
                download={message.fileName}
                className="text-xs text-pink-500 hover:text-pink-600 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Download file
              </a>
            </div>
          </motion.div>
        )
      
      case 'audio':
        return (
          <motion.div 
            className={`flex items-center space-x-3 p-4 rounded-xl border transition-colors group ${
              isDark 
                ? 'bg-white/10 border-pink-200/30 hover:bg-white/15' 
                : 'bg-white/10 border-pink-200/30 hover:bg-white/15'
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors"
            >
              <Play className="w-6 h-6 text-pink-400" />
            </motion.button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isOwnMessage ? 'text-white' : isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {message.content}
              </p>
              <p className={`text-xs ${
                isOwnMessage ? 'text-white/70' : isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                Audio message
              </p>
            </div>
          </motion.div>
        )
      
      default:
        return <p>{message.content}</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <motion.div 
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative overflow-hidden group ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
            : isDark 
              ? 'bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-md'
              : 'bg-white/90 backdrop-blur-md text-gray-800 border border-pink-200/50 shadow-md'
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {/* Bubble effect on hover */}
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full scale-0"
          whileHover={{ 
            scale: 2, 
            opacity: [0.3, 0] 
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 -skew-x-12"
          whileHover={{ 
            opacity: [0, 1, 0],
            x: ['-100%', '100%']
          }}
          transition={{ duration: 0.8 }}
        />
        
        <div className="relative z-10">
          {renderContent()}
          <div className="text-xs opacity-60 mt-2 flex items-center justify-between">
            <span>{formatTime(message.timestamp)}</span>
            {isOwnMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-1"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-pink-200 rounded-full"
                  title="Delivered & Encrypted"
                />
                <Heart className="w-3 h-3" fill="currentColor" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}