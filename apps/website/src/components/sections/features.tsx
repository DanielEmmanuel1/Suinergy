'use client';

import { motion } from 'framer-motion';
import { BarChart3, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { TabbedContainer } from '@/components/ui/tabbed-container';

const features = [
    {
        title: 'Automated Allocation',
        description: 'Smart capital distribution across top-performing protocols like Scallop, Navi, and Cetus.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>,
        icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-2",
    },
    {
        title: 'Transparent Analytics',
        description: 'Real-time performance tracking with historical data and clear position breakdowns.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>,
        icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: 'Loyalty Rewards',
        description: 'Earn points for every second your capital is active, unlocking higher yield tiers.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>,
        icon: <Trophy className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: 'Instant Liquidity',
        description: 'Enter and exit positions anytime with zero lock-up periods.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>,
        icon: <ArrowRight className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-2",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer label="Core Features" className="w-full">
                    <div className="text-left mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">
                            Intelligent Yield Orchestration
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Suinergy simplifies DeFi by automatically managing your positions across the Sui ecosystem, ensuring you always get the best risk-adjusted returns.
                        </p>
                    </div>

                    <BentoGrid className="max-w-7xl mx-auto">
                        {features.map((item, i) => (
                            <BentoGridItem
                                key={i}
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                icon={item.icon}
                                className={item.className}
                            />
                        ))}
                    </BentoGrid>
                </TabbedContainer>
            </div>
        </section>
    );
}
