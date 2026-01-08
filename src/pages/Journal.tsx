import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import {
    Calendar,
    Clock,
    ArrowRight,
    Search,
    Bookmark,
    Share2,
    ChevronRight,
    Leaf,
    Sparkles,
    Palette,
    Building2,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    publishedDate: string;
    status: string;
    tags: string[];
    readingTime: number;
    wordCount: number;
    featured?: boolean;
    category?: string;
    image?: string;
    coverImage?: string;
};

// Article Categories - matching actual blog tags
const categories = [
    { name: 'All', icon: Sparkles, count: 12 },
    { name: 'Sustainability', icon: Leaf, count: 5 },
    { name: 'Corporate Gifting', icon: Building2, count: 4 },
    { name: 'Manufacturing', icon: Palette, count: 2 },
    { name: 'Bangalore', icon: Bookmark, count: 4 },
];

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

// Helper to resolve image URLs properly for display
const resolveImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800';
    // Already a full URL - pass through
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Strip localhost prefix and reconstruct with current apiBaseUrl
        const localhostMatch = imageUrl.match(/^https?:\/\/localhost:\d+(\/.+)$/);
        if (localhostMatch) {
            return `${apiBaseUrl}${localhostMatch[1]}`;
        }
        return imageUrl;
    }
    // Relative paths starting with /src/assets or /uploads - prepend apiBaseUrl
    if (imageUrl.startsWith('/src/assets') || imageUrl.startsWith('/uploads')) {
        return `${apiBaseUrl}${imageUrl}`;
    }
    // Any other path - assume it's relative to API
    if (imageUrl.startsWith('/')) {
        return `${apiBaseUrl}${imageUrl}`;
    }
    return imageUrl;
};

