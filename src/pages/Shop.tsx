import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { ProductCard } from '../components/UI/ProductCard';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import {
    Search,
    ArrowDown,
    Filter,
    ChevronDown,
    Grid3X3,
    LayoutList,
    SlidersHorizontal,
    X,
    Sparkles,
    Banknote
} from 'lucide-react';
import categoriesData from '../data/categories.json';
import productsData from '../data/products.json';
import { useSearchParams } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type SizeEntry = { size: string; price: string | number };

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

type ShopProduct = {
    id: string | number;
    name: string;
    image: string;
    category: string;
    categorySlug: string;
    price: string | number;
    tag?: string;
    sizes?: SizeEntry[];
    source?: 'catalog' | 'category';
};

type CategoryData = {
    name?: string;
    products?: Array<{
        name?: string;
        image?: string;
        price?: string | number;
        tag?: string;
        sizes?: SizeEntry[];
    }>;
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
];

type ApiCatalogProduct = {
    id: string | number;
    name: string;
    image: string;
    category?: string;
    price: string | number;
    tag?: string;
    sizes?: SizeEntry[];
};

const parseBasePrice = (value: unknown): number => {
    const numeric =
        typeof value === 'number'
            ? value
            : Number(String(value ?? '').replace(/[₹$,\s]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
};

const FloatingOrb = ({ delay = 0, size = 300, color = '#C1A17C' }: { delay?: number; size?: number; color?: string }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            filter: 'blur(60px)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
            x: [0, 50, -30, 0],
            y: [0, -30, 20, 0],
        }}
        transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
    />
);

