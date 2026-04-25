'use server'

// Intelligent mock responses for farming assistant - NO API KEY REQUIRED
// This simulates AI behavior using pattern matching and predefined knowledge

interface FarmingContext {
  hasSoilData: boolean
  hasCropMention: boolean
  hasDiseaseMention: boolean
  hasFertilizerMention: boolean
  hasWeatherMention: boolean
  hasMarketMention: boolean
  hasImageMention: boolean
  crops: string[]
  soilValues: { n?: number; p?: number; k?: number; ph?: number; moisture?: number }
}

function parseUserInput(input: string): FarmingContext {
  const lowered = input.toLowerCase()
  
  // Extract soil values using regex
  const nMatch = lowered.match(/n[:\s]*(\d+)/i)
  const pMatch = lowered.match(/p[:\s]*(\d+)/i)
  const kMatch = lowered.match(/k[:\s]*(\d+)/i)
  const phMatch = lowered.match(/ph[:\s]*([\d.]+)/i)
  const moistureMatch = lowered.match(/moisture[:\s]*(\d+)/i)

  // Detect common crops
  const cropList = ['tomato', 'corn', 'wheat', 'rice', 'potato', 'carrot', 'lettuce', 'pepper', 'beans', 'soybean', 'cotton', 'sugarcane', 'cucumber', 'onion', 'cabbage', 'spinach', 'broccoli']
  const detectedCrops = cropList.filter(crop => lowered.includes(crop))

  return {
    hasSoilData: !!(nMatch || pMatch || kMatch || phMatch || moistureMatch) || lowered.includes('soil'),
    hasCropMention: detectedCrops.length > 0 || lowered.includes('crop') || lowered.includes('plant'),
    hasDiseaseMention: lowered.includes('disease') || lowered.includes('yellow') || lowered.includes('spot') || lowered.includes('wilt') || lowered.includes('pest') || lowered.includes('sick'),
    hasFertilizerMention: lowered.includes('fertilizer') || lowered.includes('nutrient') || lowered.includes('nitrogen') || lowered.includes('phosphorus') || lowered.includes('potassium'),
    hasWeatherMention: lowered.includes('weather') || lowered.includes('rain') || lowered.includes('temperature') || lowered.includes('planting time') || lowered.includes('when') || lowered.includes('season'),
    hasMarketMention: lowered.includes('market') || lowered.includes('price') || lowered.includes('sell') || lowered.includes('buy'),
    hasImageMention: lowered.includes('image') || lowered.includes('photo') || lowered.includes('picture') || lowered.includes('attached'),
    crops: detectedCrops,
    soilValues: {
      n: nMatch ? parseInt(nMatch[1]) : undefined,
      p: pMatch ? parseInt(pMatch[1]) : undefined,
      k: kMatch ? parseInt(kMatch[1]) : undefined,
      ph: phMatch ? parseFloat(phMatch[1]) : undefined,
      moisture: moistureMatch ? parseInt(moistureMatch[1]) : undefined,
    }
  }
}

