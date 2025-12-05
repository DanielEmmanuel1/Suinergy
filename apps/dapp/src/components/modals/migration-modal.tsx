'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface MigrationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    oldPositionId: string
    vaultId: string
    shares: string
    vaultIdDisplay: string
    onSuccess?: () => void
    onMigrate: (oldPositionId: string, vaultId: string, shares: string) => Promise<void>
}

export function MigrationModal({
    open,
    onOpenChange,
    oldPositionId,
    vaultId,
    shares,
    vaultIdDisplay,
    onSuccess,
    onMigrate,
}: MigrationModalProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const iconRef = useRef<HTMLDivElement>(null)
    const [isMigrating, setIsMigrating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) {
            setError(null)
            setIsMigrating(false)
            return
        }

        const ctx = gsap.context(() => {
            if (!contentRef.current || !iconRef.current) return

            gsap.set([iconRef.current], {
                opacity: 0,
                scale: 0.8,
            })
            gsap.set(contentRef.current, {
                scale: 0.9,
                opacity: 0,
            })

            const tl = gsap.timeline()

            tl.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: 'back.out(1.2)',
            })

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

    const handleMigrate = async () => {
        setIsMigrating(true)
        setError(null)

        try {
            await onMigrate(oldPositionId, vaultId, shares)
            if (onSuccess) {
                onSuccess()
            }
            onOpenChange(false)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Migration failed. Please try again.'
            setError(errorMessage)
        } finally {
            setIsMigrating(false)
        }
    }

    const sharesFormatted = (BigInt(shares) / BigInt(1e6)).toString()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent ref={contentRef} className="sm:max-w-md">
                <div ref={iconRef} className="flex justify-center mb-4">
                    <div className="relative">
                        <RefreshCw className="w-16 h-16 text-[#1055C9]" />
                        <div className="absolute inset-0 bg-[#1055C9] rounded-full opacity-20 animate-ping" />
                    </div>
                </div>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        Migrate Position to New Package
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Your position was created with an older package version. Migrate it to continue using all features.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vault:</span>
                                <span className="font-mono text-xs">{vaultIdDisplay}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shares:</span>
                                <span className="font-semibold">{sharesFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Old Position ID:</span>
                                <span className="font-mono text-xs break-all">{oldPositionId.slice(0, 10)}...{oldPositionId.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800 break-words">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>• This will create a new position with the same shares</p>
                        <p>• Your old position will be tracked to prevent duplicates</p>
                        <p>• After migration, you can use all new package features</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isMigrating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMigrate}
                        disabled={isMigrating}
                        className="bg-[#1055C9] hover:bg-[#0d45a8]"
                    >
                        {isMigrating ? 'Migrating...' : 'Migrate Position'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}



