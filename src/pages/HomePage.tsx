import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Lock, Zap, Chrome, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn, signInWithGoogle, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-2xl">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-4xl font-bold text-white">SecureChat</h1>
                <p className="text-purple-300 text-sm">End-to-End Encrypted</p>
              </div>
            </motion.div>
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Private Chat
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-white/80 leading-relaxed max-w-2xl">
                Experience truly secure 1:1 conversations with military-grade encryption. 
                No data storage, no tracking, just pure privacy.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {[
                { icon: Shield, title: 'E2E Encrypted', desc: 'Military-grade security' },
                { icon: Lock, title: 'Zero Storage', desc: 'No message history' },
                { icon: Zap, title: 'Real-time', desc: 'Instant messaging' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group"
                >
                  <Card className="p-6 h-full hover:bg-white/15 transition-all duration-300 border-white/10 hover:border-white/30 bg-white/10 backdrop-blur-md">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                    <p className="text-white/70 text-sm">{feature.desc}</p>
                  </Card>
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
            <Card className="p-8 backdrop-blur-xl border-white/20 shadow-2xl bg-white/10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Join SecureChat'}
                </h3>
                <p className="text-white/70">
                  {isLogin ? 'Sign in to start secure conversations' : 'Create your account for private messaging'}
                </p>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full mb-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md group"
                size="lg"
                isLoading={isGoogleLoading}
              >
                <Chrome className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 backdrop-blur-md"
                  icon={<Mail className="w-5 h-5" />}
                />
                
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 backdrop-blur-md"
                  icon={<Lock className="w-5 h-5" />}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group"
                  isLoading={isLoading}
                  size="lg"
                >
                  <span className="group-hover:scale-105 transition-transform">
                    {isLogin ? 'Sign In Securely' : 'Create Account'}
                  </span>
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white/70 hover:text-white transition-colors text-sm group"
                >
                  {isLogin ? (
                    <>Don't have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300">Create one</span></>
                  ) : (
                    <>Already have an account? <span className="text-purple-400 font-semibold group-hover:text-purple-300">Sign in</span></>
                  )}
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};