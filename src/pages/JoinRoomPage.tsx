import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, LogOut, Shield, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Predefined valid room codes for demo (in production, this would be a server check)
  const validRoomCodes = ['ABC123', 'TEST01', 'DEMO99', 'SECURE', 'CHAT01'];

  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async () => {
    setIsCreating(true);
    const newRoomCode = generateRoomCode();
    
    // Add the new room code to valid codes (simulate server creation)
    validRoomCodes.push(newRoomCode);
    
    try {
      await copyToClipboard(newRoomCode);
      setTimeout(() => {
        navigate(`/room/${newRoomCode}`);
        toast.success(`Room created: ${newRoomCode} (copied to clipboard)`);
        setIsCreating(false);
      }, 1000);
    } catch (error) {
      setIsCreating(false);
      toast.error('Failed to create room');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      throw new Error('Failed to copy to clipboard');
    }
  };

  const validateRoomCode = (code: string): boolean => {
    // Room code must be exactly 6 characters, alphanumeric
    return /^[A-Z0-9]{6}$/.test(code);
  };

  const joinRoom = async () => {
    const upperRoomCode = roomCode.toUpperCase();
    
    if (!validateRoomCode(upperRoomCode)) {
      toast.error('Invalid room code format. Must be exactly 6 characters (letters and numbers only)');
      return;
    }

    setIsJoining(true);
    
    // Simulate server room validation with delay
    setTimeout(() => {
      // Check if room exists in our valid rooms list
      if (validRoomCodes.includes(upperRoomCode)) {
        navigate(`/room/${upperRoomCode}`);
        toast.success(`Joining room ${upperRoomCode}`);
      } else {
        toast.error(`Room "${upperRoomCode}" not found. Please check the code and try again.`);
      }
      setIsJoining(false);
    }, 1500); // Longer delay to simulate real server check
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center backdrop-blur-sm bg-black/10 border-b border-white/10">
        <motion.div 
          className="flex items-center group"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            SecureChat
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            {user?.avatar_url && (
              <img 
                src={user.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-white/30"
              />
            )}
            <span className="text-white/90 font-medium">
              {user?.name || user?.email?.split('@')[0]}
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            size="sm" 
            className="text-white border-white/30 hover:bg-red-500/20 hover:border-red-400/50 backdrop-blur-md group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-16 px-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Ready to Chat
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Securely?
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Create a new private room or join an existing one with a valid room code. 
              Your conversations are end-to-end encrypted and completely private.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Create Room */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 h-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-500 group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <Plus className="w-7 h-7 text-white" />
                    </motion.div>
                    <h2 className="ml-4 text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                      Create New Room
                    </h2>
                  </div>
                  
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    Start a new secure conversation. A unique 6-character room code will be generated 
                    and automatically copied to your clipboard to share with one other person.
                  </p>
                  
                  <Button 
                    onClick={createRoom} 
                    className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-green-500/25 group" 
                    size="lg"
                    isLoading={isCreating}
                  >
                    <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                    {isCreating ? 'Creating Room...' : 'Create & Copy Code'}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Join Room */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-8 h-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-500 group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: -5 }}
                    >
                      <Users className="w-7 h-7 text-white" />
                    </motion.div>
                    <h2 className="ml-4 text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Join Existing Room
                    </h2>
                  </div>
                  
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    Enter a valid 6-character room code shared with you to join 
                    an existing secure conversation. Invalid codes will be rejected.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <Input
                        placeholder="Enter room code (e.g., ABC123)"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="bg-white/10 border-white/30 text-white placeholder-white/50 text-center text-xl tracking-[0.3em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 py-4"
                      />
                      {roomCode && !validateRoomCode(roomCode) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 flex items-center text-red-400 text-sm"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Must be exactly 6 characters
                        </motion.div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={joinRoom} 
                      className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 hover:from-blue-600 hover:via-cyan-600 hover:to-indigo-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-blue-500/25 group" 
                      size="lg"
                      isLoading={isJoining}
                      disabled={!roomCode.trim() || !validateRoomCode(roomCode)}
                    >
                      <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      {isJoining ? 'Validating Room...' : 'Join Room'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Demo Room Codes Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-300/20">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-3">Demo Room Codes (for testing)</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {validRoomCodes.slice(0, 5).map((code) => (
                    <span 
                      key={code}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white font-mono tracking-wider"
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <p className="text-white/70 text-sm mt-3">
                  Try entering one of these codes to test room validation
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {[
              { 
                icon: Shield, 
                title: 'End-to-End Encrypted', 
                desc: 'Military-grade AES-256 encryption',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                icon: Users, 
                title: 'Validated Room Access', 
                desc: 'Only valid room codes are accepted',
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: Copy, 
                title: 'Easy Code Sharing', 
                desc: 'Auto-copy generated room codes',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:from-white/15 hover:to-white/10 transition-all duration-500 group h-full">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-white mb-3 text-xl">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};