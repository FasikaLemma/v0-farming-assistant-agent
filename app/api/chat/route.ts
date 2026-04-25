import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  validateUIMessages,
} from 'ai'
import * as z from 'zod'

export const maxDuration = 60

// Soil Analysis Tool
const analyzeSoilTool = tool({
  description: 'Analyze soil composition and provide detailed breakdown of nutrients, pH level, and soil type. Use this when user provides soil data or asks about soil analysis.',
  inputSchema: z.object({
    nitrogen: z.number().min(0).max(100).describe('Nitrogen level (N) in ppm'),
    phosphorus: z.number().min(0).max(100).describe('Phosphorus level (P) in ppm'),
    potassium: z.number().min(0).max(100).describe('Potassium level (K) in ppm'),
    ph: z.number().min(0).max(14).describe('Soil pH level'),
    moisture: z.number().min(0).max(100).describe('Soil moisture percentage'),
  }),
  async *execute({ nitrogen, phosphorus, potassium, ph, moisture }) {
    yield { state: 'analyzing' as const, message: 'Analyzing soil composition...' }
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const soilType = ph < 6 ? 'Acidic' : ph > 7.5 ? 'Alkaline' : 'Neutral'
    const moistureLevel = moisture < 30 ? 'Low' : moisture > 60 ? 'High' : 'Optimal'
    
    const deficiencies: string[] = []
    if (nitrogen < 20) deficiencies.push('Nitrogen')
    if (phosphorus < 15) deficiencies.push('Phosphorus')
    if (potassium < 20) deficiencies.push('Potassium')
    
    yield {
      state: 'complete' as const,
      soilType,
      moistureLevel,
      nutrients: { nitrogen, phosphorus, potassium },
      ph,
      deficiencies,
      healthScore: Math.round((nitrogen + phosphorus + potassium) / 3),
    }
  },
})

// Crop Recommendation Tool
const recommendCropsTool = tool({
  description: 'Recommend suitable crops based on soil conditions, climate, and season. Use after soil analysis or when user asks for crop recommendations.',
  inputSchema: z.object({
    soilType: z.enum(['Acidic', 'Neutral', 'Alkaline']).describe('Type of soil'),
    moisture: z.enum(['Low', 'Optimal', 'High']).describe('Moisture level'),
    season: z.enum(['Spring', 'Summer', 'Fall', 'Winter']).describe('Current or planned planting season'),
    region: z.string().describe('Geographic region or climate zone'),
  }),
  async *execute({ soilType, moisture, season, region }) {
    yield { state: 'searching' as const, message: 'Finding optimal crops for your conditions...' }
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const cropDatabase: Record<string, { name: string; suitability: number; growthPeriod: string; yield: string; waterNeeds: string }[]> = {
      'Neutral-Optimal-Spring': [
        { name: 'Tomatoes', suitability: 95, growthPeriod: '60-80 days', yield: 'High', waterNeeds: 'Medium' },
        { name: 'Peppers', suitability: 90, growthPeriod: '60-90 days', yield: 'Medium', waterNeeds: 'Medium' },
        { name: 'Corn', suitability: 88, growthPeriod: '60-100 days', yield: 'High', waterNeeds: 'High' },
      ],
      'Acidic-Optimal-Spring': [
        { name: 'Blueberries', suitability: 95, growthPeriod: 'Perennial', yield: 'Medium', waterNeeds: 'Medium' },
        { name: 'Potatoes', suitability: 92, growthPeriod: '70-120 days', yield: 'High', waterNeeds: 'Medium' },
      ],
      'Alkaline-Low-Summer': [
        { name: 'Barley', suitability: 90, growthPeriod: '60-70 days', yield: 'Medium', waterNeeds: 'Low' },
        { name: 'Sorghum', suitability: 88, growthPeriod: '90-120 days', yield: 'High', waterNeeds: 'Low' },
      ],
    }
    
    const key = `${soilType}-${moisture}-${season}`
    const crops = cropDatabase[key] || [
      { name: 'Wheat', suitability: 85, growthPeriod: '110-130 days', yield: 'High', waterNeeds: 'Medium' },
      { name: 'Soybeans', suitability: 82, growthPeriod: '80-120 days', yield: 'Medium', waterNeeds: 'Medium' },
      { name: 'Rice', suitability: 78, growthPeriod: '120-150 days', yield: 'High', waterNeeds: 'High' },
    ]
    
    yield {
      state: 'complete' as const,
      recommendations: crops,
      conditions: { soilType, moisture, season, region },
    }
  },
})

