import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#F4EFEC] text-[#1A1A1A] antialiased selection:bg-[#C1A17C] selection:text-white">
      <Seo
        title="Terms of Service | Trusser"
        description="Read the Trusser terms of service."
        canonicalPath="/terms-of-service"
        ogType="website"
      />
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <h1 className="font-serif text-5xl text-[#1A3C27]">Terms of Service</h1>
        <p className="mt-6 text-[#5C5C5C] leading-relaxed">
          These Terms of Service govern your use of the Trusser website and purchases made through it.
        </p>

        <section className="mt-10 space-y-6 text-[#5C5C5C] leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Orders & payments</h2>
            <p>
              By placing an order, you agree that the information you provide is accurate and that you’re authorized to
              use the chosen payment method.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Shipping & delivery</h2>
            <p>
              Delivery timelines may vary based on location and product availability. If you need help with your order,
              please contact our support team.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Returns & support</h2>
            <p>
              If there is an issue with an item, contact us with your order details and we’ll assist as per our support
              process and applicable policies.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1A3C27] mb-2">Contact</h2>
            <p>
              For questions about these terms, email{' '}
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
