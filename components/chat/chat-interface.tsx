'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Send,
  ImagePlus,
  Sparkles,
  User,
  Leaf,
  X,
  HelpCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickActions = [
  { 
    label: 'Analyze my soil', 
    prompt: 'I want to analyze my soil. I have N: 35 mg/kg, P: 20 mg/kg, K: 40 mg/kg, pH: 6.5, and moisture: 45%.',
    color: 'bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary'
  },
  { 
    label: 'Recommend crops', 
    prompt: 'What crops should I plant this spring in California with neutral soil and optimal moisture?',
    color: 'bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/30 text-chart-2'
  },
  { 
    label: 'Check planting time', 
    prompt: 'When should I plant tomatoes in Texas?',
    color: 'bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent-foreground'
  },
  { 
    label: 'Fertilizer advice', 
    prompt: 'My soil is low in nitrogen and phosphorus. What fertilizers do you recommend for growing corn? I prefer organic options.',
    color: 'bg-chart-4/10 hover:bg-chart-4/20 border-chart-4/30 text-chart-4'
  },
  { 
    label: 'Market prices', 
    prompt: 'What are the current market prices for wheat? I have about 500 bushels to sell in the Midwest region.',
    color: 'bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/30 text-chart-3'
  },
  { 
    label: 'Disease help', 
    prompt: 'My tomato plants have yellow leaves with brown spots. Can you help identify the disease?',
    color: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive'
  },
]

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateSessionId(): string {
  return `session_${generateId()}`
}

function formatMessage(content: string): React.ReactNode {
  const lines = content.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Headers with emoji
        if (line.match(/^[📊🌱➡️💡🔍✅⚠️]/)) {
          const isBold = line.includes('**')
          const cleanLine = line.replace(/\*\*/g, '')
          return (
            <p key={index} className={cn(
              "text-sm",
              isBold && "font-semibold text-foreground"
            )}>
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
                i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
              )}
            </p>
          )
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={index} className="text-sm pl-4 text-muted-foreground">
              {line}
            </p>
          )
        }
        
        // Numbered items
        if (line.match(/^\d+\./)) {
          return (
            <p key={index} className="text-sm pl-4">
              {line}
            </p>
          )
        }
        
        // Table rows
        if (line.startsWith('|')) {
          return (
            <p key={index} className="text-sm font-mono text-xs">
              {line}
            </p>
          )
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2" />
        }
        
        // Regular text
        return (
          <p key={index} className="text-sm text-muted-foreground">
            {line}
          </p>
        )
      })}
    </div>
  )
}

export function ChatInterface() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [streamingContent, setStreamingContent] = useState<string>('')
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize session ID on mount
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('currentSessionId')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      sessionStorage.setItem('currentSessionId', newSessionId)
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setError(null)
    setIsLoading(true)
    setStreamingContent('')

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim()
    }
    
    setMessages(prev => [...prev, userMessage])

    try {
      // Prepare messages for API (convert to parts format)
      const apiMessages = [...messages, userMessage].map(m => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text', text: m.content }]
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let assistantId = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'message-start') {
                assistantId = parsed.id
              } else if (parsed.type === 'text-delta') {
                assistantContent += parsed.delta
                setStreamingContent(assistantContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add completed assistant message
      if (assistantContent) {
        setMessages(prev => [...prev, {
          id: assistantId || generateId(),
          role: 'assistant',
          content: assistantContent
        }])
        setStreamingContent('')
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [messages, sessionId, isLoading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const messageText = uploadedImage 
      ? `[Image attached for analysis]\n\n${input.trim()}`
      : input.trim()

    await sendMessage(messageText)
    setInput('')
    setUploadedImage(null)
  }

  const handleQuickAction = (prompt: string) => {
    if (isLoading) return
    sendMessage(prompt)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Max 10MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewChat = () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    sessionStorage.setItem('currentSessionId', newSessionId)
    setMessages([])
    setStreamingContent('')
    setError(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          {messages.length === 0 && !streamingContent ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-balance">
                  Welcome to Your AI Farming Assistant
                </h2>
                <p className="text-muted-foreground max-w-md text-balance">
                  I can help you analyze soil, recommend crops, suggest fertilizers, plan planting times, detect diseases, and provide market insights.
                </p>
              </div>
              
              {/* Quick Actions with distinct colors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className={cn(
                      "flex items-center gap-2 h-auto py-3 px-4 text-left rounded-xl border-2 transition-all duration-200",
                      "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                      action.color,
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* New Chat Button */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNewChat}
                  className="gap-2 hover:bg-primary/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Start New Chat
                </Button>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Leaf className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3'
                        : 'flex-1'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <Card className="border-0 shadow-sm bg-muted/50">
                        <CardContent className="p-4">
                          {formatMessage(message.content)}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-muted">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Streaming content */}
              {streamingContent && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Leaf className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Card className="border-0 shadow-sm bg-muted/50">
                      <CardContent className="p-4">
                        {formatMessage(streamingContent)}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Leaf className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm ml-2">Analyzing...</span>
                  </div>
                </div>
              )}

              {/* Need Help Button */}
              {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
                <div className="flex justify-center pt-2">
                  <Link href="/help">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10">
                      <HelpCircle className="h-4 w-4" />
                      Need help understanding this?
                    </Button>
                  </Link>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-destructive text-destructive-foreground">
                      <AlertCircle className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-3xl mx-auto">
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage}
                alt="Upload preview"
                className="h-20 rounded-lg border object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setUploadedImage(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 hover:bg-primary/10 hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload image for soil or plant analysis"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="sr-only">Upload image</span>
            </Button>
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about soil, crops, fertilizers, planting, diseases, or markets..."
                className="min-h-[44px] max-h-[200px] resize-none pr-12 focus-visible:ring-primary"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="shrink-0 bg-primary hover:bg-primary/90"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Free AI farming assistant. No API key required.
          </p>
        </div>
      </div>
    </div>
  )
}
