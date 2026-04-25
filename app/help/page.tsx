'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  },
  {
    title: 'Rotate Your Crops',
    description: 'Different crops use different nutrients. Rotation keeps soil balanced and reduces pests.',
  },
  {
    title: 'Monitor Weather Patterns',
    description: 'Check weather before major farming activities. The AI uses weather data for timing advice.',
  },
  {
    title: 'Start Small with New Crops',
    description: 'When trying recommended crops for the first time, start with a small plot to test results.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Sidebar - Categories */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r bg-card shrink-0">
        <div className="p-4 border-b">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </div>
        <div className="p-4">
          <h1 className="text-xl font-semibold flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-primary" />
            Help Center
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Find answers and learn how to use the AI Farming Assistant
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value) setActiveCategory(null)
              }}
              className="pl-9"
            />
          </div>

          {/* Category List */}
          <nav className="space-y-1">
            {faqCategories.map((category) => {
              const Icon = categoryIcons[category.icon] || Lightbulb
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(isActive ? null : category.id)
                    setSearchQuery('')
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', !isActive && 'text-primary')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{category.name}</p>
                    <p className={cn(
                      'text-xs truncate',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {category.items.length} articles
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* FAQ Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-3xl">
              {showSearchResults ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-1">
                      Search Results
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                  <FAQAccordion items={filteredFAQs} searchQuery={searchQuery} />
                </>
              ) : activeFullCategory ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const Icon = categoryIcons[activeFullCategory.icon] || Lightbulb
                        return <Icon className="h-5 w-5 text-primary" />
                      })()}
                      <h2 className="text-lg font-semibold">
                        {activeFullCategory.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activeFullCategory.description}
                    </p>
                  </div>
                  <FAQAccordion items={activeFullCategory.items} />
                </>
              ) : (
                <>
                  {/* Welcome Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">
                      Welcome to the Help Center
                    </h2>
                    <p className="text-muted-foreground">
                      Select a category from the sidebar or search for specific topics.
                      You can also ask the AI Help Assistant on the right for personalized guidance.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Popular Topics
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {faqCategories.slice(0, 4).map((category) => {
                        const Icon = categoryIcons[category.icon] || Lightbulb
                        return (
                          <Card
                            key={category.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setActiveCategory(category.id)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                {category.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-xs">
                                {category.description}
                              </CardDescription>
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
                      Farming Tips
                    </h3>
                    <div className="space-y-3">
                      {farmingTips.map((tip, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 rounded-lg bg-secondary/50"
                        >
                          <Badge variant="outline" className="shrink-0 h-6 w-6 p-0 justify-center">
                            {i + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{tip.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* AI Help Chat */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card shrink-0">
          <HelpChat className="h-full rounded-none border-0" />
        </div>
      </main>
    </div>
  )
}
