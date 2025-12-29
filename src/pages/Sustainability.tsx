import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Recycle, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { WhyTrusser } from '../components/Home/WhyTrusser';
import { ImpactDashboard } from '../components/Home/ImpactDashboard';
import { Seo } from '../seo/Seo';

export const Sustainability = () => {
  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title="Sustainability | Trussers"
        description="Learn how Trussers turns recycled bottles into premium stationery & lifestyle products, and why sustainable design matters."
        canonicalPath="/sustainability"
        ogType="website"
      />
      <Navbar />

      <main className="pt-32">
        <section className="mx-auto max-w-[1920px] px-6 lg:px-12 pb-16">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">
              Sustainability
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1A3C27] leading-tight">
              Built for a lower-waste lifestyle
            </h1>
            <p className="mt-6 text-lg text-[#5C5C5C] leading-relaxed">
              Sustainability is more than materials—it’s design, durability, and mindful production. We craft products
              that you’ll use every day, so “eco-friendly” becomes a habit, not a compromise.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#1A3C27] text-white flex items-center justify-center mb-5">
                  <Recycle className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Recycled inputs</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  We use recycled bottles as a starting point and transform them into durable, premium material.
                </p>
              </div>
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#C1A17C] text-[#1A3C27] flex items-center justify-center mb-5">
                  <Leaf className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Longevity-first</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  Fewer replacements means less waste. We focus on practical design you can rely on.
                </p>
              </div>
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#2D5F3F] text-white flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Thoughtful sourcing</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  We continually improve materials and processes to reduce waste and support responsible production.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#1A3C27] px-6 py-3 text-white hover:bg-[#2D5F3F] transition-colors"
              >
                Shop sustainable goods <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-full border border-[#1A3C27]/20 bg-white/60 px-6 py-3 text-[#1A3C27] hover:bg-white transition-colors"
              >
                Read our journal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <WhyTrusser />
        <ImpactDashboard />
      </main>

      <Footer />
    </div>
  );
};

