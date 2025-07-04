import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import { LandingPage } from './pages/LandingPage'
import { JoinRoomPage } from './pages/JoinRoomPage'
import { ChatRoomPage } from './pages/ChatRoomPage'
import { LoadingSpinner } from './components/LoadingSpinner'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/join" replace /> : <LandingPage />} 
      />
      <Route 
        path="/join" 
        element={
          <ProtectedRoute>
            <JoinRoomPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/room/:roomCode" 
        element={
          <ProtectedRoute>
            <ChatProvider>
              <ChatRoomPage />
            </ChatProvider>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, rgba(255, 182, 193, 0.95))',
                  color: 'var(--toast-text, #8B5A6B)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 192, 203, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 8px 32px rgba(255, 182, 193, 0.3)',
                },
                success: {
                  iconTheme: {
                    primary: '#FF69B4',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#DC143C',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App