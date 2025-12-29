import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    Tag,
    ArrowRight,
    Truck,
    Shield,
    RotateCcw,
    Gift,
    Sparkles,
    CheckCircle2,
    X,
    Heart,
} from 'lucide-react';
import { formatPriceSimple, getCurrency } from '../utils/currency';
import { addToCart, getCartItems, removeCartItem, subscribeToCart, updateCartQuantity } from '../utils/cart';
import type { CartItem as CartLineItem } from '../utils/cart';

// Frequently bought together products
const frequentlyBoughtTogether = [
    {
        id: 101,
        name: 'Women Gift Set Collection',
        image: '/products/categories/women-gift-sets/women-gift-sets-1.webp',
        price: 1299,
        originalPrice: 1599,
    },
    {
        id: 102,
        name: 'Kids Delight Gift Set',
        image: '/products/categories/kids-gifts-set/kids-gifts-set-1.webp',
        price: 999,
        originalPrice: 1299,
    },
    {
        id: 103,
        name: 'Passport Holder Premium',
        image: '/products/categories/passport-holders/passport-holders-1.webp',
        price: 599,
        originalPrice: 799,
    },
    {
        id: 104,
        name: 'Table Mat Coasters Set',
        image: '/products/categories/table-mat-coasters/table-mat-coasters-1.webp',
        price: 449,
        originalPrice: 599,
    },
];

// Coupon validation will be done via backend API

