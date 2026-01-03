import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Search,
    Menu,
    X,
    User,
    ChevronDown,
    Gift,
    Heart,
    Sparkles,
    Calendar,
    MapPin,
    Mail,
    MessageCircle,
    Clock,
    BookOpen,
    Leaf,
    Users,
    ArrowRight,
    Package,
    Star
} from 'lucide-react';
import { Button } from '../UI/Button';
import TrusserLogo from '../../assets/TrusserLOGO.avif';
import categoriesData from '../../data/categories.json';
import productsData from '../../data/products.json';
import { getCartCount, getCartItems, subscribeToCart } from '../../utils/cart';
import { fetchAccount, getCachedAccount, subscribeToAccount } from '../../utils/accountApi';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type SearchProduct = {
    id: string | number;
    name: string;
    image: string;
    category?: string;
};

type CategoryData = {
    name?: string;
    products?: Array<{
        name?: string;
        image?: string;
    }>;
};

// Featured categories for the mega menu
const featuredCategories = [
    { name: 'Gift Sets', slug: 'women-gift-sets', icon: Gift, image: '/products/categories/women-gift-sets/women-gift-sets-1.webp' },
    { name: 'Tote Bags', slug: 'tote-bags', icon: Package, image: '/products/carry-bag-korean.webp' },
    { name: 'Pouches', slug: 'pouches', icon: Sparkles, image: '/products/abstract-art-pouch.webp' },
    { name: 'Festive Bags', slug: 'festive-bags', icon: Star, image: '/products/gift-bag-cherry-blossom.webp' },
    { name: 'Kids Gifts', slug: 'kids-gifts-set', icon: Heart, image: '/products/unicorn-notebook.webp' },
    { name: 'Bottles', slug: 'bottles', icon: Package, image: '/products/colorful-stripes-bottle-holder.webp' },
];

