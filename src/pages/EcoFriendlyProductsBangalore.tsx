import { Link } from 'react-router-dom';
import { MapPin, Leaf, Package, Gift, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { BUSINESS } from '../seo/siteConfig';

const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=No%205%2C%2012th%20Cross%20Road%2C%20Cubbonpet%2C%20Bengaluru%20560002';

export const EcoFriendlyProductsBangalore = () => {
  const title = 'Eco Friendly Products in Bangalore | Trusser';
  const description =
    'Shop eco-friendly products in Bangalore—premium stationery & lifestyle essentials crafted from recycled bottles. Sustainable gifts and corporate gifting, made in Bengaluru.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What eco-friendly products can I buy from Trusser in Bangalore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trusser makes sustainable stationery and lifestyle essentials crafted from recycled bottles—designed for everyday use and gifting.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer sustainable corporate gifting in Bangalore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We curate eco-friendly corporate and event gifting and can support orders for teams and occasions in Bengaluru (subject to availability and timelines).',
        },
      },
      {
        '@type': 'Question',
        name: 'Where are you located in Bengaluru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We are based in ${BUSINESS.address.addressLocality}, ${BUSINESS.address.addressRegion} ${BUSINESS.address.postalCode} (Cubbonpet area). Contact us for help with orders and gifting.`,
        },
      },
    ],
  } as const;

  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title={title}
        description={description}
        canonicalPath="/eco-friendly-products-bangalore"
        ogType="website"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 pt-32 pb-20">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">
            Bengaluru • Sustainable Lifestyle
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A3C27] leading-tight">
            Eco Friendly Products in Bangalore
          </h1>
          <p className="mt-6 text-lg text-[#5C5C5C] leading-relaxed">
            Trusser crafts premium stationery and lifestyle goods from recycled bottles—built for everyday use, gifting,
            and corporate orders. If you’re searching for eco-friendly products in Bangalore, start here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#1A3C27] px-6 py-3 text-white hover:bg-[#2D5F3F] transition-colors"
            >
              Shop eco-friendly products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/corporate-gifting"
              className="inline-flex items-center gap-2 rounded-full border border-[#1A3C27]/20 bg-white/60 px-6 py-3 text-[#1A3C27] hover:bg-white transition-colors"
            >
              Corporate gifting in Bangalore <Gift className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#1A3C27] text-white flex items-center justify-center mb-5">
              <Leaf className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Made from recycled bottles</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              Thoughtfully designed essentials that help reduce waste while staying premium, durable, and gift-ready.
            </p>
          </div>

          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#C1A17C] text-white flex items-center justify-center mb-5">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Everyday + gifting</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              From daily carry to premium gifting, explore sustainable products that feel special without the waste.
            </p>
          </div>

          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5F3F] text-white flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Based in Bengaluru</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              We’re based in the Cubbonpet area (560002). For local help with orders or gifting, reach out anytime.
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C27] hover:text-[#2D5F3F] transition-colors"
            >
              View on Google Maps <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-gradient-to-br from-white/70 to-white/40 border border-white/40 p-10">
          <h2 className="font-serif text-3xl text-[#1A3C27]">Looking for eco friendly products in Chickpet?</h2>
          <p className="mt-4 text-[#5C5C5C] leading-relaxed max-w-3xl">
            Chickpet is close to the Cubbonpet area. If you want a curated list of eco-friendly products for Chickpet,
            see our dedicated page and shop the collection online.
          </p>
          <div className="mt-6">
            <Link
              to="/eco-friendly-products-chickpet-bangalore"
              className="inline-flex items-center gap-2 rounded-full bg-[#C1A17C] px-6 py-3 text-[#1A3C27] hover:bg-[#D4B995] transition-colors"
            >
              Eco Friendly Products in Chickpet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-white/70 border border-white/40 p-10">
          <h2 className="font-serif text-3xl text-[#1A3C27]">Contact</h2>
          <p className="mt-4 text-[#5C5C5C] leading-relaxed">
            Phone:{' '}
            <a
              className="text-[#1A3C27] font-semibold hover:underline"
              href={`tel:${BUSINESS.phone.replace(/\s+/g, '')}`}
            >
              {BUSINESS.phone}
            </a>
            {' • '}
            Email:{' '}
            <a className="text-[#1A3C27] font-semibold hover:underline" href={`mailto:${BUSINESS.email}`}>
              {BUSINESS.email}
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};
