import type { Metadata } from 'next';
import { Bungee, Outfit } from 'next/font/google';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { Providers } from '@/providers/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RouteGuard } from '@/components/auth/route-guard';

const bungee = Bungee({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Suinergy dApp - Yield Aggregator',
    description: 'Maximize your yields on Sui with intelligent strategy allocation',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${outfit.variable} ${bungee.variable}`}>
            <body className="font-sans antialiased bg-[#f4f3f0] text-black">
                <Providers>
                    <TooltipProvider>
                        <RouteGuard>
                            {children}
                        </RouteGuard>
                    </TooltipProvider>
                </Providers>
            </body>
        </html>
    );
}
