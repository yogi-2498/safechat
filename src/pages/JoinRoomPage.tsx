import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, LogOut, Shield, Heart, Youtube, Moon, Sun, AlertCircle, Check, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { FloatingElements } from '../components/FloatingElements'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { RoomValidationService } from '../services/RoomValidationService'
import toast from 'react-hot-toast'

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [validationSuccess, setValidationSuccess] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const createRoom = async () => {
    if (!user) return
    
    setIsCreating(true)
    
    try {
      console.log('🏗️ Creating new room...')
      const result = await RoomValidationService.createRoom(
        user.id, 
        user.name || user.email?.split('@')[0] || 'User'
      )
      
      console.log('✅ Create room result:', result)
      
      if (!result.success) {
        toast.error(result.message)
        setIsCreating(false)
        return
      }

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(result.roomCode)
        toast.success(`🎉 Room created: ${result.roomCode} (copied to clipboard!)`)
      } catch (clipboardError) {
        toast.success(`🎉 Room created: ${result.roomCode}`)
      }
      
      // Navigate to the room
      setTimeout(() => {
        navigate(`/room/${result.roomCode}`)
        setIsCreating(false)
      }, 1000)
    } catch (error) {
      console.error('❌ Error creating room:', error)
      setIsCreating(false)
      toast.error('Failed to create room')
    }
  }

  const validateRoomCode = async (code: string) => {
    if (!code.trim() || code.length !== 6) {
      setValidationError('')
      setValidationSuccess('')
      return
    }

    setIsValidating(true)
    setValidationError('')
    setValidationSuccess('')
    
    try {
      const validation = await RoomValidationService.validateRoom(code)
      
      if (validation.valid && validation.canJoin) {
        setValidationSuccess(`✓ Room found (${validation.userCount}/2 users)`)
        setValidationError('')
      } else {
        setValidationError(validation.message)
        setValidationSuccess('')
      }
    } catch (error) {
      setValidationError('Failed to validate room')
      setValidationSuccess('')
    } finally {
      setIsValidating(false)
    }
  }

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) {
      setValidationError('Please enter a room code')
      return
    }

    setIsJoining(true)
    setValidationError('')
    
    try {
      console.log('👥 Attempting to join room:', roomCode)
      
      // Validate room first
      const validation = await RoomValidationService.validateRoom(roomCode)
      
      if (!validation.valid) {
        setValidationError(validation.message)
        toast.error(validation.message)
        setIsJoining(false)
        return
      }

      if (!validation.canJoin) {
        setValidationError(validation.message)
        toast.error(validation.message)
        setIsJoining(false)
        return
      }

      // Join the room
      const joinResult = await RoomValidationService.joinRoom(
        roomCode, 
        user.id, 
        user.name || user.email?.split('@')[0] || 'User'
      )
      
      if (!joinResult.success) {
        setValidationError(joinResult.message)
        toast.error(joinResult.message)
        setIsJoining(false)
        return
      }

      toast.success(`💕 Joining secure room ${roomCode.toUpperCase()}`)
      navigate(`/room/${roomCode.toUpperCase()}`)
      
    } catch (error) {
      console.error('❌ Error joining room:', error)
      setValidationError('Failed to join room. Please try again.')
      toast.error('Connection error. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setRoomCode(value)
    setValidationError('')
    setValidationSuccess('')
    
    // Auto-validate when 6 characters are entered
    if (value.length === 6) {
      validateRoomCode(value)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  // Debug function
  const debugShowRooms = async () => {
    const rooms = await RoomValidationService.debugGetAllRooms()
    console.log('🐛 Debug - All rooms:', rooms)
    toast.success(`Debug: ${rooms.count} active rooms (check console)`)
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50'
    }`}>
      <FloatingElements />

      {/* Header */}
      <div className={`relative z-10 p-6 flex justify-between items-center backdrop-blur-sm border-b ${
        isDark 
          ? 'bg-black/30 border-white/10' 
          : 'bg-white/30 border-pink-200/50'
      }`}>
        <motion.div 
          className="flex items-center group"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="relative p-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl shadow-2xl">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>
          <span className={`ml-3 text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-serif`}>
            SafeChat
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`${
                isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-pink-100'
              } backdrop-blur-md`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </motion.div>
          
          {/* Debug button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={debugShowRooms}
              className={`${
                isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-pink-100'
              } backdrop-blur-md`}
              title="Debug: Show all rooms"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </motion.div>
          
          <div className={`flex items-center space-x-3 px-4 py-2 backdrop-blur-md rounded-full border ${
            isDark 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/50 border-pink-200/50'
          }`}>
            {user?.avatar_url && (
              <img 
                src={user.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-pink-300/50"
              />
            )}
            <span className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-700'
            }`}>
              {user?.name || user?.email?.split('@')[0]}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            size="sm" 
            className={`backdrop-blur-md group ${
              isDark 
                ? 'text-white border-white/30 hover:bg-red-500/20 hover:border-red-400/50' 
                : 'text-gray-700 border-pink-300/50 hover:bg-pink-50 hover:border-pink-400/50'
            }`}
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
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif">
              <span className={`bg-gradient-to-r ${
                isDark 
                  ? 'from-pink-400 via-rose-400 to-purple-400' 
                  : 'from-pink-600 via-rose-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                Ready to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                Connect? 💕
              </span>
            </h1>
            <p className={`text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Create a new private room or join an existing one. 
              Share intimate moments with YouTube watch parties and secure messaging.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Create Room */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className={`p-8 h-full backdrop-blur-xl border transition-all duration-500 group relative overflow-hidden shadow-lg hover:shadow-xl ${
                isDark 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                  : 'bg-white/70 border-pink-200/50 hover:bg-white/80'
              }`}>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <Plus className="w-7 h-7 text-white" />
                    </motion.div>
                    <h2 className={`ml-4 text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-serif`}>
                      Create New Room
                    </h2>
                  </div>
                  
                  <p className={`mb-8 text-lg leading-relaxed ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Start a new intimate conversation with screenshot protection and YouTube integration. 
                    A unique 6-character room code will be generated and copied to your clipboard.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-pink-500">
                      <Shield className="w-5 h-5" />
                      <span>End-to-end encryption enabled</span>
                    </div>
                    <div className="flex items-center space-x-3 text-pink-500">
                      <Youtube className="w-5 h-5" />
                      <span>YouTube watch party support</span>
                    </div>
                    <div className="flex items-center space-x-3 text-pink-500">
                      <Heart className="w-5 h-5" fill="currentColor" />
                      <span>Screenshot protection active</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createRoom} 
                    className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-pink-500/25 group" 
                    size="lg"
                    isLoading={isCreating}
                    disabled={isCreating}
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
              <Card className={`p-8 h-full backdrop-blur-xl border transition-all duration-500 group relative overflow-hidden shadow-lg hover:shadow-xl ${
                isDark 
                  ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                  : 'bg-white/70 border-pink-200/50 hover:bg-white/80'
              }`}>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div 
                      className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: -5 }}
                    >
                      <Users className="w-7 h-7 text-white" />
                    </motion.div>
                    <h2 className={`ml-4 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-serif`}>
                      Join Existing Room
                    </h2>
                  </div>
                  
                  <p className={`mb-8 text-lg leading-relaxed ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Enter a valid 6-character room code to join an existing secure conversation. 
                    Room codes are validated in real-time for security.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <Input
                        placeholder="Enter room code (e.g., ABC123)"
                        value={roomCode}
                        onChange={handleRoomCodeChange}
                        maxLength={6}
                        className={`text-center text-xl tracking-[0.3em] font-mono focus:ring-2 transition-all duration-300 py-4 ${
                          isDark 
                            ? 'bg-white/10 border-white/30 text-white placeholder-white/50' 
                            : 'bg-white/60 border-pink-300/50 text-gray-800 placeholder-gray-500'
                        } ${
                          validationError 
                            ? 'border-red-400/50 focus:ring-red-400' 
                            : validationSuccess
                            ? 'border-green-400/50 focus:ring-green-400'
                            : 'focus:border-pink-400 focus:ring-pink-400'
                        }`}
                      />
                      
                      {/* Validation Status */}
                      <div className="absolute -bottom-8 left-0 right-0">
                        {isValidating && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center text-blue-500 text-sm"
                          >
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            Validating...
                          </motion.div>
                        )}
                        
                        {validationError && !isValidating && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center text-red-500 text-sm"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {validationError}
                          </motion.div>
                        )}
                        
                        {validationSuccess && !isValidating && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center text-green-500 text-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {validationSuccess}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={joinRoom} 
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold py-4 text-lg shadow-2xl hover:shadow-purple-500/25 group" 
                        size="lg"
                        isLoading={isJoining}
                        disabled={!roomCode.trim() || !RoomValidationService.validateFormat(roomCode) || isJoining || isValidating}
                      >
                        <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        {isJoining ? 'Joining Room...' : 'Join Secure Room'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <Card className={`p-6 backdrop-blur-xl border ${
              isDark 
                ? 'bg-pink-500/10 border-pink-400/20' 
                : 'bg-pink-50/80 border-pink-200/50'
            }`}>
              <div className="text-center">
                <h3 className={`text-xl font-bold mb-3 font-serif ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  🔒 Real-Time Room System
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-white/70' : 'text-gray-600'
                }`}>
                  Rooms are created and validated in real-time. Only valid room codes that exist 
                  in our secure system can be accessed. All rooms support up to 2 users and 
                  automatically clean up after 24 hours of inactivity.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}