import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
      sessionStorage.setItem('auth', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500"
      style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>

      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, #fbc2eb 0%, transparent 70%)' }}></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-40 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, #ffecd2 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
          style={{ background: 'radial-gradient(circle, #a18cd1 0%, transparent 70%)' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: theme === 'dark' 
            ? 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, #000 70%, transparent 100%)'
        }}></div>

      {/* Theme Toggle in Login */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-white/20 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/30 dark:border-slate-700/50 text-gray-800 dark:text-slate-100 shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} className="text-amber-400" />}
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl shadow-xl border border-white/60 dark:border-slate-700/50 transition-all duration-300"
        style={{ background: theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)' }}>

        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: theme === 'dark' ? '#1e293b' : '#fef3c7', color: theme === 'dark' ? '#fbbf24' : '#92400e', border: theme === 'dark' ? '1px solid #451a03' : 'none' }}>
            Admin Login
          </span>
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-slate-100 mb-8" style={{ letterSpacing: '-0.02em' }}>
          Welcome Back!
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 ml-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none text-gray-700 dark:text-slate-200 transition-all focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none text-gray-700 dark:text-slate-200 transition-all focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                placeholder="•••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center ml-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 dark:bg-slate-800 mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-500 dark:text-slate-400 cursor-pointer">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          >
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login