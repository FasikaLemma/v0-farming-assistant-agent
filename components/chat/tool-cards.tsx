'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  Beaker,
  Sprout,
  Droplets,
  Sun,
  Bug,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Leaf,
  ThermometerSun,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react'
import type {
  SoilAnalysisResult,
  CropRecommendationResult,
  FertilizerResult,
  PlantingTimingResult,
  DiseaseAnalysisResult,
  MarketInsightsResult,
} from '@/lib/types'

// Soil Analysis Card
export function SoilAnalysisCard({ data }: { data: SoilAnalysisResult }) {
  if (data.state === 'analyzing') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Beaker className="h-5 w-5 text-primary" />
          Soil Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Type</p>
            <Badge variant={data.soilType === 'Neutral' ? 'default' : 'secondary'}>
              {data.soilType}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Moisture</p>
            <Badge variant={data.moistureLevel === 'Optimal' ? 'default' : 'outline'}>
              <Droplets className="h-3 w-3 mr-1" />
              {data.moistureLevel}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Nutrient Levels</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Nitrogen (N)</span>
              <span className="text-sm font-medium">{data.nutrients?.nitrogen} ppm</span>
            </div>
            <Progress value={data.nutrients?.nitrogen} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Phosphorus (P)</span>
              <span className="text-sm font-medium">{data.nutrients?.phosphorus} ppm</span>
            </div>
            <Progress value={data.nutrients?.phosphorus} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Potassium (K)</span>
              <span className="text-sm font-medium">{data.nutrients?.potassium} ppm</span>
            </div>
            <Progress value={data.nutrients?.potassium} className="h-2" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">pH Level</p>
            <p className="text-lg font-semibold">{data.ph}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground">Health Score</p>
            <p className="text-lg font-semibold text-primary">{data.healthScore}/100</p>
          </div>
        </div>

        {data.deficiencies && data.deficiencies.length > 0 && (
          <div className="bg-destructive/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Deficiencies Detected</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {data.deficiencies.map((def) => (
                <Badge key={def} variant="destructive" className="text-xs">
                  {def}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Crop Recommendation Card
export function CropRecommendationCard({ data }: { data: CropRecommendationResult }) {
  if (data.state === 'searching') {
    return (
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5 text-accent" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-accent/20 overflow-hidden">
      <CardHeader className="bg-accent/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sprout className="h-5 w-5 text-accent" />
          Recommended Crops
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-normal">
            {data.conditions?.soilType} Soil
          </Badge>
          <Badge variant="outline" className="font-normal">
            {data.conditions?.moisture} Moisture
          </Badge>
          <Badge variant="outline" className="font-normal">
            {data.conditions?.season}
          </Badge>
        </div>

        <div className="space-y-3">
          {data.recommendations?.map((crop, index) => (
            <div
              key={crop.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{crop.name}</p>
                  <p className="text-xs text-muted-foreground">{crop.growthPeriod}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={crop.suitability >= 90 ? 'default' : crop.suitability >= 80 ? 'secondary' : 'outline'}
                >
                  {crop.suitability}% Match
                </Badge>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {crop.waterNeeds}
                  </span>
                  <span>Yield: {crop.yield}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Fertilizer Recommendation Card
export function FertilizerCard({ data }: { data: FertilizerResult }) {
  if (data.state === 'calculating') {
    return (
      <Card className="border-chart-2/20 bg-chart-2/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-chart-2/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-chart-2" />
          Fertilizer Recommendations
          {data.isOrganic && (
            <Badge variant="outline" className="ml-2 text-xs">
              Organic
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {data.fertilizers?.map((fert) => (
          <div key={fert.name} className="p-3 rounded-lg border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">{fert.name}</p>
              <Badge variant="secondary">{fert.npk}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Application:</span> {fert.application}
              </div>
              <div>
                <span className="font-medium text-foreground">Dosage:</span> {fert.dosage}
              </div>
              <div className="col-span-2">
                <span className="font-medium text-foreground">Timing:</span> {fert.timing}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Planting Timing Card
export function PlantingTimingCard({ data }: { data: PlantingTimingResult }) {
  if (data.state === 'fetching') {
    return (
      <Card className="border-chart-3/20 bg-chart-3/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-chart-3/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-chart-3" />
          Planting Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{data.location}</span>
          <span className="text-muted-foreground">for {data.cropType}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
          <div className="text-center">
            <ThermometerSun className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-lg font-semibold">{data.currentWeather?.temperature}°F</p>
            <p className="text-xs text-muted-foreground">{data.currentWeather?.condition}</p>
          </div>
          <div className="text-center border-x">
            <Droplets className="h-5 w-5 mx-auto text-chart-3 mb-1" />
            <p className="text-lg font-semibold">{data.currentWeather?.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="text-center">
            <Sun className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-lg font-semibold">Good</p>
            <p className="text-xs text-muted-foreground">Conditions</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Optimal Planting Window</p>
              <p className="font-medium">
                {data.plantingWindow?.start} - {data.plantingWindow?.end}
              </p>
            </div>
            {data.plantingWindow?.optimal && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Expected Harvest</p>
              <p className="font-medium">{data.estimatedHarvest}</p>
            </div>
          </div>
        </div>

        {data.tips && data.tips.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground uppercase">Tips</p>
            <ul className="space-y-1">
              {data.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Disease Detection Card
export function DiseaseDetectionCard({ data }: { data: DiseaseAnalysisResult }) {
  if (data.state === 'scanning') {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5 text-destructive" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  const severityColor = data.detected?.severity === 'Severe' ? 'destructive' : data.detected?.severity === 'Moderate' ? 'secondary' : 'outline'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-destructive/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bug className="h-5 w-5 text-destructive" />
          Disease Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div>
            <p className="font-semibold text-lg">{data.detected?.disease}</p>
            <p className="text-sm text-muted-foreground">Detected in {data.affectedCrop}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant={severityColor}>{data.detected?.severity}</Badge>
            <p className="text-xs text-muted-foreground">{data.detected?.confidence}% confidence</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Organic Treatment</p>
            <p className="text-sm">{data.treatment?.organic}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Chemical Treatment</p>
            <p className="text-sm">{data.treatment?.chemical}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/10 space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Prevention</p>
            <p className="text-sm">{data.treatment?.prevention}</p>
          </div>
        </div>

        {data.nextSteps && data.nextSteps.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground uppercase">Immediate Next Steps</p>
            <ul className="space-y-1">
              {data.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Market Insights Card
export function MarketInsightsCard({ data }: { data: MarketInsightsResult }) {
  if (data.state === 'fetching') {
    return (
      <Card className="border-chart-4/20 bg-chart-4/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">{data.message}</span>
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = data.trend === 'Rising' ? TrendingUp : data.trend === 'Declining' ? TrendingDown : Minus
  const trendColor = data.trend === 'Rising' ? 'text-primary' : data.trend === 'Declining' ? 'text-destructive' : 'text-muted-foreground'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-chart-4/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-chart-4" />
          Market Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{data.crop}</p>
            <p className="text-2xl font-bold">${data.currentPrice}</p>
            <p className="text-xs text-muted-foreground">{data.priceUnit}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-5 w-5" />
              <span className="font-medium">{data.trend}</span>
            </div>
            <Badge variant="outline" className="mt-1">
              {data.demandLevel} Demand
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Next Week</p>
            <p className="font-semibold">${data.forecast?.nextWeek}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Month</p>
            <p className="font-semibold">${data.forecast?.nextMonth}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium">{data.recommendation}</p>
        </div>

        {data.markets && data.markets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase">Nearby Markets</p>
            <div className="space-y-2">
              {data.markets.map((market) => (
                <div key={market.name} className="flex items-center justify-between p-2 rounded-lg bg-card border text-sm">
                  <div>
                    <p className="font-medium">{market.name}</p>
                    <p className="text-xs text-muted-foreground">{market.distance}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${market.estimatedRevenue}</p>
                    <p className="text-xs text-muted-foreground">@ ${market.pricePerUnit}/bu</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