// Fertilizer Recommendation Tool
const recommendFertilizerTool = tool({
  description: 'Recommend fertilizers based on soil deficiencies and crop requirements. Use after identifying soil deficiencies or for specific crop nutrition.',
  inputSchema: z.object({
    deficiencies: z.array(z.string()).describe('List of nutrient deficiencies'),
    cropType: z.string().describe('The crop being grown or planned'),
    organicPreference: z.boolean().describe('Whether user prefers organic fertilizers'),
  }),
  async *execute({ deficiencies, cropType, organicPreference }) {
    yield { state: 'calculating' as const, message: 'Calculating optimal fertilizer mix...' }
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const recommendations: { name: string; type: string; application: string; dosage: string; timing: string; npk: string }[] = []
    
    if (deficiencies.includes('Nitrogen')) {
      recommendations.push(organicPreference
        ? { name: 'Blood Meal', type: 'Organic', application: 'Top dressing', dosage: '2-3 lbs per 100 sq ft', timing: 'Early spring', npk: '12-0-0' }
        : { name: 'Ammonium Nitrate', type: 'Synthetic', application: 'Broadcasting', dosage: '1 lb per 100 sq ft', timing: 'Before planting', npk: '34-0-0' }
      )
    }
    if (deficiencies.includes('Phosphorus')) {
      recommendations.push(organicPreference
        ? { name: 'Bone Meal', type: 'Organic', application: 'Soil incorporation', dosage: '5-10 lbs per 100 sq ft', timing: 'At planting', npk: '3-15-0' }
        : { name: 'Triple Superphosphate', type: 'Synthetic', application: 'Banding', dosage: '1-2 lbs per 100 sq ft', timing: 'At planting', npk: '0-46-0' }
      )
    }
    if (deficiencies.includes('Potassium')) {
      recommendations.push(organicPreference
        ? { name: 'Kelp Meal', type: 'Organic', application: 'Foliar spray or soil', dosage: '1-2 lbs per 100 sq ft', timing: 'Growing season', npk: '1-0-2' }
        : { name: 'Potassium Chloride', type: 'Synthetic', application: 'Broadcasting', dosage: '1 lb per 100 sq ft', timing: 'Before planting', npk: '0-0-60' }
      )
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        name: organicPreference ? 'Compost' : 'Balanced NPK 10-10-10',
        type: organicPreference ? 'Organic' : 'Synthetic',
        application: 'Broadcasting',
        dosage: organicPreference ? '2-4 inches layer' : '2-3 lbs per 100 sq ft',
        timing: 'Before planting',
        npk: organicPreference ? 'Variable' : '10-10-10',
      })
    }
    
    yield {
      state: 'complete' as const,
      fertilizers: recommendations,
      cropType,
      isOrganic: organicPreference,
    }
  },
})