// Corporate gifting categories
const corporateCategories = [
    { name: 'Wedding Gifts', description: 'Elegant celebration pieces', icon: Heart, link: '/corporate-gifting#wedding' },
    { name: 'Festive Hampers', description: 'Seasonal gift collections', icon: Calendar, link: '/corporate-gifting#festive' },
    { name: 'Custom Branding', description: 'Personalized solutions', icon: Sparkles, link: '/corporate-gifting#custom' },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
    const [catalogProducts, setCatalogProducts] = useState<SearchProduct[]>([]);
    const [categories, setCategories] = useState<Record<string, CategoryData>>(
        categoriesData as Record<string, CategoryData>
    );
    const [cartCount, setCartCount] = useState(() => getCartCount(getCartItems()));
    const [account, setAccount] = useState(() => getCachedAccount());
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setCartCount(getCartCount(getCartItems()));
        return subscribeToCart((items) => setCartCount(getCartCount(items)));
    }, []);

    useEffect(() => {
        fetchAccount().then((next) => setAccount(next));
        return subscribeToAccount((next) => setAccount(next));
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadCatalog = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/products`);
                if (!response.ok) {
                    throw new Error('Failed to load catalog');
                }
                const data = (await response.json()) as Array<{ id: number; name: string; image: string; category?: string }>;
                if (!isActive) {
                    return;
                }
                const normalized = data.map((product) => ({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    category: product.category ?? 'Catalog',
                }));
                setCatalogProducts(normalized);
            } catch {
                if (!isActive) {
                    return;
                }
                const fallback = (productsData as Array<{ id: number; name: string; image: string; category?: string }>).map(
                    (product) => ({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        category: product.category ?? 'Catalog',
                    })
                );
                setCatalogProducts(fallback);
            }
        };

        loadCatalog();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadCategories = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/categories`);
                if (!response.ok) {
                    throw new Error('Failed to load categories');
                }
                const data = (await response.json()) as Record<string, CategoryData>;
                if (!isActive) {
                    return;
                }
                setCategories(data ?? {});
            } catch {
                if (!isActive) {
                    return;
                }
                setCategories(categoriesData as Record<string, CategoryData>);
            }
        };

        loadCategories();

        return () => {
            isActive = false;
        };
    }, []);

    const categoryProducts = useMemo(() => {
        const results: SearchProduct[] = [];
        Object.entries(categories).forEach(([categoryKey, category]) => {
            const items = category.products ?? [];
            items.forEach((product, index) => {
                results.push({
                    id: `${categoryKey}-${index}`,
                    name: product.name ?? `${category.name ?? categoryKey} ${index + 1}`,
                    image: product.image ?? '/heroimage.webp',
                    category: category.name ?? categoryKey,
                });
            });
        });
        return results;
    }, [categories]);

    const allSearchProducts = useMemo(
        () => [...catalogProducts, ...categoryProducts],
        [catalogProducts, categoryProducts]
    );

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = allSearchProducts.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                (product.category ?? '').toLowerCase().includes(query)
            );
        });

        setSearchResults(results.slice(0, 8)); // Limit to 8 results
    }, [allSearchProducts, searchQuery]);

    const handleSearchClick = () => {
        setIsSearchOpen(true);
    };

    const handleProductClick = (product: SearchProduct) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(`/product/${product.id}`);
    };

    const toggleMobileDropdown = (item: string) => {
        setMobileDropdown(mobileDropdown === item ? null : item);
    };

    const MotionLink = motion(Link);

    // Shop Mega Dropdown Component
    const ShopDropdown = () => (
        <div className="nav-dropdown mega-dropdown">
            {/* Decorative brush strokes */}
            <div className="brush-stroke" style={{ top: '-10px', right: '20%', transform: 'rotate(-5deg)' }} />
            <div className="brush-stroke" style={{ bottom: '10px', left: '10%', transform: 'rotate(3deg)' }} />

            <div className="grid grid-cols-3 gap-6">
                {/* Categories Grid */}
                <div className="col-span-2">
                    <div className="dropdown-header">
                        <Sparkles size={14} />
                        Browse Collections
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {featuredCategories.map((cat, index) => (
                            <Link
                                key={cat.slug}
                                to={`/shop?category=${cat.slug}`}
                                className="nav-dropdown-item category-card group"
                                style={{ transitionDelay: `${index * 0.05}s` }}
                            >
                                <div className="overflow-hidden rounded-lg mb-2">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="category-image"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <cat.icon size={14} className="text-[#C1A17C]" />
                                    <span className="text-sm font-medium text-[#1A3C27] group-hover:text-[#2D5F3F]">
                                        {cat.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-l border-[#C1A17C]/20 pl-6">
                    <div className="dropdown-header">
                        <Star size={14} />
                        Quick Links
                    </div>
                    <div className="space-y-1">
                        <Link to="/shop" className="quick-link nav-dropdown-item">
                            <span className="quick-link-icon">
                                <Package size={18} />
                            </span>
                            <span>All Products</span>
                        </Link>
                        <Link to="/shop?sort=newest" className="quick-link nav-dropdown-item">
                            <span className="quick-link-icon">
                                <Sparkles size={18} />
                            </span>
                            <span>New Arrivals</span>
                        </Link>
                        <Link to="/shop?availability=in-stock" className="quick-link nav-dropdown-item">
                            <span className="quick-link-icon">
                                <Star size={18} />
                            </span>
                            <span>Best Sellers</span>
                        </Link>
                    </div>

                    <div className="dropdown-divider mt-4" />

                    <Link to="/shop" className="dropdown-cta mt-4 w-full justify-center">
                        Explore All
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );

    // Corporate Gifting Dropdown
    const CorporateDropdown = () => (
        <div className="nav-dropdown" style={{ width: '420px', padding: '1.5rem' }}>
            <div className="dropdown-header">
                <Gift size={14} />
                Gift Solutions
            </div>

            <div className="space-y-2">
                {corporateCategories.map((cat, index) => (
                    <Link
                        key={cat.name}
                        to={cat.link}
                        className="nav-dropdown-item quick-link"
                        style={{ transitionDelay: `${index * 0.05}s` }}
                    >
                        <span className="quick-link-icon">
                            <cat.icon size={18} />
                        </span>
                        <div>
                            <div className="font-medium">{cat.name}</div>
                            <div className="text-xs text-[#5C5C5C]">{cat.description}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="dropdown-divider" />

            <Link to="/corporate-gifting" className="dropdown-cta w-full justify-center">
                View All Options
                <ArrowRight size={16} />
            </Link>
        </div>
    );

    // About Dropdown
    const AboutDropdown = () => (
        <div className="nav-dropdown" style={{ width: '380px', padding: '1.5rem' }}>
            <div className="dropdown-header">
                <Heart size={14} />
                Our Story
            </div>

            <div className="space-y-1">
                <Link to="/about" className="nav-dropdown-item quick-link">
                    <span className="quick-link-icon">
                        <Users size={18} />
                    </span>
                    <div>
                        <div className="font-medium">About Trusser</div>
                        <div className="text-xs text-[#5C5C5C]">Our journey & mission</div>
                    </div>
                </Link>
                <Link to="/sustainability" className="nav-dropdown-item quick-link">
                    <span className="quick-link-icon">
                        <Leaf size={18} />
                    </span>
                    <div>
                        <div className="font-medium">Sustainability</div>
                        <div className="text-xs text-[#5C5C5C]">Eco-friendly practices</div>
                    </div>
                </Link>
                <Link to="/journal" className="nav-dropdown-item quick-link">
                    <span className="quick-link-icon">
                        <BookOpen size={18} />
                    </span>
                    <div>
                        <div className="font-medium">Journal</div>
                        <div className="text-xs text-[#5C5C5C]">Stories & inspiration</div>
                    </div>
                </Link>
            </div>
        </div>
    );

    // Contact Dropdown
    const ContactDropdown = () => (
        <div className="nav-dropdown" style={{ width: '340px', padding: '1.5rem' }}>
            <div className="dropdown-header">
                <MessageCircle size={14} />
                Get in Touch
            </div>

            <div className="space-y-1">
                <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-dropdown-item quick-link"
                >
                    <span className="quick-link-icon">
                        <MessageCircle size={18} />
                    </span>
                    <div>
                        <div className="font-medium">WhatsApp</div>
                        <div className="text-xs text-[#5C5C5C]">Quick chat with us</div>
                    </div>
                </a>
                <a
                    href="mailto:info@trusser.in"
                    className="nav-dropdown-item quick-link"
                >
                    <span className="quick-link-icon">
                        <Mail size={18} />
                    </span>
                    <div>
                        <div className="font-medium">Email Us</div>
                        <div className="text-xs text-[#5C5C5C]">info@trusser.in</div>
                    </div>
                </a>
                <a
                    href="https://maps.google.com/?q=Chickpet+Bangalore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-dropdown-item quick-link"
                >
                    <span className="quick-link-icon">
                        <MapPin size={18} />
                    </span>
                    <div>
                        <div className="font-medium">Visit Studio</div>
                        <div className="text-xs text-[#5C5C5C]">Chickpet, Bangalore</div>
                    </div>
                </a>
            </div>

            <div className="dropdown-divider" />

            <div className="flex items-center gap-2 text-sm text-[#5C5C5C] px-2">
                <Clock size={14} />
                <span>Mon - Sat: 10AM - 7PM</span>
            </div>

            <Link to="/contact" className="dropdown-cta w-full justify-center mt-4">
                Contact Page
                <ArrowRight size={16} />
            </Link>
        </div>
    );

    // Navigation items with dropdowns
    const navItems = [
        { name: 'Home', href: '/', hasDropdown: false },
        { name: 'Shop', to: '/shop', hasDropdown: true, dropdown: ShopDropdown },
        { name: 'Corporate Gifting', to: '/corporate-gifting', hasDropdown: true, dropdown: CorporateDropdown },
        { name: 'About Us', to: '/about', hasDropdown: true, dropdown: AboutDropdown },
        { name: 'Contact', to: '/contact', hasDropdown: true, dropdown: ContactDropdown },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'
                    }`}
                role="navigation"
                aria-label="Main navigation"
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
                                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors ${isScrolled ? 'bg-white/20 hover:bg-white/40' : 'bg-white/10 hover:bg-white/20'}`}
                                aria-label="Open menu"
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <Menu className={isScrolled ? 'text-[#2D5F3F]' : 'text-white'} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0">
                            <Link to="/" className="block">
                                <img
                                    src={TrusserLogo}
                                    alt="Trusser"
                                    className="h-10 w-auto object-contain lg:h-12"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation with Dropdowns */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => {
                                if (item.hasDropdown && item.dropdown) {
                                    const DropdownComponent = item.dropdown;
                                    return (
                                        <div key={item.name} className="nav-dropdown-trigger relative">
                                            <Link
                                                to={item.to!}
                                                className={`group relative px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-[#2D5F3F]/80 hover:text-[#2D5F3F]' : 'text-white/90 hover:text-white'}`}
                                            >
                                                <span className="relative z-10">{item.name}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className="transition-transform duration-200 group-hover:rotate-180"
                                                />
                                                <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                            </Link>
                                            <DropdownComponent />
                                        </div>
                                    );
                                }

                                if (item.href) {
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={`group relative px-5 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-[#2D5F3F]/80 hover:text-[#2D5F3F]' : 'text-white/90 hover:text-white'}`}
                                        >
                                            <span className="relative z-10">{item.name}</span>
                                            <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.to!}
                                        className={`group relative px-5 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-[#2D5F3F]/80 hover:text-[#2D5F3F]' : 'text-white/90 hover:text-white'}`}
                                    >
                                        <span className="relative z-10">{item.name}</span>
                                        <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={handleSearchClick}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm"
                                    aria-label="Search products"
                                >
                                    <Search size={20} className={`transition-transform group-hover:scale-110 ${isScrolled ? 'text-[#2D5F3F]' : 'text-white'}`} aria-hidden="true" />
                                </button>
                                <Link
                                    to={account ? '/account' : '/account/login'}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm"
                                    aria-label={account ? 'Account' : 'Sign in'}
                                >
                                    <User size={20} className={`transition-transform group-hover:scale-110 ${isScrolled ? 'text-[#2D5F3F]' : 'text-white'}`} />
                                </Link>
                            </div>

                            <Link
                                to="/cart"
                                aria-label="Cart"
                                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5F3F] text-white shadow-lg transition-all hover:bg-[#1A3C27] hover:scale-105"
                            >
                                <ShoppingBag size={18} />
                                {cartCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D45D48] text-[10px] font-bold text-white shadow-sm">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
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
                        className="fixed inset-0 z-[60] flex flex-col bg-[#F4EFEC]/95 backdrop-blur-xl lg:hidden overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                <img
                                    src={TrusserLogo}
                                    alt="Trusser"
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 hover:bg-black/10"
                                aria-label="Close menu"
                            >
                                <X size={24} className="text-[#2D5F3F]" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-start gap-4 p-6 pt-8">
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="w-full max-w-sm"
                                >
                                    {item.hasDropdown ? (
                                        <div>
                                            <button
                                                onClick={() => toggleMobileDropdown(item.name)}
                                                className="w-full flex items-center justify-between font-serif text-2xl font-medium text-[#2D5F3F] py-3 px-4 rounded-xl hover:bg-white/50 transition-colors"
                                            >
                                                {item.name}
                                                <ChevronDown
                                                    size={20}
                                                    className={`transition-transform duration-200 ${mobileDropdown === item.name ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            <AnimatePresence>
                                                {mobileDropdown === item.name && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="py-2 px-4 space-y-2">
                                                            {item.name === 'Shop' && (
                                                                <>
                                                                    {featuredCategories.map((cat) => (
                                                                        <Link
                                                                            key={cat.slug}
                                                                            to={`/shop?category=${cat.slug}`}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                        >
                                                                            <cat.icon size={18} className="text-[#C1A17C]" />
                                                                            <span>{cat.name}</span>
                                                                        </Link>
                                                                    ))}
                                                                    <Link
                                                                        to="/shop"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#2D5F3F] text-white"
                                                                    >
                                                                        <Package size={18} />
                                                                        <span>View All Products</span>
                                                                    </Link>
                                                                </>
                                                            )}
                                                            {item.name === 'Corporate Gifting' && (
                                                                <>
                                                                    {corporateCategories.map((cat) => (
                                                                        <Link
                                                                            key={cat.name}
                                                                            to={cat.link}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                        >
                                                                            <cat.icon size={18} className="text-[#C1A17C]" />
                                                                            <span>{cat.name}</span>
                                                                        </Link>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {item.name === 'About Us' && (
                                                                <>
                                                                    <Link
                                                                        to="/about"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <Users size={18} className="text-[#C1A17C]" />
                                                                        <span>About Trusser</span>
                                                                    </Link>
                                                                    <Link
                                                                        to="/sustainability"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <Leaf size={18} className="text-[#C1A17C]" />
                                                                        <span>Sustainability</span>
                                                                    </Link>
                                                                    <Link
                                                                        to="/journal"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <BookOpen size={18} className="text-[#C1A17C]" />
                                                                        <span>Journal</span>
                                                                    </Link>
                                                                </>
                                                            )}
                                                            {item.name === 'Contact' && (
                                                                <>
                                                                    <a
                                                                        href="https://wa.me/919876543210"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <MessageCircle size={18} className="text-[#C1A17C]" />
                                                                        <span>WhatsApp</span>
                                                                    </a>
                                                                    <a
                                                                        href="mailto:info@trusser.in"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <Mail size={18} className="text-[#C1A17C]" />
                                                                        <span>Email Us</span>
                                                                    </a>
                                                                    <a
                                                                        href="https://maps.google.com/?q=Chickpet+Bangalore"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/50 text-[#1A3C27] hover:bg-white/80 transition-colors"
                                                                    >
                                                                        <MapPin size={18} className="text-[#C1A17C]" />
                                                                        <span>Visit Studio</span>
                                                                    </a>
                                                                    <Link
                                                                        to="/contact"
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#2D5F3F] text-white"
                                                                    >
                                                                        <ArrowRight size={18} />
                                                                        <span>Contact Page</span>
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <MotionLink
                                            to={item.to || item.href || '/'}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block font-serif text-2xl font-medium text-[#2D5F3F] py-3 px-4 rounded-xl hover:bg-white/50 transition-colors text-center"
                                        >
                                            {item.name}
                                        </MotionLink>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 p-8">
                            {account ? (
                                <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                    <Button size="lg" className="w-full justify-center rounded-full bg-[#2D5F3F] py-6 text-lg">
                                        My Account
                                    </Button>
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/account/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                        <Button size="lg" className="w-full justify-center rounded-full bg-[#2D5F3F] py-6 text-lg">
                                            Sign in
                                        </Button>
                                    </Link>
                                    <Link to="/account/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full justify-center border-[#2D5F3F] text-[#2D5F3F] py-6 text-lg hover:bg-[#2D5F3F] hover:text-white"
                                        >
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-24"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl mx-4"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for products..."
                                            autoFocus
                                            className="w-full pl-12 pr-4 py-3 text-lg border-none outline-none bg-gray-50 rounded-xl focus:bg-gray-100 transition-colors"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Search Results */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {searchQuery === '' ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Search size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg">Start typing to search products...</p>
                                        </div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <p className="text-lg">No products found for "{searchQuery}"</p>
                                            <p className="text-sm mt-2">Try a different search term</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {searchResults.map((product, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleProductClick(product)}
                                                    className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                                                        <p className="text-sm text-gray-500">{product.category}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => {
                                                navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="text-sm text-[#2D5F3F] hover:underline"
                                        >
                                            View all results for "{searchQuery}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
