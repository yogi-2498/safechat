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
  Paperclip,
  Youtube,
  Play,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageBubble } from '../components/MessageBubble';
import { EmojiPicker } from '../components/EmojiPicker';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { useScreenshotPrevention } from '../hooks/useScreenshotPrevention';
import toast from 'react-hot-toast';

export const ChatRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sendMessage, isConnected, connectedUsers } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enable screenshot prevention
  useScreenshotPrevention();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      toast.success(`${file.type.startsWith('image/') ? 'Image' : 'File'} sent successfully!`);
    };
    reader.readAsDataURL(file);
  };

  // Handle audio recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate sending audio message
      sendMessage({
        content: `Audio message (${formatTime(recordingTime)})`,
        type: 'audio'
      });
      toast.success('Audio message sent!');
    } else {
      setIsRecording(true);
      toast.success('Recording started...');
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    toast.success('Left room successfully');
    navigate('/join');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 secure-content no-select">
      {/* Enhanced Security Warning */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 p-3"
      >
        <div className="flex items-center justify-center space-x-3 text-orange-300">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <AlertTriangle className="w-5 h-5" />
          </motion.div>
          <span className="text-sm font-medium">
            🔒 Advanced Security Active: Screenshot protection, encryption, and privacy mode enabled
          </span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div 
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              >
                <Shield className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-lg">Room: {roomCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomCode}
                    className="text-white/70 hover:text-white p-1 hover:bg-white/10 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copied ? 
                        <Check className="w-4 h-4 text-green-400" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </motion.div>
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70">{connectedUsers}/2 users</span>
                  </div>
                  {isConnected && (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <span className="text-green-400 font-medium">E2E Encrypted</span>
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
                onClick={() => setShowYouTubePlayer(true)}
                className="text-white/70 hover:text-white hover:bg-red-500/20 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Youtube className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Watch Together</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveRoom}
                className="text-white border-white/30 hover:bg-red-500/20 hover:border-red-500/50 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Leave</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area with Enhanced Styling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-select relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
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
      </div>

      {/* Enhanced Emoji Picker */}
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

      {/* Enhanced YouTube Player */}
      <YouTubePlayer 
        isVisible={showYouTubePlayer}
        onClose={() => setShowYouTubePlayer(false)}
      />

      {/* Enhanced Recording Indicator */}
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border-t border-red-500/30"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 bg-red-500 rounded-full"
              />
              <Mic className="w-6 h-6 text-red-400" />
              <span className="text-red-400 font-bold text-lg">Recording: {formatTime(recordingTime)}</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className="text-red-400 hover:bg-red-500/20 border border-red-400/30"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop & Send
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10"
      >
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {[
              { 
                icon: Paperclip, 
                onClick: () => fileInputRef.current?.click(), 
                color: 'text-blue-400 hover:bg-blue-500/20',
                tooltip: 'Attach file'
              },
              { 
                icon: Image, 
                onClick: () => fileInputRef.current?.click(), 
                color: 'text-green-400 hover:bg-green-500/20',
                tooltip: 'Send image'
              },
              { 
                icon: Smile, 
                onClick: () => setShowEmojiPicker(!showEmojiPicker), 
                color: 'text-yellow-400 hover:bg-yellow-500/20',
                tooltip: 'Add emoji'
              },
              { 
                icon: isRecording ? MicOff : Mic, 
                onClick: toggleRecording, 
                color: isRecording ? 'text-red-400 bg-red-500/20' : 'text-purple-400 hover:bg-purple-500/20',
                tooltip: isRecording ? 'Stop recording' : 'Record audio'
              },
              { 
                icon: Youtube, 
                onClick: () => setShowYouTubePlayer(true), 
                color: 'text-red-400 hover:bg-red-500/20',
                tooltip: 'Watch together'
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
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full scale-0"
                    whileHover={{ scale: 2, opacity: [0.3, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                  <button.icon className="w-5 h-5 relative z-10" />
                </Button>
              </motion.div>
            ))}
          </div>
          
          <Input
            placeholder={isRecording ? 'Recording audio...' : 'Type your encrypted message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isRecording}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          />
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isRecording}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full scale-0"
                whileHover={{ scale: 2, opacity: [0.3, 0] }}
                transition={{ duration: 0.6 }}
              />
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
            </Button>
          </motion.div>
        </form>
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