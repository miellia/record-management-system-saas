import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication.
 * Checks sessionStorage for a valid boolean 'auth' flag.
 * If unauthorized, redirects the user to the Login page.
 */
const ProtectedRoute = ({ children }) => {
  const isAuth = sessionStorage.getItem('auth') === 'true'
  return isAuth ? children : <Navigate to="/" />
}

/**
 * Main App Component
 * Defines the main routing architecture of the frontend application.
 */
const App = () => {
  return (
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
  )
}

export default App
