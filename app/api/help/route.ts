import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai'
import { z } from 'zod'

const helpSystemPrompt = `You are a friendly and knowledgeable support assistant for the AI Farming Assistant application. Your role is to help users understand how to use the app and explain farming concepts in simple terms.

## Your Personality
- Patient and understanding, especially with users who may not be tech-savvy
- Use simple, clear language - avoid jargon unless explaining it
- Provide step-by-step explanations when helpful
- Be encouraging and supportive

## Key Topics You Can Help With

### Using the App
- How to start conversations with the AI
- How to input soil data (explain NPK, pH, moisture)
- How to upload images for disease detection
- How to navigate between pages (Chat, Dashboard, History)
- Quick action buttons and their purposes

### Farming Concepts
- Explain what NPK means and optimal ranges
- Describe soil pH and its importance (6.0-7.0 is ideal for most crops)
- Clarify fertilizer types (organic vs synthetic)
- Explain crop rotation and companion planting basics
- Describe common plant disease symptoms

### AI Recommendations
- How the AI analyzes soil data
- How crop recommendations work
- Why certain fertilizers are suggested
- How planting timing is determined
- How market insights are generated

## Response Guidelines
1. Start by acknowledging the user's question
2. Provide a clear, concise answer
3. Offer to explain further if needed
4. Suggest relevant next steps or related features
5. If you don't know something, be honest and suggest where they might find more information

## Context Handling
If the user shares farming context (soil data, crop information, etc.), use it to provide personalized explanations. Reference their specific situation when explaining concepts.

Remember: You are a support assistant, not the main farming AI. Guide users on HOW to use the features rather than directly providing farming recommendations (though you can explain farming concepts).`

const explainFeature = tool({
  description: 'Explain a specific feature of the AI Farming Assistant',
  inputSchema: z.object({
    feature: z.enum([
      'soil_analysis',
      'crop_recommendation',
      'fertilizer_guidance',
      'planting_timing',
      'disease_detection',
      'market_insights',
      'dashboard',
      'history',
    ]),
  }),
  execute: async ({ feature }) => {
    const explanations: Record<string, { title: string; description: string; howToUse: string; tips: string[] }> = {
      soil_analysis: {
        title: 'Soil Analysis',
        description: 'The AI analyzes your soil composition to understand its health and nutrient levels.',
        howToUse: 'Tell the AI your soil test results with N (nitrogen), P (phosphorus), K (potassium) levels in ppm, pH level (1-14 scale), and moisture percentage.',
        tips: [
          'Get a professional soil test for accurate readings',
          'Test multiple spots in your field for better averages',
          'Retest soil every 2-3 years or after major changes',
        ],
      },
      crop_recommendation: {
        title: 'Crop Recommendations',
        description: 'Based on your soil data and location, the AI suggests crops most likely to thrive.',
        howToUse: 'Provide your soil analysis results, location, current season, and any preferences (organic, specific crop types).',
        tips: [
          'Consider crop rotation for soil health',
          'Start with high-confidence recommendations',
          'Ask about companion planting options',
        ],
      },
      fertilizer_guidance: {
        title: 'Fertilizer Guidance',
        description: 'The AI calculates exact fertilizer needs based on soil deficiencies and crop requirements.',
        howToUse: 'Share your soil test results and target crop. Mention if you prefer organic options.',
        tips: [
          'Apply fertilizers at recommended rates to avoid burn',
          'Consider slow-release options for sustained nutrition',
          'Time applications with growth stages',
        ],
      },
      planting_timing: {
        title: 'Planting Timing',
        description: 'Using your location and weather data, the AI determines optimal planting windows.',
        howToUse: 'Specify your crop, location, and any timing constraints. The AI checks weather patterns.',
        tips: [
          'Plan 2-4 weeks ahead for best results',
          'Have backup dates in case of weather changes',
          'Consider succession planting for extended harvests',
        ],
      },
      disease_detection: {
        title: 'Disease Detection',
        description: 'The AI identifies plant diseases from symptom descriptions or images.',
        howToUse: 'Describe symptoms in detail OR upload a clear photo of affected plant parts.',
        tips: [
          'Take photos in good lighting',
          'Include close-ups and whole plant views',
          'Act quickly - early treatment is most effective',
        ],
      },
      market_insights: {
        title: 'Market Insights',
        description: 'Get current prices, trends, and selling recommendations for your crops.',
        howToUse: 'Specify your crop, quantity, location, and any timing needs.',
        tips: [
          'Compare prices across regions',
          'Consider storage costs when timing sales',
          'Use partial sales to manage risk',
        ],
      },
      dashboard: {
        title: 'Dashboard Overview',
        description: 'The Dashboard shows your current farming status at a glance - weather, soil, recommendations, and market data.',
        howToUse: 'Click Dashboard in the sidebar to view summaries. Click any card to get more details in the chat.',
        tips: [
          'Check the dashboard daily for weather updates',
          'Use it as a starting point for conversations',
          'Market trends update regularly',
        ],
      },
      history: {
        title: 'Conversation History',
        description: 'Access previous conversations and recommendations from past sessions.',
        howToUse: 'Click History in the sidebar to see past chats. Click any session to review it.',
        tips: [
          'Reference past recommendations for tracking',
          'Compare seasonal advice year over year',
          'Clear old sessions to keep things organized',
        ],
      },
    }

    return explanations[feature] || { title: 'Unknown Feature', description: 'This feature is not recognized.', howToUse: 'Please try again.', tips: [] }
  },
})

const suggestNextSteps = tool({
  description: 'Suggest what the user should do next based on their question',
  inputSchema: z.object({
    currentTopic: z.string().describe('What the user is currently asking about'),
    userLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('Perceived user expertise level'),
  }),
  execute: async ({ currentTopic, userLevel }) => {
    const suggestions = {
      beginner: [
        'Start with a quick action button to see how the AI works',
        'Try asking a simple question about your crops',
        'Explore the Dashboard to see all features at once',
      ],
      intermediate: [
        'Combine multiple analyses for comprehensive recommendations',
        'Set up a seasonal planning conversation',
        'Compare different crop options for your soil',
      ],
      advanced: [
        'Use detailed soil data for precise recommendations',
        'Explore market timing strategies',
        'Discuss crop rotation planning across seasons',
      ],
    }

    return {
      topic: currentTopic,
      nextSteps: suggestions[userLevel],
      relatedFeatures: ['Chat', 'Dashboard', 'History'],
    }
  },
})

export async function POST(req: Request) {
  const { messages, farmContext } = await req.json()

  // Build context-aware system prompt
  let contextualPrompt = helpSystemPrompt
  if (farmContext) {
    contextualPrompt += `\n\n## User's Current Farming Context\n${JSON.stringify(farmContext, null, 2)}\n\nUse this context to provide personalized explanations when relevant.`
  }

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: contextualPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      explainFeature,
      suggestNextSteps,
    },
    stopWhen: stepCountIs(5),
    maxOutputTokens: 1000,
  })

  return result.toUIMessageStreamResponse()
}
