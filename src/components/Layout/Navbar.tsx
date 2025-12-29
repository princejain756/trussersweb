import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
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

    const navLinks = ['Home', 'About Us', 'Shop', 'Corporate Gifting', 'Journal'];
    const MotionLink = motion(Link);

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
                                    alt="Trusser"
                                    className="h-10 w-auto object-contain lg:h-12"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((item) => {
                                // Pages that need React Router Links
                                const routeMap: Record<string, string> = {
                                    'About Us': '/about',
                                    'Shop': '/shop',
                                    'Corporate Gifting': '/corporate-gifting',
                                    'Journal': '/journal',
                                };

                                if (routeMap[item]) {
                                    return (
                                        <Link
                                            key={item}
                                            to={routeMap[item]}
                                            className="group relative px-5 py-2 text-sm font-medium text-[#2D5F3F]/80 transition-colors hover:text-[#2D5F3F]"
                                        >
                                            <span className="relative z-10">{item}</span>
                                            <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                        </Link>
                                    );
                                }

                                return (
                                    <a
                                        key={item}
                                        href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                        className="group relative px-5 py-2 text-sm font-medium text-[#2D5F3F]/80 transition-colors hover:text-[#2D5F3F]"
                                    >
                                        <span className="relative z-10">{item}</span>
                                        <span className="absolute inset-0 z-0 scale-75 rounded-full bg-white/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/50 group-hover:opacity-100 group-hover:backdrop-blur-sm" />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={handleSearchClick}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm"
                                >
                                    <Search size={20} className="text-[#2D5F3F] transition-transform group-hover:scale-110" />
                                </button>
                                <Link
                                    to={account ? '/account' : '/account/login'}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm"
                                    aria-label={account ? 'Account' : 'Sign in'}
                                >
                                    <User size={20} className="text-[#2D5F3F] transition-transform group-hover:scale-110" />
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
                        className="fixed inset-0 z-[60] flex flex-col bg-[#F4EFEC]/95 backdrop-blur-xl lg:hidden"
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
                            >
                                <X size={24} className="text-[#2D5F3F]" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
                            {navLinks.map((item, i) => {
                                const sharedProps = {
                                    initial: { y: 20, opacity: 0 },
                                    animate: { y: 0, opacity: 1 },
                                    transition: { delay: i * 0.1 },
                                    className:
                                        'font-serif text-4xl font-medium text-[#2D5F3F] transition-opacity hover:opacity-70',
                                    onClick: () => setIsMobileMenuOpen(false),
                                };

                                // Pages that need React Router Links
                                const routeMap: Record<string, string> = {
                                    'About Us': '/about',
                                    'Shop': '/shop',
                                    'Corporate Gifting': '/corporate-gifting',
                                    'Journal': '/journal',
                                };

                                if (routeMap[item]) {
                                    return (
                                        <MotionLink key={item} to={routeMap[item]} {...sharedProps}>
                                            {item}
                                        </MotionLink>
                                    );
                                }

                                return (
                                    <motion.a
                                        key={item}
                                        href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                        {...sharedProps}
                                    >
                                        {item}
                                    </motion.a>
                                );
                            })}
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
