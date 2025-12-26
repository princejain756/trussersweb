import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getWebsiteContent } from '../../utils/websiteContent';

const categories = [
    {
        title: "Notebooks",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2787",
        span: "md:col-span-2 md:row-span-2",
        aspect: "aspect-square md:aspect-auto"
    },
    {
        title: "Office Desk",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=2940",
        span: "md:col-span-1 md:row-span-1",
        aspect: "aspect-square"
    },
    {
        title: "Lifestyle",
        image: "https://images.unsplash.com/photo-1597484662317-c9253e604f0e?auto=format&fit=crop&q=80&w=2787",
        span: "md:col-span-1 md:row-span-2",
        aspect: "aspect-[3/4]"
    },
    {
        title: "Travel Gear",
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=2940",
        span: "md:col-span-1 md:row-span-1",
        aspect: "aspect-square"
    },
];

export const ShopByMood = () => {
    const content = getWebsiteContent();

    return (
        <section className="py-24 lg:py-32 bg-white">
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="font-serif text-5xl md:text-7xl text-[#1A3C27]"
                        >
                            {content.shopByMood.heading}
                        </motion.h2>
                        <p className="mt-4 text-lg text-[#5C5C5C]">
                            {content.shopByMood.subheading}
                        </p>
                    </div>
                    <button className="group flex items-center gap-2 border-b border-[#2D5F3F] pb-1 font-medium text-[#2D5F3F] transition-all hover:gap-4 hover:border-[#C1A17C] hover:text-[#C1A17C]">
                        View All Collections <ArrowUpRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative overflow-hidden rounded-2xl cursor-pointer ${cat.span} ${cat.aspect}`}
                        >
                            <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/10 z-10" />

                            <motion.img
                                src={cat.image}
                                alt={cat.title}
                                className="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                            />

                            <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                                <div className="translate-y-4 transition-transform duration-500 md:group-hover:translate-y-0">
                                    <span className="inline-block rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#1A3C27] backdrop-blur-md shadow-sm">
                                        {cat.title}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-8 right-8 z-20 opacity-0 -translate-x-4 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A3C27] shadow-lg">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
