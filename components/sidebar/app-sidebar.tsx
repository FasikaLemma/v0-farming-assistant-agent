'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Leaf,
  LayoutDashboard,
  History,
  Settings,
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
} from 'lucide-react'
import { useChatStore } from '@/lib/chat-store'

// Main navigation - Dashboard first, Chat accessible via floating button
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview' },
  { name: 'Chat', href: '/', icon: MessageSquare, description: 'AI Assistant' },
  { name: 'History', href: '/history', icon: History, description: 'Past Chats' },
  { name: 'Help', href: '/help', icon: HelpCircle, description: 'Support' },
]

// Capabilities - organized by function
const capabilities = [
  { 
    name: 'Crop Health', 
    icon: Activity, 
    description: 'Monitor crops',
    href: '/dashboard?tab=crop-health',
    color: 'text-chart-2'
  },
  { 
    name: 'Soil & Fertility', 
    icon: Droplets, 
    description: 'NPK analysis',
    href: '/dashboard?tab=soil',
    color: 'text-primary'
  },
  { 
    name: 'Crop Advice', 
    icon: Target, 
    description: 'Recommendations',
    href: '/dashboard?tab=recommendations',
    color: 'text-chart-4'
  },
  { 
    name: 'Weather', 
    icon: CloudRain, 
    description: 'Forecasts',
    href: '/dashboard?tab=weather',
    color: 'text-chart-3'
  },
  { 
    name: 'Market', 
    icon: TrendingUp, 
    description: 'Price insights',
    href: '/dashboard?tab=market',
    color: 'text-accent'
  },
]

// Quick actions for farmers with distinct colors
const quickActions = [
  { 
    name: 'Analyze Soil', 
    icon: Droplets, 
    href: '/', 
    color: 'bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:border-primary/60'
  },
  { 
    name: 'Detect Disease', 
    icon: Bug, 
    href: '/', 
    color: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive hover:border-destructive/60'
  },
  { 
    name: 'Plan Crops', 
    icon: Sprout, 
    href: '/', 
    color: 'bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30 text-chart-2 hover:border-chart-2/60'
  },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { sessions, fetchSessions } = useChatStore()

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions('farming')
  }, [fetchSessions])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out',
          isOpen ? 'w-72' : 'w-0 lg:w-16',
          'lg:relative'
        )}
      >
        {/* Header - Fixed at top */}
        <div className={cn(
          'flex items-center h-14 sm:h-16 px-3 sm:px-4 border-b border-sidebar-border shrink-0',
          !isOpen && 'lg:justify-center lg:px-2'
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">Farm AI</span>
                  <span className="text-xs text-sidebar-foreground/60 truncate">Smart Farming</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
                onClick={onToggle}
                aria-label="Close sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onToggle}
              aria-label="Open sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className={cn('pb-4', !isOpen && 'hidden lg:block')}>
            {/* Main Navigation */}
            <nav className={cn('px-2 sm:px-3 py-3 space-y-0.5', !isOpen && 'lg:px-2')}>
              <p className={cn(
                'text-[10px] sm:text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2',
                !isOpen && 'lg:hidden'
              )}>
                Navigation
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) onToggle()
                  }}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-2 sm:gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10 sm:h-11 px-2 sm:px-3',
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                        !isOpen && 'lg:justify-center lg:w-11 lg:h-11 lg:p-0 lg:mx-auto'
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <item.icon className={cn('h-4 w-4 sm:h-5 sm:w-5 shrink-0', isActive && 'text-sidebar-primary')} />
                      {isOpen && (
                        <div className="flex flex-col items-start min-w-0">
                          <span className="text-xs sm:text-sm truncate">{item.name}</span>
                          <span className="text-[10px] sm:text-xs text-sidebar-foreground/50 truncate">{item.description}</span>
                        </div>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Recent Chats - NOW ABOVE Quick Actions */}
            {isOpen && (
              <div className="px-2 sm:px-3 mt-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-sidebar-foreground/50" />
                    <p className="text-[10px] sm:text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                      Recent Chats
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
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
                        className="h-6 text-[10px] sm:text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground px-1.5"
                      >
                        View All
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="space-y-0.5">
                    {sessions.slice(0, 5).map((session) => (
                      <Link key={session.id} href={`/?session=${session.session_id}`}>
                        <button
                          className="flex items-center gap-2 sm:gap-3 w-full px-2 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-md bg-sidebar-accent/50 flex items-center justify-center shrink-0 group-hover:bg-sidebar-primary/20">
                            <MessageSquare className="h-3.5 w-3.5 text-sidebar-foreground/60 group-hover:text-sidebar-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs sm:text-sm font-medium">{session.title}</p>
                            <p className="text-[10px] text-sidebar-foreground/40">
                              {new Date(session.updated_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto text-sidebar-foreground/20 mb-2" />
                    <p className="text-xs text-sidebar-foreground/40">No recent chats</p>
                    <Link href="/">
                      <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs text-sidebar-primary hover:text-sidebar-primary">
                        Start a conversation
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions - NOW BELOW Recent Chats */}
            {isOpen && (
              <div className="px-2 sm:px-3 mt-5">
                <p className="text-[10px] sm:text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
                  Quick Actions
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {quickActions.map((action) => (
                    <Link key={action.name} href={action.href} onClick={() => {
                      if (window.innerWidth < 1024) onToggle()
                    }}>
                      <button
                        className={cn(
                          "w-full h-auto py-2.5 sm:py-3 flex flex-col items-center gap-1 sm:gap-1.5 rounded-lg border transition-all duration-200",
                          "hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]",
                          "touch-manipulation",
                          action.color
                        )}
                      >
                        <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-[9px] sm:text-[10px] leading-tight text-center font-medium px-0.5">{action.name}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Capabilities Section */}
            {isOpen && (
              <div className="px-2 sm:px-3 mt-5">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-[10px] sm:text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                    Capabilities
                  </p>
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] bg-sidebar-accent text-sidebar-accent-foreground h-4 sm:h-5 px-1.5">
                    5
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {capabilities.map((cap) => (
                    <Link key={cap.name} href={cap.href} onClick={() => {
                      if (window.innerWidth < 1024) onToggle()
                    }}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 sm:gap-3 h-9 sm:h-10 px-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <cap.icon className={cn('h-4 w-4 shrink-0', cap.color)} />
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="text-xs sm:text-sm truncate">{cap.name}</span>
                          <span className="text-[10px] text-sidebar-foreground/40 hidden sm:inline">{cap.description}</span>
                        </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Fixed at bottom */}
        <div className={cn(
          'border-t border-sidebar-border p-2 sm:p-3 shrink-0',
          !isOpen && 'hidden lg:flex lg:justify-center lg:p-2'
        )}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 sm:gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 sm:h-10 px-2 sm:px-3',
              !isOpen && 'lg:justify-center lg:w-10 lg:h-10 lg:p-0'
            )}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            {isOpen && <span className="text-xs sm:text-sm">Settings</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}

// Mobile menu button component
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
