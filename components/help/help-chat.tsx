'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Send,
  HelpCircle,
  User,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
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

interface HelpMessage {
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  'How do I input my soil data?',
  'What do NPK values mean?',
  'How does crop recommendation work?',
  'How can I detect plant diseases?',
  'How do I upload images for analysis?',
  'What market insights can you provide?',
]

function generateHelpSessionId(): string {
  return `help_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function formatHelpMessage(content: string): React.ReactNode {
  const lines = content.split('\n')
  
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        // Headers with emoji
        if (line.match(/^[📚💡🔍✅⚠️📖🌱]/)) {
          const isBold = line.includes('**')
          const cleanLine = line.replace(/\*\*/g, '')
          return (
            <p key={index} className={cn("text-sm", isBold && "font-semibold")}>
              {cleanLine}
            </p>
          )
        }
        
        // Bold text
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g)
          return (
            <p key={index} className="text-sm">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          )
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={index} className="text-sm pl-3">
              {line}
            </p>
          )
        }
        
        // Numbered items
        if (line.match(/^\d+\./)) {
          return (
            <p key={index} className="text-sm pl-3">
              {line}
            </p>
          )
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-1" />
        }
        
        // Regular text
        return (
          <p key={index} className="text-sm">
            {line}
          </p>
        )
      })}
    </div>
  )
}

export function HelpChat({ farmContext, className }: HelpChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<HelpMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session ID on mount
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('helpSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = generateHelpSessionId()
      setSessionId(newSessionId)
      sessionStorage.setItem('helpSessionId', newSessionId)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const sendHelpMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) return

    setError(null)
    const userMessage: HelpMessage = { role: 'user', content: content.trim() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: content.trim() }],
          sessionId,
          mode: 'help',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: HelpMessage = {
        role: 'assistant',
        content: data.message,
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error sending help message:', err)
      setError('Failed to get help. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, sessionId])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendHelpMessage(input)
    setInput('')
  }, [input, isLoading, sendHelpMessage])

  const handleSuggestion = (question: string) => {
    sendHelpMessage(question)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFeedback = (messageIndex: number, helpful: boolean) => {
    setFeedbackGiven(prev => new Set(prev).add(messageIndex))
    // In a real app, you'd send this feedback to an API
    console.log(`Message ${messageIndex} marked as ${helpful ? 'helpful' : 'not helpful'}`)
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
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleSuggestion(q)}
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <span className="text-sm">{q}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
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
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="space-y-2">
                          <Card className="border-0 shadow-sm bg-muted/50">
                            <CardContent className="p-3">
                              {formatHelpMessage(message.content)}
                            </CardContent>
                          </Card>
                          {/* Feedback buttons */}
                          {!feedbackGiven.has(index) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Was this helpful?</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleFeedback(index, true)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleFeedback(index, false)}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {feedbackGiven.has(index) && (
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Spinner className="w-3 h-3" />
                      <span className="text-xs">Finding answer...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-destructive text-destructive-foreground text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="border-destructive/50 bg-destructive/10">
                      <CardContent className="p-2">
                        <p className="text-xs text-destructive">{error}</p>
                      </CardContent>
                    </Card>
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
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              disabled={isLoading}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 h-10 w-10"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
