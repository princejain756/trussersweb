import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../UI/Button';
import { Leaf, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { getWebsiteContent } from '../../utils/websiteContent';

export const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const content = getWebsiteContent();
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Parallax effects
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section ref={containerRef} className="relative flex w-full min-h-[90vh] lg:min-h-screen items-center justify-center overflow-hidden bg-[#E8DFD4]">
            {/* Premium Background with Subtle Gradient & Grain */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#F7F1E8_0%,_#E8DFD4_60%,_#DCCFB8_100%)]" />

            {/* Ambient Animated Glows */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2D5F3F]/10 blur-[100px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#C1A17C]/20 blur-[120px] rounded-full pointer-events-none"
            />

            <div className="relative w-full max-w-[1920px] px-6 lg:px-12 z-10">
                <div className="flex flex-col max-h-[1080px] w-full">

                    {/* Hero Image Section */}
                    <motion.div
                        style={{ y: imageY, opacity }}
                        className="relative flex shrink-0 items-center justify-center pt-24 lg:pt-32"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Floating Animation Wrapper for Image */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <img
                                    src={content.hero.backgroundImage}
                                    alt={content.hero.heading}
                                    className="h-auto w-full max-h-[585px] object-contain drop-shadow-2xl lg:max-h-[754px] xl:max-h-[845px]"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Text Content Section */}
                    <motion.div
                        style={{ y: textY, opacity }}
                        className="relative pb-16 pt-6 sm:pt-10 lg:pb-24 lg:pt-0"
                    >
                        <div className="mx-auto max-w-2xl text-center lg:-mt-8 lg:ml-[12%] lg:text-left xl:ml-[15%]">

                            {/* Headline */}
                            <div className="overflow-hidden mb-6">
                                <motion.h1
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-[#1A3C27] sm:text-6xl lg:text-7xl xl:text-8xl"
                                >
                                    <span className="block">{content.hero.heading.split(' ').slice(0, 2).join(' ')}</span>
                                    <span className="block bg-gradient-to-r from-[#2D5F3F] to-[#4A8B60] bg-clip-text text-transparent">
                                        {content.hero.heading.split(' ').slice(2).join(' ') || 'Into Purpose.'}
                                    </span>
                                </motion.h1>
                            </div>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                className="mb-10 text-lg font-medium leading-relaxed text-[#5C5C5C] sm:text-xl lg:max-w-xl"
                            >
                                {content.hero.subheading}
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
                            >
                                <Button
                                    size="lg"
                                    className="group relative overflow-hidden rounded-full bg-[#2D5F3F] px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(45,95,63,0.4)] transition-all hover:scale-105 hover:bg-[#234A32] hover:shadow-[0_20px_40px_-10px_rgba(45,95,63,0.5)] active:scale-95"
                                >
                                    <a href={content.hero.ctaLink} className="relative z-10 flex items-center gap-2">
                                        {content.hero.ctaText}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="group rounded-full border-2 border-[#2D5F3F]/30 bg-white/50 px-8 py-4 text-base font-semibold text-[#2D5F3F] backdrop-blur-md transition-all hover:border-[#2D5F3F] hover:bg-white hover:text-[#1A3C27] active:scale-95"
                                >
                                    Corporate & Event Gifting
                                </Button>
                            </motion.div>
                        </div>

                        {/* Badge - Premium Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 1.2, type: "spring" }}
                            className="absolute bottom-10 right-4 hidden lg:bottom-16 lg:right-12 lg:block"
                        >
                            <div className="group flex items-center gap-3 rounded-full border border-white/40 bg-white/30 p-1.5 pr-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5F3F] text-white shadow-inner">
                                    <Leaf size={18} className="animate-pulse" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] uppercase tracking-wider text-[#2D5F3F]/80 font-bold">Guaranteed</span>
                                    <span className="text-sm font-bold text-[#1A3C27]">
                                        GRS Certified • Made in India
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
