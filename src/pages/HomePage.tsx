import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Lock, Zap, Chrome, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn, signInWithGoogle, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-10 right-1/3 w-56 h-56 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
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
                  className="relative p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageCircle className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              <div className="ml-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  SecureChat
                </h1>
                <p className="text-purple-300 text-lg font-medium">End-to-End Encrypted</p>
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
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Private Chat
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h2>
              
              <p className="text-2xl lg:text-3xl text-white/80 leading-relaxed max-w-3xl">
                Experience truly secure 1:1 conversations with military-grade encryption. 
                No data storage, no tracking, just pure privacy.
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
                  desc: 'Military-grade security',
                  gradient: 'from-purple-500 to-pink-500'
                },
                { 
                  icon: Lock, 
                  title: 'Zero Storage', 
                  desc: 'No message history',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                { 
                  icon: Zap, 
                  title: 'Real-time', 
                  desc: 'Instant messaging',
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
                  <Card className="p-8 h-full hover:from-white/20 hover:to-white/10 transition-all duration-500 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient.replace('from-', 'from-').replace('to-', 'to-')}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <motion.div 
                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-2xl`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-white mb-3 text-xl">{feature.title}</h3>
                      <p className="text-white/70 leading-relaxed">{feature.desc}</p>
                    </div>
                  </Card>
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
            <Card className="p-10 backdrop-blur-xl border border-white/20 shadow-2xl bg-gradient-to-br from-white/15 to-white/5 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50" />
              
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Shield className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
                    {isLogin ? 'Welcome Back' : 'Join SecureChat'}
                  </h3>
                  <p className="text-white/80 text-lg">
                    {isLogin ? 'Sign in to start secure conversations' : 'Create your account for private messaging'}
                  </p>
                </div>

                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full mb-8 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md group py-4 text-lg font-semibold"
                  size="lg"
                  isLoading={isGoogleLoading}
                >
                  <Chrome className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </Button>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30" />
                  </div>
                  <div className="relative flex justify-center text-lg">
                    <span className="px-6 bg-transparent text-white/70 font-medium">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder-white/50 backdrop-blur-md py-4 text-lg focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      icon={<Mail className="w-6 h-6" />}
                    />
                  </div>
                  
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder-white/50 backdrop-blur-md py-4 text-lg focus:ring-2 focus:ring-purple-500 transition-all duration-300 pr-12"
                      icon={<Lock className="w-6 h-6" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
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
                    <span className="group-hover:scale-105 transition-transform">
                      {isLogin ? 'Sign In Securely' : 'Create Account'}
                    </span>
                  </Button>
                </form>

                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white/80 hover:text-white transition-colors text-lg group"
                  >
                    {isLogin ? (
                      <>Don't have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300 underline">Create one</span></>
                    ) : (
                      <>Already have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300 underline">Sign in</span></>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};