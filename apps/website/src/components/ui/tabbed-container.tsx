'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabbedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    action?: React.ReactNode;
    tabClassName?: string;
    contentClassName?: string;
}

export function TabbedContainer({
    label,
    action,
    children,
    className,
    tabClassName,
    contentClassName,
    ...props
}: TabbedContainerProps) {
    return (
        <div className={cn('relative flex flex-col w-full', className)} {...props}>
            {/* Tab Header */}
            <div className="flex items-end relative z-10 -mb-[1px] ml-px">
                <div className={cn("bg-[#f4f3f0] px-6 py-2 rounded-t-xl border-t border-l border-r border-black/10", tabClassName)}>
                    <span className={cn("text-xs font-bold tracking-wider uppercase font-heading", 
                        tabClassName?.includes('bg-[#111]') ? "text-white" : "text-black/60"
                    )}>
                        {label}
                    </span>
                </div>
            </div>

            {/* Main Content Container */}
            <div className={cn("relative z-0 bg-[#f4f3f0] rounded-b-xl rounded-tr-xl border border-black/10 p-8 md:p-12 overflow-hidden shadow-sm", contentClassName)}>
                {action && (
                    <div className="absolute top-6 right-6 z-20">
                        {action}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
