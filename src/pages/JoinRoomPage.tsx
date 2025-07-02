import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, LogOut, Shield, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, signOut } = useAuth();
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
    copyToClipboard(newRoomCode);
    navigate(`/room/${newRoomCode}`);
    toast.success(`Room created: ${newRoomCode}`);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const validateRoomCode = (code: string): boolean => {
    // Room code must be exactly 6 characters, alphanumeric
    return /^[A-Z0-9]{6}$/.test(code);
  };

  const joinRoom = async () => {
    const upperRoomCode = roomCode.toUpperCase();
    
    if (!validateRoomCode(upperRoomCode)) {
      toast.error('Invalid room code. Must be 6 characters (letters and numbers only)');
      return;
    }

    setIsJoining(true);
    
    // Simulate room validation
    setTimeout(() => {
      // For demo, we'll accept any valid format room code
      // In production, this would check if the room exists
      const validRooms = ['ABC123', 'TEST01', upperRoomCode]; // Accept any valid format
      
      if (validRooms.includes(upperRoomCode) || validateRoomCode(upperRoomCode)) {
        navigate(`/room/${upperRoomCode}`);
        toast.success(`Joining room ${upperRoomCode}`);
      } else {
        toast.error('Room not found or invalid');
      }
      setIsJoining(false);
    }, 1000);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
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
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            size="sm" 
            className="text-white border-white/30 hover:bg-white/10 group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-12 px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
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
              Create a new private room or join an existing one. 
              Your conversations are end-to-end encrypted and completely private.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Room */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 h-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="ml-4 text-2xl font-bold text-white">Create New Room</h2>
                </div>
                
                <p className="text-white/70 mb-6">
                  Start a new secure conversation. A unique 6-character room code will be generated 
                  and automatically copied to your clipboard to share.
                </p>
                
                <Button 
                  onClick={createRoom} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 group" 
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Create & Copy Code
                </Button>
              </Card>
            </motion.div>

            {/* Join Room */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-8 h-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
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
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                  <Button 
                    onClick={joinRoom} 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 group" 
                    size="lg"
                    isLoading={isJoining}
                    disabled={!roomCode.trim()}
                  >
                    <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {isJoining ? 'Validating...' : 'Join Room'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              { icon: Shield, title: 'End-to-End Encrypted', desc: 'Military-grade encryption' },
              { icon: Users, title: '1:1 Private Rooms', desc: 'Only two users per room' },
              { icon: Copy, title: 'Easy Sharing', desc: 'Simple 6-character codes' }
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
                <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.desc}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};