'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
    return (
        <section className="py-32 bg-brand-gradient relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ffffff,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8"
                >
                    Start Earning Today
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
                >
                    Join thousands of users maximizing their DeFi returns on Sui. No lock-ups, instant withdrawals, and fully automated strategies.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button size="lg" className="h-14 px-10 text-lg bg-white text-[#1565c0] hover:bg-gray-50 border-none shadow-xl font-bold" asChild>
                        <Link href={process.env.NEXT_PUBLIC_DAPP_URL || 'http://localhost:3001'}>
                            Launch Suinergy <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link href="https://discord.gg/suinergy" target="_blank">
                            Join Community
                        </Link>
                    </Button>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 text-sm text-white/80"
                >
                    Audited by OtterSec • $12.5M+ TVL • 2,400+ Users
                </motion.p>
            </div>
        </section>
    );
}
