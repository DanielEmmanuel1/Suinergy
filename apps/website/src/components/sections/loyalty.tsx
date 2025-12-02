'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap, Shield, Check } from 'lucide-react';
import { TabbedContainer } from '@/components/ui/tabbed-container';
import { cn } from '@/lib/utils';

const tiers = [
    {
        name: 'Bronze',
        requirement: '0 - 1,000 Points',
        benefits: ['Basic Yields', 'Standard Support', 'Community Access'],
        icon: Shield,
        color: 'text-transparent bg-clip-text bg-brand-gradient',
    },
    {
        name: 'Silver',
        requirement: '1,000 - 10,000 Points',
        benefits: ['1.1x Yield Boost', 'Priority Support', 'Governance Voting'],
        icon: Star,
        color: 'text-transparent bg-clip-text bg-brand-gradient',
    },
    {
        name: 'Gold',
        requirement: '10,000 - 50,000 Points',
        benefits: ['1.25x Yield Boost', 'Zero Withdrawal Fees', 'Early Access Features'],
        icon: Zap,
        color: 'text-transparent bg-clip-text bg-brand-gradient',
        featured: true,
    },
    {
        name: 'Platinum',
        requirement: '50,000+ Points',
        benefits: ['1.5x Yield Boost', 'Dedicated Account Manager', 'Revenue Share'],
        icon: Crown,
        color: 'text-transparent bg-clip-text bg-brand-gradient',
    },
];

export function Loyalty() {
    return (
        <section id="loyalty" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer label="Loyalty Program" className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading"
                        >
                            Reward Your Commitment
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg text-muted-foreground"
                        >
                            Suinergy isn't just about yields; it's about long-term growth. Earn points for every second your capital works, unlocking exclusive tiers and multipliers.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="relative">
                                    {tier.featured && (
                                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#b92b27] via-[#1565c0] to-[#b92b27] bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] opacity-75"></div>
                                    )}
                                    <div
                                        className={cn(
                                            "relative h-full p-8 rounded-2xl border border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col bg-white overflow-hidden",
                                            tier.featured 
                                                ? "border-transparent shadow-lg scale-105 z-10" 
                                                : ""
                                        )}
                                        style={tier.featured ? {
                                            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #b92b27, #1565c0)',
                                            backgroundOrigin: 'border-box',
                                            backgroundClip: 'padding-box, border-box',
                                            border: '2px solid transparent',
                                        } : {}}
                                    >
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#b92b27] to-[#1565c0] opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white shadow-sm")}>
                                            <tier.icon className={cn("w-6 h-6", tier.color)} />
                                        </div>

                                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
                                        {tier.requirement}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {tier.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                <Check className="w-4 h-4 mt-0.5 shrink-0 text-transparent bg-clip-text bg-brand-gradient" />
                                                <span className="leading-tight">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {tier.featured ? (
                                        <div className="w-full py-2 rounded-lg bg-brand-gradient text-white text-center text-sm font-bold">
                                            Current Tier
                                        </div>
                                    ) : (
                                        <div className="w-full py-2 rounded-lg bg-white border border-black/5 text-gray-500 text-center text-sm font-medium">
                                            View Details
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </TabbedContainer>
            </div>
        </section>
    );
}
