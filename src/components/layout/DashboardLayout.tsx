'use client'

import { useState, useEffect } from 'react'
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
    <div className="min-h-screen bg-surface-50 dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:border-r lg:border-surface-200 dark:lg:border-dark-border lg:overflow-hidden transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-60'
        }`}
      >
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={user.role}
        />
      </aside>

      {/* Mobile Sidebar Overlay - No Framer Motion */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden animate-slide-in"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-dark-surface-light dark:hover:bg-dark-surface-lighter transition-colors z-10"
            >
              <X className="w-4 h-4 text-surface-600 dark:text-dark-text" />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} userRole={user.role} />
          </aside>
        </>
      )}

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
