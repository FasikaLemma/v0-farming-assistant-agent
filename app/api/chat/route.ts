import { UIMessage } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { streamMockResponse } from '@/lib/mock-ai'

export const maxDuration = 30

// Helper to extract text from UIMessage parts
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, sessionId } = body as { messages: UIMessage[]; sessionId?: string }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Save user message to database if sessionId is provided
    if (sessionId) {
      try {
        const supabase = await createClient()
        
        // Ensure session exists
        const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .single()

        if (!existingSession) {
          await supabase.from('chat_sessions').insert({
            session_id: sessionId,
            title: 'New Chat',
            mode: 'farming',
          })
        }

        // Get the latest user message content
        const latestMessage = messages[messages.length - 1]
        if (latestMessage) {
          const content = getMessageText(latestMessage)

          if (content) {
            await supabase.from('chat_messages').insert({
              session_id: sessionId,
              role: 'user',
              content,
            })

            // Update session title if first message
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', sessionId)

            if (count && count <= 1) {
              await supabase
                .from('chat_sessions')
                .update({ title: content.substring(0, 50) })
                .eq('session_id', sessionId)
            }
          }
        }
      } catch (dbError) {
        console.error('Database error (non-fatal):', dbError)
        // Continue with AI response even if DB fails
      }
    }

    // Convert UIMessages to simple format for mock AI
    const simpleMessages = messages.map(m => ({
      role: m.role,
      content: getMessageText(m)
    }))

    // Create a streaming response using the mock AI
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate unique message ID
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          
          // Send start event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'message-start',
            id: messageId,
            role: 'assistant'
          })}\n\n`))

          // Stream the response
          for await (const chunk of streamMockResponse(simpleMessages)) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'text-delta',
              delta: chunk
            })}\n\n`))
          }

          // Send finish event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'message-end',
            finishReason: 'stop'
          })}\n\n`))

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          
          // Save assistant response to database
          if (sessionId && fullResponse) {
            try {
              const supabase = await createClient()
              await supabase.from('chat_messages').insert({
                session_id: sessionId,
                role: 'assistant',
                content: fullResponse,
              })
            } catch (dbError) {
              console.error('Database error saving assistant message:', dbError)
            }
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
