'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletConnectButtonProps {
    onSuccess: () => void;
}

export function WalletConnectButton({ onSuccess }: WalletConnectButtonProps) {
    const { connect, connectors, isPending } = useConnect();
    const [isConnecting, setIsConnecting] = useState(false);

    const handleClick = () => {
        setIsConnecting(true);
        const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');

        if (walletConnectConnector) {
            connect(
                { connector: walletConnectConnector },
                {
                    onSuccess: () => {
                        setIsConnecting(false);
                        onSuccess();
                    },
                    onError: () => {
                        setIsConnecting(false);
                    },
                }
            );
        } else {
            setIsConnecting(false);
        }
    };

    const isDisabled = isPending || isConnecting;

    return (
        <button
            type="button"
            className={cn(
                "h-auto flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-6",
                "hover:bg-[#f4f3f0] transition-all duration-200",
                "border-2 rounded-lg bg-white",
                "border-black/10 hover:border-[#1055C9] cursor-pointer",
                isConnecting && "border-[#1055C9]"
            )}
            onClick={handleClick}
            disabled={isDisabled}
        >
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 bg-[#f4f3f0] rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold text-[#1055C9]">
                W
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center text-black">
                WalletConnect
            </span>
            {isConnecting && (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#1055C9] mt-1" />
            )}
        </button>
    );
}
