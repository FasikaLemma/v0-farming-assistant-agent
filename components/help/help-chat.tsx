'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Send,
  HelpCircle,
  User,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FarmContext {
  recentTopics?: string[]
  soilData?: Record<string, unknown>
  cropRecommendations?: string[]
}

interface HelpChatProps {
  farmContext?: FarmContext
  className?: string
}

const suggestedQuestions = [
  { text: 'How do I input my soil data?', color: 'bg-primary/10 hover:bg-primary/20 border-primary/30' },
  { text: 'What do NPK values mean?', color: 'bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30' },
  { text: 'How does crop recommendation work?', color: 'bg-accent/10 hover:bg-accent/20 border-accent/30' },
  { text: 'How can I detect plant diseases?', color: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30' },
  { text: 'How do I upload images for analysis?', color: 'bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/30' },
  { text: 'What market insights can you provide?', color: 'bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/30' },
]

// Helper to extract text from UIMessage parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

function formatHelpMessage(content: string): React.ReactNode {
  const lines = content.split('\n')
  
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        if (line.match(/^[📚💡🔍✅⚠️📖🌱📊➡️]/)) {
          const isBold = line.includes('**')
          const cleanLine = line.replace(/\*\*/g, '')
          return (
            <p key={index} className={cn("text-sm", isBold && "font-semibold text-foreground")}>
              {cleanLine}
            </p>
          )
        }
        
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g)
          return (
            <p key={index} className="text-sm">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
              )}
            </p>
          )
        }
        
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={index} className="text-sm pl-3 text-muted-foreground">
              {line}
            </p>
          )
        }
        
        if (line.match(/^\d+\./)) {
          return (
            <p key={index} className="text-sm pl-3">
              {line}
            </p>
          )
        }
        
        if (line.trim() === '') {
          return <div key={index} className="h-1" />
        }
        
        return (
          <p key={index} className="text-sm text-muted-foreground">
            {line}
          </p>
        )
      })}
    </div>
  )
}

export function HelpChat({ className }: HelpChatProps) {
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => `help_${Date.now()}`)
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Create transport for chat API
  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      headers: { 'Content-Type': 'application/json' },
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, sessionId },
      }),
    })
  }, [sessionId])

  const { messages, sendMessage, status } = useChat({
    transport,
    id: sessionId,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, status])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input.trim() })
    setInput('')
  }

  const handleSuggestion = (question: string) => {
    if (isLoading) return
    sendMessage({ text: question })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFeedback = (messageId: string) => {
    setFeedbackGiven(prev => new Set(prev).add(messageId))
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="border-b shrink-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          AI Help Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask me anything about using the app or farming concepts
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Start by asking a question or try one of these:
                </p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.text}
                      className={cn(
                        "flex items-center justify-start text-left h-auto py-2.5 px-3 rounded-lg border-2 transition-all duration-200",
                        "hover:scale-[1.01] active:scale-[0.99]",
                        q.color,
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleSuggestion(q.text)}
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <span className="text-sm">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2'
                          : 'flex-1'
                      )}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm">{getMessageText(message)}</p>
                      ) : (
                        <div className="space-y-2">
                          <Card className="border-0 shadow-sm bg-muted/50">
                            <CardContent className="p-3">
                              {formatHelpMessage(getMessageText(message))}
                            </CardContent>
                          </Card>
                          {/* Feedback buttons */}
                          {!feedbackGiven.has(message.id) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Was this helpful?</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleFeedback(message.id)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleFeedback(message.id)}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {feedbackGiven.has(message.id) && (
                            <p className="text-xs text-muted-foreground">
                              Thanks for your feedback!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="bg-muted text-xs">
                          <User className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs ml-1">Finding answer...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="min-h-[40px] max-h-[120px] resize-none text-sm focus-visible:ring-primary"
              disabled={isLoading}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 h-10 w-10 bg-primary hover:bg-primary/90"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
