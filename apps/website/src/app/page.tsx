import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Ecosystem } from '@/components/sections/ecosystem';
import { Developers } from '@/components/sections/developers';
import { Loyalty } from '@/components/sections/loyalty';
import { Rewards } from '@/components/sections/rewards';
// import { FinalCTA } from '@/components/sections/final-cta';

export default function Home() {
    return (
        <div className="flex flex-col gap-0">
            <Hero />
            <Features />
            <HowItWorks />
            <Ecosystem />
            <Developers />
            <Loyalty />
            <Rewards />
            {/* <FinalCTA /> */}
        </div>
    );
}
