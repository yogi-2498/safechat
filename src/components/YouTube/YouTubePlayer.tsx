import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Youtube, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X,
  ExternalLink,
  Users,
  Clock,
  Eye,
  Loader,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { GlassCard } from '../ui/GlassCard'
import toast from 'react-hot-toast'

interface YouTubePlayerProps {
  onClose: () => void
  isVisible: boolean
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

interface VideoResult {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: string
  channel: string
  description: string
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  onClose, 
  isVisible, 
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VideoResult[]>([])
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [watchingTogether, setWatchingTogether] = useState(false)
  const [viewers, setViewers] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const [volume, setVolume] = useState(50)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const playerRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Enhanced mock YouTube search results
  const mockSearchResults: VideoResult[] = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: '3:33',
      views: '1.4B views',
      channel: 'Rick Astley',
      description: 'The official video for Rick Astley\'s "Never Gonna Give You Up"'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: '4:42',
      views: '8.1B views',
      channel: 'Luis Fonsi',
      description: 'Official Music Video for Despacito'
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen - Bohemian Rhapsody (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
      duration: '5:55',
      views: '1.8B views',
      channel: 'Queen Official',
      description: 'The official video for Queen\'s Bohemian Rhapsody'
    },
    {
      id: 'L_jWHffIx5E',
      title: 'Smash Mouth - All Star (Official Music Video)',
      thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
      duration: '3:20',
      views: '654M views',
      channel: 'Smash Mouth',
      description: 'Official Music Video for All Star by Smash Mouth'
    },
    {
      id: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
      duration: '4:13',
      views: '4.8B views',
      channel: 'officialpsy',
      description: 'PSY - GANGNAM STYLE (강남스타일) M/V'
    },
    {
      id: 'hT_nvWreIhg',
      title: 'The Weeknd - Blinding Lights (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg',
      duration: '4:20',
      views: '1.1B views',
      channel: 'The Weeknd',
      description: 'Official music video for Blinding Lights'
    }
  ]

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Search videos
  const searchVideos = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const searchTerms = searchQuery.toLowerCase().split(' ')
    const filtered = mockSearchResults.filter(video => {
      const searchableText = `${video.title} ${video.channel}`.toLowerCase()
      return searchTerms.some(term => searchableText.includes(term))
    })
    
    const results = filtered.length > 0 ? filtered : mockSearchResults.slice(0, 6)
    
    setSearchResults(results)
    setIsSearching(false)
    
