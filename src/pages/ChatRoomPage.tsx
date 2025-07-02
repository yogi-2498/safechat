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
      {/* Security Warning */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 p-2"
      >
        <div className="flex items-center justify-center space-x-2 text-orange-300 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>🔒 Screenshot protection active - This conversation is secure and private</span>
        </div>
      </motion.div>

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
                <span className="text-sm text-green-400">Encrypted & Connected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowYouTubePlayer(true)}
              className="text-white/70 hover:text-white hover:bg-red-500/20 group"
            >
              <Youtube className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Watch Together
            </Button>
            
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
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-select">
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

      {/* YouTube Player */}
      <YouTubePlayer 
        isVisible={showYouTubePlayer}
        onClose={() => setShowYouTubePlayer(false)}
      />

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/20 backdrop-blur-md border-t border-red-500/30"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <Mic className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Recording: {formatTime(recordingTime)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className="text-red-400 hover:bg-red-500/20"
            >
              Stop & Send
            </Button>
          </div>
        </motion.div>
      )}

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
              disabled={isRecording}
            >
              <Paperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-white/70 hover:text-white hover:bg-white/10 group"
              disabled={isRecording}
            >
              <Smile className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={`${isRecording ? 'text-red-400 bg-red-500/20' : 'text-white/70'} hover:text-white hover:bg-white/10 group`}
            >
              {isRecording ? 
                <MicOff className="w-5 h-5 group-hover:scale-110 transition-transform" /> : 
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              }
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowYouTubePlayer(true)}
              className="text-white/70 hover:text-white hover:bg-red-500/20 group"
              disabled={isRecording}
            >
              <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
          
          <Input
            placeholder={isRecording ? 'Recording audio...' : 'Type your encrypted message...'}
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