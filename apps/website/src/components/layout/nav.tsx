'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Protocol', href: '#protocol' },
    { name: 'Ecosystem', href: '#ecosystem' },
    { name: 'Developers', href: '#developers' },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md border-b border-black/5 py-4'
                    : 'bg-transparent py-6'
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 z-50">
                    <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Suinergy</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" className="font-medium" asChild>
                        <Link href="https://docs.suinergy.app" target="_blank">
                            Docs
                        </Link>
                    </Button>
                    <Button className="font-medium gap-2" asChild>
                        <Link href={process.env.NEXT_PUBLIC_DAPP_URL || 'http://localhost:3001'}>
                            Launch App <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[100] bg-white flex flex-col pt-24 pb-8 px-6 md:hidden"
                        >
                            <div className="flex-1 flex flex-col justify-between">
                                <nav className="flex flex-col gap-6">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-3xl font-bold text-foreground font-heading tracking-tight"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline" size="lg" className="w-full justify-center text-lg h-14" asChild>
                                        <Link href="https://docs.suinergy.app">Read Documentation</Link>
                                    </Button>
                                    <Button size="lg" className="w-full justify-center gap-2 text-lg h-14" asChild>
                                        <Link href={process.env.NEXT_PUBLIC_DAPP_URL || 'http://localhost:3001'}>
                                            Launch App <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