function generateSoilAnalysisResponse(context: FarmingContext): string {
  const { soilValues } = context
  let analysis = ''
  let recommendation = ''
  let nextSteps = ''

  if (soilValues.n !== undefined || soilValues.p !== undefined || soilValues.k !== undefined) {
    analysis = `Based on your soil data:\n`
    if (soilValues.n !== undefined) {
      const nStatus = soilValues.n < 20 ? 'low' : soilValues.n > 50 ? 'high' : 'optimal'
      analysis += `- **Nitrogen (N)**: ${soilValues.n} mg/kg - ${nStatus.toUpperCase()}\n`
    }
    if (soilValues.p !== undefined) {
      const pStatus = soilValues.p < 15 ? 'low' : soilValues.p > 40 ? 'high' : 'optimal'
      analysis += `- **Phosphorus (P)**: ${soilValues.p} mg/kg - ${pStatus.toUpperCase()}\n`
    }
    if (soilValues.k !== undefined) {
      const kStatus = soilValues.k < 30 ? 'low' : soilValues.k > 60 ? 'high' : 'optimal'
      analysis += `- **Potassium (K)**: ${soilValues.k} mg/kg - ${kStatus.toUpperCase()}\n`
    }
    if (soilValues.ph !== undefined) {
      const phStatus = soilValues.ph < 6.0 ? 'acidic' : soilValues.ph > 7.5 ? 'alkaline' : 'neutral (ideal)'
      analysis += `- **pH Level**: ${soilValues.ph} - ${phStatus}\n`
    }
    if (soilValues.moisture !== undefined) {
      const moistureStatus = soilValues.moisture < 30 ? 'dry' : soilValues.moisture > 60 ? 'wet' : 'good'
      analysis += `- **Moisture**: ${soilValues.moisture}% - ${moistureStatus}\n`
    }

    recommendation = `Your soil is suitable for several crops. Based on the nutrient profile:\n`
    recommendation += `- **High-yield options**: Corn, Wheat, Tomatoes\n`
    recommendation += `- **Root vegetables**: Carrots, Potatoes (prefer loose soil)\n`
    recommendation += `- **Leafy greens**: Lettuce, Spinach (benefit from nitrogen)\n`

    if (soilValues.n && soilValues.n < 25) {
      recommendation += `\n**Note**: Consider adding nitrogen-rich fertilizer for better yields.`
    }

    nextSteps = `1. Consider a follow-up soil test in 3 months\n`
    nextSteps += `2. Start with a small test plot of recommended crops\n`
    nextSteps += `3. Monitor soil moisture regularly\n`
    nextSteps += `4. Ask me about specific fertilizer recommendations`
  } else {
    analysis = `I can help analyze your soil! To provide accurate recommendations, please share your soil test results including:\n`
    analysis += `- Nitrogen (N) level in mg/kg\n`
    analysis += `- Phosphorus (P) level in mg/kg\n`
    analysis += `- Potassium (K) level in mg/kg\n`
    analysis += `- pH level (0-14 scale)\n`
    analysis += `- Moisture percentage`

    recommendation = `You can also upload a photo of your soil or describe its characteristics (color, texture, drainage).`
    nextSteps = `Share your soil data and I'll provide personalized crop and fertilizer recommendations.`
  }

  return `📊 **Analysis**\n${analysis}\n\n🌱 **Recommendation**\n${recommendation}\n\n➡️ **Next Steps**\n${nextSteps}`
}

function generateCropResponse(context: FarmingContext): string {
  const crop = context.crops[0] || 'general crops'
  
  const cropInfo: Record<string, { planting: string; harvest: string; tips: string }> = {
    tomato: {
      planting: 'Plant seedlings after last frost (soil temp above 60°F/16°C). Space 24-36 inches apart.',
      harvest: '60-80 days from transplant. Pick when firm and fully colored.',
      tips: 'Stake or cage plants. Water consistently. Remove suckers for larger fruit.'
    },
    corn: {
      planting: 'Direct sow when soil is 60°F (16°C). Plant in blocks of 4+ rows for pollination.',
      harvest: '60-100 days. Silk should be brown and dry, kernels milky when punctured.',
      tips: 'Heavy nitrogen feeder. Water 1 inch per week. Hill soil around stalks.'
    },
    wheat: {
      planting: 'Winter wheat: Sept-Oct. Spring wheat: March-April when soil is workable.',
      harvest: '120-150 days. Harvest when kernels are hard and stems are golden.',
      tips: 'Rotate with legumes. Control weeds early. Test grain moisture before storage.'
    },
    potato: {
      planting: 'Plant 2-4 weeks before last frost. Cut seed potatoes with 2-3 eyes each.',
      harvest: '70-120 days depending on variety. Harvest when vines die back.',
      tips: 'Hill soil around plants as they grow. Avoid wet conditions to prevent rot.'
    },
    default: {
      planting: 'Most vegetables can be planted after the last frost date in your area.',
      harvest: 'Harvest times vary by crop. Check specific guidelines for best results.',
      tips: 'Ensure good soil drainage, consistent watering, and proper spacing.'
    }
  }

  const info = cropInfo[crop] || cropInfo.default

  return `📊 **Analysis**
I'll help you with **${crop.charAt(0).toUpperCase() + crop.slice(1)}** cultivation. Here's what you need to know:

🌱 **Recommendation**
**Planting**: ${info.planting}

**Harvesting**: ${info.harvest}

**Growing Tips**: ${info.tips}

**Ideal Soil Conditions**:
- pH: 6.0-7.0 (slightly acidic to neutral)
- Well-draining, rich in organic matter
- Consistent moisture but not waterlogged

➡️ **Next Steps**
1. Test your soil to ensure optimal conditions
2. Prepare beds with compost 2 weeks before planting
3. Plan for pest management and crop rotation
4. Ask me about specific fertilizers or disease prevention`
}

