'use client'

import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
    leftLabel: string
    rightLabel: string
    value: boolean // true for right, false for left
    onChange: (value: boolean) => void
    className?: string
}

/**
 * Toggle switch component matching the tabs style (Vault Overview/My Position)
 * Left option is false, right option is true
 */
export function ToggleSwitch({
    leftLabel,
    rightLabel,
    value,
    onChange,
    className
}: ToggleSwitchProps) {
    return (
        <div className={cn(
            "relative inline-flex h-10 items-center justify-center rounded-xl bg-[#f4f3f0] p-1 text-[#000000]",
            className
        )}>
            {/* Left option */}
            <button
                type="button"
                onClick={() => onChange(false)}
                className={cn(
                    "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1055C9] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    !value
                        ? "text-white shadow-sm before:absolute before:inset-0 before:z-[-1] before:rounded-lg before:bg-brand-gradient before:transition-all before:duration-300"
                        : "text-[#000000]/60 hover:text-[#000000] dark:text-white/60 dark:hover:text-white"
                )}
            >
                {leftLabel}
            </button>

            {/* Right option */}
            <button
                type="button"
                onClick={() => onChange(true)}
                className={cn(
                    "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1055C9] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    value
                        ? "text-white shadow-sm before:absolute before:inset-0 before:z-[-1] before:rounded-lg before:bg-brand-gradient before:transition-all before:duration-300"
                        : "text-[#000000]/60 hover:text-[#000000]"
                )}
            >
                {rightLabel}
            </button>
        </div>
    )
}

