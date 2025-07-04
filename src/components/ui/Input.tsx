import React, { InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300'
    
    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'

    return (
      <motion.div 
        className="space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseClasses} ${errorClasses} ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
          {/* Focus ring animation */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-pink-500 opacity-0 pointer-events-none"
            whileFocus={{ opacity: 1, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

Input.displayName = 'Input'