import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import axios from 'axios'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>

      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #fbc2eb 0%, transparent 70%)' }}></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #ffecd2 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a18cd1 0%, transparent 70%)' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 40%, #000 70%, transparent 100%)'
        }}></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl shadow-xl border border-white/60"
        style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)' }}>

        <div className="flex justify-center mb-5">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: '#fef3c7', color: '#92400e' }}>
            Admin Login
          </span>
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8" style={{ letterSpacing: '-0.02em' }}>
          Welcome Back!
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 outline-none text-gray-700 transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-white border border-gray-200 outline-none text-gray-700 transition-all"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                placeholder="•••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center ml-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">Remember me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
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