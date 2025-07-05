import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Youtube, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X,
  ExternalLink,
  Users,
  SkipBack,
  SkipForward,
  Maximize
} from 'lucide-react'
import { Button } from '../ui/Button'
import { YouTubeSearch } from './YouTubeSearch'
import { Card } from '../ui/Card'
import toast from 'react-hot-toast'

interface YouTubePlayerProps {
  onClose: () => void
  isVisible: boolean
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  onClose, 
  isVisible
}) => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const [volume, setVolume] = useState(50)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [viewers] = useState(2)
  
  const playerRef = useRef<HTMLIFrameElement>(null)

  // Load video from search
  const handleVideoSelect = (videoId: string, title: string) => {
    setCurrentVideo(videoId)
    setCurrentVideoTitle(title)
    setShowSearch(false)
    setIsPlaying(true)
    setDuration(Math.floor(Math.random() * 300) + 120) // Random duration 2-7 minutes
    toast.success(`🎬 Now playing: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`)
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    toast.success(
      isPlaying 
        ? '⏸️ Video paused for both viewers' 
        : '▶️ Video playing for both viewers',
      { duration: 2000 }
    )
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast.success(isMuted ? '🔊 Audio enabled' : '🔇 Audio muted', { duration: 1500 })
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Go back to search
  const goBackToSearch = () => {
    setShowSearch(true)
    setCurrentVideo(null)
    setCurrentVideoTitle('')
    setIsPlaying(false)
  }

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentVideo) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentVideo, duration])

  if (!isVisible) return null

  return (
    <div className="w-full h-full relative bg-black">
      <Card className="h-full flex flex-col overflow-hidden bg-black border-none rounded-none">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 border-b border-white/10 flex-shrink-0 relative z-10">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Youtube className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">YouTube Together</h3>
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{viewers} watching</span>
                </div>
                <div className="flex items-center space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  <span className="text-green-400 font-medium">Synced</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentVideo && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBackToSearch}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-red-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Interface */}
          {showSearch && (
            <YouTubeSearch
              onVideoSelect={handleVideoSelect}
              onClose={onClose}
            />
          )}

          {/* Video Player */}
          {currentVideo && !showSearch && (
            <div className="flex-1 flex flex-col relative">
              {/* Video Container - Fixed aspect ratio */}
              <div className="relative flex-1 bg-black min-h-0">
                <iframe
                  ref={playerRef}
                  src={`https://www.youtube.com/embed/${currentVideo}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&iv_load_policy=3`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video Player"
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 text-white/80 text-sm mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 bg-white/20 rounded-full h-1 relative">
                        <motion.div
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                          className="text-white hover:bg-white/20 p-3"
                        >
                          <SkipBack className="w-6 h-6" />
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayPause}
                          className="text-white hover:bg-white/20 p-3"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                          className="text-white hover:bg-white/20 p-3"
                        >
                          <SkipForward className="w-6 h-6" />
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-white hover:bg-white/20 p-3"
                        >
                          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </Button>
                      </motion.div>

                      {/* Volume Slider */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(parseInt(e.target.value))}
                          className="w-20 h-1 bg-white/20 rounded-full appearance-none slider"
                        />
                        <span className="text-white/60 text-sm w-8">{volume}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://youtube.com/watch?v=${currentVideo}`, '_blank')}
                          className="text-white hover:bg-white/20 p-3"
                          title="Open in YouTube"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-3"
                        >
                          <Maximize className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  {currentVideoTitle && (
                    <div className="mt-4 bg-black/50 backdrop-blur-md rounded-lg p-3">
                      <p className="text-white font-semibold text-lg truncate">{currentVideoTitle}</p>
                      <p className="text-white/60 text-sm">Playing for {viewers} viewer{viewers !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}