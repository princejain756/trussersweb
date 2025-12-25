import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { Button } from '../UI/Button';
import TrusserLogo from '../../assets/TrusserLOGO.avif';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = ['Home', 'About Us', 'Shop', 'Corporate Gifting', 'Journal'];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'
                    }`}
            >
                <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                    <div
                        className={`relative flex items-center justify-between rounded-full transition-all duration-500 ${isScrolled
                            ? 'bg-white/70 backdrop-blur-xl shadow-lg border border-white/40 px-6 py-3'
                            : 'bg-transparent px-0 py-0'
                            }`}
                    >
                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-colors"
                            >
                                <Menu className="text-[#2D5F3F]" />
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0">
                            <Link to="/" className="block">
                                <img
                                    src={TrusserLogo}
                                    alt="Trussers"
                                    className="h-10 w-auto object-contain lg:h-12"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((item) => (
                                item === 'Shop' ? (
                                    <Link
                                        key={item}
                                        to="/shop"
                                        className="group relative px-5 py-2 text-sm font-medium text-[#2D5F3F]/80 transition-colors hover:text-[#2D5F3F]"
                                    >
                                        <span className="relative z-10">{item}</span>
                                        <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                    </Link>
                                ) : (
                                    <a
                                        key={item}
                                        href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                        className="group relative px-5 py-2 text-sm font-medium text-[#2D5F3F]/80 transition-colors hover:text-[#2D5F3F]"
                                    >
                                        <span className="relative z-10">{item}</span>
                                        <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                    </a>
                                )
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="hidden lg:flex items-center gap-2">
                                <button className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm">
                                    <Search size={20} className="text-[#2D5F3F] transition-transform group-hover:scale-110" />
                                </button>
                                <button className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm">
                                    <User size={20} className="text-[#2D5F3F] transition-transform group-hover:scale-110" />
                                </button>
                            </div>

                            <button className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5F3F] text-white shadow-lg transition-all hover:bg-[#1A3C27] hover:scale-105">
                                <ShoppingBag size={18} />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D45D48] text-[10px] font-bold text-white shadow-sm">
                                    2
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] flex flex-col bg-[#F4EFEC]/95 backdrop-blur-xl lg:hidden"
                    >
                        <div className="flex items-center justify-between p-6">
                            <span className="font-serif text-2xl font-bold text-[#2D5F3F]">Trussers.</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
                            >
                                <X size={24} className="text-[#2D5F3F]" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
                            {navLinks.map((item, i) => (
                                <motion.a
                                    key={item}
                                    href="#"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="font-serif text-4xl font-medium text-[#2D5F3F] transition-opacity hover:opacity-70"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 p-8">
                            <Button size="lg" className="w-full justify-center rounded-full bg-[#2D5F3F] py-6 text-lg">
                                Login / Register
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
