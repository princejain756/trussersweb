import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Leaf, Star } from 'lucide-react';
import { Button } from '../UI/Button';
import { Navbar } from '../Layout/Navbar';
import { Footer } from '../Layout/Footer';
import productsData from '../../data/products.json';
import { useEffect, useRef } from 'react';

export const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = productsData.find(p => p.id === Number(id));

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, [id]);

    // Parallax effect for image
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

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
                                style={{ y }}
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#1A3C27] rounded-sm shadow-sm">
                                    {product.tag}
                                </span>
                            </div>
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
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-sm text-[#5C5C5C] font-medium">(120 Reviews)</span>
                                </div>

                                <h1 className="font-serif text-4xl lg:text-6xl text-[#1A3C27] mb-4 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-3xl font-medium text-[#C1A17C] mb-8 font-serif">
                                    {product.price}
                                </p>

                                <div className="prose prose-lg text-[#5C5C5C] mb-10 leading-relaxed max-w-xl">
                                    <p>
                                        Experience the perfect blend of sustainability and luxury with our {product.name}.
                                        Handcrafted with distinct attention to detail, this piece embodies the Trussers commitment to eco-friendly elegance.
                                        Perfect for the conscious consumer who refuses to compromise on style.
                                    </p>
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
                                            <p className="text-xs text-[#5C5C5C] mt-1">On orders over ₹999</p>
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