    toast.success(`Found ${results.length} video${results.length !== 1 ? 's' : ''}`)
  }

  // Load video from search results
  const loadVideoFromSearch = (video: VideoResult) => {
    setCurrentVideo(video.id)
    setCurrentVideoTitle(video.title)
    setShowSearch(false)
    setWatchingTogether(true)
    setViewers(Math.floor(Math.random() * 2) + 1)
    setIsPlaying(true)
    setDuration(parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]))
    toast.success(`🎬 Now playing: ${video.title.substring(0, 50)}${video.title.length > 50 ? '...' : ''}`)
  }

  // Load video from URL
  const loadVideoFromUrl = () => {
    const videoId = extractVideoId(searchQuery)
    if (!videoId) {
      toast.error('Invalid YouTube URL. Please enter a valid YouTube video link or search term.')
      return
    }

    setCurrentVideo(videoId)
    setCurrentVideoTitle('YouTube Video')
    setShowSearch(false)
    setWatchingTogether(true)
    setViewers(Math.floor(Math.random() * 2) + 1)
    setIsPlaying(true)
    toast.success('🎬 Video loaded! Now watching together')
  }

  // Handle search/URL input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
      loadVideoFromUrl()
    } else {
      searchVideos()
    }
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (watchingTogether) {
      toast.success(
        isPlaying 
          ? '⏸️ Video paused for both viewers' 
          : '▶️ Video playing for both viewers',
        { duration: 2000 }
      )
    }
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
    setWatchingTogether(false)
    setIsPlaying(false)
  }

  // Load popular videos on mount
  useEffect(() => {
    if (isVisible && searchResults.length === 0) {
      setSearchResults(mockSearchResults.slice(0, 6))
    }
  }, [isVisible])

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${isMinimized ? 'pointer-events-none' : ''}`}
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ 
            scale: isMinimized ? 0.3 : 1, 
            opacity: 1,
            y: 0,
            x: isMinimized ? window.innerWidth / 2 - 200 : 0
          }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute ${isMinimized ? 'top-4 right-4 w-96 h-64' : 'top-4 left-4 right-4 bottom-4'} ${isFullscreen ? 'inset-0' : ''}`}
        >
          <GlassCard className="h-full flex flex-col overflow-hidden bg-black/95 backdrop-blur-xl border-white/20 shadow-2xl">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 border-b border-white/10 flex-shrink-0">
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
                  {watchingTogether && (
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
                  )}
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
                {onToggleMinimize && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleMinimize}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
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

            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Interface */}
                {showSearch && (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <motion.div 
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                      >
                        <Youtube className="w-10 h-10 text-white" />
                      </motion.div>
                      <h4 className="text-2xl font-bold text-white mb-3">Search & Watch Together</h4>
                      <p className="text-white/80 text-lg max-w-2xl mx-auto">
                        Search for any video or paste a YouTube URL to start watching together in real-time
                      </p>
                    </motion.div>
                    
                    <motion.form 
                      onSubmit={handleSearchSubmit} 
                      className="flex space-x-3 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Input
                        placeholder="Search videos or paste YouTube URL..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 text-lg py-3"
                        icon={<Search className="w-5 h-5" />}
                      />
                      <Button
                        type="submit"
                        disabled={!searchQuery.trim() || isSearching}
                        isLoading={isSearching}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6"
                        size="lg"
                      >
                        {isSearching ? (
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                        ) : searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be') ? (
                          <Play className="w-5 h-5 mr-2" />
                        ) : (
                          <Search className="w-5 h-5 mr-2" />
                        )}
                        {isSearching ? 'Searching...' : 
                         searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be') ? 'Load Video' : 'Search'}
                      </Button>
                    </motion.form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xl font-bold text-white">
                            {searchQuery ? `Results for "${searchQuery}"` : 'Popular Videos'}
                          </h5>
                          <span className="text-white/60 text-sm">
                            {searchResults.length} video{searchResults.length !== 1 ? 's' : ''} found
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {searchResults.map((video, index) => (
                            <motion.div
                              key={video.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.03, y: -5 }}
                              className="group cursor-pointer"
                              onClick={() => loadVideoFromSearch(video)}
                            >
                              <GlassCard className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:border-red-500/30 overflow-hidden">
                                <div className="relative mb-4 overflow-hidden rounded-lg">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{video.duration}</span>
                                  </div>
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <motion.div
                                      initial={{ scale: 0.8 }}
                                      whileHover={{ scale: 1 }}
                                      className="bg-red-500 rounded-full p-3 shadow-2xl"
                                    >
                                      <Play className="w-6 h-6 text-white" />
                                    </motion.div>
                                  </div>
                                </div>
                                <h6 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-red-300 transition-colors leading-tight">
                                  {video.title}
                                </h6>
                                <div className="flex items-center justify-between text-xs text-white/60">
                                  <span className="truncate mr-2">{video.channel}</span>
                                  <div className="flex items-center space-x-1 flex-shrink-0">
                                    <Eye className="w-3 h-3" />
                                    <span>{video.views}</span>
                                  </div>
                                </div>
                              </GlassCard>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Video Player */}
                {currentVideo && !showSearch && (
                  <div className="flex-1 flex flex-col">
                    <div className="relative flex-1 bg-black">
                      <iframe
                        ref={playerRef}
                        src={`https://www.youtube.com/embed/${currentVideo}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&iv_load_policy=3`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video Player"
                      />
                      
                      {/* Enhanced Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
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

                        <div className="flex items-center justify-between mb-4">
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
                            
                            <div className="flex items-center space-x-3 text-white/80">
                              <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="font-medium">{viewers} watching</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="w-3 h-3 bg-green-400 rounded-full"
                                />
                                <span className="text-green-400 font-medium">Live Sync</span>
                              </div>
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
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-white hover:bg-white/20 p-3"
                              >
                                <Maximize className="w-5 h-5" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                        
                        {currentVideoTitle && (
                          <div className="bg-black/50 backdrop-blur-md rounded-lg p-3">
                            <p className="text-white font-semibold text-lg truncate">{currentVideoTitle}</p>
                            <p className="text-white/60 text-sm">Playing for {viewers} viewer{viewers !== 1 ? 's' : ''}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}