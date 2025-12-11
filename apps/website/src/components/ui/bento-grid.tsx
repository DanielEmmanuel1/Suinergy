import React from 'react';

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                'row-span-1 rounded-xl shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black bg-white border-2 border-gray-200 dark:border-white/[0.2] justify-between flex flex-col space-y-4 relative group/bento overflow-visible',
                className
            )}
            style={{
                position: 'relative',
            }}
        >
            {/* Gradient border overlay - only visible on hover */}
            <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: 'linear-gradient(to right, #b92b27, #1565c0)',
                    padding: '2px',
                    margin: '-2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />
            
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                    {description}
                </div>
            </div>
        </div>
    );
};

// Demo
export default function Demo() {
    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <BentoGrid>
                <BentoGridItem
                    title="Liquidity Mining"
                    description="Earn $SYN rewards on top of your standard DeFi yields by depositing into incentivized strategy pools."
                    header={<div className="h-32 bg-gradient-to-br from-pink-100 to-blue-100 rounded-lg"></div>}
                />
                <BentoGridItem
                    title="Referral Program"
                    description="Invite friends to Suinergy and earn 10% of their protocol fees forever."
                    header={<div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg"></div>}
                />
                <BentoGridItem
                    title="Staking Rewards"
                    description="Stake your tokens to earn rewards and boost your yields across the platform."
                    header={<div className="h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg"></div>}
                />
            </BentoGrid>
        </div>
    );
}