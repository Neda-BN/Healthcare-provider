'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface Municipality {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CAREGIVER'
}

interface DashboardLayoutProps {
  children: React.ReactNode
  municipalities: Municipality[]
  user: User
}

export default function DashboardLayout({ children, municipalities, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(
    municipalities[0] || null
  )

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:border-r lg:border-surface-200 lg:overflow-hidden transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-60'
        }`}
      >
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors z-10"
              >
                <X className="w-4 h-4 text-surface-600" />
              </button>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-200 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-60'
      }`}>
        <TopBar
          municipalities={municipalities}
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={setSelectedMunicipality}
          onMenuClick={() => setSidebarOpen(true)}
          userName={user.name}
          userRole={user.role}
        />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