// Weather & Planting Timing Tool
const getPlantingTimingTool = tool({
  description: 'Get optimal planting and harvest timing based on location, weather patterns, and crop type. Use when discussing when to plant or harvest.',
  inputSchema: z.object({
    location: z.string().describe('City or region name'),
    cropType: z.string().describe('The crop to plant'),
  }),
  async *execute({ location, cropType }) {
    yield { state: 'fetching' as const, message: `Checking weather patterns for ${location}...` }
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock weather data
    const currentTemp = Math.floor(Math.random() * 20) + 60
    const forecast = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
    const humidity = Math.floor(Math.random() * 30) + 40
    
    // Calculate planting windows
    const today = new Date()
    const plantingStart = new Date(today)
    plantingStart.setDate(today.getDate() + Math.floor(Math.random() * 14) + 7)
    const plantingEnd = new Date(plantingStart)
    plantingEnd.setDate(plantingStart.getDate() + 21)
    const harvestDate = new Date(plantingStart)
    harvestDate.setDate(plantingStart.getDate() + Math.floor(Math.random() * 60) + 60)
    
    yield {
      state: 'complete' as const,
      location,
      cropType,
      currentWeather: {
        temperature: currentTemp,
        condition: forecast,
        humidity,
      },
      plantingWindow: {
        start: plantingStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        end: plantingEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        optimal: true,
      },
      estimatedHarvest: harvestDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tips: [
        'Plant in the morning when temperatures are cooler',
        'Ensure soil temperature is above 50°F for best germination',
        'Water immediately after planting',
      ],
    }
  },
})

// Disease Detection Tool (for image analysis results)
const analyzeDiseaseImageTool = tool({
  description: 'Analyze a crop/plant image to detect diseases, pests, or health issues. Use when user uploads an image of their plants or describes symptoms.',
  inputSchema: z.object({
    imageDescription: z.string().describe('Description of the plant image or symptoms observed'),
    cropType: z.string().describe('Type of crop or plant being analyzed'),
  }),
  async *execute({ imageDescription, cropType }) {
    yield { state: 'scanning' as const, message: 'Analyzing image for disease patterns...' }
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock disease detection results
    const diseases = [
      { name: 'Early Blight', confidence: 87, severity: 'Moderate', treatmentUrgency: 'High' },
      { name: 'Powdery Mildew', confidence: 72, severity: 'Mild', treatmentUrgency: 'Medium' },
      { name: 'Bacterial Spot', confidence: 65, severity: 'Severe', treatmentUrgency: 'Critical' },
    ]
    
    const detected = diseases[Math.floor(Math.random() * diseases.length)]
    
    const treatments: Record<string, { organic: string; chemical: string; prevention: string }> = {
      'Early Blight': {
        organic: 'Remove affected leaves, apply neem oil spray, improve air circulation',
        chemical: 'Apply chlorothalonil or copper-based fungicide',
        prevention: 'Rotate crops, use disease-resistant varieties, mulch around plants',
      },
      'Powdery Mildew': {
        organic: 'Spray with baking soda solution (1 tbsp per gallon), apply sulfur dust',
        chemical: 'Apply myclobutanil or propiconazole',
        prevention: 'Ensure good air circulation, avoid overhead watering, plant in full sun',
      },
      'Bacterial Spot': {
        organic: 'Remove infected parts, apply copper-based bactericide',
        chemical: 'Apply streptomycin or copper hydroxide',
        prevention: 'Use certified disease-free seeds, avoid working with wet plants',
      },
    }
    
    yield {
      state: 'complete' as const,
      detected: {
        disease: detected.name,
        confidence: detected.confidence,
        severity: detected.severity,
        urgency: detected.treatmentUrgency,
      },
      treatment: treatments[detected.name],
      affectedCrop: cropType,
      nextSteps: [
        `Isolate affected plants from healthy ones`,
        `Begin ${detected.treatmentUrgency === 'Critical' ? 'immediate' : 'treatment within 48 hours'}`,
        `Monitor surrounding plants for symptoms`,
      ],
    }
  },
})

