import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'light' | 'dark' | 'neo-light' | 'neo-dark'
  hover?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light',
  hover = true
}) => {
  const baseClasses = 'rounded-2xl backdrop-blur-xl border transition-all duration-500 relative overflow-hidden'
  
  const variants = {
    light: 'glass shadow-2xl',
    dark: 'glass-dark shadow-2xl',
    'neo-light': 'neo-light',
    'neo-dark': 'neo-dark'
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={hover ? { 
        y: -5, 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      } : {}}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 -skew-x-12"
        whileHover={{ 
          opacity: [0, 1, 0],
          x: ['-100%', '100%']
        }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}