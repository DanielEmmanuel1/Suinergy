'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Activity, Users, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TabbedContainer } from '@/components/ui/tabbed-container';

const partners = [
    { name: 'Scallop', type: 'Lending', apy: '12.4%', description: 'Premier money market on Sui', image: '/images/scallop.webp' },
    { name: 'Navi Protocol', type: 'Lending', apy: '14.2%', description: 'Native one-stop liquidity protocol', image: '/images/navi.avif' },
    { name: 'Cetus', type: 'DEX', apy: '45.8%', description: 'Concentrated liquidity protocol', image: '/images/cetus.avif' },
    { name: 'Aftermath', type: 'DEX', apy: '32.1%', description: 'DEX aggregator and perpetuals', image: '/images/aftremath.avif' },
    { name: 'Turbos', type: 'DEX', apy: '28.5%', description: 'Hyper-efficient CLMM DEX', image: '/images/turbos.svg' },
    { name: 'Bluefin', type: 'Derivatives', apy: '18.9%', description: 'Performance-focused perpetuals', image: '/images/bluefin.png' },
];

export function Ecosystem() {
    return (
        <section id="ecosystem" className="py-24 bg-black text-white">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer
                    label="Ecosystem"
                    className="w-full"
                    tabClassName="bg-[#111] border-white/10"
                    contentClassName="bg-[#111] border-white/10"
                >
                    <div className="flex flex-col md:flex-row gap-12 items-end mb-16">
                        <div className="md:w-2/3">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white font-heading">
                                Powering Yields Across Sui
                            </h2>
                            <p className="text-lg text-gray-400 max-w-2xl">
                                We integrate with the most trusted and liquid protocols on Sui to ensure your assets are always working hard for you.
                            </p>
                        </div>

                        <div className="md:w-1/3 flex justify-end">
                            <a href="#" className="group flex items-center gap-2 font-bold text-transparent bg-clip-text bg-brand-gradient hover:opacity-80 transition-opacity">
                                View all integrations <ArrowUpRight className="w-4 h-4 text-transparent bg-clip-text bg-brand-gradient group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </div>

                    {/* Partners Grid - Dark Mode Wall */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {partners.map((partner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="group relative cursor-pointer"
                            >
                                <div 
                                    className="relative bg-[#1a1a1a] p-6 rounded-xl border-2 border-white/5 transition-all group-hover:-translate-y-1 overflow-visible"
                                    style={{
                                        position: 'relative',
                                    }}
                                >
                                    {/* Gradient border overlay - only visible on hover */}
                                    <div 
                                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(to right, #b92b27, #1565c0)',
                                            padding: '2px',
                                            margin: '-2px',
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                        }}
                                    />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="w-4 h-4 text-transparent bg-clip-text bg-brand-gradient" />
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 bg-[#222] rounded-lg flex items-center justify-center p-2 overflow-hidden group-hover:ring-2 ring-transparent group-hover:bg-gradient-to-r group-hover:from-[#b92b27]/20 group-hover:to-[#1565c0]/20 transition-all">
                                        <img src={partner.image} alt={partner.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{partner.name}</h3>
                                        <span className="text-xs text-gray-500">{partner.type}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-400 mb-4 h-10">
                                    {partner.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-xs text-gray-500">Current APY</span>
                                    <Badge variant="secondary" className="bg-brand-gradient text-white hover:opacity-90 border-none">
                                        {partner.apy}
                                    </Badge>
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
