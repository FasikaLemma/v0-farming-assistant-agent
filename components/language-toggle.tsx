'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
]

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language || 'en'

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
    // Update document direction for RTL languages if needed in future
    document.documentElement.lang = langCode
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languages.find(l => l.code === currentLanguage)?.nativeName || 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              currentLanguage === lang.code && "bg-accent"
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1">
              <p className="font-medium">{lang.nativeName}</p>
              <p className="text-xs text-muted-foreground">{lang.name}</p>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle button for compact spaces
export function LanguageToggleCompact() {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language || 'en'

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'am' : 'en'
    i18n.changeLanguage(newLang)
    document.documentElement.lang = newLang
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 h-9 min-w-[100px]"
    >
      <Globe className="h-4 w-4" />
      <span className={cn(
        currentLanguage === 'am' && "font-ethiopic"
      )}>
        {currentLanguage === 'en' ? 'አማርኛ' : 'English'}
      </span>
    </Button>
  )
}
