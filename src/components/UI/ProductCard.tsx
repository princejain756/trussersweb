import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Heart, Eye } from 'lucide-react';
import { formatPriceSimple } from '../../utils/currency';
import { useState } from 'react';

interface Product {
    id: string | number;
    name: string;
    price: string | number;
    image: string;
    tag?: string;
    category?: string;
}

interface ProductCardProps {
    product: Product;
    index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const formattedPrice = typeof product.price === 'number'
        ? formatPriceSimple(product.price)
        : formatPriceSimple(product.price);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                delay: Math.min(index * 0.08, 0.6),
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative w-full"
        >
            {/* Gradient border effect on hover */}
            <motion.div
                className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(135deg, #C1A17C 0%, #1A3C27 50%, #C1A17C 100%)',
                }}
            />

            <div className="relative bg-[#F4EFEC] rounded-2xl overflow-hidden">
                <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#E8DFD4]">
                        {/* Image with Ken Burns effect */}
                        <motion.img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            animate={{
                                scale: isHovered ? 1.08 : 1,
                            }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        />

                        {/* Overlay gradient on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Tags */}
                        {product.tag && (
                            <motion.div
                                className="absolute top-4 left-4 z-10"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="bg-gradient-to-r from-[#C1A17C] to-[#D4B995] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-lg">
                                    {product.tag}
                                </span>
                            </motion.div>
                        )}

                        {product.category && (
                            <motion.div
                                className="absolute top-4 right-4 z-10"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="bg-[#1A3C27]/90 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md text-white rounded-full shadow-lg">
                                    {product.category}
                                </span>
                            </motion.div>
                        )}

                        {/* Action buttons - slide up on hover */}
                        <motion.div
                            className="absolute right-4 bottom-4 flex flex-col gap-2 z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                y: isHovered ? 0 : 20
                            }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <button
                                onClick={(e) => { e.preventDefault(); }}
                                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#1A3C27] shadow-lg hover:bg-[#1A3C27] hover:text-white transition-all duration-300 hover:scale-110"
                            >
                                <Heart size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); }}
                                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#1A3C27] shadow-lg hover:bg-[#1A3C27] hover:text-white transition-all duration-300 hover:scale-110"
                            >
                                <Eye size={18} />
                            </button>
                        </motion.div>

                        {/* Quick View Button */}
                        <motion.div
                            className="absolute inset-x-4 bottom-4 z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                y: isHovered ? 0 : 20
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button className="w-full bg-white/95 backdrop-blur-sm text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white shadow-xl py-3 font-semibold rounded-xl transition-all duration-300">
                                Quick View
                            </Button>
                        </motion.div>
                    </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 bg-white/60 backdrop-blur-sm">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-serif text-[#1A3C27] line-clamp-2 leading-snug group-hover:text-[#2D5F3F] transition-colors">
                                {product.name}
                            </h3>
                            <p className="mt-1 text-[#C1A17C] font-bold text-lg">
                                {formattedPrice}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

