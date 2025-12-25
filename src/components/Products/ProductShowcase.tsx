import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../UI/Button';
import { ArrowRight, Heart } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import productsData from '../../data/products.json';

const products = productsData;

export const ProductShowcase = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (sliderRef.current && containerRef.current) {
            setWidth(sliderRef.current.scrollWidth - containerRef.current.offsetWidth);
        }
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

    return (
        <section id="shop" className="py-24 lg:py-32 bg-[#F4EFEC] overflow-hidden">
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-[#C1A17C]">
                            Selected Goods
                        </span>
                        <h2 className="font-serif text-5xl md:text-6xl text-[#1A3C27]">
                            Curated Essentials.
                        </h2>
                    </div>
                    <Button variant="ghost" className="hidden md:inline-flex group text-[#2D5F3F]">
                        View All Commodities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
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
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-[#1A3C27]">
                                                {product.tag}
                                            </span>
                                        </div>
                                        <button className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2.5 text-[#1A3C27] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 dark:hover:text-red-500">
                                            <Heart size={18} />
                                        </button>

                                        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <Button className="w-full bg-[#2D5F3F] text-white hover:bg-[#1A3C27] shadow-lg py-6">
                                                Quick Add
                                            </Button>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="mb-1 text-xl font-serif text-[#1A3C27]">{product.name}</h3>
                                        <p className="text-[#5C5C5C] font-medium">{product.price}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Button variant="outline">View All Commodities</Button>
                </div>
            </div>
        </section>
    );
};
