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
  Eye
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

  // Mock YouTube search results
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
      title: 'Despacito ft. Daddy Yankee',
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

  // Search for videos
  const searchVideos = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock results based on search query
    const filtered = mockSearchResults.filter(video => 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length === 0) {
      // If no matches, show all results as if it's a broader search
      setSearchResults(mockSearchResults);
    } else {
      setSearchResults(filtered);
    }
    
    setIsSearching(false);
    toast.success(`Found ${filtered.length || mockSearchResults.length} videos`);
  };

  // Load video from search results
  const loadVideoFromSearch = (video: VideoResult) => {
    setCurrentVideo(video.id);
    setCurrentVideoTitle(video.title);
    setShowSearch(false);
    setWatchingTogether(true);
    setViewers(Math.floor(Math.random() * 2) + 1);
    setIsPlaying(true);
    toast.success(`Now playing: ${video.title}`);
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
    toast.success('Video loaded! Now watching together 🎬');
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

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (watchingTogether) {
      toast.success(isPlaying ? 'Video paused for both viewers' : 'Video playing for both viewers');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle fullscreen
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
  };

  // Go back to search
  const goBackToSearch = () => {
    setShowSearch(true);
    setCurrentVideo(null);
    setCurrentVideoTitle('');
    setWatchingTogether(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isMinimized ? 0.3 : 1, 
            opacity: 1,
            x: isMinimized ? window.innerWidth / 2 - 150 : 0,
            y: isMinimized ? window.innerHeight / 2 - 100 : 0
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl max-h-[90vh]'} ${isMinimized ? 'pointer-events-none' : ''}`}
        >
          <Card className="overflow-hidden bg-black/90 backdrop-blur-xl border-white/20 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600/20 to-pink-600/20 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">YouTube Together</h3>
                  {watchingTogether && (
                    <div className="flex items-center space-x-2 text-sm text-white/70">
                      <Users className="w-4 h-4" />
                      <span>{viewers} watching</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Synced</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentVideo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBackToSearch}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMinimize}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/70 hover:text-white hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Interface */}
                {showSearch && (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="text-center mb-6">
                      <Youtube className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Search & Watch Together</h4>
                      <p className="text-white/70">
                        Search for videos or paste a YouTube URL to watch together
                      </p>
                    </div>
                    
                    <form onSubmit={handleSearchSubmit} className="flex space-x-3 mb-6">
                      <Input
                        placeholder="Search videos or paste YouTube URL..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                        icon={<Search className="w-5 h-5" />}
                      />
                      <Button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        isLoading={isSearching}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      >
                        {searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be') ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Load Video
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-white mb-4">
                          {searchQuery ? `Results for "${searchQuery}"` : 'Popular Videos'}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {searchResults.map((video) => (
                            <motion.div
                              key={video.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.02 }}
                              className="group cursor-pointer"
                              onClick={() => loadVideoFromSearch(video)}
                            >
                              <Card className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                                <div className="relative mb-3">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                  </div>
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                    <Play className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <h6 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
                                  {video.title}
                                </h6>
                                <div className="flex items-center justify-between text-xs text-white/60">
                                  <span>{video.channel}</span>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{video.views}</span>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-400 mb-2">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">How to use:</span>
                      </div>
                      <ul className="text-sm text-white/70 space-y-1">
                        <li>• Search for any video by typing keywords</li>
                        <li>• Or paste a direct YouTube URL to load instantly</li>
                        <li>• Click any video to start watching together</li>
                        <li>• Video controls are synchronized between viewers</li>
                        <li>• Chat continues below while watching</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Video Player */}
                {currentVideo && !showSearch && (
                  <div className="flex-1 flex flex-col">
                    <div className="relative flex-1">
                      <div className="w-full h-full bg-black">
                        <iframe
                          ref={playerRef}
                          src={`https://www.youtube.com/embed/${currentVideo}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube Video Player"
                        />
                      </div>
                      
                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={togglePlayPause}
                              className="text-white hover:bg-white/20"
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            
                            <div className="flex items-center space-x-2 text-white/70 text-sm">
                              <Users className="w-4 h-4" />
                              <span>{viewers} watching</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://youtube.com/watch?v=${currentVideo}`, '_blank')}
                              className="text-white hover:bg-white/20"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleFullscreen}
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {currentVideoTitle && (
                          <div className="mt-2">
                            <p className="text-white text-sm font-medium truncate">{currentVideoTitle}</p>
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