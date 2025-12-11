'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Building2,
  BarChart3,
  Heart,
  PanelLeftClose,
  PanelLeft,
  Send,
  ClipboardList,
  FileBarChart,
  UserCog,
  FolderOpen,
  PenSquare,
  List,
  ScrollText,
  GitCompare,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  adminOnly?: boolean
}

// Improved navigation structure with logical hierarchy
const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Surveys',
    icon: ClipboardList,
    children: [
      { name: 'Create New', href: '/surveys/builder', icon: PenSquare },
      { name: 'Send Survey', href: '/surveys/send', icon: Send },
      { name: 'All Surveys', href: '/municipalities/report', icon: List },
    ],
  },
  {
    name: 'Municipalities',
    icon: Building2,
    children: [
      { name: 'Overview', href: '/municipalities', icon: FolderOpen },
      { name: 'Agreements', href: '/municipalities/framework', icon: ScrollText },
      { name: 'Placements', href: '/municipalities/placement', icon: FileText },
    ],
  },
  {
    name: 'Analysis',
    icon: BarChart3,
    children: [
      { name: 'Reports', href: '/reports', icon: FileBarChart },
      { name: 'Compare', href: '/analyse', icon: GitCompare },
    ],
  },
  {
    name: 'Administration',
    icon: UserCog,
    adminOnly: true,
    children: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  className?: string
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  userRole?: 'ADMIN' | 'CAREGIVER'
}

export default function Sidebar({ 
  className = '', 
  onClose, 
  collapsed = false, 
  onToggleCollapse,
  userRole = 'CAREGIVER'
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  // Check if current path is within item's children
  const isItemActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some(child => child.href && pathname.startsWith(child.href!))
    }
    return false
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
    }
  }

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && userRole !== 'ADMIN') return false
    return true
  })

  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = item.href ? isActive(item.href) : false
    const hasActiveChild = isItemActive(item)

    const handleClick = () => {
      if (hasChildren) {
        toggleExpand(item.name)
      } else if (item.href) {
        onClose?.()
      }
    }

    // Collapsed view - icon only
    if (collapsed && depth === 0) {
      return (
        <div className="relative group">
          {item.href ? (
            <Link href={item.href}>
              <div
                className={`
                  flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-150
                  ${active || hasActiveChild
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                  }
                `}
                title={item.name}
              >
                <item.icon className={`w-4 h-4 ${active || hasActiveChild ? 'text-primary-600' : ''}`} />
              </div>
            </Link>
          ) : (
            <div
              className={`
                flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-150
                ${hasActiveChild
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                }
              `}
              onClick={handleClick}
              title={item.name}
            >
              <item.icon className={`w-4 h-4 ${hasActiveChild ? 'text-primary-600' : ''}`} />
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.name}
          </div>
        </div>
      )
    }

    const content = (
      <div
        className={`
          flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150
          ${depth > 0 ? 'ml-3 pl-5 text-xs' : 'text-[13px]'}
          ${active 
            ? 'bg-primary-50 text-primary-700 font-medium' 
            : hasActiveChild && depth === 0
              ? 'text-primary-700'
              : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
          }
        `}
        onClick={handleClick}
      >
        <item.icon className={`w-4 h-4 flex-shrink-0 ${active || hasActiveChild ? 'text-primary-600' : ''}`} />
        <span className="flex-1">{item.name}</span>
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
          </motion.div>
        )}
      </div>
    )

    return (
      <div>
        {item.href ? (
          <Link href={item.href}>{content}</Link>
        ) : (
          content
        )}
        
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-0.5 space-y-0.5 border-l border-surface-200 ml-4">
                {item.children!.map((child) => (
                  <NavItemComponent key={child.name} item={child} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white w-full ${className}`}>
      {/* Logo */}
      <div className="p-3 border-b border-surface-200">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors flex-shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.h1 
              className="text-xs font-display font-semibold text-surface-900 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Healthcare Provider
            </motion.h1>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="mx-2 mt-2 p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors flex items-center justify-center"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-2 space-y-0.5 overflow-y-auto`}>
        {filteredNavigation.map((item) => (
          <NavItemComponent key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-surface-200 space-y-0.5`}>
        {collapsed ? (
          <>
            <Link
              href="/help"
              className="flex items-center justify-center p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
              onClick={onClose}
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg text-surface-500 hover:bg-accent-50 hover:text-accent-600 transition-colors w-full"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/help"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-surface-600 hover:bg-surface-100 hover:text-surface-800 transition-colors"
              onClick={onClose}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-surface-600 hover:bg-accent-50 hover:text-accent-600 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
