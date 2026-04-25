'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Leaf,
  MessageSquare,
  LayoutDashboard,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
  Sprout,
  Sun,
  Droplets,
  Bug,
  TrendingUp,
  HelpCircle,
} from 'lucide-react'
import { useChatStore } from '@/lib/chat-store'

const navigation = [
  { name: 'Chat', href: '/', icon: MessageSquare },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'History', href: '/history', icon: History },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

const capabilities = [
  { name: 'Soil Analysis', icon: Droplets, description: 'NPK, pH, moisture' },
  { name: 'Crop Planning', icon: Sprout, description: 'Best matches for your soil' },
  { name: 'Weather & Timing', icon: Sun, description: 'Optimal planting windows' },
  { name: 'Disease Detection', icon: Bug, description: 'Image-based analysis' },
  { name: 'Market Insights', icon: TrendingUp, description: 'Price trends & timing' },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { sessions } = useChatStore()

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
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Farm AI</span>
                  <span className="text-xs text-sidebar-foreground/60">Assistant</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={onToggle}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onToggle}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* New Chat Button */}
        <div className={cn('p-3', !isOpen && 'hidden lg:flex lg:justify-center lg:p-2')}>
          <Link href="/" className="w-full">
            <Button
              className={cn(
                'gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90',
                isOpen ? 'w-full' : 'w-10 h-10 p-0'
              )}
            >
              <Plus className="h-4 w-4" />
              {isOpen && <span>New Chat</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn('px-3 space-y-1', !isOpen && 'hidden lg:block lg:px-2')}>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                    !isOpen && 'lg:justify-center lg:w-10 lg:h-10 lg:p-0 lg:mx-auto'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Capabilities */}
        {isOpen && (
          <div className="px-3 mt-6">
            <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2">
              Capabilities
            </p>
            <div className="space-y-1">
              {capabilities.map((cap) => (
                <div
                  key={cap.name}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-sidebar-foreground/80"
                >
                  <cap.icon className="h-4 w-4 shrink-0 text-sidebar-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cap.name}</p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        {isOpen && sessions.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 mt-6">
            <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-5">
              Recent Chats
            </p>
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1">
                {sessions.slice(0, 10).map((session) => (
                  <button
                    key={session.id}
                    className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
                  >
                    <History className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{session.title}</p>
                      <p className="text-xs text-sidebar-foreground/50">
                        {new Date(session.timestamp).toLocaleDateString()}
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
              'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
