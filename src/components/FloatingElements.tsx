import React from 'react'
import { motion } from 'framer-motion'

const FloatingHeart: React.FC<{ delay?: number; className?: string }> = ({ delay = 0, className = '' }) => (
  <motion.div
    className={`absolute text-pink-400 ${className}`}
    initial={{ opacity: 0, scale: 0, y: 100 }}
    animate={{ 
      opacity: [0, 1, 0.8, 0],
      scale: [0, 1.2, 1, 0.5],
      y: [100, -200],
      x: [0, 30, -20, 0],
      rotate: [0, 360]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    💖
  </motion.div>
)

const FloatingRose: React.FC<{ delay?: number; className?: string; type?: 'red' | 'white' }> = ({ 
  delay = 0, 
  className = '', 
  type = 'red' 
}) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ 
      opacity: [0, 1, 0.9, 0],
      scale: [0, 1.3, 1.1, 0],
      rotate: [0, 180, 360],
      y: [0, -250],
      x: [0, 40, -30, 10]
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {type === 'red' ? '🌹' : '🥀'}
  </motion.div>
)

const FloatingSparkle: React.FC<{ delay?: number; className?: string }> = ({ delay = 0, className = '' }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.7, 1, 0],
      scale: [0, 1.5, 1, 1.2, 0],
      rotate: [0, 180, 360],
      y: [0, -150]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    ✨
  </motion.div>
)

export const FloatingElements: React.FC = () => {
  const elements = Array.from({ length: 25 }, (_, i) => i)
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((i) => {
        const positions = [
          'top-10 left-10', 'top-20 right-20', 'bottom-20 left-20', 'bottom-10 right-10',
          'top-1/4 left-1/4', 'top-1/3 right-1/3', 'bottom-1/4 left-1/3', 'bottom-1/3 right-1/4',
          'top-1/2 left-10', 'top-1/2 right-10', 'top-10 left-1/2', 'bottom-10 left-1/2',
          'top-16 left-1/4', 'top-3/4 right-16', 'bottom-1/2 left-16', 'top-1/6 right-1/4'
        ]
        
        const elementType = i % 4
        const position = positions[i % positions.length]
        
        if (elementType === 0 || elementType === 1) {
          return (
            <FloatingHeart
              key={`heart-${i}`}
              className={position}
              delay={i * 0.8}
            />
          )
        } else if (elementType === 2) {
          return (
            <FloatingRose
              key={`rose-${i}`}
              className={position}
              delay={i * 0.6}
              type={i % 2 === 0 ? 'red' : 'white'}
            />
          )
        } else {
          return (
            <FloatingSparkle
              key={`sparkle-${i}`}
              className={position}
              delay={i * 0.4}
            />
          )
        }
      })}
    </div>
  )
}