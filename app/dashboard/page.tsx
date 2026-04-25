'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Sprout,
  Droplets,
  ThermometerSun,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Leaf,
  Bug,
  DollarSign,
  CloudRain,
  Sun,
  Wind,
  Activity,
  Search,
  FileImage,
  Upload,
  Sparkles,
  Target,
  BarChart3,
  Thermometer,
  Gauge,
} from 'lucide-react'
import Link from 'next/link'

// Mock data
const soilHealth = {
  overall: 78,
  nitrogen: 65,
  phosphorus: 82,
  potassium: 70,
  ph: 6.5,
  moisture: 55,
  organicMatter: 4.2,
  texture: 'Loamy',
}

const weatherData = {
  current: { temp: 72, condition: 'Partly Cloudy', humidity: 45, windSpeed: 8 },
  forecast: [
    { day: 'Today', high: 75, low: 58, condition: 'sunny', rain: 0 },
    { day: 'Tomorrow', high: 78, low: 60, condition: 'cloudy', rain: 20 },
    { day: 'Wed', high: 72, low: 55, condition: 'rain', rain: 80 },
    { day: 'Thu', high: 70, low: 52, condition: 'sunny', rain: 5 },
    { day: 'Fri', high: 74, low: 56, condition: 'sunny', rain: 0 },
  ],
}

const cropRecommendations = [
  { name: 'Tomatoes', match: 95, season: 'Spring-Summer', duration: '60-80 days', profit: 'High' },
  { name: 'Peppers', match: 88, season: 'Spring-Summer', duration: '60-90 days', profit: 'Medium' },
  { name: 'Corn', match: 82, season: 'Summer', duration: '60-100 days', profit: 'Medium' },
  { name: 'Soybeans', match: 78, season: 'Spring-Fall', duration: '80-120 days', profit: 'High' },
]

const activeCrops = [
  { name: 'Tomatoes', status: 'Growing', progress: 65, daysToHarvest: 28, health: 'Good' },
  { name: 'Corn', status: 'Maturing', progress: 85, daysToHarvest: 14, health: 'Excellent' },
  { name: 'Peppers', status: 'Flowering', progress: 45, daysToHarvest: 45, health: 'Warning' },
]

const marketPrices = [
  { crop: 'Wheat', price: 7.25, change: 5.2, trend: 'up', volume: 'High' },
  { crop: 'Corn', price: 4.85, change: -2.1, trend: 'down', volume: 'Medium' },
  { crop: 'Soybeans', price: 12.40, change: 1.8, trend: 'up', volume: 'High' },
  { crop: 'Tomatoes', price: 2.15, change: 0, trend: 'stable', volume: 'Low' },
]

