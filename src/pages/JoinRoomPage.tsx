import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, LogOut, Shield, Copy, Check, AlertCircle, Youtube } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RoomValidationService } from '../services/RoomValidationService';
import toast from 'react-hot-toast';

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const createRoom = async () => {
    setIsCreating(true);
    
    try {
      const newRoomCode = RoomValidationService.generateRoomCode();
      
      // Add the new room to valid rooms
      RoomValidationService.addRoomCode(newRoomCode);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(newRoomCode);
      
      // Navigate to room
      setTimeout(() => {
        navigate(`/room/${newRoomCode}`);
        toast.success(`🎉 Room created: ${newRoomCode} (copied to clipboard)`);
        setIsCreating(false);
      }, 1000);
    } catch (error) {
      setIsCreating(false);
      toast.error('Failed to create room');
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      setValidationError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setValidationError('');
    
    try {
      // Validate room code
      const validation = await RoomValidationService.validateRoom(roomCode);
      
      if (!validation.valid) {
        setValidationError(validation.message);
        toast.error(validation.message);
        setIsJoining(false);
        return;
      }

      // Check room capacity
      const capacity = await RoomValidationService.checkRoomCapacity(roomCode);
      
      if (!capacity.canJoin) {
        setValidationError('Room is full (maximum 2 users)');
        toast.error('Room is full. Please try another room.');
        setIsJoining(false);
        return;
      }

      // Success - navigate to room
      navigate(`/room/${roomCode.toUpperCase()}`);
      toast.success(`🔐 Joining secure room ${roomCode.toUpperCase()}`);
      
    } catch (error) {
      setValidationError('Failed to validate room. Please try again.');
      toast.error('Connection error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRoomCode(value);
    setValidationError('');
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
              Features screenshot protection, YouTube watch parties, and end-to-end encryption.
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
                    Start a new secure conversation with screenshot protection and YouTube integration. 
                    A unique 6-character room code will be generated and copied to your clipboard.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-green-300">
                      <Shield className="w-5 h-5" />
                      <span>End-to-end encryption enabled</span>
                    </div>
                    <div className="flex items-center space-x-3 text-green-300">
                      <Youtube className="w-5 h-5" />
                      <span>YouTube watch party support</span>
                    </div>
                    <div className="flex items-center space-x-3 text-green-300">
                      <AlertCircle className="w-5 h-5" />
                      <span>Screenshot protection active</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createRoom} 
                    className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-green-500/25 group" 
                    size="lg"
                    isLoading={isCreating}
                  >
                    <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                    {isCreating ? 'Creating Secure Room...' : 'Create & Copy Code'}
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
                    Enter a valid 6-character room code to join an existing secure conversation. 
                    Invalid or non-existent codes will be rejected for security.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <Input
                        placeholder="Enter room code (e.g., ABC123)"
                        value={roomCode}
                        onChange={handleRoomCodeChange}
                        maxLength={6}
                        className={`bg-white/10 border-white/30 text-white placeholder-white/50 text-center text-xl tracking-[0.3em] font-mono focus:ring-2 focus:border-blue-500 transition-all duration-300 py-4 ${
                          validationError ? 'border-red-500/50 focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                      />
                      {validationError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-0 flex items-center text-red-400 text-sm"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationError}
                        </motion.div>
                      )}
                      {roomCode && !validationError && RoomValidationService.validateFormat(roomCode) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-0 flex items-center text-green-400 text-sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Valid format
                        </motion.div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={joinRoom} 
                      className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 hover:from-blue-600 hover:via-cyan-600 hover:to-indigo-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-blue-500/25 group" 
                      size="lg"
                      isLoading={isJoining}
                      disabled={!roomCode.trim() || !RoomValidationService.validateFormat(roomCode)}
                    >
                      <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      {isJoining ? 'Validating Room...' : 'Join Secure Room'}
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
                  {RoomValidationService.getValidCodes().slice(0, 5).map((code) => (
                    <motion.button
                      key={code}
                      onClick={() => setRoomCode(code)}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white font-mono tracking-wider hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {code}
                    </motion.button>
                  ))}
                </div>
                <p className="text-white/70 text-sm mt-3">
                  Click any code above to test room validation, or create your own room
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16"
          >
            {[
              { 
                icon: Shield, 
                title: 'E2E Encrypted', 
                desc: 'Military-grade AES-256 encryption',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                icon: AlertCircle, 
                title: 'Screenshot Protected', 
                desc: 'Advanced screenshot prevention',
                gradient: 'from-orange-500 to-red-500'
              },
              { 
                icon: Youtube, 
                title: 'Watch Together', 
                desc: 'Synchronized YouTube viewing',
                gradient: 'from-red-500 to-pink-500'
              },
              { 
                icon: Users, 
                title: 'Validated Access', 
                desc: 'Strict room code validation',
                gradient: 'from-blue-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:from-white/15 hover:to-white/10 transition-all duration-500 group h-full">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};