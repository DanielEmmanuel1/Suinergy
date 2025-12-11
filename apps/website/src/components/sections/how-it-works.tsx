'use client';

import { motion } from 'framer-motion';
import { Wallet, Settings, TrendingUp, LogOut } from 'lucide-react';
import { TabbedContainer } from '@/components/ui/tabbed-container';

const steps = [
    {
        id: '01',
        title: 'Deposit',
        description: 'Connect your wallet and deposit SUI or USDC into the Suinergy Vault.',
        icon: Wallet,
    },
    {
        id: '02',
        title: 'Auto-Allocate',
        description: 'Our smart contracts automatically distribute your capital to the highest-yielding strategies.',
        icon: Settings,
    },
    {
        id: '03',
        title: 'Compound',
        description: 'Yields are harvested and auto-compounded back into your position for exponential growth.',
        icon: TrendingUp,
    },
    {
        id: '04',
        title: 'Withdraw',
        description: 'Exit your position anytime. You receive your initial deposit plus all accrued interest.',
        icon: LogOut,
    },
];

export function HowItWorks() {
    return (
        <section id="protocol" className="py-24 bg-[#f4f3f0]">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer
                    label="The Protocol"
                    className="w-full"
                    tabClassName="bg-white"
                    contentClassName="bg-white"
                >
                    <div className="flex flex-col md:flex-row gap-16 items-start">
                        <div className="md:w-1/2 sticky top-24">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">
                                From Deposit to Returns in Seconds
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                Suinergy abstracts away the complexity of DeFi. You don't need to manage multiple wallets, monitor APYs, or manually compound rewards. We handle everything on-chain.
                            </p>

                            <div className="relative pl-8 border-l-2 border-black/10 space-y-12">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="relative group">
                                        <span className="absolute -left-[41px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-black/20 text-xs font-bold ring-4 ring-[#f4f3f0] group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-white transition-colors">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-brand-gradient transition-colors font-heading">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full">
                            <div className="relative bg-black rounded-2xl p-8 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                                {/* Abstract Visual Representation */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gradient rounded-full blur-[100px] opacity-20"></div>

                                <div className="relative z-10 space-y-4">
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white font-medium">Deposit SUI</span>
                                        </div>
                                        <span className="text-white font-mono">1,000.00</span>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-0.5 h-8 bg-white/20"></div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Settings className="w-5 h-5 text-white/60" />
                                            <span className="text-white/60 text-sm font-medium">Strategy Allocation</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-gradient w-[45%]"></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-white/40">
                                                <span>Scallop (45%)</span>
                                                <span>Navi (30%)</span>
                                                <span>Cetus (25%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-0.5 h-8 bg-white/20"></div>
                                    </div>

                                    <div className="bg-brand-gradient p-6 rounded-xl border border-white/10 text-center">
                                        <span className="text-white/80 text-sm uppercase tracking-wider font-bold">Current Yield</span>
                                        <div className="text-4xl font-bold text-white mt-1 font-heading">24.5% APY</div>
                                        <div className="text-white/60 text-xs mt-2">Auto-compounding every 60s</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabbedContainer>
            </div>
        </section>
    );
}
