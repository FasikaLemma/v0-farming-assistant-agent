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
  GripVertical,
  RotateCcw,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Position {
  x: number
  y: number
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

// Corner positions for quick snap
const CORNER_POSITIONS = {
  'bottom-right': { x: 24, y: 24 },
  'bottom-left': { x: 24, y: 24 },
  'top-right': { x: 24, y: 24 },
  'top-left': { x: 24, y: 24 },
}

type Corner = keyof typeof CORNER_POSITIONS

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 24, y: 24 })
  const [corner, setCorner] = useState<Corner>('bottom-right')
  const [showCornerMenu, setShowCornerMenu] = useState(false)
  
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dragStartRef = useRef<{ x: number; y: number; buttonX: number; buttonY: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Get button position based on corner
  const getButtonStyle = useCallback(() => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
      transition: isDragging ? 'none' : 'all 0.3s ease-out',
    }

    if (corner === 'bottom-right') {
      return { ...base, right: position.x, bottom: position.y }
    } else if (corner === 'bottom-left') {
      return { ...base, left: position.x, bottom: position.y }
    } else if (corner === 'top-right') {
      return { ...base, right: position.x, top: position.y }
    } else {
      return { ...base, left: position.x, top: position.y }
    }
  }, [position, corner, isDragging])

  // Get panel position based on corner
  const getPanelStyle = useCallback(() => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 50,
    }

    if (isExpanded) {
      return { ...base, inset: '1rem' }
    }

    if (corner === 'bottom-right') {
      return { ...base, right: '1.5rem', bottom: '1.5rem' }
    } else if (corner === 'bottom-left') {
      return { ...base, left: '1.5rem', bottom: '1.5rem' }
    } else if (corner === 'top-right') {
      return { ...base, right: '1.5rem', top: '1.5rem' }
    } else {
      return { ...base, left: '1.5rem', top: '1.5rem' }
    }
  }, [corner, isExpanded])

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      buttonX: position.x,
      buttonY: position.y,
    }
    setIsDragging(true)
  }, [position])

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const deltaX = clientX - dragStartRef.current.x
      const deltaY = clientY - dragStartRef.current.y
      
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const buttonSize = 56 // 14 * 4 = 56px
      const margin = 8
      
      let newX: number
      let newY: number
      let newCorner: Corner = corner
      
      // Determine which corner based on position
      const centerX = clientX
      const centerY = clientY
      
      if (centerX > windowWidth / 2) {
        // Right side
        newX = Math.max(margin, Math.min(windowWidth - buttonSize - margin, windowWidth - clientX - buttonSize / 2))
        if (centerY > windowHeight / 2) {
          newCorner = 'bottom-right'
          newY = Math.max(margin, Math.min(windowHeight - buttonSize - margin, windowHeight - clientY - buttonSize / 2))
        } else {
          newCorner = 'top-right'
          newY = Math.max(margin, Math.min(windowHeight - buttonSize - margin, clientY - buttonSize / 2))
        }
      } else {
        // Left side
        newX = Math.max(margin, Math.min(windowWidth - buttonSize - margin, clientX - buttonSize / 2))
        if (centerY > windowHeight / 2) {
          newCorner = 'bottom-left'
          newY = Math.max(margin, Math.min(windowHeight - buttonSize - margin, windowHeight - clientY - buttonSize / 2))
        } else {
          newCorner = 'top-left'
          newY = Math.max(margin, Math.min(windowHeight - buttonSize - margin, clientY - buttonSize / 2))
        }
      }
      
      setPosition({ x: newX, y: newY })
      setCorner(newCorner)
    }

    const handleEnd = () => {
      setIsDragging(false)
      dragStartRef.current = null
      
      // Snap to edge
      setPosition(prev => ({
        x: Math.min(prev.x, 24),
        y: Math.min(prev.y, 24),
      }))
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, corner])

  // Reset position to default
  const resetPosition = () => {
    setCorner('bottom-right')
    setPosition({ x: 24, y: 24 })
    setShowCornerMenu(false)
  }

  // Move to specific corner
  const moveToCorner = (newCorner: Corner) => {
    setCorner(newCorner)
    setPosition({ x: 24, y: 24 })
    setShowCornerMenu(false)
  }

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
      {/* Floating Draggable Button */}
      <button
        ref={buttonRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={(e) => {
          if (!isDragging) {
            setIsOpen(true)
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowCornerMenu(true)
        }}
        style={getButtonStyle()}
        className={cn(
          'w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center',
          'hover:scale-110 hover:shadow-xl active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'touch-manipulation select-none',
          isDragging && 'cursor-grabbing scale-110 shadow-2xl',
          !isDragging && 'cursor-grab',
          isOpen && 'scale-0 opacity-0 pointer-events-none'
        )}
        aria-label="Open AI Assistant (drag to reposition)"
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
        
        {/* Drag indicator */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100">
          <GripVertical className="w-3 h-3" />
        </span>
      </button>

      {/* Corner Selection Menu */}
      {showCornerMenu && !isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowCornerMenu(false)}
          />
          <div 
            className="fixed z-50 bg-card rounded-xl shadow-xl border p-2 min-w-[160px]"
            style={{
              ...getButtonStyle(),
              transform: corner.includes('right') ? 'translateX(-100%)' : 'translateX(60px)',
            }}
          >
            <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
              Position
            </p>
            <div className="space-y-1">
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Corner[]).map((c) => (
                <button
                  key={c}
                  onClick={() => moveToCorner(c)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    'hover:bg-muted',
                    corner === c && 'bg-primary/10 text-primary font-medium'
                  )}
                >
                  {c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
              <hr className="my-1" />
              <button
                onClick={resetPosition}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Position
              </button>
            </div>
          </div>
        </>
      )}

      {/* Chat Panel */}
      <div
        style={getPanelStyle()}
        className={cn(
          'transition-all duration-300 ease-out',
          !isExpanded && 'w-[calc(100vw-3rem)] max-w-md h-[70vh] max-h-[600px]',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <Card className="flex flex-col h-full shadow-2xl border-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5 shrink-0">
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
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
                      <p className="whitespace-pre-wrap break-words">{streamingContent}</p>
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
          <div className="p-4 border-t bg-background shrink-0">
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
            
            {/* Position hint */}
            <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-60">
              Drag the button to reposition or right-click for options
            </p>
          </div>
        </Card>
      </div>

      {/* Backdrop for expanded mode */}
      {isOpen && isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  )
}
