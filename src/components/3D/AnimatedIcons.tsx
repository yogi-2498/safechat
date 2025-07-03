import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Flower, Sparkles, Star, Zap } from 'lucide-react'

interface AnimatedIconProps {
  className?: string
  delay?: number
}

export const FloatingHeart: React.FC<AnimatedIconProps> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`absolute text-pink-400 ${className}`}
    initial={{ opacity: 0, scale: 0, y: 100 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0.8, 1],
      y: [100, -100],
      rotate: [0, 360]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Heart className="w-6 h-6 fill-current heartbeat-animation" />
  </motion.div>
)

export const FloatingFlower: React.FC<AnimatedIconProps> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`absolute text-purple-400 ${className}`}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ 
      opacity: [0, 1, 0.8, 0],
      scale: [0, 1.5, 1, 0.5],
      rotate: [0, 180, 360],
      x: [0, 50, -30, 0],
      y: [0, -80, -120, -200]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Flower className="w-8 h-8 flower-animation" />
  </motion.div>
)

export const FloatingSparkle: React.FC<AnimatedIconProps> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`absolute text-yellow-400 ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.5, 1, 0],
      scale: [0, 1, 1.5, 0.8, 0],
      rotate: [0, 90, 180, 270, 360]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Sparkles className="w-5 h-5 sparkle-animation" />
  </motion.div>
)

export const FloatingStar: React.FC<AnimatedIconProps> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`absolute text-blue-400 ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.7, 0],
      scale: [0, 1.3, 1, 0.6],
      rotate: [0, 180, 360],
      y: [0, -150]
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Star className="w-6 h-6 fill-current" />
  </motion.div>
)

export const FloatingZap: React.FC<AnimatedIconProps> = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`absolute text-cyan-400 ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.8, 0],
      scale: [0, 1.4, 1.1, 0],
      rotate: [0, -90, -180, -270, -360],
      x: [0, 30, -20, 0],
      y: [0, -100, -180]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Zap className="w-7 h-7 fill-current" />
  </motion.div>
)

export const AnimatedBackground: React.FC = () => {
  const elements = Array.from({ length: 20 }, (_, i) => i)
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((i) => {
        const Component = [FloatingHeart, FloatingFlower, FloatingSparkle, FloatingStar, FloatingZap][i % 5]
        const positions = [
          'top-10 left-10', 'top-20 right-20', 'bottom-20 left-20', 'bottom-10 right-10',
          'top-1/4 left-1/4', 'top-1/3 right-1/3', 'bottom-1/4 left-1/3', 'bottom-1/3 right-1/4',
          'top-1/2 left-10', 'top-1/2 right-10', 'top-10 left-1/2', 'bottom-10 left-1/2'
        ]
        
        return (
          <Component
            key={i}
            className={positions[i % positions.length]}
            delay={i * 0.5}
          />
        )
      })}
    </div>
  )
}