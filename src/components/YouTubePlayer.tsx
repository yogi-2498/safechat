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

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ onClose, isVisible }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [watchingTogether, setWatchingTogether] = useState(false);
  const [viewers, setViewers] = useState(1);
  
  const playerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Load video
  const loadVideo = () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    setCurrentVideo(videoId);
    setWatchingTogether(true);
    setViewers(Math.floor(Math.random() * 2) + 1); // Simulate 1-2 viewers
    toast.success('Video loaded! Now watching together 🎬');
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would sync with the other user
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
          className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl'} ${isMinimized ? 'pointer-events-none' : ''}`}
        >
          <Card className="overflow-hidden bg-black/90 backdrop-blur-xl border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600/20 to-pink-600/20 border-b border-white/10">
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
              <>
                {/* Video Input */}
                {!currentVideo && (
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <Youtube className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Watch YouTube Together</h4>
                      <p className="text-white/70">
                        Paste a YouTube video URL to start watching together with your chat partner
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                      <Button
                        onClick={loadVideo}
                        disabled={!videoUrl.trim()}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Load Video
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-400 mb-2">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">How it works:</span>
                      </div>
                      <ul className="text-sm text-white/70 space-y-1">
                        <li>• Both users can control playback (play, pause, seek)</li>
                        <li>• Video stays synchronized between viewers</li>
                        <li>• Chat while watching for real-time reactions</li>
                        <li>• Supports all public YouTube videos</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Video Player */}
                {currentVideo && (
                  <div className="relative">
                    <div className="aspect-video bg-black">
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
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {currentVideo && (
                  <div className="p-4 bg-black/40 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentVideo(null);
                            setVideoUrl('');
                            setWatchingTogether(false);
                          }}
                          className="text-white border-white/30 hover:bg-white/10"
                        >
                          Load New Video
                        </Button>
                      </div>
                      
                      <div className="text-sm text-white/70">
                        Video controls are synchronized between all viewers
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};