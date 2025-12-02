'use client';

import Link from 'next/link';
import { Github, Twitter, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
    return (
        <footer className="relative bg-black text-white pt-32 pb-20 overflow-hidden">
            {/* Background Gradient Transition */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#f4f3f0] to-transparent"></div>
            
            {/* Abstract Shapes Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-64 h-64 border border-white rounded-full"></div>
                <div className="absolute top-40 right-20 w-96 h-96 border border-white rounded-full"></div>
                <div className="absolute bottom-20 left-1/4 w-48 h-48 border border-white rounded-full"></div>
                <div className="absolute bottom-40 right-1/3 w-80 h-80 border border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-white rounded-full"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-6">
                            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center text-white">
                                S
                            </div>
                            Suinergy
                        </Link>
                        <p className="text-gray-400 mb-8 max-w-sm">
                            The leading yield orchestration protocol on Sui. Automating DeFi strategies for maximum returns.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-white" asChild>
                                <a href="https://twitter.com/suinergy" target="_blank" rel="noopener noreferrer">
                                    <Twitter className="w-5 h-5" />
                                    <span className="sr-only">Twitter</span>
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-white" asChild>
                                <a href="https://github.com/DanielEmmanuel1/Suinergy" target="_blank" rel="noopener noreferrer">
                                    <Github className="w-5 h-5" />
                                    <span className="sr-only">GitHub</span>
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-white" asChild>
                                <a href="https://discord.gg/suinergy" target="_blank" rel="noopener noreferrer">
                                    <Disc className="w-5 h-5" />
                                    <span className="sr-only">Discord</span>
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-white">Explore</h3>
                        <ul className="space-y-4">
                            <li><Link href="#features" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Features</Link></li>
                            <li><Link href="#ecosystem" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Ecosystem</Link></li>
                            <li><Link href="#loyalty" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Loyalty</Link></li>
                            <li><Link href="#developers" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Developers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-white">Resources</h3>
                        <ul className="space-y-4">
                            <li><a href="https://docs.suinergy.app" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Whitepaper</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Brand Assets</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-white">Legal</h3>
                        <ul className="space-y-4">
                            <li><Link href="/privacy" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="text-gray-400 hover:text-transparent hover:bg-clip-text hover:bg-brand-gradient transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Suinergy Protocol. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-gray-400">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
