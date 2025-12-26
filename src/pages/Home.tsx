
import { Navbar } from '../components/Layout/Navbar';
import { HeroSection } from '../components/Hero/HeroSection';
import { WhyTrusser } from '../components/Home/WhyTrusser';
import { ShopByMood } from '../components/Home/ShopByMood';
import { ProductShowcase } from '../components/Products/ProductShowcase';
import { CorporateGifting } from '../components/Home/CorporateGifting';
import { ImpactDashboard } from '../components/Home/ImpactDashboard';
import { InstagramFeed } from '../components/Home/InstagramFeed';
import { Footer } from '../components/Layout/Footer';

export const Home = () => {
    return (
        <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
            <Navbar />
            <main className="relative z-10 w-full overflow-hidden">
                <HeroSection />
                <WhyTrusser />
                <ShopByMood />
                <ProductShowcase />
                <CorporateGifting />
                <ImpactDashboard />
                <InstagramFeed />
            </main>
            <Footer />
        </div>
    );
};
