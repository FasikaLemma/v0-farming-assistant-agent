'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Empty } from '@/components/ui/empty'
import {
  History,
  MessageSquare,
  Trash2,
  ArrowRight,
  Clock,
  Leaf,
} from 'lucide-react'
import Link from 'next/link'
import { useChatStore } from '@/lib/chat-store'
import { formatDistanceToNow } from 'date-fns'

export default function HistoryPage() {
  const { sessions, deleteSession, clearAllSessions } = useChatStore()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Chat History
          </h1>
          <p className="text-muted-foreground">
            Review your past conversations with the farming assistant
          </p>
        </div>
        {sessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm('Are you sure you want to clear all chat history?')) {
                clearAllSessions()
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <Empty
              icon={MessageSquare}
              title="No chat history yet"
              description="Start a new conversation to see your chat history here."
              action={
                <Link href="/">
                  <Button className="gap-2">
                    <Leaf className="h-4 w-4" />
                    Start New Chat
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{session.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {session.preview}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                          </span>
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Delete this conversation?')) {
                            deleteSession(session.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/?session=${session.id}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
