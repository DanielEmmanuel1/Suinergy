'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface ProcessingModalProps {
    open: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    message?: string
}

export function ProcessingModal({
    open,
    onOpenChange,
    title = 'Processing Transaction',
    message = 'Please wait while we process your transaction...',
}: ProcessingModalProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const iconRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const ctx = gsap.context(() => {
            if (!contentRef.current || !iconRef.current) return

            // Reset initial states
            gsap.set(contentRef.current, {
                scale: 0.9,
                opacity: 0,
            })
            gsap.set(iconRef.current, {
                rotation: 0,
                scale: 0.8,
                opacity: 0,
            })

            // Animate container
            gsap.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
            })

            // Animate spinner
            gsap.to(iconRef.current, {
                scale: 1,
                opacity: 1,
                rotation: 360,
                duration: 1,
                ease: 'none',
                repeat: -1,
            })
        }, contentRef)

        return () => {
            ctx.revert()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent ref={contentRef} className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                    <div ref={iconRef} className="flex justify-center mb-4">
                        <Loader2 className="w-16 h-16 text-[#1055C9] animate-spin" />
                    </div>
                    <DialogTitle className="text-center text-xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