// Animated Section Component
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Cart Item Component
const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    index,
}: {
    item: CartLineItem;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
    index: number;
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E8DFD4]"
        >
            <div className="flex gap-4 md:gap-6">
                {/* Product Image */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0"
                >
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Wishlist Button */}
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C1A17C] hover:text-white">
                        <Heart className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        {item.category && (
                            <span className="text-xs text-[#C1A17C] font-medium uppercase tracking-wide">
                                {item.category}
                            </span>
                        )}
                        <h3 className="font-serif text-lg md:text-xl text-[#1A3C27] mt-1 truncate">
                            {item.name}
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 rounded-full bg-[#F4EFEC] flex items-center justify-center text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span
                                key={item.quantity}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="w-8 text-center font-semibold text-lg text-[#1A3C27]"
                            >
                                {item.quantity}
                            </motion.span>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 rounded-full bg-[#1A3C27] flex items-center justify-center text-white hover:bg-[#2D5F3F] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                            <p className="text-sm text-[#5C5C5C]">{formatPriceSimple(item.price)} × {item.quantity}</p>
                            <p className="font-serif text-xl text-[#1A3C27] font-medium">
                                {formatPriceSimple(item.price * item.quantity)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Remove Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(item.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
};

// Frequently Bought Together Card
const ProductSuggestionCard = ({ product, index }: { product: typeof frequentlyBoughtTogether[0]; index: number }) => {
    const [isAdded, setIsAdded] = useState(false);
    const handleAdd = () => {
        addToCart({
            id: String(product.id),
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1,
        });
        setIsAdded(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E8DFD4]"
        >
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D45D48] text-white text-xs font-bold rounded-full">
                    <Tag className="w-3 h-3" />
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
            </div>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="font-serif text-[#1A3C27] text-sm md:text-base line-clamp-2 mb-2">
                    {product.name}
                </h4>
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-[#1A3C27]">{formatPriceSimple(product.price)}</span>
                    <span className="text-sm text-[#5C5C5C] line-through">{formatPriceSimple(product.originalPrice)}</span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    className={`w-full py-2.5 rounded-full text-sm font-medium transition-all ${isAdded
                        ? 'bg-[#1A3C27] text-white'
                        : 'bg-[#F4EFEC] text-[#1A3C27] hover:bg-[#C1A17C] hover:text-white'
                        }`}
                >
                    {isAdded ? (
                        <span className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Added
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-1">
                            <Plus className="w-4 h-4" /> Add to Cart
                        </span>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
};

export const Cart = () => {
    const [cartItems, setCartItems] = useState<CartLineItem[]>(() => getCartItems());
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    useEffect(() => {
        return subscribeToCart((items) => setCartItems(items));
    }, []);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingThreshold = 2000;
    const shipping = subtotal >= shippingThreshold ? 0 : 99;

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = Math.round(subtotal * (appliedCoupon.value / 100));
        } else {
            discount = appliedCoupon.value;
        }
    }

    const total = subtotal - discount + shipping;

    // Update quantity
    const updateQuantity = (id: string, quantity: number) => {
        setCartItems(updateCartQuantity(id, quantity));
    };

    // Remove item
    const removeItem = (id: string) => {
        setCartItems(removeCartItem(id));
    };

    // Apply coupon
    const applyCoupon = async () => {
        const code = couponCode.toUpperCase().trim();
        setCouponError('');
        setCouponSuccess('');

        if (!code) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsValidatingCoupon(true);

        try {
            const response = await fetch('/api/discounts/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    subtotal,
                    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.valid) {
                setCouponError(data.error || 'Invalid coupon code');
                return;
            }

            // Store the validated coupon data
            setAppliedCoupon({
                code: data.discount.code,
                type: data.discount.type,
                value: data.discount.value,
            });

            setCouponSuccess(
                data.discount.type === 'percent'
                    ? `${data.discount.value}% discount applied!`
                    : `${formatPriceSimple(data.discount.value)} discount applied!`
            );
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Failed to validate coupon. Please try again.');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponSuccess('');
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white">
            <Seo title="Cart | Trusser" canonicalPath="/cart" noindex />
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                    {/* Page Header */}
                    <AnimatedSection className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A3C27] mb-2">
                                    Your <span className="text-[#C1A17C]">Cart</span>
                                </h1>
                                <p className="text-[#5C5C5C]">
                                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                            <Link to="/shop">
                                <Button variant="outline" className="rounded-full border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </AnimatedSection>

                    {cartItems.length > 0 ? (
                        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item, index) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Trust Badges */}
                                <AnimatedSection delay={0.3}>
                                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#E8DFD4]">
                                        {[
                                            { icon: Truck, label: 'Free Shipping', desc: getCurrency() === 'USD' ? 'On orders $24+' : 'On orders ₹2000+' },
                                            { icon: Shield, label: 'Secure Payment', desc: '100% Protected' },
                                            { icon: RotateCcw, label: 'Easy Returns', desc: '7 Days Policy' },
                                        ].map((badge, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ y: -2 }}
                                                className="text-center p-4 rounded-xl bg-white border border-[#E8DFD4]"
                                            >
                                                <badge.icon className="w-6 h-6 mx-auto text-[#C1A17C] mb-2" />
                                                <p className="font-medium text-[#1A3C27] text-sm">{badge.label}</p>
                                                <p className="text-xs text-[#5C5C5C]">{badge.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </AnimatedSection>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <AnimatedSection delay={0.2}>
                                    <div className="sticky top-32 bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-[#E8DFD4]">
                                        <h2 className="font-serif text-2xl text-[#1A3C27] mb-6">Order Summary</h2>

                                        {/* Coupon Code */}
                                        <div className="mb-6">
                                            <label className="flex items-center gap-2 text-sm font-medium text-[#1A3C27] mb-2">
                                                <Tag className="w-4 h-4 text-[#C1A17C]" />
                                                Apply Coupon
                                            </label>
                                            {appliedCoupon ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                                                    </div>
                                                    <button
                                                        onClick={removeCoupon}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        placeholder="Enter code"
                                                        className="flex-1 px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#C1A17C] focus:outline-none transition-colors uppercase placeholder:normal-case placeholder:text-[#5C5C5C]/50"
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={applyCoupon}
                                                        disabled={isValidatingCoupon}
                                                        className="px-5 py-3 bg-[#1A3C27] text-white rounded-xl hover:bg-[#2D5F3F] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isValidatingCoupon ? 'Validating...' : 'Apply'}
                                                    </motion.button>
                                                </div>
                                            )}
                                            {couponError && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-red-500 text-sm mt-2"
                                                >
                                                    {couponError}
                                                </motion.p>
                                            )}
                                            {couponSuccess && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-green-600 text-sm mt-2"
                                                >
                                                    {couponSuccess}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Price Breakdown */}
                                        <div className="space-y-3 py-6 border-t border-b border-[#E8DFD4]">
                                            <div className="flex justify-between text-[#5C5C5C]">
                                                <span>Subtotal</span>
                                                <span>{formatPriceSimple(subtotal)}</span>
                                            </div>
                                            {discount > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="flex justify-between text-green-600"
                                                >
                                                    <span>Discount</span>
                                                    <span>-{formatPriceSimple(discount)}</span>
                                                </motion.div>
                                            )}
                                            <div className="flex justify-between text-[#5C5C5C]">
                                                <span>Shipping</span>
                                                <span className={shipping === 0 ? 'text-green-600' : ''}>
                                                    {shipping === 0 ? 'FREE' : formatPriceSimple(shipping)}
                                                </span>
                                            </div>
                                            {subtotal < shippingThreshold && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-xs text-[#C1A17C]"
                                                >
                                                    Add {formatPriceSimple(shippingThreshold - subtotal)} more for free shipping!
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center py-6">
                                            <span className="font-serif text-xl text-[#1A3C27]">Total</span>
                                            <motion.span
                                                key={total}
                                                initial={{ scale: 1.1 }}
                                                animate={{ scale: 1 }}
                                                className="font-serif text-3xl text-[#1A3C27]"
                                            >
                                                {formatPriceSimple(total)}
                                            </motion.span>
                                        </div>

                                        {/* Checkout Button */}
                                        <Link to="/checkout" state={{ items: cartItems }}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-4 bg-gradient-to-r from-[#1A3C27] to-[#2D5F3F] text-white rounded-full font-semibold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                                            >
                                                Proceed to Checkout
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.button>
                                        </Link>

                                        {/* Gift Option */}
                                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#C1A17C]/10 to-[#D4B995]/10 border border-[#C1A17C]/30">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-5 h-5 rounded border-2 border-[#C1A17C] peer-checked:bg-[#C1A17C] peer-checked:border-[#C1A17C] flex items-center justify-center transition-colors">
                                                    <CheckCircle2 className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Gift className="w-5 h-5 text-[#C1A17C]" />
                                                    <span className="text-sm text-[#1A3C27] font-medium">This is a gift</span>
                                                </div>
                                            </label>
                                            <p className="text-xs text-[#5C5C5C] mt-2 ml-8">
                                                We'll include a handwritten card with your message
                                            </p>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            </div>
                        </div>
                    ) : (
                        /* Empty Cart State */
                        <AnimatedSection className="text-center py-20">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-32 h-32 mx-auto mb-8 rounded-full bg-[#F4EFEC] flex items-center justify-center"
                            >
                                <ShoppingBag className="w-16 h-16 text-[#C1A17C]" />
                            </motion.div>
                            <h2 className="font-serif text-3xl text-[#1A3C27] mb-4">Your cart is empty</h2>
                            <p className="text-[#5C5C5C] max-w-md mx-auto mb-8">
                                Looks like you haven't added anything to your cart yet.
                                Explore our sustainable collections and find something you love!
                            </p>
                            <Link to="/shop">
                                <Button className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-full px-10 py-5 text-lg font-semibold">
                                    Start Shopping
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </AnimatedSection>
                    )}

                    {/* ═══════════════════════════════════════════════════════════════════════════
                        FREQUENTLY BOUGHT TOGETHER
                    ═══════════════════════════════════════════════════════════════════════════ */}
                    {cartItems.length > 0 && (
                        <section className="mt-20 lg:mt-32">
                            <AnimatedSection>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-[#C1A17C] mb-2">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="font-bold tracking-[0.2em] text-sm uppercase">You May Also Like</span>
                                        </div>
                                        <h2 className="font-serif text-3xl md:text-4xl text-[#1A3C27]">
                                            Frequently Bought <span className="text-[#C1A17C]">Together</span>
                                        </h2>
                                    </div>
                                    <Link to="/shop" className="hidden md:flex items-center gap-2 text-[#1A3C27] font-medium hover:text-[#C1A17C] transition-colors">
                                        View All
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </AnimatedSection>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                {frequentlyBoughtTogether.map((product, index) => (
                                    <ProductSuggestionCard key={product.id} product={product} index={index} />
                                ))}
                            </div>

                            {/* Bundle Deal Banner */}
                            <AnimatedSection delay={0.4} className="mt-12">
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A3C27] to-[#2D5F3F] p-8 md:p-12"
                                >
                                    {/* Background decorations */}
                                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C1A17C]/20 blur-[80px]" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-[60px]" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-[#C1A17C] text-[#1A3C27] text-sm font-bold rounded-full mb-4">
                                                BUNDLE & SAVE 30%
                                            </span>
                                            <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
                                                Create Your Perfect Gift Set
                                            </h3>
                                            <p className="text-white/70 max-w-md">
                                                Combine any 3 items from your cart with our bestsellers and save 30% on your entire order.
                                            </p>
                                        </div>
                                        <Button className="bg-white text-[#1A3C27] hover:bg-[#C1A17C] rounded-full px-8 py-4 font-semibold whitespace-nowrap">
                                            Build Bundle
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            </AnimatedSection>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};
