import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Leaf, Star } from 'lucide-react';
import { Button } from '../UI/Button';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import productsData from '../../data/products.json';
import categoriesData from '../../data/categories.json';
import { useEffect, useRef, useState } from 'react';
import { formatPriceSimple, getCurrency } from '../../utils/currency';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';
const defaultFeatures = [
    'Made from 100% recycled materials',
    'Handcrafted by local artisans',
    'Eco-friendly and sustainable',
    'Unique design, no two pieces are identical',
];

const buildDefaultDescription = (name: string) =>
    `Handcrafted with sustainable materials, this ${name.toLowerCase()} combines traditional craftsmanship with modern design. Made from upcycled waste materials, each piece contributes to environmental conservation while offering premium quality.`;

type ProductDetailData = {
    id: string | number;
    name: string;
    image: string;
    category?: string;
    categorySlug?: string;
    price: number | string;
    description?: string;
    features?: string[];
    rating: number;
    reviews: number;
};

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        const loadProduct = async () => {
            setIsLoading(true);

            const numericId = id && Number.isFinite(Number(id));
            if (numericId) {
                try {
                    const response = await fetch(`${apiBaseUrl}/api/products/${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (!isActive) {
                            return;
                        }
                        const features = Array.isArray(data?.features) ? data.features : undefined;
                        const description = typeof data?.description === 'string' ? data.description : undefined;
                        setProduct({
                            id: data?.id ?? id,
                            name: data?.name ?? 'Product',
                            image: data?.image ?? '',
                            price: data?.price ?? '',
                            description,
                            features,
                            category: data?.category,
                            rating: 4.8,
                            reviews: 39,
                        });
                        setIsLoading(false);
                        return;
                    }
                } catch (error) {
                    // fall back to category data
                }

                const localProduct = (productsData as any[]).find(
                    (item) => Number(item.id) === Number(id)
                );
                if (localProduct && isActive) {
                    setProduct({
                        id: localProduct.id,
                        name: localProduct.name,
                        image: localProduct.image,
                        price: localProduct.price,
                        description: localProduct.description ?? buildDefaultDescription(localProduct.name),
                        features: localProduct.features ?? defaultFeatures,
                        category: localProduct.category,
                        rating: 4.8,
                        reviews: 39,
                    });
                    setIsLoading(false);
                    return;
                }
            }

            let fallback: ProductDetailData | null = null;
            if (id) {
                let categorySource: Record<string, any> = categoriesData as Record<string, any>;
                try {
                    const response = await fetch(`${apiBaseUrl}/api/categories`);
                    if (response.ok) {
                        categorySource = (await response.json()) as Record<string, any>;
                    }
                } catch (error) {
                    // fall back to local data
                }

                for (const [categorySlug, catData] of Object.entries(categorySource)) {
                    const categoryData = catData as any;
                    const productIndex = (categoryData.products ?? []).findIndex(
                        (p: any, idx: number) => `${categorySlug}-${idx}` === id
                    );

                    if (productIndex !== -1) {
                        const prod = categoryData.products[productIndex];
                        const safeName =
                            typeof prod?.name === 'string' && prod.name.trim() ? prod.name : 'Product';
                        const description =
                            typeof prod?.description === 'string' && prod.description.trim()
                                ? prod.description
                                : buildDefaultDescription(safeName);
                        const features =
                            Array.isArray(prod?.features) && prod.features.length > 0
                                ? prod.features
                                : defaultFeatures;
                        const price =
                            typeof prod?.price === 'number' || typeof prod?.price === 'string'
                                ? prod.price
                                : 'Price on request';
                        fallback = {
                            id,
                            name: safeName,
                            image: prod.image ?? '',
                            category: categoryData.name,
                            categorySlug: categorySlug,
                            price,
                            description,
                            features,
                            rating: 4.8,
                            reviews: Math.floor(Math.random() * 100) + 20,
                        };
                        break;
                    }
                }
            }

            if (!isActive) {
                return;
            }

            setProduct(fallback);
            setIsLoading(false);
        };

        loadProduct();

        return () => {
            isActive = false;
        };
    }, [id]);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, [id]);

    const containerRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EFEC]">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-[#1A3C27] mb-4">Loading product...</h2>
                    <p className="text-[#5C5C5C]">Fetching the latest details.</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4EFEC]">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-[#1A3C27] mb-4">Product Not Found</h2>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    const safeName = typeof product.name === 'string' && product.name.trim() ? product.name : 'Product';
    const resolvedDescription =
        typeof product.description === 'string' && product.description.trim()
            ? product.description.trim()
            : buildDefaultDescription(safeName);
    const resolvedFeatures = Array.isArray(product.features) && product.features.length > 0
        ? product.features
        : defaultFeatures;
    const formattedPrice =
        typeof product.price === 'number'
            ? formatPriceSimple(product.price)
            : typeof product.price === 'string' && product.price.trim()
                ? formatPriceSimple(product.price)
                : 'Price on request';
    const imageSrc = product.image?.trim() ? product.image : '/heroimage.webp';
    const freeShippingText = getCurrency() === 'USD' ? 'On orders over $12' : 'On orders over ₹999';

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white" ref={containerRef}>
            <Navbar />

            <main className="pt-24 lg:pt-32 pb-20">
                <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-[#5C5C5C] hover:text-[#1A3C27] transition-colors mb-8 sm:mb-12"
                    >
                        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium tracking-wide">Back</span>
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative aspect-[4/5] lg:aspect-square w-full overflow-hidden rounded-2xl bg-[#E8DFD4]"
                        >
                            <motion.img
                                src={imageSrc}
                                alt={safeName}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.src = '/heroimage.webp';
                                }}
                            />
                            {product.category && (
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#1A3C27] rounded-sm shadow-sm">
                                        {product.category}
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {/* Product Info Section */}
                        <div className="flex flex-col h-full justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex text-[#D4AF37]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-[#5C5C5C] font-medium">
                                        {product.rating} ({product.reviews} Reviews)
                                    </span>
                                </div>

                                <h1 className="font-serif text-4xl lg:text-6xl text-[#1A3C27] mb-4 leading-tight">
                                    {safeName}
                                </h1>
                                <p className="text-3xl font-medium text-[#C1A17C] mb-8 font-serif">
                                    {formattedPrice}
                                </p>

                                <div className="prose prose-lg text-[#5C5C5C] mb-10 leading-relaxed max-w-xl">
                                    <p>{resolvedDescription}</p>
                                </div>

                                {/* Features List */}
                                <div className="mb-10 space-y-3">
                                    <h3 className="font-serif text-xl text-[#1A3C27] mb-4">Key Features</h3>
                                    {resolvedFeatures.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Leaf className="text-[#2D5F3F] mt-1 flex-shrink-0" size={18} />
                                            <span className="text-[#5C5C5C]">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                    <Button className="flex-1 py-6 text-lg bg-[#2D5F3F] hover:bg-[#1A3C27] text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                                        <ShoppingBag className="mr-3" size={20} />
                                        Add to Cart
                                    </Button>
                                    <Button variant="outline" className="flex-1 py-6 text-lg border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white transition-all">
                                        Buy Now
                                    </Button>
                                </div>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#E8DFD4]">
                                    <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors">
                                        <div className="p-3 bg-[#E8DFD4] rounded-full text-[#1A3C27]">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-[#1A3C27]">Free Shipping</h4>
                                            <p className="text-xs text-[#5C5C5C] mt-1">{freeShippingText}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors">
                                        <div className="p-3 bg-[#E8DFD4] rounded-full text-[#1A3C27]">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-[#1A3C27]">Quality Guarantee</h4>
                                            <p className="text-xs text-[#5C5C5C] mt-1">Verified sustainable materials</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors">
                                        <div className="p-3 bg-[#E8DFD4] rounded-full text-[#1A3C27]">
                                            <Leaf size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-[#1A3C27]">Eco Friendly</h4>
                                            <p className="text-xs text-[#5C5C5C] mt-1">100% recyclable packaging</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
