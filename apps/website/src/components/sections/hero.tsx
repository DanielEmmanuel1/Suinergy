'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabbedContainer } from '@/components/ui/tabbed-container';

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white py-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,85,201,0.05),transparent_50%)]" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <TabbedContainer label="Suinergy Protocol" className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left Column: Copy */}
                        <div className="text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#b92b27]/10 to-[#1565c0]/10 border border-transparent bg-gradient-to-r from-[#b92b27]/20 to-[#1565c0]/20 text-xs font-bold uppercase tracking-wider mb-6"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gradient opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gradient"></span>
                                </span>
                                Live on Sui Mainnet
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-black leading-[1.1] font-heading"
                            >
                                Activate the Sui economy with the leading Yield Orchestrator
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
                            >
                                Suinergy automatically orchestrates your capital across the highest-performing strategies in the Sui ecosystem.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center gap-4"
                            >
                                <Button size="lg" className="h-12 px-8 text-lg gap-2 w-full sm:w-auto bg-brand-gradient hover:opacity-90 text-white rounded-full font-bold" asChild>
                                    <Link href={process.env.NEXT_PUBLIC_DAPP_URL || 'http://localhost:3001'}>
                                        Start Building <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="ghost" className="h-12 px-8 text-lg w-full sm:w-auto font-bold hover:bg-transparent hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient" asChild>
                                    <Link href="https://docs.suinergy.app">
                                        Explore the Ecosystem
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Right Column: Visual/Graphic */}
                        <div className="relative h-full min-h-[400px] bg-brand-gradient rounded-3xl overflow-hidden flex items-center justify-center p-10">
                            {/* Abstract Circles Pattern similar to Stacks */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-white rounded-full"></div>
                            </div>

                            <div className="relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 text-white text-center">
                                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 font-heading">24.5% APY</h3>
                                <p className="text-white/80">Current Average Yield</p>
                            </div>
                        </div>

                    </div>
                </TabbedContainer>
            </div>
        </section>
    );
}