// Article Card Component
const ArticleCard = ({ article, index, large = false }: { article: Blog; index: number; large?: boolean }) => {
    // Use fallback values for missing fields
    const imageUrl = resolveImageUrl(article.coverImage || article.image);
    const categoryName = article.category || (article.tags && article.tags[0]) || 'Sustainability';

    return (
        <AnimatedSection delay={index * 0.1}>
            <motion.article
                whileHover={{ y: -8 }}
                className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ${large ? 'md:flex' : ''
                    }`}
            >
                {/* Image */}
                <div className={`relative overflow-hidden ${large ? 'md:w-1/2' : 'aspect-[4/3]'}`}>
                    <img
                        src={imageUrl}
                        alt={article.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${large ? 'aspect-[4/3] md:aspect-auto md:absolute md:inset-0' : ''
                            }`}
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#1A3C27]">
                            <Leaf className="w-3 h-3" />
                            {categoryName}
                        </span>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C27]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className={`p-6 ${large ? 'md:w-1/2 md:p-8 md:flex md:flex-col md:justify-center' : ''}`}>
                    <div className="flex items-center gap-4 text-sm text-[#5C5C5C] mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readingTime} min read
                        </span>
                    </div>

                    <h3 className={`font-serif text-[#1A3C27] mb-3 group-hover:text-[#2D5F3F] transition-colors ${large ? 'text-2xl md:text-3xl' : 'text-xl'
                        }`}>
                        {article.title}
                    </h3>

                    <p className={`text-[#5C5C5C] leading-relaxed mb-4 ${large ? '' : 'line-clamp-2'}`}>
                        {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                        <Link
                            to={`/journal/${article.slug}`}
                            className="flex items-center gap-2 text-[#C1A17C] font-medium text-sm group-hover:gap-3 transition-all"
                        >
                            Read More
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-full bg-[#F4EFEC] flex items-center justify-center hover:bg-[#C1A17C] hover:text-white transition-colors">
                                <Bookmark className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-[#F4EFEC] flex items-center justify-center hover:bg-[#C1A17C] hover:text-white transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.article>
        </AnimatedSection>
    );
};

export const Journal = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/blogs`);
            const data = await response.json();
            setBlogs(data || []);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const featuredBlog = blogs.find(b => b.featured) || blogs[0];
    const otherBlogs = blogs.filter(b => b.id !== featuredBlog?.id);

    // Map blog data to featured article format for hero section
    const featuredArticle = featuredBlog ? {
        image: resolveImageUrl(featuredBlog.coverImage || featuredBlog.image),
        title: featuredBlog.title,
        excerpt: featuredBlog.excerpt,
        category: featuredBlog.category || 'Sustainability',
        author: featuredBlog.author || 'Trusser Team',
        authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        date: new Date(featuredBlog.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: `${featuredBlog.readingTime} min read`,
    } : null;

    const filteredArticles = otherBlogs.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.tags?.includes(activeCategory);
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4EFEC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A3C27] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EFEC] selection:bg-[#C1A17C] selection:text-white">
            <Seo
                title="Journal | Trusser"
                description="Stories and guides on sustainability, eco-friendly living, and corporate gifting."
                canonicalPath="/journal"
                ogType="website"
            />
            <Navbar />

            <main className="overflow-hidden">
                {/* ═══════════════════════════════════════════════════════════════════════════
                    HERO SECTION - Featured Article Spotlight
                ═══════════════════════════════════════════════════════════════════════════ */}
                {featuredArticle && (
                    <section className="relative min-h-[70vh] lg:min-h-screen flex items-end overflow-hidden pt-24 lg:pt-0">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={featuredArticle.image}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C27] via-[#1A3C27]/60 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 w-full mx-auto max-w-[1920px] px-6 lg:px-12 py-12 lg:py-24">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="max-w-4xl"
                            >
                                {/* Featured Badge & Category Wrapper */}
                                <div className="flex flex-col items-start gap-4 mb-6 lg:mb-8">
                                    <div className="inline-flex items-center gap-2 bg-[#C1A17C] rounded-full px-4 py-2 shadow-lg">
                                        <Sparkles className="w-4 h-4 text-[#1A3C27]" />
                                        <span className="text-[#1A3C27] font-bold text-xs uppercase tracking-wider">Featured Article</span>
                                    </div>

                                    <span className="inline-block text-white/90 text-sm font-bold uppercase tracking-[0.2em] pl-1">
                                        {featuredArticle.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="font-serif text-3xl md:text-5xl lg:text-7xl text-white leading-tight mb-4 lg:mb-6">
                                    {featuredArticle.title}
                                </h1>

                                {/* Excerpt */}
                                <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mb-6 lg:mb-8 leading-relaxed">
                                    {featuredArticle.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-6 mb-8">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={featuredArticle.authorImage}
                                            alt={featuredArticle.author}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                                        />
                                        <div>
                                            <p className="text-white font-medium">{featuredArticle.author}</p>
                                            <p className="text-white/60 text-sm">{featuredArticle.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <Clock className="w-4 h-4" />
                                        {featuredArticle.readTime}
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link to={`/journal/${featuredBlog?.slug}`}>
                                    <Button className="bg-white text-[#1A3C27] hover:bg-[#C1A17C] hover:text-[#1A3C27] rounded-full px-8 py-5 text-base font-semibold group">
                                        Read Full Article
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* ═══════════════════════════════════════════════════════════════════════════
                    CATEGORIES & SEARCH - Sticky Filter Bar
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="sticky top-20 z-40 bg-[#F4EFEC]/95 backdrop-blur-md border-b border-[#D4C5B5] shadow-sm">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-6">
                        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                                {categories.map((category) => (
                                    <button
                                        key={category.name}
                                        onClick={() => setActiveCategory(category.name)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === category.name
                                            ? 'bg-[#1A3C27] text-white shadow-lg'
                                            : 'bg-white text-[#1A3C27] hover:bg-[#E8DFD4] border border-[#D4C5B5]'
                                            }`}
                                    >
                                        <category.icon className="w-4 h-4" />
                                        {category.name}
                                        <span className={`text-xs ${activeCategory === category.name ? 'text-white/70' : 'text-[#5C5C5C]'}`}>
                                            ({category.count})
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full lg:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5C5C]" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-[#D4C5B5] focus:border-[#1A3C27] focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 transition-all placeholder:text-[#5C5C5C]/50 text-[#1A3C27]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    ARTICLES GRID - Bento Style
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section id="articles-grid" className="py-16 lg:py-24">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        {filteredArticles.length > 0 ? (
                            <>
                                {/* First row - Featured Layout */}
                                {filteredArticles.length >= 1 && (
                                    <div className="mb-8">
                                        <ArticleCard article={filteredArticles[0]} index={0} large />
                                    </div>
                                )}

                                {/* Grid Layout */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {filteredArticles.slice(1).map((article, index) => (
                                        <ArticleCard key={article.id} article={article} index={index + 1} />
                                    ))}
                                </div>

                                {/* Load More */}
                                <AnimatedSection className="text-center mt-16">
                                    <Button variant="outline" className="rounded-full px-10 py-5 border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white">
                                        Load More Articles
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </AnimatedSection>
                            </>
                        ) : (
                            <div className="text-center py-24">
                                <Search className="w-16 h-16 mx-auto text-[#D4C5B5] mb-4" />
                                <h3 className="font-serif text-2xl text-[#1A3C27] mb-2">No articles found</h3>
                                <p className="text-[#5C5C5C]">Try adjusting your search or filter.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    NEWSLETTER - CTA Section
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-24 lg:py-32 bg-[#1A3C27] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2D5F3F]/50 to-transparent" />
                    <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-[#C1A17C]/10 blur-[120px]" />

                    <div className="relative z-10 mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="max-w-3xl mx-auto text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#C1A17C]/20 mb-8"
                            >
                                <Sparkles className="w-10 h-10 text-[#C1A17C]" />
                            </motion.div>

                            <h2 className="font-serif text-4xl md:text-6xl text-white mb-6">
                                Stay <span className="text-[#C1A17C]">Inspired</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                                Subscribe to our newsletter for the latest articles on sustainability,
                                design inspiration, and exclusive behind-the-scenes content.
                            </p>

                            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#C1A17C] transition-colors"
                                />
                                <Button className="bg-[#C1A17C] text-[#1A3C27] hover:bg-[#D4B995] rounded-full px-8 py-4 font-semibold whitespace-nowrap">
                                    Subscribe
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>

                            <p className="text-white/40 text-sm mt-4">
                                No spam, ever. Unsubscribe anytime.
                            </p>
                        </AnimatedSection>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TOPICS CLOUD
                ═══════════════════════════════════════════════════════════════════════════ */}
                <section className="py-16 lg:py-24 bg-[#F4EFEC]">
                    <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
                        <AnimatedSection className="text-center mb-12">
                            <h3 className="font-serif text-2xl md:text-3xl text-[#1A3C27]">
                                Explore Topics
                            </h3>
                        </AnimatedSection>

                        <AnimatedSection delay={0.2}>
                            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                                {/* Generate unique tags from all blogs */}
                                {Array.from(new Set(blogs.flatMap(blog => blog.tags || []))).map((topic) => (
                                    <motion.button
                                        key={topic}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        onClick={() => {
                                            setActiveCategory(topic);
                                            // Smooth scroll to articles grid
                                            setTimeout(() => {
                                                document.getElementById('articles-grid')?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }, 100);
                                        }}
                                        className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all border ${activeCategory === topic
                                            ? 'bg-[#C1A17C] text-white border-[#C1A17C]'
                                            : 'bg-white text-[#1A3C27] border-[#E8DFD4] hover:bg-[#C1A17C] hover:text-white'
                                            }`}
                                    >
                                        {topic}
                                    </motion.button>
                                ))}
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
