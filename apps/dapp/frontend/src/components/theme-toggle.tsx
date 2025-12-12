'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
                "w-9 h-9 p-0 rounded-lg transition-all duration-200",
                "hover:bg-[#f4f3f0] dark:hover:bg-white/5"
            )}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-black dark:text-white transition-transform duration-200" />
            ) : (
                <Sun className="w-5 h-5 text-black dark:text-white transition-transform duration-200" />
            )}
        </Button>
    )
}
