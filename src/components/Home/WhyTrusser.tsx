import { motion } from 'framer-motion';
import { Recycle, ScanLine, Sprout, ShoppingBag, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: Recycle,
        title: "Bottles crushed",
        description: "100M+ bottles diverted from landfills annually, crushed into fine flakes.",
        color: "bg-[#E8DFD4]"
    },
    {
        icon: ScanLine,
        title: "Flakes spinning",
        description: "Precision spinning transforms raw plastic flakes into durable, high-grade yarn.",
        color: "bg-[#E8DFD4]"
    },
    {
        icon: Sprout,
        title: "Start stitching",
        description: "Artisans weave the yarn into premium fabric, stitching sustainability into every seam.",
        color: "bg-[#E8DFD4]"
    },
    {
        icon: ShoppingBag,
        title: "Final product",
        description: "A functional, stylish carry-good that honors both the planet and your lifestyle.",
        color: "bg-[#E8DFD4]"
    }
];

export const WhyTrusser = () => {
    return (
        <section className="relative py-24 lg:py-32 bg-[#F4EFEC] overflow-hidden">
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-[#C1A17C] font-semibold tracking-widest text-sm uppercase mb-3"
                    >
                        Our Process
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-5xl md:text-6xl text-[#2D5F3F] font-medium"
                    >
                        From Waste to Wonder
                    </motion.h2>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Horizontal Line for Desktop */}
                    <div className="absolute top-12 left-0 w-full h-[1px] bg-[#2D5F3F]/20 hidden lg:block" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative group pt-8"
                        >
                            {/* Dot on Line */}
                            <div className="absolute top-[44px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#2D5F3F] z-10 hidden lg:block transition-all duration-500 group-hover:scale-150 group-hover:bg-[#C1A17C]" />

                            <div className="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-[#2D5F3F]/10">
                                <div className={`mb-6 p-5 rounded-full ${step.color} text-[#2D5F3F] transition-colors group-hover:bg-[#2D5F3F] group-hover:text-[#E8DFD4]`}>
                                    <step.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif text-2xl text-[#1A3C27] mb-3">{step.title}</h3>
                                <p className="text-[#5C5C5C] leading-relaxed mb-6">
                                    {step.description}
                                </p>
                                <div className="mt-auto opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <ArrowRight className="text-[#C1A17C]" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
