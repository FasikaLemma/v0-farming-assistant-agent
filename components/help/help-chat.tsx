'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Send,
  HelpCircle,
  User,
  Lightbulb,
  ArrowRight,
  Sparkles,
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
  'How do I input my soil data?',
  'What do NPK values mean?',
  'How does crop recommendation work?',
  'How can I detect plant diseases?',
]

export function HelpChat({ farmContext, className }: HelpChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/help',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          farmContext,
        },
      }),
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

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

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }, [input, isLoading, sendMessage])

  const handleSuggestion = (question: string) => {
    sendMessage({ text: question })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getMessageText = (message: UIMessage): string => {
    return message.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || ''
  }

  const renderToolResult = (part: UIMessage['parts'][number]) => {
    if (part.type === 'tool-explainFeature' && part.state === 'output-available') {
      const output = part.output as {
        title: string
        description: string
        howToUse: string
        tips: string[]
      }
      return (
        <Card className="mt-3 bg-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {output.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{output.description}</p>
            <div>
              <p className="text-sm font-medium mb-1">How to Use:</p>
              <p className="text-sm text-muted-foreground">{output.howToUse}</p>
            </div>
            {output.tips.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Tips:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {output.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-1 text-accent shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    if (part.type === 'tool-suggestNextSteps' && part.state === 'output-available') {
      const output = part.output as {
        topic: string
        nextSteps: string[]
        relatedFeatures: string[]
      }
      return (
        <Card className="mt-3 bg-secondary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Suggested Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm space-y-2">
              {output.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {i + 1}
                  </Badge>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )
    }

    return null
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
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-primary shrink-0" />
                      <span className="text-sm">{q}</span>
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
                          {message.parts.map((part, i) => {
                            if (part.type === 'text') {
                              return (
                                <p key={i} className="text-sm whitespace-pre-wrap">
                                  {part.text}
                                </p>
                              )
                            }
                            return (
                              <div key={i}>{renderToolResult(part)}</div>
                            )
                          })}
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

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Spinner className="w-3 h-3" />
                      <span className="text-xs">Thinking...</span>
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
