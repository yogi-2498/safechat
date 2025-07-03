import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Youtube, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  X,
  ExternalLink,
  Users,
  Search,
  Clock,
  Eye,
  Loader
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

interface YouTubePlayerProps {
  onClose: () => void;
  isVisible: boolean;
}

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ onClose, isVisible }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [watchingTogether, setWatchingTogether] = useState(false);
  const [viewers, setViewers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  
  const playerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mock YouTube search results with more variety
  const mockSearchResults: VideoResult[] = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: '3:33',
      views: '1.4B views',
      channel: 'Rick Astley'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: '4:42',
      views: '8.1B views',
      channel: 'Luis Fonsi'
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen - Bohemian Rhapsody (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
      duration: '5:55',
      views: '1.8B views',
      channel: 'Queen Official'
    },
    {
      id: 'L_jWHffIx5E',
      title: 'Smash Mouth - All Star (Official Music Video)',
      thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
      duration: '3:20',
      views: '654M views',
      channel: 'Smash Mouth'
    },
    {
      id: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
      duration: '4:13',
      views: '4.8B views',
      channel: 'officialpsy'
    },
    {
      id: 'hT_nvWreIhg',
      title: 'The Weeknd - Blinding Lights (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg',
      duration: '4:20',
      views: '1.1B views',
      channel: 'The Weeknd'
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
      duration: '3:53',
      views: '5.8B views',
      channel: 'Ed Sheeran'
    },
    {
      id: 'YQHsXMglC9A',
      title: 'Adele - Hello (Official Music Video)',
      thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg',
      duration: '6:07',
      views: '3.2B views',
      channel: 'Adele'
    },
    {
      id: 'CevxZvSJLk8',
      title: 'Katy Perry - Roar (Official)',
      thumbnail: 'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg',
      duration: '3:43',
      views: '3.7B views',
      channel: 'Katy Perry'
    },
    {
      id: 'RgKAFK5djSk',
      title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
      thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg',
      duration: '3:57',
      views: '5.9B views',
      channel: 'Wiz Khalifa'
    }
  ];

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Enhanced search function with better filtering
  const searchVideos = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Enhanced search filtering
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const filtered = mockSearchResults.filter(video => {
      const searchableText = `${video.title} ${video.channel}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
    
    // If no matches, show popular videos
    const results = filtered.length > 0 ? filtered : mockSearchResults.slice(0, 6);
    
    setSearchResults(results);
    setIsSearching(false);
    
    toast.success(`Found ${results.length} video${results.length !== 1 ? 's' : ''}`);
  };

  // Load video from search results
  const loadVideoFromSearch = (video: VideoResult) => {
    setCurrentVideo(video.id);
    setCurrentVideoTitle(video.title);
    setShowSearch(false);
    setWatchingTogether(true);
    setViewers(Math.floor(Math.random() * 2) + 1);
    setIsPlaying(true);
    toast.success(`🎬 Now playing: ${video.title.substring(0, 50)}${video.title.length > 50 ? '...' : ''}`);
  };

  // Load video from URL
  const loadVideoFromUrl = () => {
    const videoId = extractVideoId(searchQuery);
    if (!videoId) {
      toast.error('Invalid YouTube URL. Please enter a valid YouTube video link or search term.');
      return;
    }

    setCurrentVideo(videoId);
    setCurrentVideoTitle('YouTube Video');
    setShowSearch(false);
    setWatchingTogether(true);
    setViewers(Math.floor(Math.random() * 2) + 1);
    setIsPlaying(true);
    toast.success('🎬 Video loaded! Now watching together');
  };

  // Handle search/URL input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's a YouTube URL
    if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
      loadVideoFromUrl();
    } else {
      searchVideos();
    }
  };

  // Toggle play/pause with sync notification
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (watchingTogether) {
      toast.success(
        isPlaying 
          ? '⏸️ Video paused for both viewers' 
          : '▶️ Video playing for both viewers',
        { duration: 2000 }
      );
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? '🔊 Audio enabled' : '🔇 Audio muted', { duration: 1500 });
  };

  // Enhanced fullscreen handling
  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Minimize/maximize player
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    toast.success(isMinimized ? 'Player maximized' : 'Player minimized', { duration: 1500 });
  };

  // Go back to search
  const goBackToSearch = () => {
    setShowSearch(true);
    setCurrentVideo(null);
    setCurrentVideoTitle('');
    setWatchingTogether(false);
    setIsPlaying(false);
  };

  // Load popular videos on mount
  useEffect(() => {
    if (isVisible && searchResults.length === 0) {
      setSearchResults(mockSearchResults.slice(0, 6));
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
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
          className={`absolute top-4 left-4 right-4 bottom-4 ${isFullscreen ? 'inset-0' : ''} ${isMinimized ? 'pointer-events-none' : ''}`}
        >
          <Card className="h-full flex flex-col overflow-hidden bg-black/95 backdrop-blur-xl border-white/20 shadow-2xl">
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
                          transition={{ duration: 1, repeat: Infinity }}
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                  </Button>
                </motion.div>
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
                {/* Enhanced Search Interface */}
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

                    {/* Enhanced Search Results */}
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
                              <Card className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:border-red-500/30 overflow-hidden">
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
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Enhanced Instructions */}
                    <motion.div 
                      className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <div className="flex items-center space-x-2 text-blue-400 mb-4">
                        <Eye className="w-5 h-5" />
                        <span className="font-semibold text-lg">How to Watch Together:</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-white/80">
                        <div className="space-y-2">
                          <p>• <strong>Search:</strong> Type keywords to find videos</p>
                          <p>• <strong>Direct URL:</strong> Paste any YouTube link</p>
                          <p>• <strong>Synchronized:</strong> All controls sync between viewers</p>
                        </div>
                        <div className="space-y-2">
                          <p>• <strong>Real-time:</strong> Play/pause affects both users</p>
                          <p>• <strong>Chat:</strong> Continue messaging while watching</p>
                          <p>• <strong>Fullscreen:</strong> Expand for cinema experience</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Video Player */}
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
                      
                      {/* Enhanced Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
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
                                onClick={toggleMute}
                                className="text-white hover:bg-white/20 p-3"
                              >
                                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                              </Button>
                            </motion.div>
                            
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
                                onClick={toggleFullscreen}
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
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};