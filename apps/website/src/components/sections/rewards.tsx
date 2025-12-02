'use client';

import { motion } from 'framer-motion';
import { Coins, Users, Gift, Zap } from 'lucide-react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { TabbedContainer } from '@/components/ui/tabbed-container';

const rewards = [
    {
        title: 'Meet $SYN',
        description: 'The governance and utility token of Suinergy. Stake $SYN to boost your yields and vote on protocol upgrades.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800"></div>,
        icon: <Coins className="h-4 w-4 text-white" />,
        className: "md:col-span-1 bg-black text-white border-white/10 shadow-xl shadow-primary/20 hover:border-transparent",
        titleClassName: "text-white",
        descriptionClassName: "text-neutral-400",
        iconClassName: "text-white",
    },
    {
        title: 'Liquidity Mining',
        description: 'Earn $SYN rewards on top of your standard DeFi yields by depositing into incentivized strategy pools.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#b92b27]/20 to-[#1565c0]/20"></div>,
        icon: <Zap className="h-4 w-4 text-transparent bg-clip-text bg-brand-gradient" />,
        className: "md:col-span-2",
    },
    {
        title: 'Referral Program',
        description: 'Invite friends to Suinergy and earn 10% of their protocol fees forever.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#b92b27]/20 to-[#1565c0]/20"></div>,
        icon: <Users className="h-4 w-4 text-transparent bg-clip-text bg-brand-gradient" />,
        className: "md:col-span-1",
    },
    {
        title: 'Community Airdrops',
        description: 'Active users and early adopters are eligible for exclusive $SYN airdrops and retro-active rewards.',
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-100 to-purple-50"></div>,
        icon: <Gift className="h-4 w-4 text-purple-500" />,
        className: "md:col-span-2",
    },
];

export function Rewards() {
    return (
        <section id="rewards" className="py-24 bg-[#f4f3f0]">
            <div className="container mx-auto px-4 md:px-6">
                <TabbedContainer
                    label="Incentives"
                    className="w-full"
                    tabClassName="bg-white"
                    contentClassName="bg-white"
                >
                    <div className="text-left mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">
                            Earn $SYN Rewards
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Maximize your earnings by participating in the Suinergy ecosystem. From liquidity mining to community rewards, there are multiple ways to grow your stack.
                        </p>
                    </div>

                    <BentoGrid className="max-w-7xl mx-auto">
                        {rewards.map((item, i) => (
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
