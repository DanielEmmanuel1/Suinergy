'use client';

import { motion } from 'framer-motion';
import { Terminal, Code2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabbedContainer } from '@/components/ui/tabbed-container';

const codeSnippet = `// Integrate Suinergy SDK
import { SuinergyClient } from '@suinergy/sdk';

const client = new SuinergyClient({
  network: 'mainnet'
});

// Deposit into optimal strategy
await client.deposit({
  amount: '1000',
  token: 'SUI',
  strategy: 'auto-compound'
});`;

export function Developers() {
    return (
        <section id="developers" className="py-24 bg-black text-white overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer
                    label="Developers"
                    className="w-full"
                    tabClassName="bg-[#111] border-white/10"
                    contentClassName="bg-[#111] border-white/10"
                >
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6 border border-white/20"
                            >
                                <Terminal className="w-4 h-4" />
                                <span>Built for Builders</span>
                            </motion.div>

                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white font-heading">
                                Integrate Yields into Your dApp
                            </h2>

                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                Leverage our robust SDK and smart contracts to build custom yield strategies, dashboards, or entirely new DeFi products on top of Suinergy.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Button size="lg" className="bg-brand-gradient text-white hover:opacity-90 font-bold" asChild>
                                    <a href="https://docs.suinergy.app" target="_blank">
                                        Read Documentation
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white font-bold" asChild>
                                    <a href="https://github.com/DanielEmmanuel1/Suinergy" target="_blank">
                                        View on GitHub
                                    </a>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                                <div className="flex items-start gap-3">
                                    <Code2 className="w-6 h-6 text-transparent bg-clip-text bg-brand-gradient mt-1" />
                                    <div>
                                        <h3 className="font-bold mb-1 text-white">TypeScript SDK</h3>
                                        <p className="text-sm text-gray-500">Full type safety and easy integration</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileCode className="w-6 h-6 text-transparent bg-clip-text bg-brand-gradient mt-1" />
                                    <div>
                                        <h3 className="font-bold mb-1 text-white">Move Contracts</h3>
                                        <p className="text-sm text-gray-500">Audited, open-source modules</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-2 text-xs text-gray-500 font-mono">example.ts</span>
                                </div>
                                <div className="p-6 overflow-x-auto">
                                    <pre className="font-mono text-sm leading-relaxed">
                                        <code className="language-typescript text-gray-300">
                                            {codeSnippet.split('\n').map((line, i) => (
                                                <div key={i} className="table-row">
                                                    <span className="table-cell text-gray-600 select-none pr-4 text-right w-8">{i + 1}</span>
                                                    <span className="table-cell" dangerouslySetInnerHTML={{
                                                        __html: line
                                                            .replace('//', '<span class="text-green-600">//')
                                                            .replace('import', '<span class="text-purple-400">import</span>')
                                                            .replace('from', '<span class="text-purple-400">from</span>')
                                                            .replace('const', '<span class="text-[#1565c0]">const</span>')
                                                            .replace('await', '<span class="text-purple-400">await</span>')
                                                            .replace('new', '<span class="text-[#1565c0]">new</span>')
                                                    }} />
                                                </div>
                                            ))}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabbedContainer>
            </div>
        </section>
    );
}
