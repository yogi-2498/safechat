import React from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Pause } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        );
      
      case 'image':
        return (
          <div>
            <img 
              src={message.fileUrl} 
              alt={message.fileName}
              className="rounded-lg max-w-full h-auto mb-2 max-h-64 object-cover"
            />
            <p className="text-xs opacity-70">{message.fileName}</p>
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">{message.fileName}</p>
              <a 
                href={message.fileUrl}
                download={message.fileName}
                className="text-xs opacity-70 hover:opacity-100 underline"
              >
                Download
              </a>
            </div>
          </div>
        );
      
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <motion.div 
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative overflow-hidden ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
            : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Bubble effect on hover */}
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full scale-0"
          whileHover={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
        
        <div className="relative z-10">
          {renderContent()}
          <div className="text-xs opacity-50 mt-2">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};