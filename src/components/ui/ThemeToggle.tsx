import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className = '' }) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
        isDark ? 'bg-gray-700' : 'bg-yellow-200'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'bg-gray-900 text-blue-400' : 'bg-white text-yellow-500'
        }`}
        animate={{
          x: isDark ? 32 : 0
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}