function generateDiseaseResponse(context: FarmingContext): string {
  const crop = context.crops[0] || 'your plant'

  return `📊 **Analysis**
Based on your description, this could indicate one of several common plant issues:

**Possible Conditions**:
1. **Early Blight** - Brown spots with concentric rings, starting on lower leaves
2. **Nutrient Deficiency** - Yellow leaves can indicate nitrogen or iron deficiency
3. **Bacterial Spot** - Small, dark spots that may have yellow halos
4. **Fungal Infection** - Often appears in humid conditions with poor air circulation

🌱 **Recommendation**
**Immediate Actions**:
- Remove affected leaves and dispose of them (don't compost)
- Improve air circulation between plants
- Avoid overhead watering - water at soil level
- Apply a copper-based fungicide if symptoms persist

**For ${crop}**:
- Ensure proper spacing between plants
- Mulch to prevent soil splash onto leaves
- Consider companion planting with basil or marigolds

➡️ **Next Steps**
1. Upload a clear photo of the affected leaves for more precise diagnosis
2. Check neighboring plants for similar symptoms
3. Test soil pH - many diseases thrive in imbalanced soil
4. Consider a preventive fungicide spray schedule

**Prevention Tips**:
- Rotate crops each season
- Clean tools between plants
- Water in the morning so leaves dry by evening`
}

function generateFertilizerResponse(context: FarmingContext): string {
  return `📊 **Analysis**
Based on typical soil deficiencies, here are targeted fertilizer recommendations:

**For Nitrogen Deficiency** (yellowing older leaves, stunted growth):
- **Organic**: Blood meal, fish emulsion, composted manure
- **Synthetic**: Ammonium sulfate (21-0-0), Urea (46-0-0)
- **Application**: 1-2 lbs per 100 sq ft, work into soil

**For Phosphorus Deficiency** (purple-tinted leaves, poor root development):
- **Organic**: Bone meal, rock phosphate
- **Synthetic**: Triple superphosphate (0-46-0)
- **Application**: 2-3 lbs per 100 sq ft before planting

**For Potassium Deficiency** (brown leaf edges, weak stems):
- **Organic**: Wood ash, kelp meal, greensand
- **Synthetic**: Muriate of potash (0-0-60)
- **Application**: 1-2 lbs per 100 sq ft

🌱 **Recommendation**
**Best Organic Options**:
1. **Compost** - Balanced nutrients, improves soil structure
2. **Fish emulsion** - Quick-release nitrogen, great for vegetables
3. **Bone meal + blood meal combo** - Complete NPK coverage

**Balanced Commercial Fertilizers**:
- 10-10-10 for general purpose
- 5-10-10 for root vegetables and fruiting plants
- 20-10-10 for heavy nitrogen feeders like corn

➡️ **Next Steps**
1. Get a soil test to identify specific deficiencies
2. Apply fertilizer in early morning or evening
3. Water after application to prevent burn
4. Re-test soil in 4-6 weeks to monitor improvement`
}

function generateMarketResponse(context: FarmingContext): string {
  const crop = context.crops[0] || 'crops'

  return `📊 **Analysis**
Here are current market insights and pricing trends:

**General Market Conditions**:
- Commodity prices fluctuate based on season, weather, and global supply
- Local farmers' markets typically offer 20-40% premium over wholesale
- Organic produce commands 30-50% higher prices

**Price Ranges (approximate)**:
| Crop | Wholesale/lb | Retail/lb | Best Season |
|------|-------------|-----------|-------------|
| Tomatoes | $0.80-1.50 | $2.50-4.00 | Jun-Aug |
| Corn | $0.15-0.30 | $0.50-0.75 | Jul-Sep |
| Wheat | $0.12-0.18 | N/A (bulk) | Jul-Aug |
| Potatoes | $0.30-0.50 | $0.75-1.25 | Sep-Nov |

🌱 **Recommendation**
**Best Selling Strategies**:
1. **Timing**: Sell during peak demand, not peak harvest (when prices drop)
2. **Direct Sales**: Farmers' markets, CSA programs, restaurants
3. **Value-Added**: Consider selling processed products (jams, dried goods)
4. **Storage**: Root vegetables and grains can be stored for off-season sales

**For ${crop}**:
- Monitor local market prices weekly
- Build relationships with local buyers
- Consider contracts with restaurants or grocery stores

➡️ **Next Steps**
1. Research local buyers and their requirements
2. Calculate your production costs to set profitable prices
3. Consider organic certification for premium pricing
4. Join local farming cooperatives for better market access`
}

