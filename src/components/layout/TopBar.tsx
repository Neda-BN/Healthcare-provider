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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'alert'
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Sample notifications about survey statistics
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Survey Response Rate Increased',
      message: 'Nordic Care AB response rate increased to 87% (+12% from last month)',
      time: '10 min ago',
      read: false,
      link: '/municipality/nordic-care',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Response Rate Alert',
      message: 'Problem Care AB has only 45% response rate. Consider sending a reminder.',
      time: '1 hour ago',
      read: false,
      link: '/surveys/send',
    },
    {
      id: '3',
      type: 'info',
      title: 'New Survey Completed',
      message: 'Average Joe Omsorg completed the quarterly satisfaction survey.',
      time: '2 hours ago',
      read: false,
      link: '/reports',
    },
    {
      id: '4',
      type: 'alert',
      title: 'Agreement Expiring Soon',
      message: 'Problem Care AB framework agreement expires in 30 days.',
      time: '5 hours ago',
      read: true,
      link: '/municipalities/framework',
    },
    {
      id: '5',
      type: 'success',
      title: 'Quality Score Improved',
      message: 'Overall quality index improved by 0.8 points this quarter.',
      time: '1 day ago',
      read: true,
      link: '/analyse',
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-amber-500" />
      case 'info':
        return <BarChart3 className="w-5 h-5 text-primary-500 dark:text-dark-primary" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-accent-500" />
      default:
        return <Bell className="w-5 h-5 text-surface-500" />
    }
  }

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
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors relative"
              >
                <Bell className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-accent-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-dark-soft border border-surface-200 dark:border-dark-border overflow-hidden z-50 animate-fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface-light">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                      <h3 className="font-semibold text-surface-900 dark:text-dark-text">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-dark-primary dark:hover:text-dark-primary-hover font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-surface-100 dark:border-dark-border hover:bg-surface-50 dark:hover:bg-dark-surface-light transition-colors cursor-pointer ${
                          !notification.read ? 'bg-primary-50/50 dark:bg-dark-primary/10' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.link) {
                            router.push(notification.link)
                            setNotificationsOpen(false)
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-surface-900 dark:text-dark-text' : 'text-surface-700 dark:text-dark-text-muted'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-primary-500 dark:bg-dark-primary rounded-full mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-surface-600 dark:text-dark-text-muted mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <Clock className="w-3 h-3 text-surface-400 dark:text-dark-text-muted" />
                              <span className="text-xs text-surface-400 dark:text-dark-text-muted">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface-light">
                    <Link
                      href="/reports"
                      className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary dark:hover:text-dark-primary-hover font-medium"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      View all survey reports
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
                    <span>Go to <strong className="dark:text-dark-text">Surveys → Survey Builder</strong> to build a survey</span>
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
