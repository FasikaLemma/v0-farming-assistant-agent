'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatInterface } from '@/components/chat/chat-interface'

function ChatWithSession() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  
  return <ChatInterface initialSessionId={sessionId} />
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex-1 p-4 space-y-4">
        <div className="h-12 bg-muted rounded-lg w-3/4" />
        <div className="h-12 bg-muted rounded-lg w-1/2 ml-auto" />
        <div className="h-12 bg-muted rounded-lg w-2/3" />
      </div>
      <div className="p-4 border-t">
        <div className="h-12 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatWithSession />
    </Suspense>
  )
}