// Market Intelligence Tool
const getMarketInsightsTool = tool({
  description: 'Get market prices, trends, and selling recommendations for crops. Use when discussing selling, market timing, or price information.',
  inputSchema: z.object({
    cropType: z.string().describe('The crop to get market data for'),
    quantity: z.number().describe('Quantity in bushels or tons'),
    region: z.string().describe('Market region or location'),
  }),
  async *execute({ cropType, quantity, region }) {
    yield { state: 'fetching' as const, message: 'Fetching latest market data...' }
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const basePrice = Math.random() * 5 + 3
    const trend = ['Rising', 'Stable', 'Declining'][Math.floor(Math.random() * 3)]
    const demandLevel = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    
    const markets = [
      { name: `${region} Farmers Market`, distance: '5 miles', pricePerUnit: basePrice * 1.2, demandLevel: 'High' },
      { name: `${region} Agricultural Co-op`, distance: '12 miles', pricePerUnit: basePrice * 1.1, demandLevel: 'Medium' },
      { name: 'Regional Distribution Center', distance: '25 miles', pricePerUnit: basePrice * 1.05, demandLevel: 'High' },
    ]
    
    const optimalWindow = trend === 'Rising' ? 'Wait 2-3 weeks for better prices' : trend === 'Declining' ? 'Sell within the next week' : 'Current prices are favorable'
    
    yield {
      state: 'complete' as const,
      crop: cropType,
      quantity,
      currentPrice: basePrice.toFixed(2),
      priceUnit: 'per bushel',
      trend,
      demandLevel,
      markets: markets.map(m => ({
        ...m,
        pricePerUnit: m.pricePerUnit.toFixed(2),
        estimatedRevenue: (m.pricePerUnit * quantity).toFixed(2),
      })),
      recommendation: optimalWindow,
      forecast: {
        nextWeek: (basePrice * (trend === 'Rising' ? 1.05 : trend === 'Declining' ? 0.95 : 1)).toFixed(2),
        nextMonth: (basePrice * (trend === 'Rising' ? 1.12 : trend === 'Declining' ? 0.88 : 1.02)).toFixed(2),
      },
    }
  },
})

// Define all tools
const tools = {
  analyzeSoil: analyzeSoilTool,
  recommendCrops: recommendCropsTool,
  recommendFertilizer: recommendFertilizerTool,
  getPlantingTiming: getPlantingTimingTool,
  analyzeDiseaseImage: analyzeDiseaseImageTool,
  getMarketInsights: getMarketInsightsTool,
} as const

// Export message type for client
export type FarmingAgentMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof tools>
>

const systemPrompt = `You are an expert Agentic AI Farming Assistant. You help farmers make data-driven decisions by combining multiple data sources and providing step-by-step guidance.

## Your Approach
1. **Understand the Goal**: First understand what the farmer wants to achieve
2. **Multi-Step Reasoning**: Break complex problems into logical steps
3. **Proactive Guidance**: Don't just answer - guide them through the entire process
4. **Explain Your Reasoning**: Always explain why you're making certain recommendations

## Your Capabilities
- **Soil Analysis**: Analyze soil composition (N, P, K, pH, moisture) and identify deficiencies
- **Crop Recommendations**: Suggest optimal crops based on soil, climate, and season
- **Fertilizer Guidance**: Recommend fertilizers based on deficiencies and crop needs
- **Planting Timing**: Use weather data to suggest optimal planting/harvest windows
- **Disease Detection**: Analyze plant symptoms to identify diseases and treatments
- **Market Intelligence**: Provide price insights and selling recommendations

## Conversation Flow
When a farmer provides soil data:
1. First analyze the soil composition
2. Automatically recommend suitable crops
3. Suggest fertilizers if deficiencies are found
4. Offer to check planting timing for their location
5. Mention that you can provide market insights when ready to sell

When discussing plant health issues:
1. Ask for or analyze symptoms/images
2. Identify potential diseases
3. Recommend treatments (both organic and chemical options)
4. Suggest preventive measures

## Response Format
- Use clear, farmer-friendly language
- Provide specific, actionable recommendations
- Include relevant numbers and data
- Suggest logical next steps
- Use bullet points for lists

Remember: You're a trusted farming advisor. Be helpful, thorough, and guide them step-by-step through their farming decisions.`

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<FarmingAgentMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: 'openai/gpt-4o',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
