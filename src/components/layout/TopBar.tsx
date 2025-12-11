'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ChevronDown,
  Send,
  Bell,
  Menu,
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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-surface-200 dark:border-dark-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
            >
              <Menu className="w-5 h-5 text-surface-600 dark:text-dark-text" />
            </button>

            {/* Municipality dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-50 hover:bg-surface-100 dark:bg-dark-surface dark:hover:bg-dark-surface-light rounded-lg transition-colors border border-surface-200 dark:border-dark-border"
              >
                <Building2 className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                <span className="text-sm font-medium text-surface-700 dark:text-dark-text max-w-[200px] truncate">
                  {selectedMunicipality?.name || 'Select Municipality'}
                </span>
                <ChevronDown className={`w-4 h-4 text-surface-400 dark:text-dark-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-dark-soft border border-surface-200 dark:border-dark-border overflow-hidden z-50 animate-fade-in">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-surface-400 dark:text-dark-text-muted uppercase tracking-wider">
                      Municipalities
                    </div>
                    {municipalities.map((municipality) => (
                      <button
                        key={municipality.id}
                        onClick={() => handleMunicipalitySelect(municipality)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          selectedMunicipality?.id === municipality.id
                            ? 'bg-primary-50 text-primary-700 dark:bg-dark-primary/20 dark:text-dark-primary'
                            : 'hover:bg-surface-50 text-surface-700 dark:hover:bg-dark-surface-light dark:text-dark-text'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{municipality.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-surface-200 dark:border-dark-border p-2">
                    <Link
                      href="/municipalities"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:text-dark-primary dark:hover:bg-dark-primary/10 rounded-lg transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      View all municipalities
                    </Link>
                  </div>
                </div>
              )}
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
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors relative">
              <Bell className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-surface-200 dark:border-dark-border">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-surface-900 dark:text-dark-text">{userName}</div>
                <div className="text-xs text-surface-500 dark:text-dark-text-muted">{userRole}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-dark-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700 dark:text-dark-primary">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal - No Framer Motion */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setHelpModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-xl dark:shadow-dark-soft overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-dark-border">
              <h2 className="text-xl font-display font-bold text-surface-900 dark:text-dark-text">Help & Support</h2>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
              >
                <X className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-surface-900 dark:text-dark-text">Quick Start Guide</h3>
                <ol className="space-y-2 text-sm text-surface-600 dark:text-dark-text-muted">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 dark:bg-dark-primary/20 dark:text-dark-primary flex items-center justify-center text-xs font-medium">1</span>
                    <span>Go to <strong className="dark:text-dark-text">Surveys → Survey Templates</strong> to build a survey</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 dark:bg-dark-primary/20 dark:text-dark-primary flex items-center justify-center text-xs font-medium">2</span>
                    <span>Use <strong className="dark:text-dark-text">Surveys → Send Survey</strong> to email it to municipalities</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 dark:bg-dark-primary/20 dark:text-dark-primary flex items-center justify-center text-xs font-medium">3</span>
                    <span>View responses in <strong className="dark:text-dark-text">Analysis → Reports</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 dark:bg-dark-primary/20 dark:text-dark-primary flex items-center justify-center text-xs font-medium">4</span>
                    <span>Compare municipalities in <strong className="dark:text-dark-text">Analysis → Compare</strong></span>
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t border-surface-200 dark:border-dark-border">
                <h3 className="font-medium text-surface-900 dark:text-dark-text mb-2">Need more help?</h3>
                <p className="text-sm text-surface-600 dark:text-dark-text-muted mb-3">
                  Visit the Help & Support page or contact our support team.
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/help"
                    className="btn-primary btn-sm inline-flex"
                    onClick={() => setHelpModalOpen(false)}
                  >
                    Help Center
                  </Link>
                  <a
                    href="mailto:support@healthcare-provider.se"
                    className="btn-secondary btn-sm inline-flex"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
