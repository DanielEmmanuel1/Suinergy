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
import { Button } from '@/components/ui/button'
import { AlertCircle, XCircle } from 'lucide-react'

interface ErrorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    message?: string
    error?: string | Error
    onClose?: () => void
}

export function ErrorModal({
    open,
    onOpenChange,
    title = 'Transaction Failed',
    message = 'Your transaction could not be completed.',
    error,
    onClose,
}: ErrorModalProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const iconRef = useRef<HTMLDivElement>(null)

    // Extract error message
    const errorMessage = error instanceof Error ? error.message : error || message

    useEffect(() => {
        if (!open) return

        const ctx = gsap.context(() => {
            if (!contentRef.current || !iconRef.current) return

            // Reset initial states
            gsap.set([iconRef.current], {
                opacity: 0,
                scale: 0.5,
            })
            gsap.set(contentRef.current, {
                scale: 0.9,
                opacity: 0,
            })

            // Create timeline
            const tl = gsap.timeline()

            // Animate container
            tl.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: 'back.out(1.2)',
            })

            // Animate icon
            tl.to(
                iconRef.current,
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.5)',
                },
                '-=0.2'
            )
        }, contentRef)

        return () => {
            ctx.revert()
        }
    }, [open])

    const handleClose = () => {
        onOpenChange(false)
        if (onClose) onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent ref={contentRef} className="sm:max-w-md">
                <div ref={iconRef} className="flex justify-center mb-4">
                    <div className="relative">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping" />
                    </div>
                </div>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold text-red-600">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800 break-words">{errorMessage}</p>
                        </div>
                    </div>
                )}
                <div className="flex justify-center mt-4">
                    <Button onClick={handleClose} className="bg-red-500 hover:bg-red-600 dark:hover:bg-red-700">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

