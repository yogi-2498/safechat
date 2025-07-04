import React, { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'glass'
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'glass',
  ...props 
}) => {
  const baseClasses = 'rounded-2xl shadow-xl border transition-all duration-500 relative overflow-hidden'
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    glass: 'bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15'
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      {...props}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-rose-500/30 to-purple-500/30 opacity-0 rounded-2xl"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Bubble effect on hover */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/10 rounded-full"
        whileHover={{ 
          width: '200%', 
          height: '200%', 
          x: '-50%', 
          y: '-50%',
          opacity: [0, 0.5, 0]
        }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}