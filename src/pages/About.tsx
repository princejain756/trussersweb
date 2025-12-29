import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Leaf, Recycle } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { WhyTrusser } from '../components/Home/WhyTrusser';
import { ImpactDashboard } from '../components/Home/ImpactDashboard';
import { Seo } from '../seo/Seo';

export const About = () => {
  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title="About Trussers | Sustainable Eco-Friendly Products"
        description="Trussers creates premium eco-friendly stationery & lifestyle products crafted from recycled bottles. Made in Bengaluru, India."
        canonicalPath="/about"
        ogType="website"
      />
      <Navbar />

      <main className="pt-32">
        <section className="mx-auto max-w-[1920px] px-6 lg:px-12 pb-16">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">Our Story</p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1A3C27] leading-tight">
              Turning Waste Into Purpose
            </h1>
            <p className="mt-6 text-lg text-[#5C5C5C] leading-relaxed">
              Trussers crafts premium stationery and lifestyle essentials from recycled bottles. Our goal is simple: make
              sustainable choices feel effortless—beautiful to use, easy to gift, and built to last.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#1A3C27] text-white flex items-center justify-center mb-5">
                  <Recycle className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Upcycled materials</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  We transform waste into durable fabric—then into everyday products that reduce landfill impact.
                </p>
              </div>
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#C1A17C] text-[#1A3C27] flex items-center justify-center mb-5">
                  <Leaf className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Designed to last</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  Sustainability is longevity. Our designs focus on quality, utility, and timeless aesthetics.
                </p>
              </div>
              <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#2D5F3F] text-white flex items-center justify-center mb-5">
                  <Gift className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Gift-ready</h2>
                <p className="text-[#5C5C5C] leading-relaxed">
                  From individual gifts to corporate orders, we curate sustainable gifting experiences.
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
                to="/corporate-gifting"
                className="inline-flex items-center gap-2 rounded-full border border-[#1A3C27]/20 bg-white/60 px-6 py-3 text-[#1A3C27] hover:bg-white transition-colors"
              >
                Explore corporate gifting <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Factory Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/aboutus/factory.avif"
                    alt="Trusser Factory - 20,000 Sq Ft Manufacturing Facility in Tenkasi"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Floating stats card */}
                <div className="absolute -bottom-6 -right-6 bg-[#1A3C27] rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-serif font-bold text-[#C1A17C]">20,000</div>
                  <div className="text-sm text-white/80">Sq Ft Factory</div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">Our Manufacturing</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#1A3C27] leading-tight mb-6">
                  In the Heart of Tenkasi
                </h2>
                <p className="text-lg text-[#5C5C5C] leading-relaxed mb-6">
                  Our parent company, <strong className="text-[#1A3C27]">Nauti Crew Eco Products Pvt Ltd</strong>,
                  features a 20,000 sq ft factory in Tenkasi, dedicated to producing high-quality
                  eco-friendly products.
                </p>
                <p className="text-lg text-[#5C5C5C] leading-relaxed mb-8">
                  Our sustainable manufacturing processes reflect our commitment to innovation
                  and environmental care. Every product is crafted with precision and purpose.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A3C27]/10 rounded-full text-[#1A3C27] text-sm font-medium">
                    <Recycle className="w-4 h-4" /> GRS Certified
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#C1A17C]/20 rounded-full text-[#1A3C27] text-sm font-medium">
                    <Leaf className="w-4 h-4" /> Made in India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Responsibility Section */}
        <section className="py-20 bg-[#F4EFEC]">
          <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Content */}
              <div>
                <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">Social Responsibility</p>
                <h2 className="font-serif text-4xl md:text-5xl text-[#1A3C27] leading-tight mb-6">
                  Empowering Communities
                </h2>
                <p className="text-lg text-[#5C5C5C] leading-relaxed mb-6">
                  In partnership with <strong className="text-[#1A3C27]">AMAR SEVA SANGAM</strong>,
                  we strive to uplift differently-abled individuals and empower women in the workforce.
                </p>
                <p className="text-lg text-[#5C5C5C] leading-relaxed mb-8">
                  With over <strong className="text-[#C1A17C]">60% of our staff being women</strong> and
                  including those with disabilities, we believe in the philosophy that by doing good,
                  we can achieve great returns for our community and ourselves.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-serif font-bold text-[#1A3C27]">60%+</div>
                    <div className="text-sm text-[#5C5C5C]">Women in workforce</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-serif font-bold text-[#C1A17C]">50,000+</div>
                    <div className="text-sm text-[#5C5C5C]">Bottles recycled monthly</div>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/aboutus/socialresponsibility.avif"
                    alt="Social Responsibility - Empowering Women and Differently-abled Individuals"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -left-4 bg-[#C1A17C] rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-xl">
                  <Gift className="w-8 h-8 text-white mb-1" />
                  <span className="text-[10px] text-white font-semibold">IMPACT</span>
                </div>
              </div>
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