function generateImageAnalysisResponse(): string {
  return `📊 **Analysis**
Thank you for sharing the image! Based on visual analysis:

**Soil Assessment** (if soil image):
- **Color**: Indicates organic matter content and mineral composition
- **Texture**: Helps determine drainage and nutrient retention
- **Structure**: Shows soil health and root penetration potential

**Plant Assessment** (if plant image):
- Looking for signs of disease, pest damage, or nutrient deficiency
- Checking leaf color, shape, and overall plant vigor
- Evaluating growth stage and health indicators

🌱 **Recommendation**
**What I observed**:
- The image shows typical characteristics that can be improved
- Consider the environmental factors affecting your crops
- Regular monitoring will help catch issues early

**Suggested Actions**:
1. Ensure consistent watering practices
2. Check for proper drainage
3. Monitor for pest activity regularly
4. Apply appropriate fertilizers based on growth stage

➡️ **Next Steps**
1. Describe any specific concerns you have about what's in the image
2. Share details about recent treatments or changes
3. Tell me about your location and current weather conditions
4. Ask specific questions about what you see

**Note**: For best results, ensure images are clear and well-lit. Include close-ups of any problem areas.`
}

function generateGenericResponse(input: string): string {
  return `📊 **Analysis**
I understand you're looking for farming guidance. I'm your AI farming assistant, ready to help with:

**My Capabilities**:
- 🌍 **Soil Analysis**: Analyze NPK levels, pH, and moisture
- 🌱 **Crop Recommendations**: Suggest best crops for your conditions
- 🧪 **Fertilizer Guidance**: Organic and synthetic options
- 📅 **Planting Timing**: Optimal planting and harvest windows
- 🦠 **Disease Detection**: Identify plant health issues
- 📈 **Market Intelligence**: Pricing and selling strategies

🌱 **Recommendation**
To get started, try one of these:

1. **Share your soil test results**: "My soil has N: 35, P: 20, K: 40, pH: 6.5"
2. **Ask about a specific crop**: "When should I plant tomatoes?"
3. **Get fertilizer advice**: "What fertilizer should I use for corn?"
4. **Describe a problem**: "My plants have yellow leaves with brown spots"
5. **Upload an image**: Share a photo of your soil or plants

➡️ **Next Steps**
Pick any topic above, and I'll provide detailed, actionable guidance tailored to your specific situation. The more details you share, the better I can help!

**Quick tips while you're here**:
- Always rotate crops to maintain soil health
- Test your soil at least once per growing season
- Keep records of what works in your specific conditions`
}

export async function generateMockResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
  // Get the latest user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  const input = lastUserMessage?.content || ''
  
  // Parse the input to understand context
  const context = parseUserInput(input)
  
  // Add a small delay to simulate AI thinking
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate appropriate response based on context
  if (context.hasImageMention) {
    return generateImageAnalysisResponse()
  }
  
  if (context.hasDiseaseMention) {
    return generateDiseaseResponse(context)
  }
  
  if (context.hasSoilData) {
    return generateSoilAnalysisResponse(context)
  }
  
  if (context.hasFertilizerMention) {
    return generateFertilizerResponse(context)
  }
  
  if (context.hasMarketMention) {
    return generateMarketResponse(context)
  }
  
  if (context.hasCropMention || context.hasWeatherMention) {
    return generateCropResponse(context)
  }
  
  return generateGenericResponse(input)
}

// Stream the response character by character for realistic effect
export async function* streamMockResponse(messages: Array<{ role: string; content: string }>): AsyncGenerator<string> {
  const fullResponse = await generateMockResponse(messages)
  
  // Stream in chunks for realistic typing effect
  const chunkSize = 3
  for (let i = 0; i < fullResponse.length; i += chunkSize) {
    yield fullResponse.slice(i, i + chunkSize)
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 15))
  }
}