const recentAlerts = [
  { type: 'warning', message: 'Low nitrogen detected in Field A', time: '2h ago' },
  { type: 'success', message: 'Optimal planting window for soybeans', time: '5h ago' },
  { type: 'info', message: 'Wheat prices up 5% this week', time: '1d ago' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">Farm Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Your complete farming intelligence center
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Activity className="h-3 w-3" />
                Live Data
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Last Updated:</span> Today
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <QuickStatCard
              title="Soil Health"
              value={`${soilHealth.overall}%`}
              icon={Droplets}
              color="primary"
              trend="+3% this week"
            />
            <QuickStatCard
              title="Temperature"
              value={`${weatherData.current.temp}°F`}
              icon={ThermometerSun}
              color="accent"
              trend={weatherData.current.condition}
            />
            <QuickStatCard
              title="Active Crops"
              value={activeCrops.length.toString()}
              icon={Sprout}
              color="chart-2"
              trend="2 ready soon"
            />
            <QuickStatCard
              title="Next Harvest"
              value="14 days"
              icon={Calendar}
              color="chart-4"
              trend="Corn"
            />
          </div>
        </div>

        {/* Main Tabs - Capabilities Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="crop-health" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Crop Health</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Soil & Fertility</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Crop Advice</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <CloudRain className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex-1 min-w-[120px] gap-2 data-[state=active]:bg-background">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              {/* Alerts */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    Alerts & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {alert.type === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      )}
                      {alert.type === 'success' && (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      )}
                      {alert.type === 'info' && (
                        <TrendingUp className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Active Crops Mini */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sprout className="h-5 w-5 text-chart-2" />
                      Active Crops
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('crop-health')}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {activeCrops.map((crop) => (
                      <div key={crop.name} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-medium">{crop.name}</p>
                          <Badge
                            variant={crop.health === 'Excellent' ? 'default' : crop.health === 'Good' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {crop.health}
                          </Badge>
                        </div>
                        <Progress value={crop.progress} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {crop.daysToHarvest} days to harvest
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weather Preview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ThermometerSun className="h-5 w-5 text-accent" />
                    5-Day Forecast
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('weather')}>
                    Details <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 md:gap-4">
                  {weatherData.forecast.map((day) => (
                    <div key={day.day} className="text-center p-2 md:p-4 rounded-lg bg-muted/50">
                      <p className="font-medium text-sm mb-2">{day.day}</p>
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                        {day.condition === 'sunny' && <Sun className="h-4 w-4 text-accent" />}
                        {day.condition === 'cloudy' && <CloudRain className="h-4 w-4 text-muted-foreground" />}
                        {day.condition === 'rain' && <CloudRain className="h-4 w-4 text-chart-3" />}
                      </div>
                      <p className="text-lg font-semibold">{day.high}°</p>
                      <p className="text-xs text-muted-foreground">{day.low}°</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crop Health Tab */}
          <TabsContent value="crop-health" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <h2 className="text-xl font-semibold">Crop Health Analysis</h2>
                <p className="text-sm text-muted-foreground">Monitor and analyze your crop conditions</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Link href="/">
                  <Button size="sm" className="gap-2">
                    <Bug className="h-4 w-4" />
                    Detect Disease
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCrops.map((crop) => (
                <Card key={crop.name} className="overflow-hidden">
                  <div className={`h-2 ${crop.health === 'Excellent' ? 'bg-primary' : crop.health === 'Good' ? 'bg-chart-2' : 'bg-destructive'}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <Badge variant={crop.health === 'Excellent' ? 'default' : crop.health === 'Good' ? 'secondary' : 'destructive'}>
                        {crop.health}
                      </Badge>
                    </div>
                    <CardDescription>Status: {crop.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Growth Progress</span>
                        <span className="font-medium">{crop.progress}%</span>
                      </div>
                      <Progress value={crop.progress} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{crop.daysToHarvest}</p>
                        <p className="text-xs text-muted-foreground">Days to Harvest</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{crop.progress}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <FileImage className="h-4 w-4" />
                      Scan for Issues
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Analysis Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Disease Detection</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a photo to detect plant diseases instantly
                      </p>
                    </div>
                  </div>
                  <Link href="/">
                    <Button size="lg" className="gap-2">
                      Start Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Soil & Fertility Tab */}
          <TabsContent value="soil" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <h2 className="text-xl font-semibold">Soil & Fertility Insights</h2>
                <p className="text-sm text-muted-foreground">Comprehensive soil analysis and recommendations</p>
              </div>
              <Link href="/">
                <Button className="gap-2">
                  <Droplets className="h-4 w-4" />
                  New Soil Test
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* NPK Levels */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    Nutrient Levels (NPK)
                  </CardTitle>
                  <CardDescription>Current soil nutrient composition</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <NutrientCard
                      name="Nitrogen (N)"
                      value={soilHealth.nitrogen}
                      status={soilHealth.nitrogen > 70 ? 'Optimal' : 'Low'}
                      description="Essential for leaf growth"
                    />
                    <NutrientCard
                      name="Phosphorus (P)"
                      value={soilHealth.phosphorus}
                      status="Optimal"
                      description="Root development"
                    />
                    <NutrientCard
                      name="Potassium (K)"
                      value={soilHealth.potassium}
                      status={soilHealth.potassium > 70 ? 'Optimal' : 'Moderate'}
                      description="Disease resistance"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">pH Level</p>
                      <p className="text-xl font-bold">{soilHealth.ph}</p>
                      <p className="text-xs text-primary">Optimal</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Moisture</p>
                      <p className="text-xl font-bold">{soilHealth.moisture}%</p>
                      <p className="text-xs text-muted-foreground">Moderate</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Organic Matter</p>
                      <p className="text-xl font-bold">{soilHealth.organicMatter}%</p>
                      <p className="text-xs text-primary">Good</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Texture</p>
                      <p className="text-xl font-bold">{soilHealth.texture}</p>
                      <p className="text-xs text-primary">Ideal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Health Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-primary"
                        strokeDasharray={`${(soilHealth.overall / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold">{soilHealth.overall}</span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-sm">Healthy Soil</Badge>
                  <p className="text-sm text-muted-foreground text-center">
                    Your soil is in good condition. Minor nitrogen improvement recommended.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fertilizer Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-chart-2" />
                  Fertilizer Recommendations
                </CardTitle>
                <CardDescription>Based on your soil analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">N</span>
                      </div>
                      <div>
                        <p className="font-medium">Nitrogen Boost</p>
                        <p className="text-xs text-muted-foreground">Urea or Ammonium Nitrate</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Apply 50-75 lbs/acre to improve leaf growth and overall vigor.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-medium">Organic Compost</p>
                        <p className="text-xs text-muted-foreground">Natural Enhancement</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add 2-3 inches of compost to improve soil structure and nutrients.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Soil Conditioner</p>
                        <p className="text-xs text-muted-foreground">pH Balance</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your pH is optimal. Maintain with regular organic matter additions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crop Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <h2 className="text-xl font-semibold">Crop Recommendations</h2>
                <p className="text-sm text-muted-foreground">AI-powered suggestions based on your soil and climate</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search crops..." className="pl-9" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {cropRecommendations.map((crop) => (
                <Card key={crop.name} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                          <Sprout className="h-6 w-6 text-chart-2" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{crop.name}</CardTitle>
                          <CardDescription>{crop.season}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{crop.match}%</p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm font-medium">{crop.duration}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center">
                        <Badge variant={crop.profit === 'High' ? 'default' : 'secondary'}>
                          {crop.profit}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Profit</p>
                      </div>
                      <div className="text-center">
                        <Button size="sm" variant="outline" className="w-full">
                          Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Planting Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-chart-4" />
                  Optimal Planting Windows
                </CardTitle>
                <CardDescription>Best times to plant based on weather forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cropRecommendations.slice(0, 3).map((crop) => (
                    <div key={crop.name} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <Sprout className="h-5 w-5 text-chart-2 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{crop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Recommended: Next 2 weeks for optimal growth
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {crop.season}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6 mt-6">
            <div>
              <h2 className="text-xl font-semibold">Weather & Environment</h2>
              <p className="text-sm text-muted-foreground">Detailed weather analysis for farming decisions</p>
            </div>

            {/* Current Weather */}
            <Card>
              <CardHeader>
                <CardTitle>Current Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                      <Sun className="h-12 w-12 text-accent" />
                    </div>
                    <div>
                      <p className="text-5xl font-bold">{weatherData.current.temp}°F</p>
                      <p className="text-lg text-muted-foreground">{weatherData.current.condition}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 flex-1">
                    <div className="text-center">
                      <Droplets className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                      <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{weatherData.current.windSpeed}</p>
                      <p className="text-sm text-muted-foreground">mph Wind</p>
                    </div>
                    <div className="text-center">
                      <CloudRain className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                      <p className="text-2xl font-bold">0%</p>
                      <p className="text-sm text-muted-foreground">Rain Chance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extended Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>5-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weatherData.forecast.map((day, index) => (
                    <div
                      key={day.day}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="w-12 text-center">
                        <p className="font-medium">{day.day}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        {day.condition === 'sunny' && <Sun className="h-5 w-5 text-accent" />}
                        {day.condition === 'cloudy' && <CloudRain className="h-5 w-5 text-muted-foreground" />}
                        {day.condition === 'rain' && <CloudRain className="h-5 w-5 text-chart-3" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{day.high}°</span>
                          <span className="text-muted-foreground">/ {day.low}°</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4 text-chart-3" />
                        <span className={day.rain > 50 ? 'text-chart-3 font-medium' : 'text-muted-foreground'}>
                          {day.rain}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Farming Advisory */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI Weather Advisory</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on the forecast, Wednesday will bring significant rain (80% chance). 
                      Consider completing any field work or planting by Tuesday evening. 
                      The rain will be beneficial for recently planted crops but may delay harvesting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <h2 className="text-xl font-semibold">Market Intelligence</h2>
                <p className="text-sm text-muted-foreground">Real-time prices and trading insights</p>
              </div>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Full Market
              </Button>
            </div>

            {/* Price Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketPrices.map((item) => (
                <Card key={item.crop}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-chart-2" />
                        <span className="font-medium">{item.crop}</span>
                      </div>
                      <Badge variant={item.volume === 'High' ? 'default' : 'secondary'} className="text-xs">
                        {item.volume}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold">${item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mb-2">per bushel</p>
                    <div
                      className={`flex items-center gap-1 ${
                        item.trend === 'up'
                          ? 'text-primary'
                          : item.trend === 'down'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                      {item.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                      <span className="text-sm font-medium">
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">this week</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-chart-4" />
                  Selling Recommendations
                </CardTitle>
                <CardDescription>AI-powered market timing advice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Good time to sell Wheat</p>
                      <p className="text-sm text-muted-foreground">
                        Prices are 5.2% above average. Consider selling 30-50% of inventory.
                      </p>
                    </div>
                    <Badge variant="default">Recommended</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-6 w-6 text-accent shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Hold Corn for now</p>
                      <p className="text-sm text-muted-foreground">
                        Prices expected to recover in 2-3 weeks based on market trends.
                      </p>
                    </div>
                    <Badge variant="secondary">Wait</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <TrendingUp className="h-6 w-6 text-chart-2 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Soybeans trending up</p>
                      <p className="text-sm text-muted-foreground">
                        Strong demand expected. Good selling opportunity in 1-2 weeks.
                      </p>
                    </div>
                    <Badge variant="outline">Monitor</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Quick Stat Card Component
function QuickStatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
  trend: string
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{trend}</p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${color}/10 flex items-center justify-center shrink-0 ml-2`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Nutrient Card Component
function NutrientCard({
  name,
  value,
  status,
  description,
}: {
  name: string
  value: number
  status: string
  description: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant={status === 'Optimal' ? 'default' : status === 'Low' ? 'destructive' : 'secondary'} className="text-xs">
          {status}
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Level</span>
          <span className="font-medium">{value}%</span>
        </div>
        <Progress
          value={value}
          className={`h-2 ${value < 50 ? '[&>div]:bg-destructive' : value < 70 ? '[&>div]:bg-accent' : ''}`}
        />
      </div>
    </div>
  )
}
