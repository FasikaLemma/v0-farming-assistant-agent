'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
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
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/chat-store'

const quickActions = [
  { label: 'Analyze my soil', prompt: 'I want to analyze my soil. I have N: 35 mg/kg, P: 20 mg/kg, K: 40 mg/kg, pH: 6.5, and moisture: 45%.' },
  { label: 'Recommend crops', prompt: 'What crops should I plant this spring in California with neutral soil and optimal moisture?' },
  { label: 'Check planting time', prompt: 'When should I plant tomatoes in Texas?' },
  { label: 'Fertilizer advice', prompt: 'My soil is low in nitrogen and phosphorus. What fertilizers do you recommend for growing corn? I prefer organic options.' },
  { label: 'Market prices', prompt: 'What are the current market prices for wheat? I have about 500 bushels to sell in the Midwest region.' },
  { label: 'Disease help', prompt: 'My tomato plants have yellow leaves with brown spots. Can you help identify the disease?' },
]

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function formatMessage(content: string): React.ReactNode {
  // Parse markdown-like formatting
  const lines = content.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Headers with emoji
        if (line.match(/^[📊🌱➡️💡🔍✅⚠️]/)) {
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
            <p key={index} className="text-sm pl-4">
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
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="h-2" />
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

export function ChatInterface() {
  const [input, setInput] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, isLoading, error, sendMessage, clearMessages, setError, fetchSessions } = useChatStore()

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
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions('farming')
  }, [fetchSessions])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !sessionId) return

    setError(null)
    
    await sendMessage(input.trim(), sessionId, {
      mode: 'farming',
      image: uploadedImage || undefined,
    })
    
    setInput('')
    setUploadedImage(null)
  }, [input, isLoading, sessionId, sendMessage, uploadedImage, setError])

  const handleQuickAction = async (prompt: string) => {
    if (isLoading || !sessionId) return
    setError(null)
    await sendMessage(prompt, sessionId, { mode: 'farming' })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
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
    clearMessages()
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    sessionStorage.setItem('currentSessionId', newSessionId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          {messages.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-xl">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    className="h-auto py-3 px-4 text-left justify-start text-wrap"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2 shrink-0 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
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
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Start New Chat
                </Button>
              </div>

              {messages.map((message, index) => (
                <div
                  key={index}
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
                      <div className="space-y-2">
                        {message.imageUrl && (
                          <p className="text-xs opacity-80">[Image attached]</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
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

              {/* Need Help Button - shown after conversation starts */}
              {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
                <div className="flex justify-center pt-2">
                  <Link href="/help">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <HelpCircle className="h-4 w-4" />
                      Need help understanding this?
                    </Button>
                  </Link>
                </div>
              )}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Leaf className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="w-4 h-4" />
                    <span className="text-sm">Analyzing and thinking...</span>
                  </div>
                </div>
              )}

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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setError(null)}
                      >
                        Dismiss
                      </Button>
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
              className="shrink-0"
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
                className="min-h-[44px] max-h-[200px] resize-none pr-12"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Powered by Google Gemini AI. Always verify recommendations with local experts.
          </p>
        </div>
      </div>
    </div>
  )
}
