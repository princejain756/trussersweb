import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import {
    Gift,
    Palette,
    Truck,
    Users,
    MessageCircle,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Package,
    Heart,
    Star,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react';
import corporateGiftBox from '../assets/corporategiftbox.webp';

// Gift Categories Data
const giftCategories = [
    {
        title: 'Welcome Kits',
        description: 'Curated onboarding essentials for new team members',
        image: '/products/categories/corporate-gift-sets/corporate-gift-sets-3.webp',
        accent: '#C1A17C',
        link: '/shop?category=corporate-gift-sets',
    },
    {
        title: 'Event Hampers',
        description: 'Premium gift boxes for conferences & celebrations',
        image: '/products/categories/festive-bags/festive-bags-1.webp',
        accent: '#4A8B60',
        link: '/shop?category=festive-bags',
    },
    {
        title: 'Festive Collections',
        description: 'Seasonal gifting for Diwali, Christmas & more',
        image: '/products/categories/women-gift-sets/women-gift-sets-1.webp',
        accent: '#D45D48',
        link: '/shop?category=women-gift-sets',
    },
    {
        title: 'Custom Bundles',
        description: 'Fully personalized gift sets with your branding',
        image: '/products/categories/kids-gifts-set/kids-gifts-set-1.webp',
        accent: '#2D5F3F',
        link: '/shop?category=kids-gifts-set',
    },
];

// Process Steps
const processSteps = [
    {
        step: 1,
        title: 'Consultation',
        description: 'Share your vision, budget, and brand guidelines with our gifting experts',
        icon: MessageCircle,
    },
    {
        step: 2,
        title: 'Design & Curation',
        description: 'We curate the perfect sustainable products and create custom mockups',
        icon: Palette,
    },
    {
        step: 3,
        title: 'Production',
        description: 'Your gifts are crafted with care using eco-friendly materials',
        icon: Package,
    },
    {
        step: 4,
        title: 'Delivery',
        description: 'Timely delivery to single or multiple locations across India',
        icon: Truck,
    },
];

// Featured Products
const featuredProducts = [
    { image: '/products/categories/corporate-gift-sets/corporate-gift-sets-3.webp', name: 'Executive Suite' },
    { image: '/products/categories/women-gift-sets/women-gift-sets-2.webp', name: 'Wellness Box' },
    { image: '/products/categories/bottle-bags/bottle-bags-1.webp', name: 'Eco Starter Kit' },
    { image: '/products/categories/festive-bags/festive-bags-2.webp', name: 'Premium Hamper' },
    { image: '/products/categories/pouches/pouches-1.webp', name: 'Her Collection' },
    { image: '/products/categories/tote-bags/tote-bags-1.webp', name: 'Festive Delight' },
];

// Why Choose Us Features
const features = [
    {
        icon: Sparkles,
        title: '100% Sustainable',
        description: 'Eco-friendly materials made from recycled waste',
    },
    {
        icon: Palette,
        title: 'Fully Customizable',
        description: 'Your logo, colors, and messaging on every piece',
    },
    {
        icon: Heart,
        title: 'Premium Quality',
        description: 'Handcrafted with attention to every detail',
    },
    {
        icon: Truck,
        title: 'Pan-India Delivery',
        description: 'Fast, reliable shipping across all locations',
    },
];

// Testimonials
const testimonials = [
    {
        quote: "Trusser transformed our employee gifting experience. The quality and sustainability aspect resonated deeply with our brand values.",
        author: 'Priya Sharma',
        role: 'HR Director',
        company: 'Tech Innovations Ltd',
    },
    {
        quote: "The customization options and attention to detail were exceptional. Our clients loved the premium eco-friendly gift hampers.",
        author: 'Rajesh Kumar',
        role: 'Marketing Head',
        company: 'Global Solutions Inc',
    },
    {
        quote: "Working with Trusser was seamless from start to finish. They delivered 500+ kits on time with impeccable quality.",
        author: 'Ananya Patel',
        role: 'Operations Manager',
        company: 'Sunrise Enterprises',
    },
];

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-serif text-5xl md:text-7xl text-white"
        >
            {isInView ? value : 0}{suffix}
        </motion.span>
    );
};

