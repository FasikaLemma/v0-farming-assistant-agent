'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FAQItem } from '@/lib/faq-data'

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
      <mark key={i} className="bg-accent/50 text-accent-foreground rounded px-0.5">
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
      <div className="text-center py-8 text-muted-foreground">
        <p>No FAQs found matching your search.</p>
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-left hover:no-underline">
            <span className="font-medium">
              {highlightText(item.question, searchQuery)}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed">
              {highlightText(item.answer, searchQuery)}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
