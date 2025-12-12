'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, AlertCircle, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      toast.success(`Welcome back, ${data.user.name}!`)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-white/10"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-white/20 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-lg font-display font-semibold">Healthcare Provider</span>
            </div>
            
            <h1 className="text-4xl font-display font-bold leading-tight mb-6">
              Survey Management<br />
              <span className="text-primary-200 dark:text-cyan-300">& Analytics Platform</span>
            </h1>
            
            <p className="text-lg text-primary-100 dark:text-cyan-100 leading-relaxed max-w-md">
              Comprehensive municipality survey management, real-time dashboards, 
              and comparative analysis to improve care quality.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-primary-200 dark:text-cyan-200">Active Municipalities</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold">43</div>
                <div className="text-sm text-primary-200 dark:text-cyan-200">Survey Questions</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50 dark:bg-dark-bg">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="p-1.5 bg-primary-600 dark:bg-dark-primary rounded-lg">
              <Heart className="w-5 h-5 text-white dark:text-dark-primary-text" />
            </div>
            <span className="text-base font-display font-semibold text-surface-900 dark:text-dark-text">Healthcare Provider</span>
          </div>

          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Welcome back</h2>
              <p className="text-surface-500 dark:text-dark-text-muted mt-2">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800 rounded-lg text-accent-700 dark:text-accent-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11"
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-11"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-dark-border">
              <p className="text-sm text-center text-surface-500 dark:text-dark-text-muted mb-4">Demo credentials</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <div>
                    <span className="font-medium text-surface-700 dark:text-dark-text">Admin</span>
                    <p className="text-surface-500 dark:text-dark-text-muted text-xs">admin@healthcare-provider.se</p>
                  </div>
                  <code className="text-xs bg-surface-200 dark:bg-dark-surface px-2 py-1 rounded text-surface-700 dark:text-dark-text">admin123</code>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg">
                  <div>
                    <span className="font-medium text-surface-700 dark:text-dark-text">Municipality</span>
                    <p className="text-surface-500 dark:text-dark-text-muted text-xs">municipality@healthcare-provider.se</p>
                  </div>
                  <code className="text-xs bg-surface-200 dark:bg-dark-surface px-2 py-1 rounded text-surface-700 dark:text-dark-text">municipality123</code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
