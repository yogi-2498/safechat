import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, LogOut, Shield, Zap, MessageCircle, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { user, signOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = () => {
    const newRoomCode = generateRoomCode();
    navigate(`/room/${newRoomCode}`);
    toast.success(`Room created: ${newRoomCode}`);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    if (roomCode.length !== 6) {
      toast.error('Room code must be 6 characters');
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      navigate(`/room/${roomCode.toUpperCase()}`);
      setIsJoining(false);
    }, 500);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="relative min-h-screen">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">SecureChat</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user?.avatar_url && (
                <img 
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
              )}
              <span className="text-white/70">Welcome, {user?.name || user?.email}</span>
            </div>
            <Button variant="ghost" onClick={toggleTheme} size="sm" className="text-white/80 hover:text-white">
              {isDark ? '☀️' : '🌙'}
            </Button>
            <Button variant="outline" onClick={handleSignOut} size="sm" className="text-white border-white/30">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-24 px-6 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                Ready to Chat
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Securely?
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Create a new private room or join an existing one with a room code. 
                Your conversations are end-to-end encrypted and disappear when you're done.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Create Room */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card variant="glass" className="p-8 h-full">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="ml-4 text-2xl font-bold text-white">Create New Room</h2>
                  </div>
                  
                  <p className="text-white/70 mb-6">
                    Start a new secure conversation. A unique room code will be generated 
                    that you can share with one other person.
                  </p>
                  
                  <Button onClick={createRoom} className="w-full" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Room
                  </Button>
                </Card>
              </motion.div>

              {/* Join Room */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card variant="glass" className="p-8 h-full">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="ml-4 text-2xl font-bold text-white">Join Existing Room</h2>
                  </div>
                  
                  <p className="text-white/70 mb-6">
                    Enter a 6-character room code shared with you to join 
                    an existing secure conversation.
                  </p>
                  
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter room code (e.g., ABC123)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 text-center text-lg tracking-widest"
                    />
                    <Button 
                      onClick={joinRoom} 
                      className="w-full" 
                      size="lg"
                      isLoading={isJoining}
                      disabled={!roomCode.trim()}
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Join Room
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* How to Test on 2 Devices */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <Card variant="glass" className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-6 h-6 text-blue-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Testing on Multiple Devices</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-white/80">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Option 1: Different Browsers</h4>
                    <p className="text-sm">Open the app in Chrome and Firefox (or any two different browsers) on the same computer. Create a room in one browser and join with the code in the other.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Option 2: Incognito/Private Mode</h4>
                    <p className="text-sm">Open one regular window and one incognito/private window. Each will have separate sessions, allowing you to test the two-user functionality.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Option 3: Mobile + Desktop</h4>
                    <p className="text-sm">Access the app on your phone and computer simultaneously. Create a room on one device and join with the code on the other.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Option 4: Share with Friend</h4>
                    <p className="text-sm">Send the room code to a friend or colleague. They can join from their own device to test real-time messaging between different locations.</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Security Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card variant="glass" className="p-6 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">End-to-End Encrypted</h3>
                <p className="text-sm text-white/70">Military-grade encryption keeps your messages private</p>
              </Card>
              
              <Card variant="glass" className="p-6 text-center">
                <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">No Time Limits</h3>
                <p className="text-sm text-white/70">Chat as long as you need without restrictions</p>
              </Card>
              
              <Card variant="glass" className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Rich Media Support</h3>
                <p className="text-sm text-white/70">Send text, images, audio, and files securely</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};