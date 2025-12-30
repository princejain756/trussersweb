import { Mail, MapPin, Phone, ArrowRight, MessageCircle } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { BUSINESS } from '../seo/siteConfig';

const WHATSAPP_NUMBER = '919008138404';
const ADDRESS = 'No. 18/1, 12th Cross, Cubbonpet, Bangalore-560002, Karnataka';
const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=No%2018%2F1%2C%2012th%20Cross%2C%20Cubbonpet%2C%20Bangalore%20560002%2C%20Karnataka';
const embedMapUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0095067977566!2d77.57558077484063!3d12.968736387346685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15c0f13e0e5b%3A0x8c0e9e3e8e9e8e9e!2sCubbonpet%2C%20Bengaluru%2C%20Karnataka%20560002!5e0!3m2!1sen!2sin!4v1703950000000!5m2!1sen!2sin';

export const Contact = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I'm interested in Trusser eco-friendly products. Please help me with my order."
  )}`;

  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title="Contact Trusser | Eco-Friendly Products"
        description="Contact Trusser for sustainable stationery, lifestyle essentials, and corporate gifting. Based in Bengaluru, India."
        canonicalPath="/contact"
        ogType="website"
      />
      <Navbar />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 pt-32 pb-20">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-[#C1A17C] uppercase mb-3">Contact</p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A3C27] leading-tight">Let's talk</h1>
          <p className="mt-6 text-lg text-[#5C5C5C] leading-relaxed">
            Need product recommendations, gifting support, or help with an order? Reach out and we'll get back quickly.
          </p>
        </header>

        <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#1A3C27] text-white flex items-center justify-center mb-5">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Call</h2>
            <a
              href={`tel:${BUSINESS.phone.replace(/\s+/g, '')}`}
              className="text-[#1A3C27] font-semibold hover:underline"
            >
              {BUSINESS.phone}
            </a>
            <p className="mt-3 text-sm text-[#5C5C5C]">Mon–Sat • 10am–7pm (IST)</p>
          </div>

          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#C1A17C] text-[#1A3C27] flex items-center justify-center mb-5">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Email</h2>
            <a href={`mailto:${BUSINESS.email}`} className="text-[#1A3C27] font-semibold hover:underline">
              {BUSINESS.email}
            </a>
            <p className="mt-3 text-sm text-[#5C5C5C]">We reply within 1 business day.</p>
          </div>

          <div className="rounded-3xl bg-white/70 border border-white/40 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5F3F] text-white flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-3">Bengaluru</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              {ADDRESS}
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C27] hover:text-[#2D5F3F] transition-colors"
            >
              Open in Google Maps <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Embedded Google Map */}
        <section className="mt-14">
          <div className="rounded-3xl overflow-hidden border border-white/40 shadow-sm">
            <iframe
              src={embedMapUrl}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Trusser Location - Cubbonpet, Bangalore"
              className="w-full"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#5C5C5C]">
            <MapPin className="w-4 h-4 text-[#1A3C27]" />
            <span>{ADDRESS}</span>
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-gradient-to-br from-white/70 to-white/40 border border-white/40 p-10">
          <h2 className="font-serif text-3xl text-[#1A3C27]">Prefer WhatsApp?</h2>
          <p className="mt-4 text-[#5C5C5C] leading-relaxed max-w-2xl">
            Message us on WhatsApp for quick product recommendations, bulk enquiries, and corporate gifting support.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white hover:bg-[#1DA851] transition-colors"
          >
            WhatsApp us <MessageCircle className="w-4 h-4" />
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