const FilterSidebar = ({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    setPriceRange,
    minPrice,
    maxPrice,
    isOpen,
    onClose,
    isMobile
}: {
    categories: { slug: string; name: string; count: number }[];
    selectedCategory: string;
    onCategoryChange: (slug: string) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    minPrice: number;
    maxPrice: number;
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
}) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(['price']);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), priceRange[1] - 1);
        setPriceRange([val, priceRange[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), priceRange[0] + 1);
        setPriceRange([priceRange[0], val]);
    };

    const sidebarContent = (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-[#D4C5B5]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A3C27] to-[#2D5F3F] flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl text-[#1A3C27]">Filters</h2>
                            <p className="text-xs text-[#5C5C5C]">Refine your search</p>
                        </div>
                    </div>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[#E8DFD4] transition-colors"
                        >
                            <X className="w-5 h-5 text-[#1A3C27]" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Categories Section */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 overflow-hidden shadow-sm">
                    <button
                        onClick={() => toggleSection('categories')}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <span className="font-semibold text-[#1A3C27] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C1A17C]" />
                            Categories
                        </span>
                        <motion.div
                            animate={{ rotate: expandedSections.includes('categories') ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown className="w-5 h-5 text-[#5C5C5C]" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {expandedSections.includes('categories') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-1">
                                    {categories.map((cat, index) => (
                                        <motion.button
                                            key={cat.slug}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => {
                                                onCategoryChange(cat.slug);
                                                if (isMobile) onClose();
                                            }}
                                            className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${selectedCategory === cat.slug
                                                ? 'bg-gradient-to-r from-[#1A3C27] to-[#2D5F3F] text-white shadow-lg shadow-[#1A3C27]/20'
                                                : 'hover:bg-[#E8DFD4]/70 text-[#1A3C27]'
                                                }`}
                                        >
                                            <span className="font-medium text-sm">{cat.name}</span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full transition-all ${selectedCategory === cat.slug
                                                ? 'bg-white/20 text-white'
                                                : 'bg-[#C1A17C]/20 text-[#8B7355] group-hover:bg-[#C1A17C]/30'
                                                }`}>
                                                {cat.count}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Price Range Section */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 overflow-hidden shadow-sm">
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/40 transition-colors"
                    >
                        <span className="font-semibold text-[#1A3C27] flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#C1A17C]" />
                            Price Range
                        </span>
                        <motion.div
                            animate={{ rotate: expandedSections.includes('price') ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown className="w-5 h-5 text-[#5C5C5C]" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {expandedSections.includes('price') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-6">
                                    <div className="relative h-12 mb-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#D4C5B5] rounded-full -translate-y-1/2"></div>
                                        <div
                                            className="absolute top-1/2 h-1 bg-[#1A3C27] rounded-full -translate-y-1/2"
                                            style={{
                                                left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                                                right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                                            }}
                                        ></div>
                                        <input
                                            type="range"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceRange[0]}
                                            onChange={handleMinChange}
                                            className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A3C27] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all z-20"
                                        />
                                        <input
                                            type="range"
                                            min={minPrice}
                                            max={maxPrice}
                                            value={priceRange[1]}
                                            onChange={handleMaxChange}
                                            className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1A3C27] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all z-20"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium text-[#1A3C27]">
                                        <span className="bg-white/80 px-3 py-1 rounded border border-[#D4C5B5]">₹{priceRange[0]}</span>
                                        <span className="text-[#5C5C5C]">-</span>
                                        <span className="bg-white/80 px-3 py-1 rounded border border-[#D4C5B5]">₹{priceRange[1]}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Filters */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 p-5 shadow-sm">
                    <h3 className="font-semibold text-[#1A3C27] mb-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#C1A17C]" />
                        Quick Filters
                    </h3>
                    <div className="space-y-3">
                        {['New Arrivals', 'Best Sellers', 'On Sale'].map((filter, index) => (
                            <motion.label
                                key={filter}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="relative w-5 h-5">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 rounded-md border-2 border-[#D4C5B5] peer-checked:border-[#1A3C27] peer-checked:bg-[#1A3C27] transition-all duration-200 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm text-[#5C5C5C] group-hover:text-[#1A3C27] transition-colors">
                                    {filter}
                                </span>
                            </motion.label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-[#D4C5B5]/50">
                <button
                    onClick={() => {
                        onCategoryChange('all');
                        setPriceRange([minPrice, maxPrice]);
                        if (isMobile) onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D4C5B5] text-[#5C5C5C] hover:border-[#1A3C27] hover:text-[#1A3C27] transition-all duration-300 font-medium text-sm"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );

    if (!isMobile) {
        return (
            <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block w-72 xl:w-80 flex-shrink-0"
            >
                <div className="sticky top-28 bg-[#F4EFEC]/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-[#1A3C27]/5 overflow-hidden max-h-[calc(100vh-8rem)]">
                    {sidebarContent}
                </div>
            </motion.aside>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#F4EFEC] z-50 lg:hidden shadow-2xl"
                    >
                        {sidebarContent}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export const Shop = () => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [visibleCount, setVisibleCount] = useState(12);
    const [catalogProducts, setCatalogProducts] = useState<ShopProduct[]>([]);
    const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>(
        categoriesData as Record<string, CategoryData>
    );
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Price filtering
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const urlSearchQuery = searchParams.get('search');
        setSearchQuery(urlSearchQuery ?? '');
    }, [searchParams]);

    useEffect(() => {
        let isActive = true;
        const loadCatalog = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/products`);
                if (!response.ok) throw new Error('Failed to load catalog');
                const data = (await response.json()) as ApiCatalogProduct[];
                if (!isActive) return;
                const normalized = data.map((product) => ({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    category: product.category?.trim() || 'Catalog',
                    categorySlug: slugify(product.category?.trim() || 'Catalog'),
                    price: product.price,
                    tag: product.tag,
                    sizes: product.sizes,
                    source: 'catalog' as const,
                }));
                setCatalogProducts(normalized);
            } catch {
                if (!isActive) return;
                const fallback = (productsData as ApiCatalogProduct[]).map((product) => ({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    category: product.category?.trim() || 'Catalog',
                    categorySlug: slugify(product.category?.trim() || 'Catalog'),
                    price: product.price,
                    tag: product.tag,
                    sizes: product.sizes,
                    source: 'catalog' as const,
                }));
                setCatalogProducts(fallback);
            }
        };
        loadCatalog();
        return () => { isActive = false; };
    }, []);

    useEffect(() => {
        let isActive = true;
        const loadCategories = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/categories`);
                if (!response.ok) throw new Error('Failed to load categories');
                const data = (await response.json()) as Record<string, CategoryData>;
                if (!isActive) return;
                setCategoryData(data ?? {});
            } catch {
                if (!isActive) return;
                setCategoryData(categoriesData as Record<string, CategoryData>);
            }
        };
        loadCategories();
        return () => { isActive = false; };
    }, []);

    const categoryProducts = useMemo<ShopProduct[]>(() => {
        const products: ShopProduct[] = [];
        Object.entries(categoryData).forEach(([categorySlug, catData]) => {
            const items = catData.products ?? [];
            items.forEach((product, index) => {
                const normalizedPrice =
                    typeof product.price === 'number'
                        ? product.price
                        : typeof product.price === 'string'
                            ? product.price
                            : '';
                products.push({
                    id: `${categorySlug}-${index}`,
                    name: product.name ?? `${catData.name ?? categorySlug} ${index + 1}`,
                    image: product.image ?? '/heroimage.webp',
                    category: catData.name ?? categorySlug,
                    categorySlug,
                    price: normalizedPrice,
                    tag: product.tag ?? (index < 3 ? 'New' : undefined),
                    sizes: product.sizes,
                    source: 'category',
                });
            });
        });
        return products;
    }, [categoryData]);

    const allProducts = useMemo(() => {
        return [...catalogProducts, ...categoryProducts];
    }, [catalogProducts, categoryProducts]);

    const uniqueProducts = useMemo(() => {
        const bestByKey = new Map<string, ShopProduct>();

        allProducts.forEach((product) => {
            const key = `${slugify(product.name)}|${String(product.image ?? '').toLowerCase()}`;
            const existing = bestByKey.get(key);
            if (!existing) {
                bestByKey.set(key, product);
                return;
            }

            const existingPrice = parseBasePrice(existing.price);
            const nextPrice = parseBasePrice(product.price);
            if (nextPrice > existingPrice) {
                bestByKey.set(key, product);
                return;
            }
            if (nextPrice === existingPrice && product.source === 'catalog' && existing.source !== 'catalog') {
                bestByKey.set(key, product);
            }
        });

        return Array.from(bestByKey.values());
    }, [allProducts]);

    // Recalculate global min/max prices when products change
    useEffect(() => {
        if (uniqueProducts.length > 0) {
            const prices = uniqueProducts.map((p) => parseBasePrice(p.price));
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange([min, max]); // Reset range when data loads
        }
    }, [uniqueProducts]);

    const categories = useMemo(() => {
        const totals = new Map<string, { slug: string; name: string; count: number }>();
        uniqueProducts.forEach((product) => {
            const slug = product.categorySlug;
            const name = product.category;
            const current = totals.get(slug);
            if (current) current.count += 1;
            else totals.set(slug, { slug, name, count: 1 });
        });
        const cats = Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
        const totalCount = cats.reduce((sum, cat) => sum + cat.count, 0);
        return [{ slug: 'all', name: 'All Products', count: totalCount }, ...cats];
    }, [uniqueProducts]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = uniqueProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;

            // Price Filtering
            const productPrice = parseBasePrice(product.price);
            const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        });

        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': {
                    const priceA = parseBasePrice(a.price);
                    const priceB = parseBasePrice(b.price);
                    return priceA - priceB;
                }
                case 'price-desc': {
                    const priceA = parseBasePrice(a.price);
                    const priceB = parseBasePrice(b.price);
                    return priceB - priceA;
                }
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'newest':
                default:
                    return 0;
            }
        });

        return result;
    }, [searchQuery, selectedCategory, uniqueProducts, sortBy, priceRange]);

    const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);

    const loadMore = () => setVisibleCount(prev => prev + 12);

    const handleCategoryChange = (slug: string) => {
        setSelectedCategory(slug);
        setVisibleCount(12);
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white">
            <Seo
                title="Shop Eco-Friendly Products | Trusser"
                description="Shop eco-friendly stationery & lifestyle products crafted from recycled bottles. Sustainable gifts and corporate gifting—made in Bengaluru, India."
                canonicalPath="/shop"
                ogType="website"
            />
            <Navbar />

            <main>
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#1A3C27] via-[#2D5F3F] to-[#1A3C27]">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <FloatingOrb delay={0} size={400} color="#C1A17C" />
                        <FloatingOrb delay={2} size={300} color="#4A8B60" />
                        <FloatingOrb delay={4} size={350} color="#C1A17C" />
                    </div>

                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />

                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12 text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 mb-6"
                        >
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C1A17C]" />
                            <span className="text-[#C1A17C] font-bold tracking-[0.3em] text-xs uppercase">
                                Explore Our Collection
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C1A17C]" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight"
                        >
                            <span className="bg-gradient-to-r from-white via-white to-[#C1A17C] bg-clip-text text-transparent">
                                Curated Goods
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed"
                        >
                            Discover our selection of sustainable, premium products designed for modern living.
                        </motion.p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V60Z" fill="#F4EFEC" />
                        </svg>
                    </div>
                </section>

                <section className="py-8 lg:py-12">
                    <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
                        <div className="flex gap-8">
                            <FilterSidebar
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                isOpen={filterOpen}
                                onClose={() => setFilterOpen(false)}
                                isMobile={false}
                            />

                            <FilterSidebar
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                isOpen={filterOpen}
                                onClose={() => setFilterOpen(false)}
                                isMobile={true}
                            />

                            <div className="flex-1 min-w-0">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="sticky top-24 sm:top-28 z-30 mb-8"
                                >
                                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-[#1A3C27]/5 p-4">
                                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setFilterOpen(true)}
                                                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A3C27] text-white font-medium text-sm hover:bg-[#2D5F3F] transition-colors"
                                                >
                                                    <Filter className="w-4 h-4" />
                                                    Filters
                                                </button>

                                                <div className="hidden sm:block">
                                                    <p className="text-sm text-[#5C5C5C]">
                                                        Showing <span className="font-semibold text-[#1A3C27]">{Math.min(visibleCount, filteredAndSortedProducts.length)}</span> of <span className="font-semibold text-[#1A3C27]">{filteredAndSortedProducts.length}</span> products
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search products..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-xl bg-[#F4EFEC] border border-[#D4C5B5]/50 focus:border-[#1A3C27] focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/10 transition-all placeholder:text-[#5C5C5C]/50 text-[#1A3C27] text-sm"
                                                    />
                                                </div>

                                                <div className="relative" ref={sortDropdownRef}>
                                                    <button
                                                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                                        className="flex items-center justify-between gap-2 w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F4EFEC] border border-[#D4C5B5]/50 hover:border-[#1A3C27]/30 transition-all text-sm text-[#1A3C27]"
                                                    >
                                                        <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                                        <motion.div
                                                            animate={{ rotate: sortDropdownOpen ? 180 : 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <ChevronDown className="w-4 h-4 text-[#5C5C5C]" />
                                                        </motion.div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {sortDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#D4C5B5]/30 overflow-hidden z-50"
                                                            >
                                                                {sortOptions.map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        onClick={() => {
                                                                            setSortBy(option.value);
                                                                            setSortDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${sortBy === option.value
                                                                            ? 'bg-[#1A3C27] text-white'
                                                                            : 'text-[#1A3C27] hover:bg-[#F4EFEC]'
                                                                            }`}
                                                                    >
                                                                        {option.label}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="hidden md:flex items-center bg-[#F4EFEC] rounded-xl p-1 border border-[#D4C5B5]/50">
                                                    <button
                                                        onClick={() => setViewMode('grid')}
                                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                                            ? 'bg-[#1A3C27] text-white shadow-sm'
                                                            : 'text-[#5C5C5C] hover:text-[#1A3C27]'
                                                            }`}
                                                    >
                                                        <Grid3X3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode('list')}
                                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                                            ? 'bg-[#1A3C27] text-white shadow-sm'
                                                            : 'text-[#5C5C5C] hover:text-[#1A3C27]'
                                                            }`}
                                                    >
                                                        <LayoutList className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:hidden mt-3 pt-3 border-t border-[#D4C5B5]/30">
                                            <p className="text-sm text-[#5C5C5C] text-center">
                                                Showing <span className="font-semibold text-[#1A3C27]">{Math.min(visibleCount, filteredAndSortedProducts.length)}</span> of <span className="font-semibold text-[#1A3C27]">{filteredAndSortedProducts.length}</span> products
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {selectedCategory !== 'all' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-[#5C5C5C]">Active filters:</span>
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                onClick={() => handleCategoryChange('all')}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A3C27] text-white text-sm font-medium group hover:bg-[#2D5F3F] transition-colors"
                                            >
                                                {categories.find(c => c.slug === selectedCategory)?.name}
                                                <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                <div className={`grid gap-6 lg:gap-8 ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                                    : 'grid-cols-1'
                                    }`}>
                                    {visibleProducts.map((product, index) => (
                                        <ProductCard key={product.id} product={product} index={index % 12} />
                                    ))}
                                </div>

                                {visibleProducts.length < filteredAndSortedProducts.length && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-16 text-center"
                                    >
                                        <Button
                                            onClick={loadMore}
                                            variant="outline"
                                            className="group rounded-full px-8 py-4 border-2 border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white transition-all duration-300 shadow-lg shadow-[#1A3C27]/10 hover:shadow-xl hover:shadow-[#1A3C27]/20"
                                        >
                                            <span>Load More Products</span>
                                            <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                                        </Button>
                                    </motion.div>
                                )}

                                {visibleProducts.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-24"
                                    >
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#E8DFD4] flex items-center justify-center">
                                            <Search className="w-10 h-10 text-[#C1A17C]" />
                                        </div>
                                        <h3 className="font-serif text-2xl text-[#1A3C27] mb-2">No products found</h3>
                                        <p className="text-[#5C5C5C] mb-6">Try adjusting your search or filters.</p>
                                        <Button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory('all');
                                                setPriceRange([minPrice, maxPrice]);
                                            }}
                                            className="rounded-full bg-[#1A3C27] text-white hover:bg-[#2D5F3F]"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
