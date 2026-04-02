import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Banknote,
    CheckCircle2,
    Coins,
    CreditCard,
    Landmark,
    Loader2,
    Mail,
    MapPin,
    Package,
    Phone,
    QrCode,
    ShieldCheck,
    Sparkles,
    Tag,
    Truck,
    User,
    Wallet,
    X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';
import { formatPriceSimple } from '../utils/currency';
import { getCartItems, subscribeToCart } from '../utils/cart';
import { fetchAccount, getCachedAccount, subscribeToAccount } from '../utils/accountApi';
import type { AccountProfile } from '../utils/accountApi';

type LineItem = {
    id: number | string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
};

type CheckoutFormValues = {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    instructions: string;
    billingSameAsShipping: boolean;
    saveDetails: boolean;
    wantInvoice: boolean;
    gstNumber: string;
};

type CheckoutLocationState = {
    items?: LineItem[];
};

type RazorpayPaymentAction = {
    kind: 'razorpay';
    status: 'ready' | 'unconfigured';
    keyId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
};

type RazorpaySuccessResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
};

type RazorpayFailedResponse = {
    error?: {
        description?: string;
        reason?: string;
    };
};

type RazorpayInstance = {
    open: () => void;
    on?: (event: 'payment.failed', handler: (resp: RazorpayFailedResponse) => void) => void;
};

type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    modal?: {
        ondismiss: () => void;
    };
    handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
    theme?: {
        color?: string;
    };
};

type RazorpayCtor = new (options: RazorpayOptions) => RazorpayInstance;

const loadScriptOnce = (src: string) =>
    new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
        if (existing) {
            if (existing.getAttribute('data-loaded') === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load payment SDK.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => {
            script.setAttribute('data-loaded', 'true');
            resolve();
        });
        script.addEventListener('error', () => reject(new Error('Failed to load payment SDK.')));
        document.body.appendChild(script);
    });

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const createEmptyForm = (): CheckoutFormValues => ({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    instructions: '',
    billingSameAsShipping: true,
    saveDetails: false,
    wantInvoice: false,
    gstNumber: '',
});

