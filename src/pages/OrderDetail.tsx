import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BadgeCheck,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    MapPin,
    Package,
    ShoppingBag,
    Sparkles,
    Truck,
    XCircle,
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import { getCachedAccount, fetchAccount } from '../utils/accountApi';
import type { AccountOrder } from '../utils/accountApi';
import { formatPriceSimple } from '../utils/currency';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type OrderPayload = AccountOrder & {
    pricing?: {
        subtotal: number;
        shipping: number;
        taxes: number;
        total: number;
    };
    payment?: {
        method: 'razorpay' | 'cod';
        status: 'pending' | 'paid' | 'failed';
    };
    customer?: {
        fullName: string;
        email: string;
        phone: string;
    };
    fulfillmentStatus?: string;
    deliveryStatus?: string;
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="h-3.5 w-3.5" /> },
        failed: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
    };
    const { bg, text, icon } = config[status] ?? config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}>
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const FulfillmentBadge = ({ status }: { status?: string }) => {
    if (!status) return null;
    const config: Record<string, { bg: string; text: string }> = {
        fulfilled: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        unfulfilled: { bg: 'bg-slate-100', text: 'text-slate-600' },
        partial: { bg: 'bg-amber-50', text: 'text-amber-700' },
    };
    const { bg, text } = config[status.toLowerCase()] ?? config.unfulfilled;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}>
            <Package className="h-3.5 w-3.5" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export const OrderDetail = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError('Order ID not found.');
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const loadOrder = async () => {
            try {
                // First ensure account is loaded
                const account = getCachedAccount() ?? (await fetchAccount());
                if (!account) {
                    navigate('/account/login');
                    return;
                }

                // Fetch order details from API
                const response = await fetch(`${apiBaseUrl}/api/orders/${encodeURIComponent(orderId)}`, {
                    credentials: 'include',
                });
                const payload = await response.json();
                if (!response.ok) {
                    throw new Error(payload?.error ?? 'Unable to load order details.');
                }
                if (isMounted) {
                    setOrder(payload);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Unable to load order details.');
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
    }, [orderId, navigate]);

    const paymentMethod = order?.payment?.method ?? order?.paymentMethod ?? 'cod';
    const paymentStatus = order?.payment?.status ?? order?.paymentStatus ?? 'pending';
    const pricing = order?.pricing ?? {
        subtotal: order?.total ?? 0,
        shipping: 0,
        taxes: 0,
        total: order?.total ?? 0,
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC]">
            <Seo title={`Order ${order?.orderNumber ?? ''} | Trusser`} canonicalPath="/account/orders" noindex />
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="mx-auto max-w-5xl px-6">
                    {/* Back Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link
                            to="/account"
                            className="inline-flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#1A3C27] transition-colors mb-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to account
                        </Link>
                    </motion.div>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-12 text-center"
                        >
                            <div className="mx-auto w-10 h-10 border-2 border-[#1A3C27] border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-sm text-[#5C5C5C]">Loading order details...</p>
                        </motion.div>
                    )}

                    {!isLoading && error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl bg-white/85 border border-red-200 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-12 text-center"
                        >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h1 className="mt-4 font-serif text-2xl text-[#1A3C27]">Order not found</h1>
                            <p className="mt-2 text-sm text-[#5C5C5C]">{error}</p>
                            <Button
                                onClick={() => navigate('/account')}
                                className="mt-6 rounded-full bg-[#1A3C27] text-white"
                            >
                                Return to account
                            </Button>
                        </motion.div>
                    )}

                    {!isLoading && order && (
                        <div className="space-y-8">
                            {/* Order Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-8"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A3C27] text-white">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-[#C1A17C]">Order</p>
                                                <h1 className="mt-1 font-serif text-3xl md:text-4xl text-[#1A3C27]">
                                                    {order.orderNumber}
                                                </h1>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm text-[#5C5C5C]">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <PaymentStatusBadge status={paymentStatus} />
                                        <FulfillmentBadge status={order.fulfillmentStatus} />
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                                {/* Left Column - Items */}
                                <div className="space-y-6">
                                    {/* Order Items */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Items</p>
                                                <h2 className="mt-1 font-serif text-2xl text-[#1A3C27]">Order summary</h2>
                                            </div>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4EFEC] px-4 py-2 text-xs text-[#1A3C27]">
                                                <Package className="h-4 w-4" />
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {order.items.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                                    className="flex items-center gap-4 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] p-4"
                                                >
                                                    <div className="h-20 w-20 rounded-xl border border-[#E8DFD4] overflow-hidden bg-white flex-shrink-0">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-[#9C8F84]">
                                                                <Package className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-[#1A3C27] truncate">{item.name}</p>
                                                        <p className="mt-1 text-sm text-[#9C8F84]">
                                                            Qty: {item.quantity} × {formatPriceSimple(item.price)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-semibold text-[#1A3C27]">
                                                            {formatPriceSimple(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Pricing Summary */}
                                        <div className="mt-6 pt-6 border-t border-[#E8DFD4] space-y-3">
                                            <div className="flex justify-between text-sm text-[#5C5C5C]">
                                                <span>Subtotal</span>
                                                <span>{formatPriceSimple(pricing.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-[#5C5C5C]">
                                                <span>Shipping</span>
                                                <span>{pricing.shipping === 0 ? 'FREE' : formatPriceSimple(pricing.shipping)}</span>
                                            </div>
                                            {pricing.taxes > 0 && (
                                                <div className="flex justify-between text-sm text-[#5C5C5C]">
                                                    <span>Taxes</span>
                                                    <span>{formatPriceSimple(pricing.taxes)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-lg font-semibold text-[#1A3C27] pt-3 border-t border-[#E8DFD4]">
                                                <span>Total</span>
                                                <span>{formatPriceSimple(pricing.total)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Right Column - Details */}
                                <div className="space-y-6">
                                    {/* Shipping Address */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <MapPin className="h-5 w-5 text-[#C1A17C]" />
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Delivery</p>
                                                <h2 className="font-serif text-xl text-[#1A3C27]">Shipping address</h2>
                                            </div>
                                        </div>
                                        <div className="text-sm text-[#5C5C5C] space-y-1">
                                            {order.customer?.fullName && (
                                                <p className="font-semibold text-[#1A3C27]">{order.customer.fullName}</p>
                                            )}
                                            <p>{order.shipping.address1}</p>
                                            {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                                            <p>
                                                {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                                            </p>
                                            <p>{order.shipping.country}</p>
                                            {order.shipping.instructions && (
                                                <p className="mt-2 text-xs italic text-[#9C8F84]">
                                                    Note: {order.shipping.instructions}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Payment */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="rounded-3xl bg-[#1A3C27] text-white p-6 shadow-[0_20px_60px_rgba(26,60,39,0.3)]"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <CreditCard className="h-5 w-5 text-white/70" />
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Payment</p>
                                                <h2 className="font-serif text-xl text-white">
                                                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            {paymentStatus === 'paid' ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    Payment confirmed
                                                </>
                                            ) : paymentStatus === 'failed' ? (
                                                <>
                                                    <XCircle className="h-4 w-4 text-red-400" />
                                                    Payment failed
                                                </>
                                            ) : paymentMethod === 'cod' ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-amber-400" />
                                                    Pay on delivery
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="h-4 w-4 text-amber-400" />
                                                    Payment pending
                                                </>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* GST Invoice Details */}
                                    {order.invoice?.requested && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.35 }}
                                            className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <BadgeCheck className="h-5 w-5 text-[#C1A17C]" />
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">GST</p>
                                                    <h2 className="font-serif text-xl text-[#1A3C27]">Tax invoice details</h2>
                                                </div>
                                            </div>
                                            <div className="text-sm text-[#5C5C5C] space-y-1">
                                                <p className="font-semibold text-[#1A3C27]">NAUTICREW ECO PRODUCTS PVT LTD</p>
                                                <p>GSTIN: 29AAJCN7013J1Z6</p>
                                                {order.invoice.gstNumber && (
                                                    <p className="mt-2 text-[#1A3C27]">
                                                        Customer GSTIN: {order.invoice.gstNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Download Invoice Button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        <a
                                            href={`${apiBaseUrl}/api/orders/${order.id}/invoice/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-gradient-to-r from-[#C1A17C] to-[#D4B896] px-6 py-4 text-white font-semibold shadow-[0_10px_30px_rgba(193,161,124,0.3)] hover:shadow-[0_15px_40px_rgba(193,161,124,0.4)] transition-all hover:scale-[1.02]"
                                        >
                                            <Download className="h-5 w-5" />
                                            Download Invoice
                                        </a>
                                    </motion.div>

                                    {/* Delivery Status */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.45 }}
                                        className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Truck className="h-5 w-5 text-[#C1A17C]" />
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Delivery</p>
                                                <h2 className="font-serif text-xl text-[#1A3C27]">Expected timeline</h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-[#5C5C5C]">
                                            <Sparkles className="h-4 w-4 text-[#C1A17C]" />
                                            <p>Your order will be delivered within 2-4 business days.</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderDetail;
