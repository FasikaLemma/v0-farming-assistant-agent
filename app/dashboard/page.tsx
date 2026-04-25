'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
} from 'lucide-react'
import Link from 'next/link'

// Mock dashboard data
const soilHealth = {
  overall: 78,
  nitrogen: 65,
  phosphorus: 82,
  potassium: 70,
  ph: 6.5,
  moisture: 55,
}

const weatherData = {
  current: { temp: 72, condition: 'Partly Cloudy', humidity: 45 },
  forecast: [
    { day: 'Today', high: 75, low: 58, condition: 'sunny' },
    { day: 'Tomorrow', high: 78, low: 60, condition: 'cloudy' },
    { day: 'Wed', high: 72, low: 55, condition: 'rain' },
    { day: 'Thu', high: 70, low: 52, condition: 'sunny' },
  ],
}

const activeCrops = [
  { name: 'Tomatoes', status: 'Growing', progress: 65, daysToHarvest: 28 },
  { name: 'Corn', status: 'Maturing', progress: 85, daysToHarvest: 14 },
  { name: 'Peppers', status: 'Flowering', progress: 45, daysToHarvest: 45 },
]

const recentAlerts = [
  { type: 'warning', message: 'Low nitrogen levels detected in Field A', time: '2 hours ago' },
  { type: 'success', message: 'Optimal planting window for soybeans', time: '5 hours ago' },
  { type: 'info', message: 'Wheat prices up 5% this week', time: '1 day ago' },
]

const marketPrices = [
  { crop: 'Wheat', price: 7.25, change: 5.2, trend: 'up' },
  { crop: 'Corn', price: 4.85, change: -2.1, trend: 'down' },
  { crop: 'Soybeans', price: 12.40, change: 1.8, trend: 'up' },
  { crop: 'Tomatoes', price: 2.15, change: 0, trend: 'stable' },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Farm Dashboard</h1>
          <p className="text-muted-foreground">Overview of your farming operations</p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <Leaf className="h-4 w-4" />
            Start New Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Soil Health</p>
                <p className="text-2xl font-bold">{soilHealth.overall}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{weatherData.current.temp}°F</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ThermometerSun className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Crops</p>
                <p className="text-2xl font-bold">{activeCrops.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                <Sprout className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Harvest</p>
                <p className="text-2xl font-bold">14 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-chart-4/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Soil Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Soil Analysis
            </CardTitle>
            <CardDescription>Current soil nutrient levels and conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nitrogen (N)</span>
                  <span className="font-medium">{soilHealth.nitrogen}%</span>
                </div>
                <Progress value={soilHealth.nitrogen} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Phosphorus (P)</span>
                  <span className="font-medium">{soilHealth.phosphorus}%</span>
                </div>
                <Progress value={soilHealth.phosphorus} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Potassium (K)</span>
                  <span className="font-medium">{soilHealth.potassium}%</span>
                </div>
                <Progress value={soilHealth.potassium} className="h-2" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t">
              <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">pH Level</p>
                <p className="text-xl font-semibold">{soilHealth.ph}</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Moisture</p>
                <p className="text-xl font-semibold">{soilHealth.moisture}%</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-primary/10 text-center">
                <p className="text-xs text-muted-foreground">Overall Health</p>
                <p className="text-xl font-semibold text-primary">{soilHealth.overall}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                {alert.type === 'warning' && (
                  <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                )}
                {alert.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                )}
                {alert.type === 'info' && (
                  <TrendingUp className="h-5 w-5 text-chart-3 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Crops */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-chart-2" />
              Active Crops
            </CardTitle>
            <CardDescription>Track your growing crops and estimated harvest times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCrops.map((crop) => (
                <div key={crop.name} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                    <Sprout className="h-6 w-6 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{crop.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {crop.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{crop.daysToHarvest} days</p>
                        <p className="text-xs text-muted-foreground">until harvest</p>
                      </div>
                    </div>
                    <Progress value={crop.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-4" />
              Market Prices
            </CardTitle>
            <CardDescription>Current commodity prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketPrices.map((item) => (
                <div
                  key={item.crop}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.crop}</p>
                    <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
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
                        {item.change > 0 ? '+' : ''}
                        {item.change}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">per bushel</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-accent" />
            Weather Forecast
          </CardTitle>
          <CardDescription>Plan your farming activities based on upcoming weather</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {weatherData.forecast.map((day) => (
              <div
                key={day.day}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <p className="font-medium mb-2">{day.day}</p>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                  {day.condition === 'sunny' && <ThermometerSun className="h-5 w-5 text-accent" />}
                  {day.condition === 'cloudy' && <Droplets className="h-5 w-5 text-chart-3" />}
                  {day.condition === 'rain' && <Droplets className="h-5 w-5 text-chart-3" />}
                </div>
                <p className="text-lg font-semibold">{day.high}°</p>
                <p className="text-sm text-muted-foreground">{day.low}°</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Need farming advice?</p>
                <p className="text-sm text-muted-foreground">
                  Chat with your AI assistant for personalized recommendations
                </p>
              </div>
            </div>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Start Chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
