import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Paperclip
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageBubble } from '../components/MessageBubble';
import { EmojiPicker } from '../components/EmojiPicker';
import toast from 'react-hot-toast';

export const ChatRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sendMessage, isConnected, connectedUsers } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Copy room code
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode || '');
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy room code');
    }
  };

  // Send text message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage({
      content: newMessage,
      type: 'text'
    });
    setNewMessage('');
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      sendMessage({
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: result,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Leave room
  const handleLeaveRoom = () => {
    toast.success('Left room successfully');
    navigate('/join');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 group">
              <Shield className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-white">Room: {roomCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomCode}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 group"
              >
                {copied ? 
                  <Check className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" /> : 
                  <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                }
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/70">{connectedUsers}/2 users</span>
            </div>
            
            {isConnected && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Connected</span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-white border-white/30 hover:bg-red-500/20 hover:border-red-500/50 group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Leave
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user?.id}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-4 z-50"
          >
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10"
      >
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-white/70 hover:text-white hover:bg-white/10 group"
            >
              <Paperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-white/70 hover:text-white hover:bg-white/10 group"
            >
              <Smile className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={`${isRecording ? 'text-red-400 bg-red-500/20' : 'text-white/70'} hover:text-white hover:bg-white/10 group`}
            >
              {isRecording ? 
                <MicOff className="w-5 h-5 group-hover:scale-110 transition-transform" /> : 
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              }
            </Button>
          </div>
          
          <Input
            placeholder={isRecording ? 'Recording...' : 'Type your message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isRecording}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          />
          
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isRecording}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group"
          >
            <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </form>
        
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center justify-center"
          >
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-sm">Recording audio...</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};