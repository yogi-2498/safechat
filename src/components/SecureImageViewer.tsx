import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, RotateCw, Shield, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'

interface SecureImageViewerProps {
  isOpen: boolean
  imageUrl: string
  imageName?: string
  onClose: () => void
}

export const SecureImageViewer: React.FC<SecureImageViewerProps> = ({
  isOpen,
  imageUrl,
  imageName,
  onClose
}) => {
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })

  // Reset state when opening new image
  React.useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, imageUrl])

  // Enhanced security measures
  React.useEffect(() => {
    if (isOpen) {
      // Disable right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        return false
      }

      // Disable drag and drop
      const preventDragDrop = (e: DragEvent) => {
        e.preventDefault()
        return false
      }

      // Disable save shortcuts and print
      const preventSaveShortcuts = (e: KeyboardEvent) => {
        if (
          (e.ctrlKey && e.key === 's') ||
          (e.metaKey && e.key === 's') ||
          (e.ctrlKey && e.shiftKey && e.key === 'S') ||
          (e.metaKey && e.shiftKey && e.key === 'S') ||
          (e.ctrlKey && e.key === 'p') ||
          (e.metaKey && e.key === 'p') ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.key === 'F12')
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      // Disable image selection
      const preventSelection = (e: Event) => {
        e.preventDefault()
        return false
      }

      document.addEventListener('contextmenu', preventContextMenu)
      document.addEventListener('dragstart', preventDragDrop)
      document.addEventListener('drop', preventDragDrop)
      document.addEventListener('keydown', preventSaveShortcuts)
      document.addEventListener('selectstart', preventSelection)

      // Disable print media
      const style = document.createElement('style')
      style.textContent = `
        @media print {
          body * { visibility: hidden !important; }
          body::before {
            content: "🔒 This content is protected and cannot be printed.";
            visibility: visible !important;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: #333;
          }
        }
      `
      document.head.appendChild(style)

      return () => {
        document.removeEventListener('contextmenu', preventContextMenu)
        document.removeEventListener('dragstart', preventDragDrop)
        document.removeEventListener('drop', preventDragDrop)
        document.removeEventListener('keydown', preventSaveShortcuts)
        document.removeEventListener('selectstart', preventSelection)
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
      }
    }
  }, [isOpen])

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => prev + 90)

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center no-select"
        onClick={onClose}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Security Warning */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pink-500/20 border border-pink-500/30 backdrop-blur-md rounded-lg px-4 py-2"
          >
            <div className="flex items-center space-x-2 text-pink-300 text-sm">
              <Shield className="w-4 h-4" />
              <span>🔒 Image protected - Download, save, and screenshot disabled</span>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="absolute top-16 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/20 backdrop-blur-md bg-black/30"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/20 backdrop-blur-md bg-black/30"
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/20 backdrop-blur-md bg-black/30"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-pink-500/20 border border-pink-500/30 backdrop-blur-md rounded-lg px-3 py-1">
              <div className="flex items-center space-x-2 text-pink-300 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Download Disabled</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-pink-500/20 backdrop-blur-md bg-black/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Name */}
        {imageName && (
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <div className="inline-block bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">{imageName}</p>
            </div>
          </div>
        )}

        {/* Image Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
        >
          <motion.img
            src={imageUrl}
            alt={imageName || 'Protected image'}
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitUserDrag: 'none',
              WebkitTouchCallout: 'none'
            }}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
          
          {/* Security overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'transparent',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </motion.div>

        {/* Instructions */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm">
            <p className="text-center">
              Scroll to zoom • Drag to pan • ESC to close • Download/save disabled for security
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}