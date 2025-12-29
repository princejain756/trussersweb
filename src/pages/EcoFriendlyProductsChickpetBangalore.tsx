import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, ArrowRight, Leaf } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { BUSINESS } from '../seo/siteConfig';

const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=No%205%2C%2012th%20Cross%20Road%2C%20Cubbonpet%2C%20Bengaluru%20560002';

export const EcoFriendlyProductsChickpetBangalore = () => {
  const title = 'Eco Friendly Products in Chickpet, Bangalore | Trusser';
  const description =
    'Searching for eco friendly products in Chickpet, Bangalore? Shop sustainable stationery & lifestyle essentials crafted from recycled bottles. Made in Bengaluru (near Chickpet).';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I find eco friendly products in Chickpet, Bangalore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trusser offers eco-friendly stationery and lifestyle essentials crafted from recycled bottles. Browse the collection online and contact us for help with orders in the Chickpet area.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are you located near Chickpet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We are based in the Cubbonpet area of Bengaluru (560002), close to Chickpet. Reach out for product recommendations and gifting support.`,
        },
      },
    ],
  } as const;

  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title={title}
        description={description}
        canonicalPath="/eco-friendly-products-chickpet-bangalore"
        ogType="website"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 pt-32 pb-20">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">
            Chickpet • Bengaluru 560002
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A3C27] leading-tight">
            Eco Friendly Products in Chickpet, Bangalore
          </h1>
          <p className="mt-6 text-lg text-[#5C5C5C] leading-relaxed">
            If you’re in Chickpet and searching for eco-friendly products, Trusser brings premium sustainable goods made
            from recycled bottles—ideal for daily carry, gifting, and office essentials.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#1A3C27] px-6 py-3 text-white hover:bg-[#2D5F3F] transition-colors"
            >
              Shop now <ShoppingBag className="w-4 h-4" />
            </Link>
            <Link
              to="/eco-friendly-products-bangalore"
              className="inline-flex items-center gap-2 rounded-full border border-[#1A3C27]/20 bg-white/60 px-6 py-3 text-[#1A3C27] hover:bg-white transition-colors"
            >
              Bangalore page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <section className="mt-16 rounded-3xl bg-white/70 border border-white/40 p-10">
          <h2 className="font-serif text-3xl text-[#1A3C27]">Why people choose Trusser</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C1A17C] text-[#1A3C27] flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <p className="text-[#5C5C5C] leading-relaxed">
                Crafted from recycled bottles for a lower-waste lifestyle—without compromising on quality.
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1A3C27] text-white flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-[#5C5C5C] leading-relaxed">
                Easy online shopping with a curated selection of sustainable essentials and gift options.
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2D5F3F] text-white flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-[#5C5C5C] leading-relaxed">
                Based in Bengaluru (Cubbonpet area), close to Chickpet—support is just a call away.
              </p>
            </div>
          </div>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C27] hover:text-[#2D5F3F] transition-colors"
          >
            View our area on Google Maps <ArrowRight className="w-4 h-4" />
          </a>
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
