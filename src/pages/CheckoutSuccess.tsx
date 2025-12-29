import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    Clock,
    Package,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { formatPriceSimple } from '../utils/currency';
import { clearCart } from '../utils/cart';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type OrderItem = {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

type OrderPayload = {
    id: string;
    orderNumber: string;
    createdAt: string;
    customer: {
        fullName: string;
        username: string;
        email: string;
        phone: string;
    };
    shipping: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        instructions?: string;
    };
    items: OrderItem[];
    pricing: {
        subtotal: number;
        shipping: number;
        taxes: number;
        total: number;
    };
    payment: {
        method: 'razorpay' | 'cod';
        status: 'pending' | 'paid' | 'failed';
        providerOrderId?: string;
    };
    invoice?: {
        requested: boolean;
        gstNumber?: string;
    };
};

export const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<OrderPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const clearedRef = useRef(false);

    useEffect(() => {
        if (!orderId) {
            setError('Missing order confirmation id.');
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const loadOrder = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/orders/${encodeURIComponent(orderId)}`, {
                    credentials: 'include',
                });
                const payload = await response.json();
                if (!response.ok) {
                    throw new Error(payload?.error ?? 'Unable to load order confirmation.');
                }
                if (isMounted) {
                    setOrder(payload);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Unable to load order confirmation.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            isMounted = false;
        };
    }, [orderId]);

    useEffect(() => {
        if (order && !clearedRef.current) {
            clearCart();
            clearedRef.current = true;
        }
    }, [order]);

    const paymentLabel = useMemo(() => {
        if (!order) {
            return '';
        }
        if (order.payment.method === 'cod') {
            return 'Cash on Delivery';
        }
        return 'Razorpay';
    }, [order]);

    const paymentStatusMessage = useMemo(() => {
        if (!order) {
            return '';
        }
        if (order.payment.method === 'cod') {
            return 'Payment will be collected at delivery.';
        }
        if (order.payment.status === 'paid') {
            return 'Payment confirmed. Your order is being packed.';
        }
        if (order.payment.status === 'failed') {
            return 'Payment failed. Please retry or choose another method.';
        }
        return 'Payment pending. You will receive a confirmation once it is completed.';
    }, [order]);

    return (
        <div className="min-h-screen bg-[#F7F0E8]">
            <Seo title="Order confirmation | Trussers" canonicalPath="/checkout/success" noindex />
            <Navbar />
            <main className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute -top-20 right-10 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(193,161,124,0.55),_transparent_70%)] blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(26,60,39,0.45),_transparent_70%)] blur-3xl" />
                </div>

                <section className="relative py-16">
                    <div className="container mx-auto px-6">
                        {isLoading && (
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-10 text-center text-[#1A3C27] shadow-[0_20px_60px_rgba(26,60,39,0.15)]">
                                <p className="text-sm uppercase tracking-[0.3em] text-[#C1A17C]">Preparing your confirmation</p>
                                <h1 className="mt-4 font-serif text-3xl">Loading your order details...</h1>
                            </div>
                        )}

                        {!isLoading && error && (
                            <div className="rounded-3xl border border-red-200 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(26,60,39,0.12)]">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h1 className="mt-4 font-serif text-3xl text-[#1A3C27]">We could not find that order</h1>
                                <p className="mt-2 text-sm text-[#5C5C5C]">{error}</p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <Link
                                        to="/checkout"
                                        className="rounded-full border border-[#1A3C27] px-6 py-3 text-sm font-semibold text-[#1A3C27]"
                                    >
                                        Return to checkout
                                    </Link>
                                    <Link
                                        to="/shop"
                                        className="rounded-full bg-[#1A3C27] px-6 py-3 text-sm font-semibold text-white"
                                    >
                                        Continue shopping
                                    </Link>
                                </div>
                            </div>
                        )}

                        {!isLoading && order && (
                            <div className="space-y-10">
                                <div className="rounded-[32px] bg-white/85 backdrop-blur border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.15)] p-8 md:p-12">
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A3C27] text-white">
                                                <CheckCircle2 className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-[#C1A17C]">Order confirmed</p>
                                                <h1 className="mt-2 font-serif text-3xl md:text-4xl text-[#1A3C27]">Thank you for your order.</h1>
                                                <p className="mt-2 text-sm text-[#5C5C5C]">We have sent a confirmation to {order.customer.email}.</p>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-[#F4EFEC] px-6 py-4 text-right">
                                            <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Order number</p>
                                            <p className="mt-2 text-2xl font-serif text-[#1A3C27]">{order.orderNumber}</p>
                                            <p className="mt-1 text-xs text-[#5C5C5C]">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="rounded-2xl border border-[#E8DFD4] bg-white/80 p-5">
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#C1A17C]">
                                                <Sparkles className="h-4 w-4" />
                                                Status
                                            </div>
                                            <p className="mt-3 text-lg font-semibold text-[#1A3C27]">Payment {order.payment.status}</p>
                                            <p className="mt-2 text-sm text-[#5C5C5C]">{paymentStatusMessage}</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#E8DFD4] bg-white/80 p-5">
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#C1A17C]">
                                                <Truck className="h-4 w-4" />
                                                Delivery
                                            </div>
                                            <p className="mt-3 text-lg font-semibold text-[#1A3C27]">2-4 business days</p>
                                            <p className="mt-2 text-sm text-[#5C5C5C]">Your parcel is scheduled for express shipping.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#E8DFD4] bg-white/80 p-5">
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#C1A17C]">
                                                <ShieldCheck className="h-4 w-4" />
                                                Support
                                            </div>
                                            <p className="mt-3 text-lg font-semibold text-[#1A3C27]">Priority assistance</p>
                                            <p className="mt-2 text-sm text-[#5C5C5C]">We are here if you need changes or help.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
                                    <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Items</p>
                                                <h2 className="mt-2 font-serif text-2xl text-[#1A3C27]">Order summary</h2>
                                            </div>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4EFEC] px-4 py-2 text-xs text-[#1A3C27]">
                                                <Package className="h-4 w-4" />
                                                {order.items.length} items
                                            </span>
                                        </div>
                                        <div className="mt-6 space-y-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded-2xl border border-[#E8DFD4] overflow-hidden bg-white">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-[#9C8F84]">Item</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-[#1A3C27]">{item.name}</p>
                                                        <p className="text-xs text-[#9C8F84]">Qty {item.quantity}</p>
                                                    </div>
                                                    <div className="text-sm font-semibold text-[#1A3C27]">
                                                        {formatPriceSimple(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 space-y-2 text-sm text-[#5C5C5C]">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{formatPriceSimple(order.pricing.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipping</span>
                                                <span>{order.pricing.shipping === 0 ? 'FREE' : formatPriceSimple(order.pricing.shipping)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Taxes</span>
                                                <span>{formatPriceSimple(order.pricing.taxes)}</span>
                                            </div>
                                            <div className="flex justify-between text-[#1A3C27] font-semibold">
                                                <span>Total</span>
                                                <span>{formatPriceSimple(order.pricing.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Shipping</p>
                                                    <h2 className="mt-2 font-serif text-2xl text-[#1A3C27]">Delivery address</h2>
                                                </div>
                                                <BadgeCheck className="h-6 w-6 text-[#1A3C27]" />
                                            </div>
                                            <div className="mt-4 text-sm text-[#5C5C5C]">
                                                <p className="font-semibold text-[#1A3C27]">{order.customer.fullName}</p>
                                                <p>{order.shipping.address1}</p>
                                                {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                                                <p>
                                                    {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                                                </p>
                                                <p>{order.shipping.country}</p>
                                                {order.invoice?.requested && order.invoice.gstNumber && (
                                                    <p className="mt-2 text-xs text-[#9C8F84]">GSTIN: {order.invoice.gstNumber}</p>
                                                )}
                                                {order.shipping.instructions && (
                                                    <p className="mt-2 text-xs text-[#9C8F84]">Instructions: {order.shipping.instructions}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-3xl bg-[#1A3C27] text-white p-6 md:p-8 shadow-[0_20px_60px_rgba(26,60,39,0.3)]">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Payment</p>
                                                    <h2 className="mt-2 font-serif text-2xl">{paymentLabel}</h2>
                                                </div>
                                                <Clock className="h-6 w-6 text-white/80" />
                                            </div>
                                            <p className="mt-4 text-sm text-white/80">{paymentStatusMessage}</p>
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <Link
                                                    to="/shop"
                                                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1A3C27]"
                                                >
                                                    Continue shopping
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    to="/cart"
                                                    className="inline-flex items-center gap-2 rounded-full border border-white/50 px-5 py-2 text-sm font-semibold text-white"
                                                >
                                                    View cart
                                                </Link>
                                            </div>
                                        </div>

                                        {order.invoice?.requested && (
                                            <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">GST Invoice</p>
                                                        <h2 className="mt-2 font-serif text-2xl text-[#1A3C27]">Invoice details</h2>
                                                    </div>
                                                    <BadgeCheck className="h-6 w-6 text-[#1A3C27]" />
                                                </div>
                                                <div className="mt-4 text-sm text-[#5C5C5C] space-y-2">
                                                    <p className="font-semibold text-[#1A3C27]">NAUTICREW ECO PRODUCTS PRIVATE LIMITED</p>
                                                    <p>No 5, 12th Cross Road, Cubbonpet</p>
                                                    <p>Bengaluru - 560002, Karnataka, India</p>
                                                    <p>GSTIN: 29AAJCN7013J1Z6</p>
                                                    <p>Place of Supply: Karnataka (29)</p>
                                                    <p>Contact: +91 9008138404</p>
                                                    <p>Email: info@trusser.in</p>
                                                    {order.invoice?.gstNumber && (
                                                        <p className="mt-2 text-xs text-[#9C8F84]">Customer GSTIN: {order.invoice.gstNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};