export const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
    const [formValues, setFormValues] = useState<CheckoutFormValues>(createEmptyForm);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [storedItems, setStoredItems] = useState(() => getCartItems());
    const [account, setAccount] = useState<AccountProfile | null>(() => getCachedAccount());
    const [useGuestCheckout, setUseGuestCheckout] = useState(false);
    const [hasPrefilled, setHasPrefilled] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const stateItems = (location.state as CheckoutLocationState | null)?.items;
    const lineItems = useMemo<LineItem[]>(() => {
        const sourceItems = Array.isArray(stateItems) && stateItems.length > 0 ? stateItems : storedItems;
        return sourceItems
            .map((item, index) => {
                const rawId = Number(item.id ?? index + 1);
                const rawPrice =
                    typeof item.price === 'number'
                        ? item.price
                        : Number(String(item.price ?? 0).replace(/[₹$,\s]/g, ''));
                const rawQuantity = Number(item.quantity ?? 1);
                return {
                    id: Number.isFinite(rawId) ? rawId : index + 1,
                    name: item.name ?? 'Item',
                    image: item.image ?? '',
                    price: Number.isFinite(rawPrice) ? rawPrice : 0,
                    quantity: Number.isFinite(rawQuantity) ? rawQuantity : 1,
                    size: item.size,
                };
            })
            .filter((item) => Number.isFinite(item.price) && Number.isFinite(item.quantity) && item.quantity > 0);
    }, [stateItems, storedItems]);

    useEffect(() => {
        setStoredItems(getCartItems());
        return subscribeToCart((items) => setStoredItems(items));
    }, []);

    useEffect(() => {
        fetchAccount().then((next) => setAccount(next));
        return subscribeToAccount((next) => setAccount(next));
    }, []);

    useEffect(() => {
        setHasPrefilled(false);
    }, [account?.id, useGuestCheckout]);

    useEffect(() => {
        if (!account || useGuestCheckout || hasPrefilled) {
            return;
        }

        const primaryAddress = account.addresses?.[0];
        const savedGst = account.gstNumber || '';
        setFormValues((prev) => ({
            ...prev,
            fullName: prev.fullName || account.fullName,
            username: prev.username || account.username,
            email: prev.email || account.email,
            phone: prev.phone || account.phone,
            address1: prev.address1 || primaryAddress?.address1 || '',
            address2: prev.address2 || primaryAddress?.address2 || '',
            city: prev.city || primaryAddress?.city || '',
            state: prev.state || primaryAddress?.state || '',
            pincode: prev.pincode || primaryAddress?.pincode || '',
            country: prev.country || primaryAddress?.country || 'India',
            instructions: prev.instructions || primaryAddress?.instructions || '',
            gstNumber: prev.gstNumber || savedGst,
            // Auto-enable GST invoice if user has saved GSTIN
            wantInvoice: prev.wantInvoice || Boolean(savedGst),
        }));
        setHasPrefilled(true);
    }, [account, hasPrefilled, useGuestCheckout]);

    const pricing = useMemo(() => {
        const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percent') {
                discount = Math.round(subtotal * (appliedCoupon.value / 100));
            } else {
                discount = appliedCoupon.value;
            }
        }
        const shipping = subtotal > 3000 ? 0 : lineItems.length > 0 ? 199 : 0;
        const taxes = Math.round(subtotal * 0.12);
        const total = subtotal - discount + shipping + taxes;
        return { subtotal, discount, shipping, taxes, total };
    }, [lineItems, appliedCoupon]);

    const updateField = <K extends keyof CheckoutFormValues>(field: K, value: CheckoutFormValues[K]) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateForm = (values: CheckoutFormValues) => {
        const errors: Partial<Record<keyof CheckoutFormValues, string>> = {};
        const username = values.username.trim();
        const email = values.email.trim();
        const phoneDigits = values.phone.replace(/\D/g, '');
        const pincodeDigits = values.pincode.replace(/\D/g, '');

        if (!values.fullName.trim()) {
            errors.fullName = 'Full name is required.';
        }
        const requireUsername = Boolean(account && !useGuestCheckout);
        if (requireUsername && !username) {
            errors.username = 'Username is required.';
        } else if (username && username.length < 3) {
            errors.username = 'Username should be at least 3 characters.';
        }
        if (!email) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Enter a valid email address.';
        }
        if (!values.phone.trim()) {
            errors.phone = 'Phone number is required.';
        } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
            errors.phone = 'Enter a valid phone number.';
        }
        if (!values.address1.trim()) {
            errors.address1 = 'Street address is required.';
        }
        if (!values.city.trim()) {
            errors.city = 'City is required.';
        }
        if (!values.state.trim()) {
            errors.state = 'State is required.';
        }
        if (!values.pincode.trim()) {
            errors.pincode = 'Pincode is required.';
        } else if (pincodeDigits.length !== 6) {
            errors.pincode = 'Pincode must be 6 digits.';
        }
        if (!values.country.trim()) {
            errors.country = 'Country is required.';
        }
        if (values.wantInvoice) {
            const gstin = values.gstNumber.trim().toUpperCase();
            if (!gstin) {
                errors.gstNumber = 'GSTIN is required for invoices.';
            } else if (!/^[0-9A-Z]{15}$/.test(gstin)) {
                errors.gstNumber = 'GSTIN must be 15 alphanumeric characters.';
            }
        }

        return errors;
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
            const response = await fetch(`${apiBaseUrl}/api/discounts/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    subtotal: pricing.subtotal,
                    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (lineItems.length === 0) {
            setSubmitError('Your cart is empty. Add items before checkout.');
            return;
        }

        const errors = validateForm(formValues);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSubmitError('Please fix the highlighted fields.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    customer: {
                        fullName: formValues.fullName,
                        username: formValues.username,
                        email: formValues.email,
                        phone: formValues.phone,
                    },
                    shipping: {
                        address1: formValues.address1,
                        address2: formValues.address2,
                        city: formValues.city,
                        state: formValues.state,
                        pincode: formValues.pincode,
                        country: formValues.country,
                        instructions: formValues.instructions,
                    },
                    items: lineItems,
                    paymentMethod,
                    invoice: {
                        requested: formValues.wantInvoice,
                        gstNumber: formValues.wantInvoice ? formValues.gstNumber.trim().toUpperCase() : undefined,
                    },
                    couponCode: appliedCoupon?.code,
                    guestCheckout: useGuestCheckout,
                }),
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error ?? 'Unable to create order.');
            }

            const order = payload?.order;
            const orderId = order?.id ?? payload?.id;
            if (!orderId || typeof orderId !== 'string') {
                throw new Error('Order created, but no confirmation id returned.');
            }

            if (paymentMethod === 'cod') {
                navigate(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
                return;
            }

            const paymentAction = payload?.paymentAction as RazorpayPaymentAction | undefined;
            if (!paymentAction || paymentAction.kind !== 'razorpay') {
                throw new Error('Razorpay is unavailable right now. Please try again or use Cash on Delivery.');
            }
            if (paymentAction.status !== 'ready' || !paymentAction.keyId || !paymentAction.orderId) {
                throw new Error('Razorpay is not configured. Please use Cash on Delivery for now.');
            }

            await loadScriptOnce('https://checkout.razorpay.com/v1/checkout.js');
            const RazorpayConstructor = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
            if (!RazorpayConstructor) {
                throw new Error('Unable to start Razorpay checkout. Please refresh and try again.');
            }

            await new Promise<void>((resolve, reject) => {
                let settled = false;
                const settle = (fn: () => void) => {
                    if (settled) return;
                    settled = true;
                    fn();
                };

                const markFailed = async (reason: string) => {
                    try {
                        await fetch(`${apiBaseUrl}/api/checkout/razorpay/fail`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ orderId, reason }),
                        });
                    } catch {
                        void 0;
                    }
                };

                const options: RazorpayOptions = {
                    key: paymentAction.keyId!,
                    amount: paymentAction.amount ?? 0,
                    currency: paymentAction.currency ?? 'INR',
                    name: 'Trusser',
                    description: `Order ${order?.orderNumber ?? ''}`.trim(),
                    order_id: paymentAction.orderId!,
                    prefill: {
                        name: formValues.fullName,
                        email: formValues.email,
                        contact: formValues.phone,
                    },
                    notes: {
                        internal_order_id: orderId,
                    },
                    modal: {
                        ondismiss: () => {
                            void markFailed('cancelled');
                            settle(() => reject(new Error('Payment cancelled.')));
                        },
                    },
                    handler: async (response: RazorpaySuccessResponse) => {
                        try {
                            const confirmResponse = await fetch(`${apiBaseUrl}/api/checkout/razorpay/confirm`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    orderId,
                                    razorpayPaymentId: response?.razorpay_payment_id,
                                    razorpayOrderId: response?.razorpay_order_id,
                                    razorpaySignature: response?.razorpay_signature,
                                }),
                            });
                            const confirmPayload = await confirmResponse.json();
                            if (!confirmResponse.ok) {
                                throw new Error(confirmPayload?.error ?? 'Payment verification failed.');
                            }
                            navigate(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
                            settle(() => resolve());
                        } catch (err) {
                            settle(() => reject(err instanceof Error ? err : new Error('Payment verification failed.')));
                        }
                    },
                    theme: {
                        color: '#1A3C27',
                    },
                };

                const razorpay = new RazorpayConstructor(options);
                if (typeof razorpay?.on === 'function') {
                    razorpay.on('payment.failed', (resp: RazorpayFailedResponse) => {
                        void markFailed(resp?.error?.reason ?? 'payment_failed');
                        settle(() =>
                            reject(new Error(resp?.error?.description ?? 'Payment failed. Please try again or use Cash on Delivery.')),
                        );
                    });
                }
                razorpay.open();
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClass = 'w-full rounded-2xl px-4 py-3 text-[#1A3C27] placeholder:text-[#9C8F84] bg-[#FBF8F4] focus:outline-none focus:ring-2';
    const inputClass = (hasError: boolean) =>
        `${inputBaseClass} ${hasError ? 'border border-red-400 focus:ring-red-200' : 'border border-[#E8DFD4] focus:ring-[#C1A17C]/30'}`;
    const usernameLabel = account && !useGuestCheckout ? 'Username' : 'Username (optional)';

    return (
        <div className="min-h-screen bg-[#F7F0E8]">
            <Seo title="Checkout | Trusser" canonicalPath="/checkout" noindex />
            <Navbar />
            <main className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute -top-32 -left-28 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(193,161,124,0.6),_transparent_65%)] blur-3xl" />
                    <div className="absolute top-40 -right-24 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(26,60,39,0.45),_transparent_65%)] blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent_70%)]" />
                </div>

                <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-12">
                    <div className="container mx-auto px-6">
                        <AnimatedSection>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur border border-white/60 shadow-sm text-sm text-[#1A3C27]">
                                <Sparkles className="w-4 h-4 text-[#C1A17C]" />
                                Secure checkout with verified payments
                            </div>
                        </AnimatedSection>
                        <AnimatedSection delay={0.1}>
                            <h1 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A3C27] leading-tight">
                                Finish your order in style.
                                <span className="block text-[#C1A17C]">Luxury checkout, zero friction.</span>
                            </h1>
                        </AnimatedSection>
                        <AnimatedSection delay={0.2} className="mt-6">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C5C5C]">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#1A3C27]" />
                                    100% secure payments
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#1A3C27]" />
                                    Express delivery in 2-4 days
                                </div>
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className="w-4 h-4 text-[#1A3C27]" />
                                    Verified eco-friendly packaging
                                </div>
                            </div>
                        </AnimatedSection>

                        <AnimatedSection delay={0.25} className="mt-10">
                            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-[#1A3C27]">
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#C1A17C]" />
                                    Cart
                                </span>
                                <span className="h-px w-16 bg-[#C1A17C]/40" />
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="w-3 h-3 rounded-full bg-[#1A3C27]" />
                                    Checkout
                                </span>
                                <span className="h-px w-16 bg-[#C1A17C]/40" />
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#C1A17C]/40" />
                                    Pay
                                </span>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>

                <section className="relative pb-20">
                    <div className="container mx-auto px-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
                            <div className="space-y-8">
                                <AnimatedSection>
                                    <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                        {account ? (
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Account</p>
                                                    <h2 className="font-serif text-2xl text-[#1A3C27] mt-2">
                                                        Checkout as {account.fullName}
                                                    </h2>
                                                    <p className="mt-2 text-sm text-[#5C5C5C]">
                                                        Saved details will be applied automatically unless you switch to guest checkout.
                                                    </p>
                                                </div>
                                                <label className="flex items-center gap-3 rounded-full border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm text-[#1A3C27]">
                                                    <input
                                                        type="checkbox"
                                                        checked={useGuestCheckout}
                                                        onChange={(event) => setUseGuestCheckout(event.target.checked)}
                                                        className="h-4 w-4 rounded border-[#C1A17C] text-[#1A3C27]"
                                                    />
                                                    Use guest checkout
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Guest checkout</p>
                                                    <h2 className="font-serif text-2xl text-[#1A3C27] mt-2">Continue without signing in</h2>
                                                    <p className="mt-2 text-sm text-[#5C5C5C]">
                                                        Sign in to save addresses and see your order history.
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/account/login"
                                                    className="rounded-full border border-[#1A3C27] px-5 py-2 text-sm font-semibold text-[#1A3C27]"
                                                >
                                                    Sign in
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection>
                                    <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-6 md:p-10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Contact</p>
                                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C27] mt-2">Personal details</h2>
                                            </div>
                                            <div className="hidden md:flex items-center gap-2 text-xs text-[#1A3C27] bg-[#F7F0E8] px-4 py-2 rounded-full">
                                                <User className="w-4 h-4" />
                                                Verified customer
                                            </div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">Full name</span>
                                                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${formErrors.fullName ? 'border border-red-400 bg-white' : 'border border-[#E8DFD4] bg-[#FBF8F4]'}`}>
                                                    <User className="w-5 h-5 text-[#C1A17C]" />
                                                    <input
                                                        type="text"
                                                        placeholder="Maitri"
                                                        value={formValues.fullName}
                                                        onChange={(event) => updateField('fullName', event.target.value)}
                                                        className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                                        aria-invalid={Boolean(formErrors.fullName)}
                                                    />
                                                </div>
                                                {formErrors.fullName && <p className="text-xs text-red-600">{formErrors.fullName}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">{usernameLabel}</span>
                                                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${formErrors.username ? 'border border-red-400 bg-white' : 'border border-[#E8DFD4] bg-[#FBF8F4]'}`}>
                                                    <BadgeCheck className="w-5 h-5 text-[#C1A17C]" />
                                                    <input
                                                        type="text"
                                                        placeholder="@aaravgifts"
                                                        value={formValues.username}
                                                        onChange={(event) => updateField('username', event.target.value)}
                                                        className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                                        aria-invalid={Boolean(formErrors.username)}
                                                    />
                                                </div>
                                                {formErrors.username && <p className="text-xs text-red-600">{formErrors.username}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">Email</span>
                                                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${formErrors.email ? 'border border-red-400 bg-white' : 'border border-[#E8DFD4] bg-[#FBF8F4]'}`}>
                                                    <Mail className="w-5 h-5 text-[#C1A17C]" />
                                                    <input
                                                        type="email"
                                                        placeholder="maitri@trusser.in"
                                                        value={formValues.email}
                                                        onChange={(event) => updateField('email', event.target.value)}
                                                        className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                                        aria-invalid={Boolean(formErrors.email)}
                                                    />
                                                </div>
                                                {formErrors.email && <p className="text-xs text-red-600">{formErrors.email}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">Phone</span>
                                                <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${formErrors.phone ? 'border border-red-400 bg-white' : 'border border-[#E8DFD4] bg-[#FBF8F4]'}`}>
                                                    <Phone className="w-5 h-5 text-[#C1A17C]" />
                                                    <input
                                                        type="tel"
                                                        placeholder="+91 9008138404"
                                                        value={formValues.phone}
                                                        onChange={(event) => updateField('phone', event.target.value)}
                                                        className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                                        aria-invalid={Boolean(formErrors.phone)}
                                                    />
                                                </div>
                                                {formErrors.phone && <p className="text-xs text-red-600">{formErrors.phone}</p>}
                                            </label>
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection delay={0.1}>
                                    <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-6 md:p-10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Delivery</p>
                                                <h2 className="font-serif text-2xl md:text-3xl text-[#1A3C27] mt-2">Shipping address</h2>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-[#1A3C27] bg-[#F7F0E8] px-4 py-2 rounded-full">
                                                <MapPin className="w-4 h-4" />
                                                Deliver to doorstep
                                            </div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <label className="space-y-2 md:col-span-2">
                                                <span className="text-sm text-[#1A3C27]">Street address</span>
                                                <input
                                                    type="text"
                                                    placeholder="18, Park Avenue, Green Street"
                                                    value={formValues.address1}
                                                    onChange={(event) => updateField('address1', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.address1))}
                                                    aria-invalid={Boolean(formErrors.address1)}
                                                />
                                                {formErrors.address1 && <p className="text-xs text-red-600">{formErrors.address1}</p>}
                                            </label>
                                            <label className="space-y-2 md:col-span-2">
                                                <span className="text-sm text-[#1A3C27]">Apartment, suite, landmark</span>
                                                <input
                                                    type="text"
                                                    placeholder="Near Lotus Mall, Floor 4"
                                                    value={formValues.address2}
                                                    onChange={(event) => updateField('address2', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.address2))}
                                                    aria-invalid={Boolean(formErrors.address2)}
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">City</span>
                                                <input
                                                    type="text"
                                                    placeholder="Pune"
                                                    value={formValues.city}
                                                    onChange={(event) => updateField('city', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.city))}
                                                    aria-invalid={Boolean(formErrors.city)}
                                                />
                                                {formErrors.city && <p className="text-xs text-red-600">{formErrors.city}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">State</span>
                                                <input
                                                    type="text"
                                                    placeholder="Maharashtra"
                                                    value={formValues.state}
                                                    onChange={(event) => updateField('state', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.state))}
                                                    aria-invalid={Boolean(formErrors.state)}
                                                />
                                                {formErrors.state && <p className="text-xs text-red-600">{formErrors.state}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">Pincode</span>
                                                <input
                                                    type="text"
                                                    placeholder="411001"
                                                    value={formValues.pincode}
                                                    onChange={(event) => updateField('pincode', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.pincode))}
                                                    aria-invalid={Boolean(formErrors.pincode)}
                                                />
                                                {formErrors.pincode && <p className="text-xs text-red-600">{formErrors.pincode}</p>}
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm text-[#1A3C27]">Country</span>
                                                <input
                                                    type="text"
                                                    placeholder="India"
                                                    value={formValues.country}
                                                    onChange={(event) => updateField('country', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.country))}
                                                    aria-invalid={Boolean(formErrors.country)}
                                                />
                                                {formErrors.country && <p className="text-xs text-red-600">{formErrors.country}</p>}
                                            </label>
                                            <label className="space-y-2 md:col-span-2">
                                                <span className="text-sm text-[#1A3C27]">Delivery instructions</span>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Leave at security desk. Call on arrival."
                                                    value={formValues.instructions}
                                                    onChange={(event) => updateField('instructions', event.target.value)}
                                                    className={inputClass(Boolean(formErrors.instructions))}
                                                    aria-invalid={Boolean(formErrors.instructions)}
                                                />
                                            </label>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { icon: Package, title: 'Gift wrap', value: 'Premium finish' },
                                                { icon: Truck, title: 'Delivery', value: '2-4 business days' },
                                                { icon: ShieldCheck, title: 'Protection', value: 'Insured shipment' },
                                            ].map((item) => (
                                                <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-white/70 px-4 py-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F4EFEC] flex items-center justify-center">
                                                        <item.icon className="w-5 h-5 text-[#1A3C27]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-[#9C8F84] uppercase tracking-[0.2em]">{item.title}</p>
                                                        <p className="text-sm text-[#1A3C27] font-medium">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection delay={0.15}>
                                    <div className="rounded-3xl bg-gradient-to-br from-[#1A3C27] via-[#244C34] to-[#2D5F3F] text-white p-6 md:p-8 shadow-[0_35px_90px_rgba(26,60,39,0.35)]">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Reward</p>
                                                <h3 className="font-serif text-2xl md:text-3xl">You are 1 step away from elite perks</h3>
                                            </div>
                                            <button className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold hover:bg-white/20 transition" type="button">
                                                Unlock benefits
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Priority support
                                            </span>
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Free personalization
                                            </span>
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                                                <CheckCircle2 className="w-4 h-4" />
                                                VIP launch access
                                            </span>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            </div>

                            <div className="space-y-8">
                                <AnimatedSection>
                                    <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Order</p>
                                                <h2 className="font-serif text-2xl text-[#1A3C27] mt-2">Summary</h2>
                                            </div>
                                            <Link to="/cart" className="text-sm text-[#1A3C27] hover:text-[#C1A17C] flex items-center gap-1">
                                                <ArrowLeft className="w-4 h-4" />
                                                Edit cart
                                            </Link>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            {lineItems.map((item) => (
                                                <div key={item.id} className="flex gap-4 items-center">
                                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#E8DFD4]">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#1A3C27] text-white text-xs flex items-center justify-center">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-[#1A3C27] font-medium">
                                                            {item.name}
                                                            {item.size && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8DFD4] text-xs text-[#5C5C5C]">
                                                                    Size: {item.size}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-[#9C8F84]">{formatPriceSimple(item.price)}</p>
                                                    </div>
                                                    <div className="text-sm text-[#1A3C27] font-semibold">
                                                        {formatPriceSimple(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}
                                            {lineItems.length === 0 && (
                                                <div className="rounded-2xl border border-dashed border-[#E8DFD4] p-6 text-center text-sm text-[#9C8F84]">
                                                    Your cart is empty. Head back to add items.
                                                </div>
                                            )}
                                        </div>

                                        {/* Coupon Code */}
                                        <div className="mt-6 pt-6 border-t border-[#E8DFD4]">
                                            <label className="flex items-center gap-2 text-sm font-medium text-[#1A3C27] mb-3">
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
                                                        type="button"
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
                                                        className="flex-1 px-4 py-3 rounded-xl bg-[#FBF8F4] border-2 border-transparent focus:border-[#C1A17C] focus:outline-none transition-colors uppercase placeholder:normal-case placeholder:text-[#9C8F84]/50"
                                                    />
                                                    <motion.button
                                                        type="button"
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

                                        <div className="mt-6 space-y-3 text-sm text-[#5C5C5C]">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{formatPriceSimple(pricing.subtotal)}</span>
                                            </div>
                                            {pricing.discount > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="flex justify-between text-green-600"
                                                >
                                                    <span>Discount</span>
                                                    <span>-{formatPriceSimple(pricing.discount)}</span>
                                                </motion.div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Shipping</span>
                                                <span className={pricing.shipping === 0 ? 'text-green-600' : ''}>
                                                    {pricing.shipping === 0 ? 'FREE' : formatPriceSimple(pricing.shipping)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Taxes</span>
                                                <span>{formatPriceSimple(pricing.taxes)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between text-[#1A3C27]">
                                            <span className="font-serif text-xl">Total</span>
                                            <span className="font-serif text-2xl">{formatPriceSimple(pricing.total)}</span>
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection delay={0.1}>
                                    <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-6 md:p-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Payment</p>
                                                <h2 className="font-serif text-2xl text-[#1A3C27] mt-2">Choose a method</h2>
                                            </div>
                                            <div className="text-xs text-[#1A3C27] bg-[#F7F0E8] px-3 py-2 rounded-full flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                PCI compliant
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('razorpay')}
                                                className={`w-full text-left rounded-3xl border-2 p-4 transition ${paymentMethod === 'razorpay' ? 'border-[#1A3C27] bg-[#F4EFEC]' : 'border-transparent bg-white/60 hover:border-[#C1A17C]/60'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-[#1A3C27] flex items-center justify-center">
                                                            <Wallet className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#1A3C27]">Razorpay</p>
                                                            <p className="text-xs text-[#5C5C5C]">UPI, cards, EMI, netbanking</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-[#1A3C27] bg-[#1A3C27]' : 'border-[#C1A17C]'}`}>
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#1A3C27]">
                                                    <div className="flex items-center gap-2 bg-white/80 border border-white rounded-2xl px-3 py-2">
                                                        <QrCode className="w-4 h-4 text-[#C1A17C]" />
                                                        UPI instant pay
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white/80 border border-white rounded-2xl px-3 py-2">
                                                        <CreditCard className="w-4 h-4 text-[#C1A17C]" />
                                                        Debit / Credit cards
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white/80 border border-white rounded-2xl px-3 py-2">
                                                        <Coins className="w-4 h-4 text-[#C1A17C]" />
                                                        Easy EMI plans
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white/80 border border-white rounded-2xl px-3 py-2">
                                                        <Landmark className="w-4 h-4 text-[#C1A17C]" />
                                                        Netbanking
                                                    </div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('cod')}
                                                className={`w-full text-left rounded-3xl border-2 p-4 transition ${paymentMethod === 'cod' ? 'border-[#1A3C27] bg-[#F4EFEC]' : 'border-transparent bg-white/60 hover:border-[#C1A17C]/60'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-[#C1A17C] flex items-center justify-center">
                                                            <Banknote className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#1A3C27]">Cash on Delivery</p>
                                                            <p className="text-xs text-[#5C5C5C]">Pay with cash or UPI at your doorstep</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#1A3C27] bg-[#1A3C27]' : 'border-[#C1A17C]'}`}>
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/80 border border-white px-4 py-3 text-xs text-[#1A3C27]">
                                                    <Package className="w-4 h-4 text-[#C1A17C]" />
                                                    COD available for orders below {formatPriceSimple(10000)}
                                                </div>
                                            </button>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-4">
                                            <label className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm text-[#1A3C27]">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-[#C1A17C] text-[#1A3C27]"
                                                    checked={formValues.billingSameAsShipping}
                                                    onChange={(event) => updateField('billingSameAsShipping', event.target.checked)}
                                                />
                                                Billing address same as shipping
                                            </label>
                                            <label className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm text-[#1A3C27]">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-[#C1A17C] text-[#1A3C27]"
                                                    checked={formValues.saveDetails}
                                                    onChange={(event) => updateField('saveDetails', event.target.checked)}
                                                />
                                                Save details for next time
                                            </label>
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] p-4">
                                            <label className="flex items-start gap-3 text-sm text-[#1A3C27]">
                                                <input
                                                    type="checkbox"
                                                    checked={formValues.wantInvoice}
                                                    onChange={(event) => updateField('wantInvoice', event.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-[#C1A17C] text-[#1A3C27]"
                                                />
                                                <div>
                                                    <p className="font-semibold">Request GST invoice</p>
                                                    <p className="text-xs text-[#5C5C5C] mt-1">
                                                        Provide a valid 15-character GSTIN to generate a tax invoice.
                                                    </p>
                                                </div>
                                            </label>
                                            {formValues.wantInvoice && (
                                                <div className="mt-4">
                                                    <input
                                                        type="text"
                                                        value={formValues.gstNumber}
                                                        onChange={(event) => updateField('gstNumber', event.target.value.toUpperCase())}
                                                        placeholder="GSTIN (15 characters)"
                                                        className={inputClass(Boolean(formErrors.gstNumber))}
                                                    />
                                                    {formErrors.gstNumber && (
                                                        <p className="mt-2 text-xs text-red-600">{formErrors.gstNumber}</p>
                                                    )}
                                                    <div className="mt-3 rounded-2xl border border-[#E8DFD4] bg-white/80 p-3 text-xs text-[#5C5C5C]">
                                                        <p className="font-semibold text-[#1A3C27]">Invoice issued by</p>
                                                        <p>NAUTICREW ECO PRODUCTS PRIVATE LIMITED</p>
                                                        <p>No 5, 12th Cross Road, Cubbonpet</p>
                                                        <p>Bengaluru - 560002, Karnataka, India</p>
                                                        <p>GSTIN: 29AAJCN7013J1Z6 · Place of Supply: Karnataka (29)</p>
                                                        <p>Contact: +91 9008138404 · info@trusser.in</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {submitError && (
                                            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                {submitError}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || lineItems.length === 0}
                                            className="mt-8 w-full rounded-full bg-[#1A3C27] py-4 text-white text-lg font-semibold shadow-[0_20px_50px_rgba(26,60,39,0.3)] hover:bg-[#2D5F3F] transition disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            <span className="inline-flex items-center justify-center gap-2">
                                                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                                {isSubmitting ? 'Processing order...' : 'Place order securely'}
                                            </span>
                                        </button>
                                        <p className="mt-4 text-xs text-[#5C5C5C] text-center">
                                            By placing the order, you agree to our terms and confirm you have read our privacy policy.
                                        </p>
                                    </div>
                                </AnimatedSection>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};
