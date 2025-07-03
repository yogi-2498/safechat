import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App