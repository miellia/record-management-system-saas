import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication.
 * Checks sessionStorage for a valid boolean 'auth' flag.
 * If unauthorized, redirects the user to the Login page.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 font-sans text-indigo-600">Loading...</div>; // Could be a nicer spinner
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

/**
 * Main App Component
 * Defines the main routing architecture of the frontend application.
 */
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route: Login Page */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Route: Admin Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
