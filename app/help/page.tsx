'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FAQAccordion } from '@/components/help/faq-accordion'
import { AIHelpModal } from '@/components/help/ai-help-modal'
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
  Bot,
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
  const [aiModalOpen, setAiModalOpen] = useState(false)

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
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header - Sticky on mobile, responsive on all sizes */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shrink-0">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Top row with back button and title */}
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2 truncate">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="truncate">Help Center</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">
                  Find answers and get AI-powered assistance
                </p>
              </div>
            </div>
            
            {/* AI Assistant Button - Always visible */}
            <Button
              onClick={() => setAiModalOpen(true)}
              className="shrink-0 h-9 sm:h-10 px-3 sm:px-4 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
          </div>

          {/* Search Bar - Full Width, responsive padding */}
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
                }
              }}
              className="pl-10 h-11 sm:h-12 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary w-full"
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
      </header>

      {/* Main Content Area - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-8 sm:pb-12 max-w-5xl mx-auto w-full">
          {showSearchResults ? (
            /* Search Results */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">Search Results</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground w-fit"
                >
                  Clear search
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
                  className="gap-1 -ml-2 h-9"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back</span>
                </Button>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                {(() => {
                  const Icon = categoryIcons[activeFullCategory.icon] || Lightbulb
                  return (
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                  )
                })()}
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold">{activeFullCategory.name}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {activeFullCategory.description}
                  </p>
                </div>
              </div>
              <FAQAccordion items={activeFullCategory.items} />
            </div>
          ) : (
            /* Default View - Categories & Tips */
            <div className="space-y-6 sm:space-y-8">
              {/* Welcome Message */}
              <div className="text-center py-2 sm:py-4">
                <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 mb-3 sm:mb-4">
                  <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">How can we help you?</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto px-4">
                  Browse categories below or use the search bar to find answers.
                </p>
              </div>

              {/* AI Assistant CTA - Mobile prominent */}
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1">
                        Need personalized help?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with our AI assistant for step-by-step guidance and answers to your questions.
                      </p>
                    </div>
                    <Button
                      onClick={() => setAiModalOpen(true)}
                      className="w-full sm:w-auto h-11 sm:h-12 px-6 gap-2 shadow-lg shadow-primary/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Category Cards - Responsive Grid */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Browse Topics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {faqCategories.map((category) => {
                    const Icon = categoryIcons[category.icon] || Lightbulb
                    return (
                      <Card
                        key={category.id}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98] touch-manipulation"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <CardHeader className="p-3 sm:p-4 pb-2">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-sm font-medium leading-tight">
                                {category.name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5 line-clamp-2">
                                {category.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-0">
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
                <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Quick Farming Tips
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {farmingTips.map((tip, i) => {
                    const Icon = tip.icon
                    return (
                      <div
                        key={i}
                        className="flex gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border"
                      >
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{tip.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-none">
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bottom spacing for mobile */}
              <div className="h-4 sm:h-0" />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* AI Help Modal */}
      <AIHelpModal open={aiModalOpen} onOpenChange={setAiModalOpen} />
    </div>
  )
}
