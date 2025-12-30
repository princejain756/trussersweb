
import { Suspense, lazy } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { HeroSection } from '../components/Hero/HeroSection';
import { WhyTrusser } from '../components/Home/WhyTrusser';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { LazySection } from '../components/Performance/LazySection';

const ProductShowcase = lazy(() =>
    import('../components/Products/ProductShowcase').then((mod) => ({ default: mod.ProductShowcase }))
);
const CorporateGifting = lazy(() =>
    import('../components/Home/CorporateGifting').then((mod) => ({ default: mod.CorporateGifting }))
);
const ImpactDashboard = lazy(() =>
    import('../components/Home/ImpactDashboard').then((mod) => ({ default: mod.ImpactDashboard }))
);
const InstagramFeed = lazy(() =>
    import('../components/Home/InstagramFeed').then((mod) => ({ default: mod.InstagramFeed }))
);

export const Home = () => {
    return (
        <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
            <Seo canonicalPath="/" />
            <Navbar />
            <main id="main-content" role="main" className="relative z-10 w-full overflow-hidden">
                <HeroSection />
                <WhyTrusser />
                <LazySection
                    minHeight={800}
                    placeholder={<div className="py-24 lg:py-32 bg-[#F4EFEC]" aria-hidden="true" />}
                >
                    <Suspense fallback={<div className="py-24 lg:py-32 bg-[#F4EFEC]" aria-hidden="true" />}>
                        <ProductShowcase />
                    </Suspense>
                </LazySection>

                <LazySection
                    minHeight={640}
                    placeholder={<div className="py-12 bg-[#F4EFEC]" aria-hidden="true" />}
                >
                    <Suspense fallback={<div className="py-12 bg-[#F4EFEC]" aria-hidden="true" />}>
                        <CorporateGifting />
                    </Suspense>
                </LazySection>

                <LazySection
                    minHeight={520}
                    placeholder={<div className="py-24 bg-[#F4EFEC]" aria-hidden="true" />}
                >
                    <Suspense fallback={<div className="py-24 bg-[#F4EFEC]" aria-hidden="true" />}>
                        <ImpactDashboard />
                    </Suspense>
                </LazySection>

                <LazySection
                    minHeight={900}
                    placeholder={<div className="py-16 md:py-24 bg-[#F4EFEC]" aria-hidden="true" />}
                >
                    <Suspense fallback={<div className="py-16 md:py-24 bg-[#F4EFEC]" aria-hidden="true" />}>
                        <InstagramFeed />
                    </Suspense>
                </LazySection>
            </main>
            <Footer />
        </div>
    );
};
