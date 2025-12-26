import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Creative Counter Component
const AnimatedCounter = ({ value }: { value: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20%" });

    // Use spring for smooth creative deceleration
    const springValue = useSpring(0, {
        damping: 30,
        stiffness: 70,
        duration: 2.5
    });

    // Formatting for Indian Number System (16,95,75,321)
    const formatIndianNumber = (num: number) => {
        const rounded = Math.round(num);
        const s = rounded.toString();
        if (s.length <= 3) return s;
        const lastThree = s.substring(s.length - 3);
        const otherNumbers = s.substring(0, s.length - 3);
        const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
        return formatted;
    };

    const displayValue = useTransform(springValue, (latest) => formatIndianNumber(latest));

    useEffect(() => {
        if (inView) {
            springValue.set(value);
        }
    }, [inView, value, springValue]);

    return (
        <motion.span ref={ref} className="tabular-nums inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#2D5F3F] to-[#1A3C27]">
            {displayValue}
        </motion.span>
    );
};

export const ImpactDashboard = () => {
    return (
        <section className="py-24 bg-[#F4EFEC]">
            <div className="mx-auto max-w-5xl px-6">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#E8DFD4]/50 border border-[#2D5F3F]/5 p-16 text-center">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(#2D5F3F 1px, transparent 1px)",
                            backgroundSize: "24px 24px"
                        }}
                    />

                    <h2 className="font-serif text-4xl md:text-5xl text-[#1A3C27] mb-16 relative z-10">
                        Our Impact So Far
                    </h2>

                    <div className="flex flex-col items-center justify-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm mb-8 text-[#2D5F3F]">
                                {/* Water Bottle Icon */}
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 3h6v4h-6z" />
                                    <path d="M8 7h8v2H8z" />
                                    <path d="M7 9h10v12a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                </svg>
                            </div>
                            <h3 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium mb-4 tracking-tight flex items-center justify-center">
                                <AnimatedCounter value={169575321} />
                            </h3>
                            <div className="text-[#C1A17C] font-bold uppercase tracking-[0.2em] text-lg mb-2">
                                Plastic Bottles Recycled
                            </div>
                            <div className="text-[#5C5C5C] text-sm font-medium bg-white/50 px-4 py-1 rounded-full border border-[#D4C5B5]/30">
                                UPTO MARCH 31*, 2025
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
