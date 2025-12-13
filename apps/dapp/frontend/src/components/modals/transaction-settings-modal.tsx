'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Zap } from 'lucide-react'

interface TransactionSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (settings: TransactionSettings) => void
}

export interface TransactionSettings {
    slippage: number
    gasPrice: 'standard' | 'fast' | 'instant'
    deadline: number // minutes
}

const defaultSettings: TransactionSettings = {
    slippage: 0.5,
    gasPrice: 'standard',
    deadline: 20,
}

export function TransactionSettingsModal({ open, onOpenChange, onSave }: TransactionSettingsModalProps) {
    const [settings, setSettings] = useState<TransactionSettings>(defaultSettings)
    const [customSlippage, setCustomSlippage] = useState(false)

    const handleSave = () => {
        onSave?.(settings)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Transaction Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your transaction parameters for deposits and withdrawals
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Slippage Tolerance */}
                    <div className="space-y-3">
                        <Label>Slippage Tolerance</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={!customSlippage && settings.slippage === 0.1 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setSettings({ ...settings, slippage: 0.1 })
                                    setCustomSlippage(false)
                                }}
                                className={!customSlippage && settings.slippage === 0.1 ? 'bg-brand-gradient' : ''}
                            >
                                0.1%
                            </Button>
                            <Button
                                variant={!customSlippage && settings.slippage === 0.5 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setSettings({ ...settings, slippage: 0.5 })
                                    setCustomSlippage(false)
                                }}
                                className={!customSlippage && settings.slippage === 0.5 ? 'bg-brand-gradient' : ''}
                            >
                                0.5%
                            </Button>
                            <Button
                                variant={!customSlippage && settings.slippage === 1.0 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setSettings({ ...settings, slippage: 1.0 })
                                    setCustomSlippage(false)
                                }}
                                className={!customSlippage && settings.slippage === 1.0 ? 'bg-brand-gradient' : ''}
                            >
                                1.0%
                            </Button>
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="50"
                                    value={customSlippage ? settings.slippage : ''}
                                    placeholder="Custom"
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value)
                                        if (!isNaN(value) && value >= 0 && value <= 50) {
                                            setSettings({ ...settings, slippage: value })
                                            setCustomSlippage(true)
                                        }
                                    }}
                                    onFocus={() => setCustomSlippage(true)}
                                    className="h-9"
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Gas Price */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Gas Price
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={settings.gasPrice === 'standard' ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, gasPrice: 'standard' })}
                                className={settings.gasPrice === 'standard' ? 'bg-brand-gradient' : ''}
                            >
                                Standard
                            </Button>
                            <Button
                                variant={settings.gasPrice === 'fast' ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, gasPrice: 'fast' })}
                                className={settings.gasPrice === 'fast' ? 'bg-brand-gradient' : ''}
                            >
                                Fast
                            </Button>
                            <Button
                                variant={settings.gasPrice === 'instant' ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, gasPrice: 'instant' })}
                                className={settings.gasPrice === 'instant' ? 'bg-brand-gradient' : ''}
                            >
                                Instant
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Transaction Deadline */}
                    <div className="space-y-3">
                        <Label>Transaction Deadline</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.deadline}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    if (!isNaN(value) && value >= 1 && value <= 60) {
                                        setSettings({ ...settings, deadline: value })
                                    }
                                }}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Transaction will revert if it takes longer than this time
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-brand-gradient" onClick={handleSave}>
                        Save Settings
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

