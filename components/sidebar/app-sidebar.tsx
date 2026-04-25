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
  Sun,
  Droplets,
  Bug,
  TrendingUp,
  HelpCircle,
  Activity,
  Target,
  CloudRain,
  MessageSquare,
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
    color: 'bg-primary/10 hover:bg-primary/20 border-primary/40 text-primary hover:border-primary'
  },
  { 
    name: 'Detect Disease', 
    icon: Bug, 
    href: '/', 
    color: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/40 text-destructive hover:border-destructive'
  },
  { 
    name: 'Plan Crops', 
    icon: Sprout, 
    href: '/', 
    color: 'bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/40 text-chart-2 hover:border-chart-2'
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
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300',
          isOpen ? 'w-72' : 'w-0 lg:w-16',
          'lg:relative'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
          !isOpen && 'lg:justify-center lg:px-2'
        )}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Farm AI</span>
                  <span className="text-xs text-sidebar-foreground/60">Smart Farming</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
                onClick={onToggle}
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className={cn('px-3 py-4 space-y-1', !isOpen && 'hidden lg:block lg:px-2')}>
          <p className={cn(
            'text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2',
            !isOpen && 'lg:hidden'
          )}>
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-11',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                    !isOpen && 'lg:justify-center lg:w-12 lg:h-12 lg:p-0 lg:mx-auto'
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
                  {isOpen && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-sidebar-foreground/50">{item.description}</span>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Capabilities Section */}
        {isOpen && (
          <div className="px-3 mt-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                Capabilities
              </p>
              <Badge variant="secondary" className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground">
                5
              </Badge>
            </div>
            <div className="space-y-0.5">
              {capabilities.map((cap) => (
                <Link key={cap.name} href={cap.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <cap.icon className={cn('h-4 w-4 shrink-0', cap.color)} />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-sm truncate">{cap.name}</span>
                      <span className="text-xs text-sidebar-foreground/40">{cap.description}</span>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isOpen && (
          <div className="px-3 mt-6">
            <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <button
                    className={cn(
                      "w-full h-auto py-3 flex flex-col items-center gap-1.5 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]",
                      action.color
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-[10px] leading-tight text-center font-medium">{action.name}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        {isOpen && sessions.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 mt-6">
            <div className="flex items-center justify-between px-5 mb-2">
              <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                Recent Chats
              </p>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground p-0">
                  View All
                </Button>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-0.5">
                {sessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{session.title}</p>
                      <p className="text-[10px] text-sidebar-foreground/40">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          'border-t border-sidebar-border p-3 mt-auto',
          !isOpen && 'hidden lg:flex lg:justify-center lg:p-2'
        )}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              !isOpen && 'lg:justify-center lg:w-10 lg:h-10 lg:p-0'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {isOpen && <span>Settings</span>}
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
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  )
}
