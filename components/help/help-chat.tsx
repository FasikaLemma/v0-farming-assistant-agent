'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Send,
  HelpCircle,
  User,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpChatProps {
  className?: string
}

const suggestedQuestions = [
  { 
    text: 'How do I input my soil data?', 
    color: 'bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary',
    icon: '🌱'
  },
  { 
    text: 'What do NPK values mean?', 
    color: 'bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30 text-chart-2',
    icon: '🧪'
  },
  { 
    text: 'How does crop recommendation work?', 
    color: 'bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent',
    icon: '🌾'
  },
  { 
    text: 'How can I detect plant diseases?', 
    color: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive',
    icon: '🔬'
  },
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
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Bold text with **
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g)
          return (
            <p key={index} className="text-sm leading-relaxed">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
              )}
            </p>
          )
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={index} className="text-sm pl-4 text-muted-foreground flex gap-2">
              <span className="text-primary">•</span>
              <span>{line.substring(2)}</span>
            </p>
          )
        }
        
        // Numbered lists
        if (line.match(/^\d+\./)) {
          const match = line.match(/^(\d+)\.\s*(.*)/)
          if (match) {
            return (
              <p key={index} className="text-sm pl-4 flex gap-2">
                <span className="text-primary font-medium">{match[1]}.</span>
                <span className="text-muted-foreground">{match[2]}</span>
              </p>
            )
          }
        }
        
        // Empty line
        if (line.trim() === '') {
          return <div key={index} className="h-2" />
        }
        
        return (
          <p key={index} className="text-sm leading-relaxed text-muted-foreground">
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Auto-resize textarea
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
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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
    <div className={cn('flex flex-col bg-background', className)}>
      {/* Header */}
      <div className="px-4 py-4 border-b shrink-0 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">AI Help Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask me anything about using the app
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            /* Empty State with Suggestions */
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Hi! How can I help?</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  I can explain features, answer questions, and guide you through using the farming assistant.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">
                  Try asking
                </p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.text}
                      className={cn(
                        "flex items-center gap-3 text-left py-3 px-4 rounded-xl border-2 transition-all duration-200",
                        "hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm",
                        q.color,
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleSuggestion(q.text)}
                      disabled={isLoading}
                    >
                      <span className="text-lg">{q.icon}</span>
                      <span className="text-sm font-medium">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message List */
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
                    <Avatar className="w-8 h-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] min-w-0',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3'
                        : 'flex-1'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm break-words">{getMessageText(message)}</p>
                    ) : (
                      <div className="space-y-3">
                        <Card className="border-0 shadow-sm bg-muted/50">
                          <CardContent className="p-4">
                            {formatHelpMessage(getMessageText(message))}
                          </CardContent>
                        </Card>
                        {/* Feedback buttons */}
                        {!feedbackGiven.has(message.id) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                            <span>Was this helpful?</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleFeedback(message.id)}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleFeedback(message.id)}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        {feedbackGiven.has(message.id) && (
                          <p className="text-xs text-primary pl-1 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            Thanks for your feedback!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="shrink-0 border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="min-h-[48px] max-h-[120px] resize-none text-base pr-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isLoading}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="shrink-0 h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
