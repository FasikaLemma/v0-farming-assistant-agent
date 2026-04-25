'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import {
  Send,
  ImagePlus,
  Sparkles,
  User,
  Leaf,
  X,
  HelpCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  SoilAnalysisCard,
  CropRecommendationCard,
  FertilizerCard,
  PlantingTimingCard,
  DiseaseDetectionCard,
  MarketInsightsCard,
} from './tool-cards'
import type { FarmingAgentMessage } from '@/app/api/chat/route'

const quickActions = [
  { label: 'Analyze my soil', prompt: 'I want to analyze my soil. I have N: 35, P: 20, K: 40, pH: 6.5, and moisture: 45%.' },
  { label: 'Recommend crops', prompt: 'What crops should I plant this spring in California with neutral soil and optimal moisture?' },
  { label: 'Check planting time', prompt: 'When should I plant tomatoes in Texas?' },
  { label: 'Fertilizer advice', prompt: 'My soil is low in nitrogen and phosphorus. What fertilizers do you recommend for growing corn? I prefer organic options.' },
  { label: 'Market prices', prompt: 'What are the current market prices for wheat? I have about 500 bushels to sell in the Midwest region.' },
  { label: 'Disease help', prompt: 'My tomato plants have yellow leaves with brown spots. Can you help identify the disease?' },
]

export function ChatInterface() {
  const [input, setInput] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat<FarmingAgentMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

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

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    let messageText = input
    if (uploadedImage) {
      messageText = `[User uploaded an image]\n${input}`
    }

    sendMessage({ text: messageText })
    setInput('')
    setUploadedImage(null)
  }, [input, isLoading, sendMessage, uploadedImage])

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => {
      sendMessage({ text: prompt })
      setInput('')
    }, 100)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

  const renderMessagePart = (part: FarmingAgentMessage['parts'][number], index: number) => {
    switch (part.type) {
      case 'text':
        return (
          <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{part.text}</div>
          </div>
        )

      case 'tool-analyzeSoil':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <SoilAnalysisCard
              key={index}
              data={{ state: 'analyzing', message: 'Analyzing soil composition...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <SoilAnalysisCard key={index} data={part.output as never} />
        }
        return null

      case 'tool-recommendCrops':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <CropRecommendationCard
              key={index}
              data={{ state: 'searching', message: 'Finding optimal crops...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <CropRecommendationCard key={index} data={part.output as never} />
        }
        return null

      case 'tool-recommendFertilizer':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <FertilizerCard
              key={index}
              data={{ state: 'calculating', message: 'Calculating fertilizer recommendations...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <FertilizerCard key={index} data={part.output as never} />
        }
        return null

      case 'tool-getPlantingTiming':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <PlantingTimingCard
              key={index}
              data={{ state: 'fetching', message: 'Checking weather and timing...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <PlantingTimingCard key={index} data={part.output as never} />
        }
        return null

      case 'tool-analyzeDiseaseImage':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <DiseaseDetectionCard
              key={index}
              data={{ state: 'scanning', message: 'Scanning for diseases...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <DiseaseDetectionCard key={index} data={part.output as never} />
        }
        return null

      case 'tool-getMarketInsights':
        if (part.state === 'input-streaming' || part.state === 'input-available') {
          return (
            <MarketInsightsCard
              key={index}
              data={{ state: 'fetching', message: 'Fetching market data...' }}
            />
          )
        }
        if (part.state === 'output-available') {
          return <MarketInsightsCard key={index} data={part.output as never} />
        }
        return null

      default:
        return null
    }
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
                  >
                    <Sparkles className="w-4 h-4 mr-2 shrink-0 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
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
                      'max-w-[85%] space-y-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3'
                        : 'flex-1'
                    )}
                  >
                    {message.parts.map((part, index) => renderMessagePart(part, index))}
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

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Leaf className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="w-4 h-4" />
                    <span className="text-sm">Thinking...</span>
                  </div>
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
            AI-powered farming advice. Always verify recommendations with local experts.
          </p>
        </div>
      </div>
    </div>
  )
}
