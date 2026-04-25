'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Leaf,
  LayoutDashboard,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sprout,
  Droplets,
  Bug,
  TrendingUp,
  HelpCircle,
  Activity,
  Target,
  CloudRain,
  MessageSquare,
  Plus,
  Clock,
  X,
  Zap,
} from 'lucide-react'
import { useChatStore } from '@/lib/chat-store'

// Main navigation
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview' },
  { name: 'Chat', href: '/', icon: MessageSquare, description: 'AI Assistant' },
  { name: 'History', href: '/history', icon: History, description: 'Past Chats' },
  { name: 'Help', href: '/help', icon: HelpCircle, description: 'Support' },
]

// Capabilities
const capabilities = [
  { name: 'Crop Health', icon: Activity, href: '/dashboard?tab=crop-health', color: 'text-chart-2' },
  { name: 'Soil & Fertility', icon: Droplets, href: '/dashboard?tab=soil', color: 'text-primary' },
  { name: 'Crop Advice', icon: Target, href: '/dashboard?tab=recommendations', color: 'text-chart-4' },
  { name: 'Weather', icon: CloudRain, href: '/dashboard?tab=weather', color: 'text-chart-3' },
  { name: 'Market', icon: TrendingUp, href: '/dashboard?tab=market', color: 'text-accent' },
]

