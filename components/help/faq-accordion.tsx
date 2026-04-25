'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FAQItem } from '@/lib/faq-data'
import { cn } from '@/lib/utils'

interface FAQAccordionProps {
  items: FAQItem[]
  searchQuery?: string
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function FAQAccordion({ items, searchQuery = '' }: FAQAccordionProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-muted-foreground font-medium">No FAQs found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try searching with different keywords
        </p>
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {items.map((item) => (
        <AccordionItem 
          key={item.id} 
          value={item.id}
          className={cn(
            "border rounded-xl px-4 bg-card transition-all duration-200",
            "hover:border-primary/30 hover:shadow-sm",
            "data-[state=open]:border-primary/50 data-[state=open]:shadow-md"
          )}
        >
          <AccordionTrigger className="text-left hover:no-underline py-4 gap-3">
            <span className="font-medium text-sm sm:text-base leading-relaxed pr-4">
              {highlightText(item.question, searchQuery)}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="pt-1 border-t">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed pt-3">
                {highlightText(item.answer, searchQuery)}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
