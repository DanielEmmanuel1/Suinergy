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
import { CheckCircle2 } from 'lucide-react'

interface SuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    message?: string
    onClose?: () => void
}

export function SuccessModal({
    open,
    onOpenChange,
    title = 'Success!',
    message = 'Your transaction was completed successfully.',
    onClose,
}: SuccessModalProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const iconRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const messageRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        if (!open) return

        let timer: NodeJS.Timeout | null = null

        const ctx = gsap.context(() => {
            if (!contentRef.current || !iconRef.current || !titleRef.current || !messageRef.current) return

            // Reset initial states
            gsap.set([iconRef.current, titleRef.current, messageRef.current], {
                opacity: 0,
                scale: 0.5,
            })
            gsap.set(contentRef.current, {
                scale: 0.8,
                opacity: 0,
            })

            // Create timeline
            const tl = gsap.timeline()

            // Animate container
            tl.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out(1.7)',
            })

            // Animate icon with bounce
            tl.to(
                iconRef.current,
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)',
                },
                '-=0.2'
            )

            // Animate title
            tl.to(
                titleRef.current,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                },
                '-=0.3'
            )

            // Animate message
            tl.to(
                messageRef.current,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                },
                '-=0.2'
            )

            // Auto-close after 3 seconds
            timer = setTimeout(() => {
                onOpenChange(false)
                if (onClose) onClose()
            }, 3000)
        }, contentRef)

        return () => {
            if (timer) clearTimeout(timer)
            ctx.revert()
        }
    }, [open, onOpenChange, onClose])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent ref={contentRef} className="sm:max-w-md">
                <DialogHeader>
                    <div ref={iconRef} className="flex justify-center mb-4">
                        <div className="relative">
                            <CheckCircle2 className="w-16 h-16 text-[#10b981]" />
                            <div className="absolute inset-0 bg-[#10b981] rounded-full opacity-20 animate-ping" />
                        </div>
                    </div>
                    <DialogTitle ref={titleRef} className="text-center text-xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription ref={messageRef} className="text-center pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

