import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, Lock, Sparkles, Chrome, Mail, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { FloatingElements } from '../components/FloatingElements'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

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
        toast.success('Welcome back to SafeChat! 💕')
      } else {
        await signUp(email, password)
        toast.success('Account created successfully! Welcome to SafeChat! 💕')
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
      toast.success('Signed in with Google! Welcome to SafeChat! 💕')
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Floating romantic elements */}
      <FloatingElements />

      {/* Main content */}
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
                <motion.div 
                  className="relative p-4 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-3xl shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  animate={{ 
                    boxShadow: [
                      '0 20px 40px rgba(255, 182, 193, 0.4)',
                      '0 25px 50px rgba(255, 182, 193, 0.6)',
                      '0 20px 40px rgba(255, 182, 193, 0.4)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-12 h-12 text-white" fill="currentColor" />
                </motion.div>
              </div>
              <div className="ml-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent font-serif">
                  SafeChat
                </h1>
                <p className="text-rose-500 text-lg font-medium">
                  Where Hearts Connect Securely 💕
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
              <h2 className="text-6xl lg:text-8xl font-bold leading-tight font-serif">
                <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                  Love
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                  Securely
                </span>
              </h2>
              
              <p className="text-2xl lg:text-3xl text-gray-700 leading-relaxed max-w-3xl">
                Experience intimate conversations with military-grade encryption. 
                Share your heart without compromise, watch together, love together.
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
                  title: 'Protected Love', 
                  desc: 'Your intimate moments, safely encrypted',
                  gradient: 'from-pink-400 to-rose-400'
                },
                { 
                  icon: Lock, 
                  title: 'Private Forever', 
                  desc: 'No traces left behind, pure privacy',
                  gradient: 'from-purple-400 to-pink-400'
                },
                { 
                  icon: Sparkles, 
                  title: 'Watch Together', 
                  desc: 'Share videos while staying connected',
                  gradient: 'from-rose-400 to-purple-400'
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
                  <Card className="p-8 h-full bg-white/70 backdrop-blur-xl border border-pink-200/50 hover:bg-white/80 transition-all duration-500 shadow-lg hover:shadow-xl">
                    <motion.div 
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-800 mb-3 text-xl font-serif">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </Card>
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
                  <div className="text-2xl font-bold text-gray-800 font-serif">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="p-10 bg-white/80 backdrop-blur-xl border border-pink-200/50 shadow-2xl">
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3 font-serif">
                  {isLogin ? 'Welcome Back' : 'Join SafeChat'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {isLogin ? 'Sign in to reconnect with your heart' : 'Create your account for intimate conversations'}
                </p>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full mb-8 bg-white/60 border-pink-300/50 text-gray-700 hover:bg-white/80 group py-4 text-lg font-semibold backdrop-blur-md"
                size="lg"
                isLoading={isGoogleLoading}
              >
                <Chrome className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Continue with Google
              </Button>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-pink-300" />
                </div>
                <div className="relative flex justify-center text-lg">
                  <span className="px-6 bg-white/80 text-gray-500 font-medium">
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
                    className="py-4 text-lg focus:ring-2 focus:ring-pink-400 transition-all duration-300 bg-white/60 border-pink-300/50 text-gray-800 placeholder-gray-500 backdrop-blur-md"
                    icon={<Mail className="w-6 h-6 text-pink-400" />}
                  />
                </div>
                
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-4 text-lg focus:ring-2 focus:ring-pink-400 transition-all duration-300 pr-12 bg-white/60 border-pink-300/50 text-gray-800 placeholder-gray-500 backdrop-blur-md"
                    icon={<Lock className="w-6 h-6 text-pink-400" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 group py-4 text-lg font-semibold shadow-2xl hover:shadow-pink-500/25"
                  isLoading={isLoading}
                  size="lg"
                >
                  <span className="group-hover:scale-105 transition-transform flex items-center">
                    <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                    {isLogin ? 'Sign In Securely' : 'Create Account'}
                  </span>
                </Button>
              </form>

              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-lg group transition-colors text-gray-600 hover:text-gray-800"
                >
                  {isLogin ? (
                    <>Don't have an account? <span className="text-pink-500 font-semibold group-hover:text-pink-600 underline">Create one</span></>
                  ) : (
                    <>Already have an account? <span className="text-pink-500 font-semibold group-hover:text-pink-600 underline">Sign in</span></>
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <motion.div 
                className="mt-8 p-4 bg-pink-50/80 border border-pink-200/50 rounded-lg backdrop-blur-md"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-pink-500" />
                  <span className="text-pink-600 text-sm font-medium">Your heart is safe with us</span>
                </div>
                <p className="text-xs mt-1 text-pink-500">
                  We never store your messages or personal data. Everything is encrypted and temporary.
                </p>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}