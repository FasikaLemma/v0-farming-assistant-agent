import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSession, saveMessage, updateSessionTitle, getSessionMessages } from '@/lib/db'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const FARMING_SYSTEM_PROMPT = `You are an expert agentic AI farming assistant. You provide intelligent, step-by-step guidance for farmers.

Your capabilities:
1. **Soil Analysis**: Analyze soil composition (N, P, K, pH, moisture) and provide insights
2. **Crop Recommendations**: Suggest optimal crops based on soil, climate, and season
3. **Fertilizer Guidance**: Recommend organic and synthetic fertilizers based on deficiencies
4. **Planting Timing**: Advise on optimal planting and harvest windows based on weather
5. **Disease Detection**: Analyze plant/soil images to identify diseases or issues
6. **Market Intelligence**: Provide insights on crop prices and best selling times

Your behavior:
- Always respond with structured, actionable advice
- Break down complex problems into steps
- Explain your reasoning clearly
- Proactively suggest next actions
- Use simple language that farmers can understand
- When analyzing images, describe what you see and provide specific recommendations

Response format:
Always structure your responses with:
📊 **Analysis**: What you observe or understand from the input
🌱 **Recommendation**: Your specific advice or suggestions
➡️ **Next Steps**: What the farmer should do next

If the user provides soil data, analyze it and recommend crops.
If they ask about a crop, suggest fertilizers and planting timing.
If they share an image, analyze it for soil type or plant disease.
Always maintain context from previous messages in the conversation.`

const HELP_SYSTEM_PROMPT = `You are a friendly support assistant for the Farm AI application. Help users understand how to use the app and explain farming concepts in simple terms.

Your role:
- Explain how features work (soil analysis, crop recommendations, etc.)
- Clarify farming terminology and concepts
- Guide users through the app's functionality
- Simplify technical explanations
- Provide step-by-step instructions

Always be patient, helpful, and use simple language. If discussing previous farming recommendations, explain the reasoning behind them clearly.`

interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
}

interface RequestBody {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    imageUrl?: string
  }>
  sessionId: string
  mode?: 'farming' | 'help'
  soilData?: {
    nitrogen?: number
    phosphorus?: number
    potassium?: number
    ph?: number
    moisture?: number
  }
  image?: string // base64 encoded image
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const body: RequestBody = await request.json()
    const { messages, sessionId, mode = 'farming', soilData, image } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get or create session in database
    await getOrCreateSession(sessionId, mode)

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]
    
    // Save user message to database
    await saveMessage(sessionId, 'user', latestMessage.content, {
      imageUrl: image ? 'image_uploaded' : undefined,
      metadata: soilData ? { soilData } : undefined,
    })

    // Update session title if this is the first message
    const existingMessages = await getSessionMessages(sessionId)
    if (existingMessages.length <= 1) {
      const title = latestMessage.content.substring(0, 50)
      await updateSessionTitle(sessionId, title)
    }

    // Build Gemini messages from conversation history
    const systemPrompt = mode === 'help' ? HELP_SYSTEM_PROMPT : FARMING_SYSTEM_PROMPT
    
    const geminiMessages: GeminiMessage[] = []
    
    // Add conversation history
    for (const msg of messages) {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = []
      
      let content = msg.content
      
      // Add soil data context if provided with the message
      if (msg === latestMessage && soilData) {
        content += `\n\nSoil Data Provided:\n- Nitrogen (N): ${soilData.nitrogen ?? 'Not provided'} mg/kg\n- Phosphorus (P): ${soilData.phosphorus ?? 'Not provided'} mg/kg\n- Potassium (K): ${soilData.potassium ?? 'Not provided'} mg/kg\n- pH: ${soilData.ph ?? 'Not provided'}\n- Moisture: ${soilData.moisture ?? 'Not provided'}%`
      }
      
      parts.push({ text: content })
      
      // Add image if provided with the latest message
      if (msg === latestMessage && image) {
        // Extract base64 data and mime type
        const matches = image.match(/^data:(.+);base64,(.+)$/)
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          })
        }
      }
      
      geminiMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      })
    }

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      
      // Parse error for better user feedback
      let errorMessage = 'Failed to get response from AI'
      try {
        const errorJson = JSON.parse(errorData)
        if (errorJson.error?.code === 429) {
          errorMessage = 'AI service is temporarily busy. Please wait a moment and try again.'
        } else if (errorJson.error?.message) {
          errorMessage = 'AI service error. Please try again in a few seconds.'
        }
      } catch {
        // Keep default error message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract the response text
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I was unable to generate a response. Please try again.'

    // Save assistant response to database
    await saveMessage(sessionId, 'assistant', assistantMessage)

    return NextResponse.json({
      message: assistantMessage,
      sessionId,
    })
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const messages = await getSessionMessages(sessionId)
    
    return NextResponse.json({
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        imageUrl: msg.image_url,
        createdAt: msg.created_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
