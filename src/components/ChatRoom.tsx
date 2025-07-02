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
  Play,
  Pause,
  Download,
  X,
  Copy,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useScreenshotPrevention } from '../hooks/useScreenshotPrevention';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { E2EEncryption } from '../lib/encryption';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  type: 'text' | 'image' | 'audio' | 'file';
  created_at: string;
  file_url?: string;
  file_name?: string;
}

export const ChatRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Screenshot prevention
  useScreenshotPrevention();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Audio recording
  const { isRecording, audioBlob, recordingTime, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize room and encryption
  useEffect(() => {
    if (!user || !roomCode) return;

    const initializeRoom = async () => {
      try {
        // Generate encryption keys
        await E2EEncryption.generateKeyPair();
        await E2EEncryption.generateRoomKey();
        
        setIsConnected(true);
        toast.success(`Connected to room ${roomCode}`);
        
        // Simulate user count (in real app, this would be managed by backend)
        setConnectedUsers(1);
      } catch (error) {
        console.error('Error initializing room:', error);
        toast.error('Failed to connect to room');
      }
    };

    initializeRoom();

    return () => {
      E2EEncryption.clearKeys();
    };
  }, [user, roomCode]);

  // Format time
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
      toast.success('Room code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy room code');
    }
  };

  // Send message
  const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
    if (!content.trim() && type === 'text') return;

    try {
      // For demo purposes, we'll store messages in plain text
      // In production, this would be encrypted
      const message: Message = {
        id: Date.now().toString(),
        content: content,
        sender_id: user!.id,
        type,
        created_at: new Date().toISOString(),
        file_url: fileUrl,
        file_name: fileName,
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle text message submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      if (file.type.startsWith('image/')) {
        sendMessage(file.name, 'image', result, file.name);
      } else {
        sendMessage(file.name, 'file', result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle audio recording
  const handleSendAudio = () => {
    if (audioBlob) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        sendMessage(`Audio message (${formatTime(recordingTime)})`, 'audio', result);
        clearRecording();
      };
      reader.readAsDataURL(audioBlob);
    }
  };

  // Play/pause audio
  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    if (playingAudio === messageId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(messageId);
      }
    }
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    toast.success('Room closed. All messages deleted.');
    navigate('/dashboard');
  };

  // Render message
  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender_id === user?.id;
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
            : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
        }`}>
          {message.type === 'text' && (
            <ReactMarkdown className="prose prose-sm prose-invert">
              {message.content}
            </ReactMarkdown>
          )}
          
          {message.type === 'image' && (
            <div>
              <img 
                src={message.file_url} 
                alt={message.file_name}
                className="rounded-lg max-w-full h-auto mb-2"
              />
              <p className="text-xs opacity-70">{message.file_name}</p>
            </div>
          )}
          
          {message.type === 'audio' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAudioPlayback(message.id, message.file_url!)}
                className="p-1"
              >
                {playingAudio === message.id ? 
                  <Pause className="w-4 h-4" /> : 
                  <Play className="w-4 h-4" />
                }
              </Button>
              <span className="text-sm">{message.content}</span>
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">{message.file_name}</p>
                <a 
                  href={message.file_url}
                  download={message.file_name}
                  className="text-xs opacity-70 hover:opacity-100 underline"
                >
                  Download
                </a>
              </div>
            </div>
          )}
          
          <div className="text-xs opacity-50 mt-1">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-white">Room: {roomCode}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomCode}
                className="text-white/70 hover:text-white p-1"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveRoom}
              className="text-white border-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />

      {/* Audio Recording Preview */}
      {audioBlob && (
        <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-green-400" />
                <span className="text-white">Audio recorded ({formatTime(recordingTime)})</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={clearRecording}>
                  <X className="w-4 h-4" />
                </Button>
                <Button variant="primary" size="sm" onClick={handleSendAudio}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-4"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-white/70 hover:text-white"
            >
              <Image className="w-5 h-5" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-white/70 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className={`${isRecording ? 'text-red-400' : 'text-white/70'} hover:text-white`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          </div>
          
          <Input
            placeholder={isRecording ? 'Recording...' : 'Type your message... (Markdown supported)'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isRecording}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
          />
          
          <Button type="submit" disabled={!newMessage.trim() || isRecording}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        {isRecording && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-sm">Recording... {formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
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
  );
};