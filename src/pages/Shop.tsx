import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { ProductCard } from '../components/UI/ProductCard';
import { Button } from '../components/UI/Button';
import { Search, ArrowDown, Filter } from 'lucide-react';
import categoriesData from '../data/categories.json';
import productsData from '../data/products.json';
import { useSearchParams } from 'react-router-dom';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

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
};

type CategoryData = {
    name?: string;
    products?: Array<{
        name?: string;
        image?: string;
        price?: string | number;
        tag?: string;
    }>;
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

    // Handle search query from URL parameter
    useEffect(() => {
        const urlSearchQuery = searchParams.get('search');
        setSearchQuery(urlSearchQuery ?? '');
    }, [searchParams]);

    useEffect(() => {
        let isActive = true;

        const loadCatalog = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/products`);
                if (!response.ok) {
                    throw new Error('Failed to load catalog');
                }
                const data = (await response.json()) as Array<{
                    id: number;
                    name: string;
                    image: string;
                    price: string | number;
                    tag?: string;
                    category?: string;
                }>;
                if (!isActive) {
                    return;
                }
                const normalized = data.map((product) => {
                    const categoryName = product.category?.trim() || 'Catalog';
                    return {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        category: categoryName,
                        categorySlug: slugify(categoryName) || 'catalog',
                        price: product.price,
                        tag: product.tag,
                    };
                });
                setCatalogProducts(normalized);
            } catch (error) {
                if (!isActive) {
                    return;
                }
                const fallback = (productsData as Array<{
                    id: number;
                    name: string;
                    image: string;
                    price: string | number;
                    tag?: string;
                    category?: string;
                }>).map((product) => {
                    const categoryName = product.category?.trim() || 'Catalog';
                    return {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        category: categoryName,
                        categorySlug: slugify(categoryName) || 'catalog',
                        price: product.price,
                        tag: product.tag,
                    };
                });
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
                setCategoryData(data ?? {});
            } catch (error) {
                if (!isActive) {
                    return;
                }
                setCategoryData(categoriesData as Record<string, CategoryData>);
            }
        };

        loadCategories();

        return () => {
            isActive = false;
        };
    }, []);

    // Get all products from all categories
    const categoryProducts = useMemo<ShopProduct[]>(() => {
        const products: ShopProduct[] = [];
        Object.entries(categoryData).forEach(([categorySlug, catData]) => {
            const items = catData.products ?? [];
            items.forEach((product, index) => {
                const rawPrice = product.price;
                const price =
                    typeof rawPrice === 'number'
                        ? rawPrice
                        : typeof rawPrice === 'string' && rawPrice.trim().length > 0
                            ? rawPrice
                            : 'Price on request';
                products.push({
                    id: `${categorySlug}-${index}`,
                    name: product.name ?? `${catData.name ?? categorySlug} ${index + 1}`,
                    image: product.image ?? '/heroimage.webp',
                    category: catData.name ?? categorySlug,
                    categorySlug,
                    price,
                    tag: product.tag ?? (index < 3 ? 'New' : undefined),
                });
            });
        });
        return products;
    }, [categoryData]);

    const allProducts = useMemo(() => {
        return [...catalogProducts, ...categoryProducts];
    }, [catalogProducts, categoryProducts]);

    const categories = useMemo(() => {
        const totals = new Map<string, { slug: string; name: string; count: number }>();
        allProducts.forEach((product) => {
            const slug = product.categorySlug;
            const name = product.category;
            const current = totals.get(slug);
            if (current) {
                current.count += 1;
            } else {
                totals.set(slug, { slug, name, count: 1 });
            }
        });
        const cats = Array.from(totals.values()).sort((a, b) => a.name.localeCompare(b.name));
        const totalCount = cats.reduce((sum, cat) => sum + cat.count, 0);
        return [{ slug: 'all', name: 'All Products', count: totalCount }, ...cats];
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory, allProducts]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    const loadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#1A3C27]">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12 text-center text-white">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="block text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4"
                        >
                            Explore Our Collection
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6"
                        >
                            Curated Goods
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/70 text-lg max-w-xl mx-auto"
                        >
                            Discover our selection of sustainable, premium products designed for modern living.
                        </motion.p>
                    </div>
                </section>

                {/* Filters & Search - Sticky Header */}
                <div className="sticky top-20 z-40 bg-[#F4EFEC]/95 backdrop-blur-md border-b border-[#D4C5B5] shadow-sm">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Categories Filter */}
                            <div className="w-full lg:w-auto">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter size={18} className="text-[#1A3C27]" />
                                    <span className="text-sm font-semibold text-[#1A3C27]">Categories</span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.slug}
                                            onClick={() => {
                                                setSelectedCategory(cat.slug);
                                                setVisibleCount(12);
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                                                selectedCategory === cat.slug
                                                    ? 'bg-[#1A3C27] text-white shadow-md'
                                                    : 'bg-white text-[#1A3C27] hover:bg-[#E8DFD4] border border-[#D4C5B5]'
                                            }`}
                                        >
                                            {cat.name}
                                            <span className={`text-xs ${selectedCategory === cat.slug ? 'text-white/70' : 'text-[#5C5C5C]'}`}>
                                                ({cat.count})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative w-full lg:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#D4C5B5] focus:border-[#1A3C27] focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 transition-all placeholder:text-[#5C5C5C]/50 text-[#1A3C27]"
                                />
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-3 text-sm text-[#5C5C5C]">
                            Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <section className="py-12 lg:py-20">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                            {visibleProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index % 12} />
                            ))}
                        </div>

                        {/* Load More */}
                        {visibleProducts.length < filteredProducts.length && (
                            <div className="mt-16 text-center">
                                <Button
                                    onClick={loadMore}
                                    variant="outline"
                                    className="rounded-full px-8 py-4 border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white"
                                >
                                    Load More Products
                                    <ArrowDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {visibleProducts.length === 0 && (
                            <div className="text-center py-24">
                                <h3 className="font-serif text-2xl text-[#1A3C27] mb-2">No products found</h3>
                                <p className="text-[#5C5C5C]">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
