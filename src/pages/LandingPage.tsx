import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Shield, Lock, Zap, Chrome, Mail, Eye, EyeOff, Heart, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { GlassCard } from '../components/ui/GlassCard'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { AnimatedBackground } from '../components/3D/AnimatedIcons'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const { signIn, signInWithGoogle, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        toast.success('Welcome back to SafeChat! 🎉')
      } else {
        await signUp(email, password)
        toast.success('Account created successfully! Welcome to SafeChat! 🎉')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in with Google! Welcome to SafeChat! 🎉')
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100'
    }`}>
      {/* 3D Animated Background */}
      <AnimatedBackground />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      </div>

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className={`absolute w-96 h-96 rounded-full blur-3xl opacity-30 ${
              isDark 
                ? ['bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-cyan-500'][i % 4]
                : ['bg-purple-300', 'bg-pink-300', 'bg-blue-300', 'bg-cyan-300'][i % 4]
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            {/* Logo and Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center lg:justify-start mb-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <motion.div 
                  className="relative p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl transform-3d"
                  whileHover={{ scale: 1.05, rotateY: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className="w-12 h-12 text-white heartbeat-animation" />
                </motion.div>
              </div>
              <div className="ml-4">
                <h1 className={`text-5xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-white via-purple-200 to-pink-200' 
                    : 'from-purple-600 via-pink-600 to-blue-600'
                } bg-clip-text text-transparent`}>
                  SafeChat
                </h1>
                <p className={`text-lg font-medium ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  End-to-End Encrypted • Secure • Private
                </p>
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-6xl lg:text-8xl font-bold leading-tight">
                <span className={`bg-gradient-to-r ${
                  isDark 
                    ? 'from-white via-purple-200 to-pink-200' 
                    : 'from-purple-700 via-pink-700 to-blue-700'
                } bg-clip-text text-transparent`}>
                  Private Chat
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h2>
              
              <p className={`text-2xl lg:text-3xl leading-relaxed max-w-3xl ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Experience truly secure 1:1 conversations with military-grade encryption, 
                screenshot protection, and YouTube watch parties. No data storage, no tracking, just pure privacy.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            >
              {[
                { 
                  icon: Shield, 
                  title: 'E2E Encrypted', 
                  desc: 'Military-grade security with screenshot protection',
                  gradient: 'from-purple-500 to-pink-500'
                },
                { 
                  icon: Lock, 
                  title: 'Zero Storage', 
                  desc: 'No message history, complete privacy',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                { 
                  icon: Zap, 
                  title: 'YouTube Together', 
                  desc: 'Watch videos while chatting securely',
                  gradient: 'from-green-500 to-emerald-500'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group"
                  whileHover={{ y: -5 }}
                >
                  <GlassCard 
                    className={`p-8 h-full transition-all duration-500 border-white/20 ${
                      isDark 
                        ? 'bg-gradient-to-br from-white/10 to-white/5' 
                        : 'bg-gradient-to-br from-white/60 to-white/40'
                    } backdrop-blur-xl relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient.replace('from-', 'from-').replace('to-', 'to-')}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <motion.div 
                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-2xl`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className={`font-bold mb-3 text-xl ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`leading-relaxed ${
                        isDark ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {feature.desc}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center lg:justify-start space-x-8 pt-8"
            >
              {[
                { value: '256-bit', label: 'Encryption' },
                { value: 'Zero', label: 'Data Storage' },
                { value: '100%', label: 'Private' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <GlassCard 
              className={`p-10 backdrop-blur-xl border shadow-2xl relative overflow-hidden ${
                isDark 
                  ? 'border-white/20 bg-gradient-to-br from-white/15 to-white/5' 
                  : 'border-purple-200/50 bg-gradient-to-br from-white/80 to-white/60'
              }`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50" />
              
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform-3d"
                    whileHover={{ rotateY: 180 }}
                  >
                    <Shield className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className={`text-4xl font-bold bg-gradient-to-r ${
                    isDark 
                      ? 'from-white to-purple-200' 
                      : 'from-purple-600 to-pink-600'
                  } bg-clip-text text-transparent mb-3`}>
                    {isLogin ? 'Welcome Back' : 'Join SafeChat'}
                  </h3>
                  <p className={`text-lg ${
                    isDark ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {isLogin ? 'Sign in to start secure conversations' : 'Create your account for private messaging'}
                  </p>
                </div>

                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className={`w-full mb-8 group py-4 text-lg font-semibold backdrop-blur-md ${
                    isDark 
                      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20' 
                      : 'bg-white/60 border-purple-300/50 text-gray-700 hover:bg-white/80'
                  }`}
                  size="lg"
                  isLoading={isGoogleLoading}
                >
                  <Chrome className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </Button>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${
                      isDark ? 'border-white/30' : 'border-gray-300'
                    }`} />
                  </div>
                  <div className="relative flex justify-center text-lg">
                    <span className={`px-6 bg-transparent font-medium ${
                      isDark ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`py-4 text-lg focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/10 border-white/30 text-white placeholder-white/50' 
                          : 'bg-white/60 border-purple-300/50 text-gray-800 placeholder-gray-500'
                      } backdrop-blur-md`}
                      icon={<Mail className="w-6 h-6" />}
                    />
                  </div>
                  
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`py-4 text-lg focus:ring-2 focus:ring-purple-500 transition-all duration-300 pr-12 ${
                        isDark 
                          ? 'bg-white/10 border-white/30 text-white placeholder-white/50' 
                          : 'bg-white/60 border-purple-300/50 text-gray-800 placeholder-gray-500'
                      } backdrop-blur-md`}
                      icon={<Lock className="w-6 h-6" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 group py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25"
                    isLoading={isLoading}
                    size="lg"
                  >
                    <span className="group-hover:scale-105 transition-transform flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 sparkle-animation" />
                      {isLogin ? 'Sign In Securely' : 'Create Account'}
                    </span>
                  </Button>
                </form>

                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className={`text-lg group transition-colors ${
                      isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {isLogin ? (
                      <>Don't have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300 underline">Create one</span></>
                    ) : (
                      <>Already have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300 underline">Sign in</span></>
                    )}
                  </button>
                </div>

                {/* Security Notice */}
                <motion.div 
                  className={`mt-8 p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-green-100/80 border-green-300/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Your privacy is guaranteed</span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-green-300/70' : 'text-green-600'
                  }`}>
                    We never store your messages or personal data. Everything is encrypted and temporary.
                  </p>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}