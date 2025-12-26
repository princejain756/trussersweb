import { ArrowRight } from 'lucide-react';
import { getWebsiteContent } from '../../utils/websiteContent';

export const Footer = () => {
    const content = getWebsiteContent();

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

                        <form className="flex max-w-md items-center border-b border-[#E8DFD4]/30 focus-within:border-[#C1A17C] transition-colors pb-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 bg-transparent text-lg placeholder:text-[#E8DFD4]/30 focus:outline-none"
                            />
                            <button className="text-[#C1A17C] hover:text-white transition-colors">
                                <ArrowRight size={24} />
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:pl-12">
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Shop</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">New Arrivals</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Best Sellers</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Accessories</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Stationery</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Gift Cards</a></li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-serif text-xl text-white">Company</h4>
                            <ul className="flex flex-col gap-4 text-[#E8DFD4]/60">
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Our Story</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Sustainability</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Impact Report</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-[#C1A17C] transition-colors">Contact</a></li>
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
                        &copy; 2024 Trussers Inc. Made with <span className="text-[#C1A17C]">♥</span> in India.
                    </p>
                    <div className="flex gap-8 text-sm text-[#E8DFD4]/40">
                        <a href="#" className="hover:text-[#E8DFD4] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#E8DFD4] transition-colors">Terms of Service</a>
                    </div>
                </div>

                {/* Massive Brand Name for Aesthetic */}
                <div className="w-full text-center mt-20 opacity-10 select-none pointer-events-none">
                    <span className="font-serif text-[12vw] sm:text-[15vw] leading-none tracking-tighter text-[#E8DFD4]">
                        TRUSSERS
                    </span>
                </div>
            </div>
        </footer>
    );
};
