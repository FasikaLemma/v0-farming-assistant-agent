'use client'

import { useState, useEffect } from 'react'
import { AppSidebar, MobileMenuButton } from '@/components/sidebar/app-sidebar'
import { FloatingAssistant } from '@/components/ai-assistant/floating-assistant'
import { cn } from '@/lib/utils'
import { Leaf } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Open sidebar by default on desktop
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 h-screen transition-all duration-200",
        // On desktop, adjust margin based on sidebar state
        "lg:ml-0"
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 z-10">
          <MobileMenuButton onClick={() => setSidebarOpen(true)} />
          <div className="flex items-center gap-2 ml-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Farm AI Assistant</span>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant - Accessible on all pages */}
      <FloatingAssistant />
    </div>
  )
}
