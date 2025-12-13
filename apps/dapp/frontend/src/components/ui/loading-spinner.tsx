'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const spinnerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!spinnerRef.current) return

        const ctx = gsap.context(() => {
            gsap.to(spinnerRef.current, {
                rotation: 360,
                duration: 1,
                repeat: -1,
                ease: 'none',
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
    }

    return (
        <div ref={containerRef} className={`flex items-center justify-center ${className}`}>
            <div
                ref={spinnerRef}
                className={`${sizeClasses[size]} border-[#1055C9] border-t-transparent rounded-full`}
            />
        </div>
    )
}

