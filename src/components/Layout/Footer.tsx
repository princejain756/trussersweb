import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWebsiteContent } from '../../utils/websiteContent';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

export const Footer = () => {
    const content = getWebsiteContent();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setStatus('loading');
            const response = await fetch(`${apiBaseUrl}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'footer' }),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(result.message || 'Successfully subscribed!');
                setEmail('');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Failed to subscribe');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <footer className="bg-[#1A3C27] text-[#E8DFD4] overflow-hidden">
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12 pt-24 pb-12">

                {/* Top Section: CTA and Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div>
                        <h2 className="font-serif text-5xl md:text-7xl leading-none mb-8">
                            Join the <br />
                            <span className="text-[#C1A17C]">Movement.</span>
                        </h2>
                        <p className="text-xl text-[#E8DFD4]/70 max-w-md mb-8 leading-relaxed">
                            {content.footer.aboutText}
                        </p>

                        <form onSubmit={handleSubmit} className="flex max-w-md items-center border-b border-[#E8DFD4]/30 focus-within:border-[#C1A17C] transition-colors pb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 bg-transparent text-lg placeholder:text-[#E8DFD4]/30 focus:outline-none"
                                disabled={status === 'loading' || status === 'success'}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="text-[#C1A17C] hover:text-white transition-colors disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : status === 'success' ? (
                                    <Check size={24} className="text-green-400" />
                                ) : (
                                    <ArrowRight size={24} />
                                )}
                            </button>
                        </form>
                        {message && (
                            <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 lg:pl-12">
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Shop</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                <li><Link to="/shop" className="hover:text-[#C1A17C] transition-colors">Shop All</Link></li>
                                <li><Link to="/shop" className="hover:text-[#C1A17C] transition-colors">New Arrivals</Link></li>
                                <li><Link to="/corporate-gifting" className="hover:text-[#C1A17C] transition-colors">Corporate Gifting</Link></li>
                                <li><Link to="/journal" className="hover:text-[#C1A17C] transition-colors">Journal</Link></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Company</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                <li><Link to="/about" className="hover:text-[#C1A17C] transition-colors">About</Link></li>
                                <li><Link to="/sustainability" className="hover:text-[#C1A17C] transition-colors">Sustainability</Link></li>
                                <li><Link to="/contact" className="hover:text-[#C1A17C] transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Locations</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                <li><Link to="/eco-friendly-products-bangalore" className="hover:text-[#C1A17C] transition-colors">Bangalore</Link></li>
                                <li><Link to="/eco-friendly-products-chickpet-bangalore" className="hover:text-[#C1A17C] transition-colors">Chickpet</Link></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Social</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                {(content.socialLinks || []).map((link) => (
                                    <li key={link.id}>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[#C1A17C] transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#E8DFD4]/10 gap-6">
                    <p className="text-sm text-[#E8DFD4]/40">
                        &copy; 2025 Trusser. <a href="https://maninfini.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C1A17C] transition-colors">Made By Maninfini Automation</a>.
                    </p>
                    <div className="flex gap-8 text-sm text-[#E8DFD4]/40">
                        <Link to="/privacy-policy" className="hover:text-[#E8DFD4] transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-[#E8DFD4] transition-colors">Terms of Service</Link>
                    </div>
                </div>

                {/* Massive Brand Name for Aesthetic */}
                <div className="w-full text-center mt-20 opacity-10 select-none pointer-events-none">
                    <span className="font-serif text-[12vw] sm:text-[15vw] leading-none tracking-tighter text-[#E8DFD4]">
                        TRUSSER
                    </span>
                </div>
            </div>
        </footer>
    );
};
