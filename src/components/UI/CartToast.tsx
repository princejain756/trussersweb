import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPriceSimple } from '../../utils/currency';
import { clearLastCartAdded, getLastCartAdded, subscribeToCartAdds } from '../../utils/cart';
import type { CartItem } from '../../utils/cart';

const AUTO_CLOSE_MS = 3000;

export const CartToast = () => {
    const [item, setItem] = useState<CartItem | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const cached = getLastCartAdded();
        if (cached && Date.now() - cached.at < 2000) {
            setItem(cached.item);
            setIsVisible(true);
            clearLastCartAdded();
        }

        const unsubscribe = subscribeToCartAdds((nextItem) => {
            setItem(nextItem);
            setIsVisible(true);
            clearLastCartAdded();

            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
            timerRef.current = window.setTimeout(() => {
                setIsVisible(false);
            }, AUTO_CLOSE_MS);
        });

        return () => {
            unsubscribe();
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && item && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="fixed bottom-6 right-6 z-[100] w-[280px] rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_50px_rgba(26,60,39,0.25)] backdrop-blur"
                >
                    <div className="flex items-start gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#F4EFEC]">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-[#9C8F84]">Item</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#C1A17C]">Added to cart</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A3C27] line-clamp-2">{item.name}</p>
                            <p className="mt-1 text-xs text-[#5C5C5C]">
                                {item.size && <span className="text-[#C1A17C]">{item.size} • </span>}
                                {item.quantity} × {formatPriceSimple(item.price)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsVisible(false)}
                            className="rounded-full border border-[#E8DFD4] p-1 text-[#5C5C5C] hover:text-[#1A3C27]"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <Link
                            to="/cart"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1A3C27] px-3 py-2 text-xs font-semibold text-white"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            View cart
                        </Link>
                        <Link
                            to="/checkout"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#1A3C27] px-3 py-2 text-xs font-semibold text-[#1A3C27]"
                        >
                            Checkout
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
