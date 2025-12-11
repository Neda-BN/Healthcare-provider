'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Send,
  Bell,
  Menu,
  Search,
  X,
  HelpCircle,
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
}

interface TopBarProps {
  municipalities: Municipality[]
  selectedMunicipality?: Municipality | null
  onMunicipalityChange?: (municipality: Municipality) => void
  onMenuClick?: () => void
  userName?: string
  userRole?: string
}

export default function TopBar({
  municipalities,
  selectedMunicipality,
  onMunicipalityChange,
  onMenuClick,
  userName = 'User',
  userRole = 'CAREGIVER',
}: TopBarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMunicipalitySelect = (municipality: Municipality) => {
    onMunicipalityChange?.(municipality)
    router.push(`/municipality/${municipality.id}`)
    setDropdownOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-surface-200">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-surface-600" />
            </button>

            {/* Municipality dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors border border-surface-200"
              >
                <Building2 className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-surface-700 max-w-[200px] truncate">
                  {selectedMunicipality?.name || 'Select Municipality'}
                </span>
                <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-medium text-surface-400 uppercase tracking-wider">
                        Municipalities
                      </div>
                      {municipalities.map((municipality) => (
                        <button
                          key={municipality.id}
                          onClick={() => handleMunicipalitySelect(municipality)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedMunicipality?.id === municipality.id
                              ? 'bg-primary-50 text-primary-700'
                              : 'hover:bg-surface-50 text-surface-700'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm font-medium">{municipality.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-surface-200 p-2">
                      <Link
                        href="/municipalities"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        View all municipalities
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Send Survey button */}
            <Link
              href="/surveys/send"
              className="btn-primary btn-sm hidden sm:flex"
            >
              <Send className="w-4 h-4" />
              <span>Send Survey</span>
            </Link>

            {/* Help button */}
            <button
              onClick={() => setHelpModalOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-surface-500" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors relative">
              <Bell className="w-5 h-5 text-surface-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-surface-900">{userName}</div>
                <div className="text-xs text-surface-500">{userRole}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <AnimatePresence>
        {helpModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setHelpModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-200">
                <h2 className="text-xl font-display font-bold text-surface-900">Help & Support</h2>
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-surface-900">Quick Start Guide</h3>
                  <ol className="space-y-2 text-sm text-surface-600">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">1</span>
                      <span>Select a municipality from the dropdown above</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">2</span>
                      <span>Navigate to "New internal survey" → "Question builder" to create surveys</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">3</span>
                      <span>Click "Send Survey" to email the survey to municipality contacts</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">4</span>
                      <span>View responses in the Dashboard or use Analyse to compare results</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-4 border-t border-surface-200">
                  <h3 className="font-medium text-surface-900 mb-2">Need more help?</h3>
                  <p className="text-sm text-surface-600 mb-3">
                    Contact our support team for assistance with the system.
                  </p>
                  <a
                    href="mailto:support@healthcare-provider.se"
                    className="btn-secondary btn-sm inline-flex"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