// Quick actions with colors
const quickActions = [
  { 
    name: 'Soil', 
    icon: Droplets, 
    href: '/?action=soil', 
    bgColor: 'bg-primary/15',
    hoverBg: 'hover:bg-primary/25',
    borderColor: 'border-primary/30',
    textColor: 'text-primary',
    iconBg: 'bg-primary/20'
  },
  { 
    name: 'Disease', 
    icon: Bug, 
    href: '/?action=disease', 
    bgColor: 'bg-destructive/15',
    hoverBg: 'hover:bg-destructive/25',
    borderColor: 'border-destructive/30',
    textColor: 'text-destructive',
    iconBg: 'bg-destructive/20'
  },
  { 
    name: 'Crops', 
    icon: Sprout, 
    href: '/?action=crops', 
    bgColor: 'bg-chart-2/15',
    hoverBg: 'hover:bg-chart-2/25',
    borderColor: 'border-chart-2/30',
    textColor: 'text-chart-2',
    iconBg: 'bg-chart-2/20'
  },
  { 
    name: 'Weather', 
    icon: CloudRain, 
    href: '/?action=weather', 
    bgColor: 'bg-chart-3/15',
    hoverBg: 'hover:bg-chart-3/25',
    borderColor: 'border-chart-3/30',
    textColor: 'text-chart-3',
    iconBg: 'bg-chart-3/20'
  },
  { 
    name: 'Market', 
    icon: TrendingUp, 
    href: '/?action=market', 
    bgColor: 'bg-accent/15',
    hoverBg: 'hover:bg-accent/25',
    borderColor: 'border-accent/30',
    textColor: 'text-accent',
    iconBg: 'bg-accent/20'
  },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { sessions, fetchSessions } = useChatStore()
  const sidebarRef = useRef<HTMLElement>(null)

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions('farming')
  }, [fetchSessions])

  // Close sidebar on escape key (mobile only)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        onToggle()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onToggle])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNavigation = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'bg-sidebar text-sidebar-foreground flex flex-col h-screen',
          // Mobile: fixed drawer
          'fixed top-0 left-0 z-50 w-[280px] max-w-[85vw]',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: relative positioning with width transition
          'lg:relative lg:translate-x-0 lg:z-0',
          'lg:transition-[width] lg:duration-200 lg:ease-out',
          isOpen ? 'lg:w-64' : 'lg:w-16',
          // Ensure it's above main content on desktop when expanded
          'lg:shrink-0'
        )}
      >
        {/* Header - Fixed height */}
        <div className={cn(
          'flex items-center h-14 px-3 border-b border-sidebar-border shrink-0',
          !isOpen && 'lg:justify-center lg:px-2'
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 flex items-center justify-center shrink-0 shadow-sm">
                  <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm">Farm AI</span>
                  <span className="text-[10px] text-sidebar-foreground/50">Smart Farming</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
                onClick={onToggle}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 lg:hidden" />
                <ChevronLeft className="h-4 w-4 hidden lg:block" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
              onClick={onToggle}
              aria-label="Open sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className={cn('pb-4', !isOpen && 'hidden lg:block')}>
            
            {/* Quick Actions - Horizontal Scroll */}
            {isOpen && (
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between px-3 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-sidebar-primary" />
                    <p className="text-xs font-semibold text-sidebar-foreground/80 uppercase tracking-wide">
                      Quick Actions
                    </p>
                  </div>
                </div>
                
                {/* Horizontal scroll container */}
                <div className="overflow-x-auto px-3 pb-2 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
                  <div className="flex gap-2 w-max">
                    {quickActions.map((action) => (
                      <Link 
                        key={action.name} 
                        href={action.href} 
                        onClick={handleNavigation}
                        className="shrink-0"
                      >
                        <button
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200",
                            "min-w-[70px] w-[70px]",
                            "hover:scale-[1.02] active:scale-[0.98]",
                            "touch-manipulation shadow-sm hover:shadow-md",
                            action.bgColor,
                            action.hoverBg,
                            action.borderColor,
                            action.textColor
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            action.iconBg
                          )}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-semibold leading-tight text-center">
                            {action.name}
                          </span>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <nav className={cn('px-2 py-2 space-y-0.5', !isOpen && 'lg:px-2')}>
              <p className={cn(
                'text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2',
                !isOpen && 'lg:hidden'
              )}>
                Menu
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} onClick={handleNavigation}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10 px-2',
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                        !isOpen && 'lg:justify-center lg:w-10 lg:h-10 lg:p-0 lg:mx-auto'
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 shrink-0 transition-colors', 
                        isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
                      )} />
                      {isOpen && (
                        <div className="flex flex-col items-start min-w-0">
                          <span className="text-sm">{item.name}</span>
                        </div>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Recent Chats */}
            {isOpen && (
              <div className="px-2 mt-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-sidebar-foreground/50" />
                    <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                      Recent Chats
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Link href="/">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        title="New Chat"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link href="/history">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[10px] text-sidebar-foreground/50 hover:text-sidebar-foreground px-1.5"
                      >
                        All
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="space-y-0.5">
                    {sessions.slice(0, 4).map((session) => (
                      <Link key={session.id} href={`/?session=${session.session_id}`} onClick={handleNavigation}>
                        <button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-left group">
                          <div className="w-7 h-7 rounded-lg bg-sidebar-accent/50 flex items-center justify-center shrink-0 group-hover:bg-sidebar-primary/20 transition-colors">
                            <MessageSquare className="h-3.5 w-3.5 text-sidebar-foreground/60 group-hover:text-sidebar-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">{session.title}</p>
                            <p className="text-[10px] text-sidebar-foreground/40">
                              {new Date(session.updated_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center rounded-lg bg-sidebar-accent/30">
                    <MessageSquare className="h-6 w-6 mx-auto text-sidebar-foreground/20 mb-1.5" />
                    <p className="text-[10px] text-sidebar-foreground/40 mb-2">No recent chats</p>
                    <Link href="/" onClick={handleNavigation}>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-primary/10">
                        Start chatting
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Capabilities */}
            {isOpen && (
              <div className="px-2 mt-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    Capabilities
                  </p>
                  <Badge variant="secondary" className="text-[9px] bg-sidebar-accent text-sidebar-accent-foreground h-4 px-1">
                    {capabilities.length}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {capabilities.map((cap) => (
                    <Link key={cap.name} href={cap.href} onClick={handleNavigation}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-9 px-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <cap.icon className={cn('h-4 w-4 shrink-0', cap.color)} />
                        <span className="text-xs">{cap.name}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed height */}
        <div className={cn(
          'border-t border-sidebar-border p-2 shrink-0 bg-sidebar',
          !isOpen && 'hidden lg:block lg:p-2'
        )}>
          {isOpen && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-sidebar-accent/30">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Farm AI v2.0</p>
                <p className="text-[10px] text-sidebar-foreground/50">Free Plan</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// Mobile menu button
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden h-10 w-10 touch-manipulation"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
