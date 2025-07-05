import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Clock, Eye, Loader } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

interface VideoResult {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: string
  channel: string
  description: string
}

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string, title: string) => void
  onClose: () => void
}

export const YouTubeSearch: React.FC<YouTubeSearchProps> = ({
  onVideoSelect,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VideoResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
    },
    {
      id: 'YQHsXMglC9A',
      title: 'Adele - Hello (Official Music Video)',
      thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg',
      duration: '6:07',
      views: '3.2B views',
      channel: 'Adele',
      description: 'Official music video for Hello by Adele'
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You (Official Video)',
      thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
      duration: '3:53',
      views: '5.8B views',
      channel: 'Ed Sheeran',
      description: 'Official music video for Shape of You'
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
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    const searchTerms = searchQuery.toLowerCase().split(' ')
    const filtered = mockSearchResults.filter(video => {
      const searchableText = `${video.title} ${video.channel}`.toLowerCase()
      return searchTerms.some(term => searchableText.includes(term))
    })
    
    const results = filtered.length > 0 ? filtered : mockSearchResults.slice(0, 6)
    
    setSearchResults(results)
    setIsSearching(false)
  }

  // Load video from URL
  const loadVideoFromUrl = () => {
    const videoId = extractVideoId(searchQuery)
    if (!videoId) return

    onVideoSelect(videoId, 'YouTube Video')
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

  // Load popular videos on mount
  React.useEffect(() => {
    if (searchResults.length === 0) {
      setSearchResults(mockSearchResults.slice(0, 6))
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-red-50 to-pink-50">
      {/* Search Header */}
      <div className="p-6 border-b border-red-200/50 bg-white/80 backdrop-blur-md">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Watch Together</h3>
          <p className="text-gray-600">Search for videos or paste a YouTube URL</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex space-x-3">
          <Input
            placeholder="Search videos or paste YouTube URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/70 border-red-300/50 focus:ring-red-400"
            icon={<Search className="w-5 h-5 text-red-400" />}
          />
          <Button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            isLoading={isSearching}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
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
        </form>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-gray-800">
                {searchQuery ? `Results for "${searchQuery}"` : 'Popular Videos'}
              </h4>
              <span className="text-gray-500 text-sm">
                {searchResults.length} video{searchResults.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => onVideoSelect(video.id, video.title)}
                >
                  <Card className="overflow-hidden bg-white/70 border-red-200/50 hover:bg-white/90 transition-all duration-300 group-hover:border-red-400/50 shadow-lg hover:shadow-xl">
                    <div className="relative overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{video.duration}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1 }}
                          className="bg-red-500 rounded-full p-4 shadow-2xl"
                        >
                          <Play className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h5 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                        {video.title}
                      </h5>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="truncate mr-2">{video.channel}</span>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Eye className="w-3 h-3" />
                          <span>{video.views}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}