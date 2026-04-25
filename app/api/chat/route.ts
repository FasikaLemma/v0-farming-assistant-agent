import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'

// Initialize Google Gemini with API key from environment - Direct API access (no gateway)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
})

export const maxDuration = 30

const FARMING_SYSTEM_PROMPT = `You are an expert agentic AI farming assistant. You provide intelligent, step-by-step guidance for farmers.

Your capabilities:
1. **Soil Analysis**: Analyze soil composition (N, P, K, pH, moisture) and provide insights
2. **Crop Recommendations**: Suggest optimal crops based on soil, climate, and season
3. **Fertilizer Guidance**: Recommend organic and synthetic fertilizers based on deficiencies
4. **Planting Timing**: Advise on optimal planting and harvest windows based on weather
5. **Disease Detection**: Analyze plant/soil descriptions to identify diseases or issues
6. **Market Intelligence**: Provide insights on crop prices and best selling times

Your behavior:
- Always respond with structured, actionable advice
- Break down complex problems into steps
- Explain your reasoning clearly
- Proactively suggest next actions
- Use simple language that farmers can understand

Response format - ALWAYS structure your responses with these exact headers:

📊 **Analysis**
[Your observation or understanding from the input]

🌱 **Recommendation**
[Your specific advice or suggestions]

➡️ **Next Steps**
[What the farmer should do next]

If the user provides soil data, analyze it and recommend crops.
If they ask about a crop, suggest fertilizers and planting timing.
Always maintain context from previous messages in the conversation.`

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

    // Save message to database if sessionId is provided
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
          // Extract text from parts
          const content = latestMessage.parts
            ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('') || ''

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

    // Stream the response using Vercel AI SDK with Google Gemini
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: FARMING_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
      temperature: 0.7,
      abortSignal: req.signal,
    })

    // Return streaming response
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: allMessages }) => {
        // Save assistant response to database
        if (sessionId && allMessages.length > 0) {
          try {
            const supabase = await createClient()
            const lastMessage = allMessages[allMessages.length - 1]
            
            if (lastMessage && lastMessage.role === 'assistant') {
              const content = lastMessage.parts
                ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('') || ''

              if (content) {
                await supabase.from('chat_messages').insert({
                  session_id: sessionId,
                  role: 'assistant',
                  content,
                })
              }
            }
          } catch (dbError) {
            console.error('Database error saving assistant message:', dbError)
          }
        }
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
