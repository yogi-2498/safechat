import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  theme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('safechat-theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    localStorage.setItem('safechat-theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.setProperty('--bg-primary', 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)')
      document.documentElement.style.setProperty('--bg-secondary', 'rgba(255, 182, 193, 0.1)')
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.setProperty('--bg-primary', 'linear-gradient(135deg, #fdf2f8, #fce7f3, #fbcfe8)')
      document.documentElement.style.setProperty('--bg-secondary', 'rgba(255, 182, 193, 0.2)')
      document.documentElement.style.setProperty('--text-primary', '#374151')
      document.documentElement.style.setProperty('--text-secondary', 'rgba(55, 65, 81, 0.7)')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: isDark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}