// Animated Section Component
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const CorporateGifting = () => {
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Quote form state
    const [quoteForm, setQuoteForm] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        category: '',
        quantity: '',
        requirements: '',
    });

    const handleQuoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const subject = encodeURIComponent(`Corporate Gifting Quote Request from ${quoteForm.company || quoteForm.name}`);
        const body = encodeURIComponent(
            `Dear Trusser Team,

I would like to request a quote for corporate gifting. Here are my details:

CONTACT INFORMATION
-------------------
Name: ${quoteForm.name || 'Not provided'}
Company: ${quoteForm.company || 'Not provided'}
Email: ${quoteForm.email || 'Not provided'}
Phone: ${quoteForm.phone || 'Not provided'}

REQUIREMENTS
------------
Gift Category: ${quoteForm.category || 'Not specified'}
Estimated Quantity: ${quoteForm.quantity || 'Not specified'}

Additional Requirements:
${quoteForm.requirements || 'No additional requirements specified.'}

---
Looking forward to hearing from you.

Best regards,
${quoteForm.name || 'Customer'}`
        );

        window.location.href = `mailto:info@trusser.in?subject=${subject}&body=${body}`;
    };

    const updateQuoteForm = (field: string, value: string) => {
        setQuoteForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white">
            <Seo
                title="Eco-Friendly Corporate Gifts in Bangalore | Trusser"
                description="Premium sustainable corporate and event gifting. Curated eco-friendly gift sets crafted from recycled bottles—made in Bengaluru, delivered across India."
                canonicalPath="/corporate-gifting"
                ogType="website"
            />
            <Navbar />

            <main className="overflow-hidden">
                {/* ═══════════════════════════════════════════════════════════════════════════
                    HERO SECTION - Immersive Full-Screen with Parallax
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Animated Background Gradients */}
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="absolute inset-0 bg-gradient-to-br from-[#1A3C27] via-[#2D5F3F] to-[#1A3C27]"
                    >
                        {/* Floating Gradient Orbs */}
                        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#C1A17C]/20 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#4A8B60]/30 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#D45D48]/10 blur-[150px]" />
                    </motion.div>

                    {/* Decorative Grid Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '50px 50px',
                        }} />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12 py-32 lg:py-40">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Text Content */}
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
                                >
                                    <Gift className="w-4 h-4 text-[#C1A17C]" />
                                    <span className="text-white/80 text-sm font-medium tracking-wide">Corporate Gifting Solutions</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-8"
                                >
                                    Gifts That
                                    <br />
                                    <span className="text-[#C1A17C]">Mean More</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="text-xl text-white/70 max-w-xl mb-10 leading-relaxed"
                                >
                                    Elevate your corporate gifting with sustainable, customizable gift sets that
                                    leave lasting impressions and reflect your brand's commitment to the planet.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    <Button className="bg-[#C1A17C] text-[#1A3C27] hover:bg-[#D4B995] rounded-full px-8 py-5 text-base font-semibold group">
                                        Get a Free Quote
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-[#1A3C27] rounded-full px-8 py-5 text-base">
                                        View Catalog
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Floating Image Composition */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="relative hidden lg:block"
                            >
                                {/* Main Image */}
                                <div className="relative z-20">
                                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 p-4 rotate-3 hover:rotate-0 transition-transform duration-700">
                                        <img
                                            src={corporateGiftBox}
                                            alt="Corporate Gift Box"
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -top-8 -right-8 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#2D5F3F] rounded-xl flex items-center justify-center">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Orders Delivered</p>
                                            <p className="font-serif text-2xl text-[#1A3C27]">10,000+</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                    className="absolute -bottom-4 -left-12 z-30 bg-[#C1A17C] rounded-2xl p-4 shadow-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-8 h-8 text-[#1A3C27]" />
                                        <div>
                                            <p className="text-sm text-[#1A3C27]/70">Happy Clients</p>
                                            <p className="font-serif text-2xl text-[#1A3C27]">500+</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
                        >
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-3 bg-white/50 rounded-full"
                            />
                        </motion.div>
                    </motion.div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    STATS SECTION - Impressive Numbers
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="relative py-20 bg-[#1A3C27] overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/heroimage.webp')] bg-cover bg-center" />
                    </div>
                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
                            {[
                                { value: 500, suffix: '+', label: 'Corporate Clients' },
                                { value: 10000, suffix: '+', label: 'Gifts Delivered' },
                                { value: 50, suffix: 'T', label: 'Waste Recycled' },
                                { value: 100, suffix: '%', label: 'Sustainable' },
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                    <p className="text-white/60 mt-2 text-sm tracking-wide uppercase">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    WHY CHOOSE US - Feature Grid
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                Why Trusser
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[#1A3C27] mb-6">
                                The <span className="text-[#C1A17C]">Sustainable</span> Choice
                            </h2>
                            <p className="text-lg text-[#5C5C5C]">
                                Every gift tells a story of environmental responsibility and premium craftsmanship.
                            </p>
                        </AnimatedSection>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <AnimatedSection key={index} delay={index * 0.1}>
                                    <motion.div
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#E8DFD4] overflow-hidden"
                                    >
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#2D5F3F] to-[#1A3C27] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-[#F4EFEC] group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-500">
                                                <feature.icon className="w-8 h-8 text-[#2D5F3F] group-hover:text-white transition-colors duration-500" />
                                            </div>
                                            <h3 className="font-serif text-xl text-[#1A3C27] group-hover:text-white mb-3 transition-colors duration-500">
                                                {feature.title}
                                            </h3>
                                            <p className="text-[#5C5C5C] group-hover:text-white/80 transition-colors duration-500">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    GIFT CATEGORIES - Interactive Gallery
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-[#1A3C27] relative overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2D5F3F]/50 to-transparent" />

                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                Our Collections
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">
                                Curated Gift <span className="text-[#C1A17C]">Categories</span>
                            </h2>
                            <p className="text-lg text-white/60">
                                From welcome kits to festive hampers, find the perfect collection for every occasion.
                            </p>
                        </AnimatedSection>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {giftCategories.map((category, index) => (
                                <AnimatedSection key={index} delay={index * 0.15}>
                                    <Link to={category.link}>
                                        <motion.div
                                            whileHover={{ y: -12 }}
                                            className="group relative rounded-3xl overflow-hidden cursor-pointer aspect-[3/4]"
                                        >
                                            {/* Background Image */}
                                            <img
                                                src={category.image}
                                                alt={category.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                            {/* Accent Border on Hover */}
                                            <div
                                                className="absolute inset-0 border-4 border-transparent group-hover:border-[#C1A17C] rounded-3xl transition-all duration-500"
                                            />

                                            {/* Content */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <motion.div
                                                    initial={{ y: 20, opacity: 0 }}
                                                    whileInView={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.2 + index * 0.1 }}
                                                >
                                                    <h3 className="font-serif text-2xl text-white mb-2">{category.title}</h3>
                                                    <p className="text-white/70 text-sm mb-4">{category.description}</p>
                                                    <div className="flex items-center gap-2 text-[#C1A17C] font-medium text-sm group-hover:underline">
                                                        Explore Collection
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </AnimatedSection>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    HOW IT WORKS - Process Timeline
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-[#F4EFEC]">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                Simple Process
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[#1A3C27] mb-6">
                                How It <span className="text-[#C1A17C]">Works</span>
                            </h2>
                            <p className="text-lg text-[#5C5C5C]">
                                From concept to delivery, we make corporate gifting effortless.
                            </p>
                        </AnimatedSection>

                        {/* Timeline */}
                        <div className="relative">
                            {/* Connecting Line - Desktop */}
                            <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#C1A17C] via-[#2D5F3F] to-[#C1A17C]" />

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {processSteps.map((step, index) => (
                                    <AnimatedSection key={index} delay={index * 0.2}>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="relative text-center"
                                        >
                                            {/* Step Number Circle */}
                                            <div className="relative z-10 mx-auto w-[120px] h-[120px] rounded-full bg-white shadow-xl flex items-center justify-center mb-8 border-4 border-[#F4EFEC]">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2D5F3F] to-[#1A3C27] flex items-center justify-center">
                                                    <step.icon className="w-10 h-10 text-white" />
                                                </div>
                                                {/* Step Badge */}
                                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#C1A17C] flex items-center justify-center font-bold text-[#1A3C27] text-sm shadow-lg">
                                                    {step.step}
                                                </div>
                                            </div>

                                            <h3 className="font-serif text-xl text-[#1A3C27] mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-[#5C5C5C] text-sm leading-relaxed max-w-xs mx-auto">
                                                {step.description}
                                            </p>
                                        </motion.div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    FEATURED PRODUCTS - Masonry Grid
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-white">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                Best Sellers
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[#1A3C27] mb-6">
                                Featured <span className="text-[#C1A17C]">Gift Sets</span>
                            </h2>
                            <p className="text-lg text-[#5C5C5C]">
                                Explore our most popular collections loved by companies across India.
                            </p>
                        </AnimatedSection>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                            {featuredProducts.map((product, index) => (
                                <AnimatedSection key={index} delay={index * 0.1}>
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="font-serif text-xl text-white">{product.name}</h3>
                                            <p className="text-white/70 text-sm mt-1">Starting from ₹499</p>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            ))}
                        </div>

                        <AnimatedSection className="text-center mt-12">
                            <Link to="/shop">
                                <Button className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-full px-10 py-5 text-base font-semibold group">
                                    View All Products
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </AnimatedSection>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TESTIMONIALS - Carousel
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-gradient-to-br from-[#F4EFEC] to-[#E8DFD4]">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                Client Stories
                            </span>
                            <h2 className="font-serif text-4xl md:text-6xl text-[#1A3C27] mb-6">
                                What Our <span className="text-[#C1A17C]">Clients Say</span>
                            </h2>
                        </AnimatedSection>

                        <div className="max-w-4xl mx-auto">
                            <AnimatedSection>
                                <motion.div
                                    key={activeTestimonial}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="relative bg-white rounded-3xl p-10 md:p-16 shadow-xl"
                                >
                                    {/* Quote Icon */}
                                    <div className="absolute top-8 left-8 text-[#C1A17C]/20 text-8xl font-serif">"</div>

                                    <div className="relative z-10">
                                        <p className="text-xl md:text-2xl text-[#1A3C27] leading-relaxed mb-8 font-serif italic">
                                            "{testimonials[activeTestimonial].quote}"
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-[#1A3C27]">{testimonials[activeTestimonial].author}</p>
                                                <p className="text-[#5C5C5C] text-sm">
                                                    {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 fill-[#C1A17C] text-[#C1A17C]" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatedSection>

                            {/* Dots Navigation */}
                            <div className="flex justify-center gap-3 mt-8">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${activeTestimonial === index
                                            ? 'bg-[#C1A17C] w-8'
                                            : 'bg-[#1A3C27]/20 hover:bg-[#1A3C27]/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    CONTACT / CTA SECTION
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-[#1A3C27] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#2D5F3F]/50 to-transparent" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#C1A17C]/10 blur-[100px]" />

                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left - Contact Info */}
                            <AnimatedSection>
                                <span className="text-[#C1A17C] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                                    Let's Connect
                                </span>
                                <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">
                                    Ready to <span className="text-[#C1A17C]">Elevate</span> Your Gifting?
                                </h2>
                                <p className="text-lg text-white/70 mb-10 max-w-lg">
                                    Get in touch with our gifting experts for a personalized consultation.
                                    We'll help you create the perfect sustainable gift solution.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { icon: Phone, label: 'Call Us', value: '+91 9008138404' },
                                        { icon: Mail, label: 'Email', value: 'info@trusser.in' },
                                        { icon: MapPin, label: 'Office', value: 'Mumbai, Maharashtra' },
                                    ].map((contact, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                <contact.icon className="w-5 h-5 text-[#C1A17C]" />
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-sm">{contact.label}</p>
                                                <p className="text-white font-medium">{contact.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AnimatedSection>

                            {/* Right - Form */}
                            <AnimatedSection delay={0.2}>
                                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
                                    <h3 className="font-serif text-2xl text-[#1A3C27] mb-6">Request a Quote</h3>
                                    <form onSubmit={handleQuoteSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                value={quoteForm.name}
                                                onChange={(e) => updateQuoteForm('name', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors placeholder:text-[#5C5C5C]/50"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                value={quoteForm.company}
                                                onChange={(e) => updateQuoteForm('company', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors placeholder:text-[#5C5C5C]/50"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={quoteForm.email}
                                                onChange={(e) => updateQuoteForm('email', e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors placeholder:text-[#5C5C5C]/50"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={quoteForm.phone}
                                                onChange={(e) => updateQuoteForm('phone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors placeholder:text-[#5C5C5C]/50"
                                            />
                                        </div>
                                        <select
                                            value={quoteForm.category}
                                            onChange={(e) => updateQuoteForm('category', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors text-[#5C5C5C]"
                                        >
                                            <option value="">Select Gift Category</option>
                                            <option value="Welcome Kits">Welcome Kits</option>
                                            <option value="Event Hampers">Event Hampers</option>
                                            <option value="Festive Collections">Festive Collections</option>
                                            <option value="Custom Bundles">Custom Bundles</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Estimated Quantity (e.g., 100-500)"
                                            value={quoteForm.quantity}
                                            onChange={(e) => updateQuoteForm('quantity', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors placeholder:text-[#5C5C5C]/50"
                                        />
                                        <textarea
                                            placeholder="Tell us about your requirements..."
                                            rows={4}
                                            value={quoteForm.requirements}
                                            onChange={(e) => updateQuoteForm('requirements', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-[#F4EFEC] border-2 border-transparent focus:border-[#2D5F3F] focus:outline-none transition-colors resize-none placeholder:text-[#5C5C5C]/50"
                                        />
                                        <Button type="submit" className="w-full bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-xl py-4 text-base font-semibold group">
                                            Submit Inquiry
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </form>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
