import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title="Privacy Policy | Trussers"
        description="Read the Trussers privacy policy."
        canonicalPath="/privacy-policy"
        ogType="website"
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <h1 className="font-serif text-5xl text-[#1A3C27]">Privacy Policy</h1>
        <p className="mt-6 text-[#5C5C5C] leading-relaxed">
          This Privacy Policy explains how Trussers collects, uses, and protects your information when you visit and use
          our website.
        </p>

        <section className="mt-10 space-y-6 text-[#5C5C5C] leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Information we collect</h2>
            <p>
              When you place an order or create an account, we may collect details such as your name, email address,
              phone number, shipping address, and order information.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">How we use information</h2>
            <p>
              We use your information to process orders, provide customer support, improve our products and services,
              and communicate important updates related to your purchase.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Cookies & analytics</h2>
            <p>
              We may use cookies and similar technologies to help the site function, understand usage, and improve
              performance. You can control cookies through your browser settings.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Contact</h2>
            <p>
              If you have any questions about this policy, contact us at{' '}
              <a className="text-[#1A3C27] font-semibold hover:underline" href="mailto:info@trusser.in">
                info@trusser.in
              </a>
              .
            </p>
          </div>
          <p className="text-sm text-[#5C5C5C]/80">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

