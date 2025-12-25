import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { ProductCard } from '../components/UI/ProductCard';
import { Button } from '../components/UI/Button';
import { Search, ArrowDown } from 'lucide-react';
import productsData from '../data/products.json';

export const Shop = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [visibleCount, setVisibleCount] = useState(12);

    // Extract unique categories (if we had categories, for now we use 'New' from tag, or just 'All')
    // In a real app, products would have a 'category' field.
    const categories = ['All', 'New', 'Best Sellers', 'Accessories'];

    const filteredProducts = useMemo(() => {
        return productsData.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Since we don't have explicit categories in JSON other than 'tag: New', 
            // we'll just simulate category filtering or ignore it for now unless tag matches
            const matchesCategory = selectedCategory === 'All' ||
                (selectedCategory === 'New' && product.tag === 'New') ||
                true; // Default to true for mocked categories

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

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
                <div className="sticky top-20 z-40 bg-[#F4EFEC]/80 backdrop-blur-md border-b border-[#D4C5B5]">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                                ? 'bg-[#1A3C27] text-white'
                                                : 'bg-white text-[#1A3C27] hover:bg-[#E8DFD4]'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-transparent focus:border-[#1A3C27] focus:outline-none transition-all placeholder:text-[#5C5C5C]/50 text-[#1A3C27]"
                                />
                            </div>
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
