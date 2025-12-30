import { Button } from '../UI/Button';
import { motion } from 'framer-motion';
import corporateGiftBox from '../../assets/corporategiftbox.webp';

export const CorporateGifting = () => {
    return (
        <section className="py-12 px-4 lg:px-6 bg-[#F4EFEC]">
            <div className="mx-auto max-w-[1920px]">
                <div className="relative overflow-hidden rounded-[3rem] bg-[#1A3C27] min-h-[600px] flex items-center">

                    {/* Background Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-[#2D5F3F] rounded-full blur-[120px] opacity-40" />
                        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-[#C1A17C] rounded-full blur-[100px] opacity-20" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="mb-6 inline-block font-sans text-sm font-bold uppercase tracking-[0.2em] text-[#C1A17C]">
                                Corporate Gifting
                            </span>
                            <h2 className="mb-8 font-serif text-5xl md:text-7xl text-white leading-[1.1]">
                                Welcome Kit <br />
                                <span className="text-white/50 italic">tailored & curated.</span>
                            </h2>
                            <p className="mb-10 text-lg text-white/70 max-w-md leading-relaxed">
                                Premium sustainable kits for your team. Customizable branding, eco-friendly packaging, and impactful messaging that resonates with your values.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-[#C1A17C] text-[#1A3C27] hover:bg-[#D4B995] rounded-full px-8 py-4 text-base font-semibold">
                                    Download Catalog
                                </Button>
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-[#1A3C27] rounded-full px-8 py-4 text-base">
                                    Contact Sales
                                </Button>
                            </div>
                        </div>

                        {/* Image Composition */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 10 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 aspect-square rounded-2xl overflow-hidden glass border border-white/10 p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src={corporateGiftBox}
                                    alt="Corporate Gift Box"
                                    loading="lazy"
                                    decoding="async"
                                    fetchPriority="low"
                                    width={900}
                                    height={900}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
