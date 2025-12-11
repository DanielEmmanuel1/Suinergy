import type { Metadata } from 'next';
import { Bungee, Outfit } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/providers/smooth-scroll';
import { Navbar } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';

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
    title: 'Suinergy | High-Yield Sui DeFi Strategies',
    description: 'Automated DeFi yield strategies on the Sui Network.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${outfit.variable} ${bungee.variable}`}>
            <body className="font-sans antialiased bg-[#f4f3f0] text-black">
                <SmoothScroll>
                    <Navbar />
                    <main className="min-h-screen pt-20">
                        {children}
                    </main>
                    <Footer />
                </SmoothScroll>
            </body>
        </html>
    );
}
