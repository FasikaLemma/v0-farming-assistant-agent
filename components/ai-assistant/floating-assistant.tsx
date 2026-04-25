'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Leaf,
  X,
  Send,
  Mic,
  MicOff,
  Minimize2,
  Maximize2,
  User,
  Sparkles,
  ImagePlus,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickSuggestions = [
  { label: 'Analyze my soil', prompt: 'Help me analyze my soil composition', color: 'bg-primary/20 hover:bg-primary/30 text-primary' },
  { label: 'Best crops for spring', prompt: 'What crops should I plant this spring?', color: 'bg-chart-2/20 hover:bg-chart-2/30 text-chart-2' },
  { label: 'Detect plant disease', prompt: 'My plants look sick, can you help identify the disease?', color: 'bg-destructive/20 hover:bg-destructive/30 text-destructive' },
  { label: 'Market prices today', prompt: 'What are current market prices for crops?', color: 'bg-accent/20 hover:bg-accent/30 text-accent-foreground' },
]

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setInput(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setStreamingContent('')

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim()
    }
    
    setMessages(prev => [...prev, userMessage])

    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text', text: m.content }]
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      if (!response.ok) throw new Error('Failed to get response')

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
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return
    sendMessage(prompt)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      sendMessage('[Image attached for analysis]\n\nPlease analyze this plant/soil image for any issues or diseases.')
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed z-50 transition-all duration-300 ease-out',
          isExpanded
            ? 'inset-4 md:inset-8'
            : 'bottom-6 right-6 w-[calc(100vw-3rem)] max-w-md h-[70vh] max-h-[600px]',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        )}
      >
        <Card className="flex flex-col h-full shadow-2xl border-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Farm AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Thinking...' : 'Always here to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && !streamingContent ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">How can I help you today?</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask me about soil, crops, weather, or upload an image
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSuggestions.map((suggestion) => (
                    <Badge
                      key={suggestion.label}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:scale-105",
                        suggestion.color,
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    >
                      {suggestion.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={cn(
                        message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {message.role === 'assistant' ? (
                          <Leaf className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {/* Streaming content */}
                {streamingContent && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Leaf className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[80%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                    </div>
                  </div>
                )}

                {isLoading && !streamingContent && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Leaf className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="min-h-[44px] max-h-32 pr-10 resize-none focus-visible:ring-primary"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute right-1 top-1 h-8 w-8',
                    isListening && 'text-destructive bg-destructive/10'
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="submit"
                size="icon"
                className="shrink-0 bg-primary hover:bg-primary/90"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Backdrop */}
      {isOpen && isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}
