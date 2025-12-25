import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Counter Component
const Counter = ({ to, duration = 2 }: { to: number; duration?: number }) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const inView = useInView(nodeRef, { once: true, margin: "-20%" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = to;
            const totalDuration = duration * 1000;
            const incrementTime = totalDuration / end;

            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);

            return () => clearInterval(timer);
        }
    }, [inView, to, duration]);

    return <div ref={nodeRef}>{count}+</div>;
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-6 text-[#2D5F3F]">
                                {/* Water Bottle Icon */}
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 3h6v4h-6z" />
                                    <path d="M8 7h8v2H8z" />
                                    <path d="M7 9h10v12a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                </svg>
                            </div>
                            <div className="font-serif text-6xl md:text-7xl font-medium text-[#2D5F3F] mb-3 tabular-nums">
                                <Counter to={400} />
                            </div>
                            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#C1A17C]">
                                Bottles Recycled
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-6 text-[#2D5F3F]">
                                {/* Scale/Weight Icon */}
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M6 9l2-5h8l2 5v11a2 2 0 01-2 2H8a2 2 0 01-2-2V9z" />
                                    <path d="M12 9v12" />
                                </svg>
                            </div>
                            <div className="font-serif text-6xl md:text-7xl font-medium text-[#2D5F3F] mb-3 tabular-nums">
                                <Counter to={700} />
                            </div>
                            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#C1A17C]">
                                Plastic Diverted
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
