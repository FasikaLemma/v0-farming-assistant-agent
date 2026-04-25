'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FAQAccordion } from '@/components/help/faq-accordion'
import { HelpChat } from '@/components/help/help-chat'
import {
  Search,
  MessageSquare,
  Rocket,
  Sprout,
  FlaskConical,
  Bug,
  TrendingUp,
  Lightbulb,
  ArrowLeft,
  BookOpen,
  Sparkles,
  X,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { faqCategories, searchableFAQs } from '@/lib/faq-data'

const categoryIcons: Record<string, React.ElementType> = {
  rocket: Rocket,
  sprout: Sprout,
  flask: FlaskConical,
  bug: Bug,
  'trending-up': TrendingUp,
}

const farmingTips = [
  {
    title: 'Test Your Soil Regularly',
    description: 'Soil conditions change over time. Test every 2-3 years for accurate recommendations.',
    icon: FlaskConical,
  },
  {
    title: 'Rotate Your Crops',
    description: 'Different crops use different nutrients. Rotation keeps soil balanced and reduces pests.',
    icon: Sprout,
  },
  {
    title: 'Monitor Weather Patterns',
    description: 'Check weather before major farming activities. The AI uses weather data for timing advice.',
    icon: Lightbulb,
  },
  {
    title: 'Start Small with New Crops',
    description: 'When trying recommended crops for the first time, start with a small plot to test results.',
    icon: Rocket,
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('faq')

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory
        ? faqCategories.find((c) => c.id === activeCategory)?.items || []
        : []
    }

    const query = searchQuery.toLowerCase()
    return searchableFAQs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    )
  }, [searchQuery, activeCategory])

  const showSearchResults = searchQuery.trim().length > 0
  const activeFullCategory = activeCategory
    ? faqCategories.find((c) => c.id === activeCategory)
    : null

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Help Center
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Find answers and get AI-powered assistance
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value) {
                  setActiveCategory(null)
                  setActiveTab('faq')
                }
              }}
              className="pl-10 h-12 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-12 rounded-none border-t bg-transparent p-0 gap-0">
            <TabsTrigger
              value="faq"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
              <span className="sm:hidden">FAQ</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">Ask AI</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* FAQ Tab Content */}
          <TabsContent value="faq" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto">
              <div className="p-4 pb-8 max-w-4xl mx-auto">
                {showSearchResults ? (
                  /* Search Results */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Search Results</h2>
                        <p className="text-sm text-muted-foreground">
                          {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="text-muted-foreground"
                      >
                        Clear
                      </Button>
                    </div>
                    <FAQAccordion items={filteredFAQs} searchQuery={searchQuery} />
                  </div>
                ) : activeFullCategory ? (
                  /* Category View */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveCategory(null)}
                        className="gap-1 -ml-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = categoryIcons[activeFullCategory.icon] || Lightbulb
                        return (
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        )
                      })()}
                      <div>
                        <h2 className="text-lg font-semibold">{activeFullCategory.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {activeFullCategory.description}
                        </p>
                      </div>
                    </div>
                    <FAQAccordion items={activeFullCategory.items} />
                  </div>
                ) : (
                  /* Default View - Categories & Tips */
                  <div className="space-y-8">
                    {/* Welcome Message */}
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                        <HelpCircle className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">How can we help you?</h2>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Browse categories below or use the search bar to find answers.
                        You can also chat with our AI assistant for personalized help.
                      </p>
                    </div>

                    {/* Category Cards - Responsive Grid */}
                    <div>
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Browse Topics
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {faqCategories.map((category) => {
                          const Icon = categoryIcons[category.icon] || Lightbulb
                          return (
                            <Card
                              key={category.id}
                              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
                              onClick={() => setActiveCategory(category.id)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <CardTitle className="text-sm font-medium">
                                      {category.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5 line-clamp-2">
                                      {category.description}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <Badge variant="secondary" className="text-xs">
                                  {category.items.length} articles
                                </Badge>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Farming Tips */}
                    <div>
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        Quick Farming Tips
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {farmingTips.map((tip, i) => {
                          const Icon = tip.icon
                          return (
                            <div
                              key={i}
                              className="flex gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border"
                            >
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{tip.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {tip.description}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* CTA to Chat */}
                    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1">
                              Still have questions?
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Chat with our AI assistant for personalized guidance and step-by-step help.
                            </p>
                          </div>
                          <Button
                            onClick={() => setActiveTab('chat')}
                            className="w-full sm:w-auto h-12 px-6 gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Ask AI Assistant
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI Chat Tab Content */}
          <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden">
            <HelpChat className="h-full border-0 rounded-none" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
