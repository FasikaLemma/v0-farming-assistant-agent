// Farming Assistant Types

export interface SoilAnalysisResult {
  state: 'analyzing' | 'complete'
  message?: string
  soilType?: string
  moistureLevel?: string
  nutrients?: {
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  ph?: number
  deficiencies?: string[]
  healthScore?: number
}

export interface CropRecommendation {
  name: string
  suitability: number
  growthPeriod: string
  yield: string
  waterNeeds: string
}

export interface CropRecommendationResult {
  state: 'searching' | 'complete'
  message?: string
  recommendations?: CropRecommendation[]
  conditions?: {
    soilType: string
    moisture: string
    season: string
    region: string
  }
}

export interface FertilizerRecommendation {
  name: string
  type: string
  application: string
  dosage: string
  timing: string
  npk: string
}

export interface FertilizerResult {
  state: 'calculating' | 'complete'
  message?: string
  fertilizers?: FertilizerRecommendation[]
  cropType?: string
  isOrganic?: boolean
}

export interface PlantingTimingResult {
  state: 'fetching' | 'complete'
  message?: string
  location?: string
  cropType?: string
  currentWeather?: {
    temperature: number
    condition: string
    humidity: number
  }
  plantingWindow?: {
    start: string
    end: string
    optimal: boolean
  }
  estimatedHarvest?: string
  tips?: string[]
}

export interface DiseaseAnalysisResult {
  state: 'scanning' | 'complete'
  message?: string
  detected?: {
    disease: string
    confidence: number
    severity: string
    urgency: string
  }
  treatment?: {
    organic: string
    chemical: string
    prevention: string
  }
  affectedCrop?: string
  nextSteps?: string[]
}

export interface MarketData {
  name: string
  distance: string
  pricePerUnit: string
  demandLevel: string
  estimatedRevenue: string
}

export interface MarketInsightsResult {
  state: 'fetching' | 'complete'
  message?: string
  crop?: string
  quantity?: number
  currentPrice?: string
  priceUnit?: string
  trend?: string
  demandLevel?: string
  markets?: MarketData[]
  recommendation?: string
  forecast?: {
    nextWeek: string
    nextMonth: string
  }
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}
