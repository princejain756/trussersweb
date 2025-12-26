import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Heart } from 'lucide-react';
import { formatPriceSimple } from '../../utils/currency';

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
    const formattedPrice = typeof product.price === 'number'
        ? formatPriceSimple(product.price)
        : formatPriceSimple(product.price);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.5 }}
            className="group relative w-full flex-shrink-0"
        >
            <Link to={`/product/${product.id}`} className="block">
                <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-md bg-[#E8DFD4]">
                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.tag && (
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-[#1A3C27]">
                                {product.tag}
                            </span>
                        </div>
                    )}

                    {product.category && (
                        <div className="absolute top-4 right-4 z-10">
                            <span className="bg-[#1A3C27]/90 px-2 py-1 text-xs font-medium tracking-wide backdrop-blur-md text-white rounded">
                                {product.category}
                            </span>
                        </div>
                    )}

                    {/* Heart Button - Prevent Link click */}
                    <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="absolute right-4 bottom-20 z-10 rounded-full bg-white/90 p-2.5 text-[#1A3C27] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100 hover:text-red-500"
                    >
                        <Heart size={18} />
                    </button>

                    <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button className="w-full bg-[#2D5F3F] text-white hover:bg-[#1A3C27] shadow-lg py-6">
                            Quick View
                        </Button>
                    </div>
                </div>
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="mb-1 text-xl font-serif text-[#1A3C27] line-clamp-2">{product.name}</h3>
                    <p className="text-[#5C5C5C] font-medium">{formattedPrice}</p>
                </div>
            </div>
        </motion.div>
    );
};
