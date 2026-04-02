import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '../UI/Button';
import { ArrowRight, Heart } from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import categoriesData from '../../data/categories.json';
import productsData from '../../data/products.json';
import { formatPriceRange } from '../../utils/currency';
import type { SizeEntry } from '../../utils/currency';
import { getWebsiteContent } from '../../utils/websiteContent';
import { addToCart } from '../../utils/cart';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

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

type ApiCatalogProduct = {
    id: string | number;
    name?: string;
    image?: string;
    category?: string;
    price?: string | number;
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

const parseVariantPrices = (sizes?: SizeEntry[]): number[] =>
    (sizes ?? [])
        .map((entry) => Number(String(entry.price ?? '').replace(/[₹$,\s]/g, '')))
        .filter((value) => Number.isFinite(value) && value > 0);

const getEffectiveDisplayPrice = (product: Pick<ShopProduct, 'price' | 'sizes'>): number => {
    const variantPrices = parseVariantPrices(product.sizes);
    if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
    }
    return parseBasePrice(product.price);
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export const ProductShowcase = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const [miniCartProduct, setMiniCartProduct] = useState<ShopProduct | null>(null);
    const content = getWebsiteContent();
    const [catalogProducts, setCatalogProducts] = useState<ShopProduct[]>([]);
    const [categoryData, setCategoryData] = useState<Record<string, CategoryData>>(
        categoriesData as Record<string, CategoryData>
    );

    useEffect(() => {
        let isActive = true;
        const loadCatalog = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/products`);
                if (!response.ok) throw new Error('Failed to load catalog');
                const data = (await response.json()) as ApiCatalogProduct[];
                if (!isActive) return;
                setCatalogProducts((Array.isArray(data) ? data : []).map((product) => ({
                    id: product.id,
                    name: product.name ?? 'Product',
                    image: product.image ?? '/heroimage.webp',
                    category: product.category?.trim() || 'Catalog',
                    categorySlug: slugify(product.category?.trim() || 'Catalog'),
                    price: product.price ?? '',
                    tag: product.tag,
                    sizes: product.sizes,
                    source: 'catalog',
                })));
            } catch {
                if (!isActive) return;
                setCatalogProducts((productsData as ApiCatalogProduct[]).map((product) => ({
                    id: product.id,
                    name: product.name ?? 'Product',
                    image: product.image ?? '/heroimage.webp',
                    category: product.category?.trim() || 'Catalog',
                    categorySlug: slugify(product.category?.trim() || 'Catalog'),
                    price: product.price ?? '',
                    tag: product.tag,
                    sizes: product.sizes,
                    source: 'catalog',
                })));
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
                products.push({
                    id: `${categorySlug}-${index}`,
                    name: product.name ?? `${catData.name ?? categorySlug} ${index + 1}`,
                    image: product.image ?? '/heroimage.webp',
                    category: catData.name ?? categorySlug,
                    categorySlug,
                    price: product.price ?? '',
                    tag: product.tag,
                    sizes: product.sizes,
                    source: 'category',
                });
            });
        });
        return products;
    }, [categoryData]);

    // Merge catalog + category, remove duplicates, then pick one valid priced product per category.
    const products = useMemo<ShopProduct[]>(() => {
        const merged = [...catalogProducts, ...categoryProducts];

        const dedupedByNameImage = new Map<string, ShopProduct>();
        merged.forEach((product) => {
            const key = `${product.name.trim().toLowerCase()}|${String(product.image ?? '').toLowerCase()}`;
            const existing = dedupedByNameImage.get(key);
            if (!existing) {
                dedupedByNameImage.set(key, product);
                return;
            }
            const existingPrice = getEffectiveDisplayPrice(existing);
            const nextPrice = getEffectiveDisplayPrice(product);
            if (nextPrice > existingPrice) {
                dedupedByNameImage.set(key, product);
                return;
            }
            if (nextPrice === existingPrice && product.source === 'catalog' && existing.source !== 'catalog') {
                dedupedByNameImage.set(key, product);
            }
        });

        const validProducts = Array.from(dedupedByNameImage.values()).filter((product) => {
            const img = product.image ?? '';
            const isValidPath = img.startsWith('/products/') &&
                (img.endsWith('.webp') || img.endsWith('.jpg') || img.endsWith('.png'));
            const isNotPlaceholder = !img.includes('placeholder') && !img.includes('heroimage');
            const hasPositivePrice = getEffectiveDisplayPrice(product) > 0;
            return isValidPath && isNotPlaceholder && hasPositivePrice;
        });

        const bestByCategory = new Map<string, ShopProduct>();
        validProducts.forEach((product) => {
            const key = product.categorySlug;
            const existing = bestByCategory.get(key);
            if (!existing) {
                bestByCategory.set(key, product);
                return;
            }
            if (getEffectiveDisplayPrice(product) > getEffectiveDisplayPrice(existing)) {
                bestByCategory.set(key, product);
            }
        });

        return Array.from(bestByCategory.values());
    }, [catalogProducts, categoryProducts]);

    useEffect(() => {
        if (sliderRef.current && containerRef.current) {
            const updateWidth = () => {
                if (sliderRef.current && containerRef.current) {
                    setWidth(sliderRef.current.scrollWidth - containerRef.current.offsetWidth);
                }
            };

            updateWidth();
            const timer = setTimeout(updateWidth, 500);

            window.addEventListener('resize', updateWidth);
            return () => {
                window.removeEventListener('resize', updateWidth);
                clearTimeout(timer);
            };
        }
    }, [products]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x = useTransform(scrollYProgress, (value) => `${-15 * value}%`);
    const formatPrice = (product: ShopProduct) => {
        return formatPriceRange(product.sizes, product.price);
    };

    const handleQuickAdd = (product: ShopProduct) => {
        const price =
            typeof product.price === 'number'
                ? product.price
                : Number(String(product.price ?? 0).replace(/[₹$,\s]/g, ''));
        addToCart({
            id: String(product.id),
            name: product.name,
            image: product.image,
            price: Number.isFinite(price) ? price : 0,
            quantity: 1,
            category: product.category,
        });
        setMiniCartProduct(product);
        setIsMiniCartOpen(true);
    };

    return (
        <section id="shop" className="py-24 lg:py-32 bg-[#F4EFEC] overflow-hidden">
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-[#C1A17C]">
                            {content.productShowcase.label}
                        </span>
                        <h2 className="font-serif text-5xl md:text-6xl text-[#1A3C27]">
                            {content.productShowcase.heading}
                        </h2>
                    </div>
                    <Link to="/shop">
                        <Button variant="ghost" className="hidden md:inline-flex group text-[#2D5F3F]">
                            View All Commodities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                {/* Horizontal Scroll Container */}
                <div ref={containerRef} className="relative w-full">
                    <motion.div
                        ref={sliderRef}
                        style={{ x }}
                        className="flex gap-8 w-max pb-12 cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ right: 0, left: -width }}
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.5 }}
                                className="group relative w-[280px] md:w-[350px] flex-shrink-0"
                            >
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-md bg-[#E8DFD4]">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="low"
                                            width={700}
                                            height={875}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-[#1A3C27]">
                                                {product.category}
                                            </span>
                                        </div>
                                        <button className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2.5 text-[#1A3C27] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 dark:hover:text-red-500">
                                            <Heart size={18} />
                                        </button>

                                        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <Button
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    handleQuickAdd(product);
                                                }}
                                                className="w-full bg-[#2D5F3F] text-white hover:bg-[#1A3C27] shadow-lg py-6"
                                            >
                                                Quick Add
                                            </Button>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="mb-1 text-xl font-serif text-[#1A3C27]">{product.name}</h3>
                                        <p className="text-[#5C5C5C] font-medium">{formatPrice(product)}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/shop">
                        <Button variant="outline">View All Commodities</Button>
                    </Link>
                </div>
            </div>

            {isMiniCartOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div className="fixed inset-0 z-[100]">
                        <button
                            type="button"
                            aria-label="Close mini cart"
                            onClick={() => setIsMiniCartOpen(false)}
                            className="absolute inset-0 bg-black/40"
                        />
                        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
                            <div className="flex h-full flex-col p-6">
                                <div className="flex items-center justify-between border-b border-[#E8DFD4] pb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1A17C]">Mini Cart</p>
                                        <h3 className="font-serif text-2xl text-[#1A3C27]">Added to cart</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsMiniCartOpen(false)}
                                        className="rounded-full border border-[#E8DFD4] px-3 py-1 text-xs font-semibold text-[#1A3C27] hover:bg-[#F4EFEC]"
                                    >
                                        Close
                                    </button>
                                </div>

                                {miniCartProduct && (
                                    <div className="mt-6 flex gap-4 rounded-2xl bg-[#F4EFEC] p-4">
                                        <div className="h-20 w-20 overflow-hidden rounded-xl bg-white">
                                            <img
                                                src={miniCartProduct.image}
                                                alt={miniCartProduct.name}
                                                loading="lazy"
                                                decoding="async"
                                                fetchPriority="low"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center">
                                            <p className="text-sm font-semibold text-[#1A3C27] line-clamp-2">
                                                {miniCartProduct.name}
                                            </p>
                                            <p className="text-sm text-[#5C5C5C]">{formatPrice(miniCartProduct)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white"
                                        onClick={() => setIsMiniCartOpen(false)}
                                    >
                                        Continue Shopping
                                    </Button>
                                    <Link to="/shop" className="block">
                                        <Button className="w-full bg-[#2D5F3F] text-white hover:bg-[#1A3C27]">
                                            View Shop
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </section>
    );
};
