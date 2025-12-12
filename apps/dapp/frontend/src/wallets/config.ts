import { http, createConfig } from 'wagmi'
import { base, avalanche, lisk } from 'wagmi/chains'

export const wagmiConfig = createConfig({
    chains: [base, avalanche, lisk],
    transports: {
        [base.id]: http(),
        [avalanche.id]: http(),
        [lisk.id]: http(),
    },
})
