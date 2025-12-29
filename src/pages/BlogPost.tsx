import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Tag,
    Facebook,
    Twitter,
    Linkedin,
    Mail
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Seo } from '../seo/Seo';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: {
        name: string;
        avatar?: string;
    };
    publishedDate: string;
    status: 'published' | 'draft';
    tags: string[];
    category: string;
    coverImage: string;
    seoKeywords: string[];
    readingTime: number;
    wordCount: number;
}

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlog();
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/blogs/${slug}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Blog post not found');
                } else {
                    setError('Failed to load blog post');
                }
                return;
            }

            const data = await response.json();
            setBlog(data);
        } catch (err) {
            console.error('Error fetching blog:', err);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || '';

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(shareTitle);

        const shareLinks: { [key: string]: string } = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${encodedUrl}`
        };

        if (shareLinks[platform]) {
            window.open(shareLinks[platform], '_blank', 'width=600,height=400');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A3C27] to-[#0A0F0D] flex items-center justify-center">
                <Seo title="Loading article | Trusser Journal" canonicalPath={slug ? `/journal/${slug}` : '/journal'} noindex />
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#C1A17C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#F5F1E8] font-['Inter']">Loading article...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A3C27] to-[#0A0F0D] flex items-center justify-center">
                <Seo title="Article not found | Trusser Journal" canonicalPath={slug ? `/journal/${slug}` : '/journal'} noindex />
                <div className="text-center max-w-md mx-auto px-4">
                    <h1 className="text-4xl font-['Playfair_Display'] text-[#F5F1E8] mb-4">
                        {error || 'Article Not Found'}
                    </h1>
                    <p className="text-[#C1A17C] mb-8 font-['Inter']">
                        The article you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        to="/journal"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C1A17C] to-[#D4B896] text-[#1A3C27] rounded-full font-['Inter'] font-semibold hover:shadow-lg hover:shadow-[#C1A17C]/20 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Journal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Seo
                title={`${blog.title} | Trusser Journal`}
                description={blog.excerpt}
                canonicalPath={`/journal/${blog.slug}`}
                ogType="article"
                ogImage={blog.coverImage}
                keywords={blog.seoKeywords}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'BlogPosting',
                    headline: blog.title,
                    description: blog.excerpt,
                    image: blog.coverImage,
                    datePublished: blog.publishedDate,
                    author: {
                        '@type': 'Person',
                        name: blog.author?.name || 'Trusser Team',
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'Trusser',
                    },
                }}
            />
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A3C27] to-[#0A0F0D]">
                {/* Hero Section */}
                <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${blog.coverImage})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0F0D]"></div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
                        {/* Back Button */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <Link
                                to="/journal"
                                className="inline-flex items-center gap-2 text-[#F5F1E8] hover:text-[#C1A17C] transition-colors duration-300 font-['Inter']"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Journal
                            </Link>
                        </motion.div>

                        {/* Category Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-4"
                        >
                            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#C1A17C] to-[#D4B896] text-[#1A3C27] rounded-full text-sm font-['Inter'] font-semibold">
                                {blog.category}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] text-[#F5F1E8] mb-6 leading-tight"
                        >
                            {blog.title}
                        </motion.h1>

                        {/* Meta Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-6 text-[#C1A17C] font-['Inter']"
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span>{blog.author.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(blog.publishedDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{blog.readingTime} min read</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="lg:col-span-9"
                        >
                            {/* Excerpt */}
                            <div className="mb-8 p-6 bg-gradient-to-br from-[#1A3C27]/30 to-[#2A4C37]/30 backdrop-blur-sm border border-[#C1A17C]/20 rounded-2xl">
                                <p className="text-xl text-[#F5F1E8] font-['Inter'] leading-relaxed italic">
                                    {blog.excerpt}
                                </p>
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-lg max-w-none
                prose-headings:font-['Playfair_Display'] prose-headings:text-[#F5F1E8] prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[#C1A17C]
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[#D4B896]
                prose-p:font-['Inter'] prose-p:text-[#F5F1E8] prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-[#C1A17C] prose-a:underline hover:prose-a:text-[#D4B896]
                prose-strong:text-[#FFFFFF] prose-strong:font-semibold
                prose-li:text-[#F5F1E8] prose-li:mb-2
                prose-ul:text-[#F5F1E8] prose-ol:text-[#F5F1E8]
                prose-blockquote:border-l-4 prose-blockquote:border-[#C1A17C] prose-blockquote:pl-4 prose-blockquote:text-[#D4B896] prose-blockquote:italic
                prose-code:text-[#C1A17C] prose-code:bg-[#1A3C27]/50 prose-code:px-2 prose-code:py-1 prose-code:rounded
                [&_h2]:text-[#C1A17C] [&_h3]:text-[#D4B896] [&_p]:text-[#F5F1E8] [&_li]:text-[#F5F1E8] [&_strong]:text-white [&_br]:mb-2"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Tags */}
                            <div className="mt-12 pt-8 border-t border-[#C1A17C]/20">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Tag className="w-5 h-5 text-[#C1A17C]" />
                                    {blog.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-1.5 bg-[#1A3C27]/50 border border-[#C1A17C]/30 text-[#C1A17C] rounded-full text-sm font-['Inter'] hover:bg-[#1A3C27]/70 transition-colors duration-300 cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.article>

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="lg:col-span-3"
                        >
                            {/* Share Section */}
                            <div className="sticky top-8">
                                <div className="p-6 bg-gradient-to-br from-[#1A3C27]/30 to-[#2A4C37]/30 backdrop-blur-sm border border-[#C1A17C]/20 rounded-2xl">
                                    <h3 className="text-xl font-['Playfair_Display'] text-[#F5F1E8] mb-4">
                                        Share Article
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="flex items-center gap-3 px-4 py-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/30 text-[#F5F1E8] rounded-xl transition-all duration-300 font-['Inter']"
                                        >
                                            <Facebook className="w-5 h-5" />
                                            <span>Facebook</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="flex items-center gap-3 px-4 py-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 text-[#F5F1E8] rounded-xl transition-all duration-300 font-['Inter']"
                                        >
                                            <Twitter className="w-5 h-5" />
                                            <span>Twitter</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="flex items-center gap-3 px-4 py-3 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/30 text-[#F5F1E8] rounded-xl transition-all duration-300 font-['Inter']"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                            <span>LinkedIn</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('email')}
                                            className="flex items-center gap-3 px-4 py-3 bg-[#C1A17C]/20 hover:bg-[#C1A17C]/30 border border-[#C1A17C]/30 text-[#F5F1E8] rounded-xl transition-all duration-300 font-['Inter']"
                                        >
                                            <Mail className="w-5 h-5" />
                                            <span>Email</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>

                {/* Related Articles CTA */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="p-8 bg-gradient-to-br from-[#C1A17C]/10 to-[#D4B896]/10 backdrop-blur-sm border border-[#C1A17C]/20 rounded-2xl text-center"
                    >
                        <h3 className="text-2xl font-['Playfair_Display'] text-[#F5F1E8] mb-4">
                            Enjoyed this article?
                        </h3>
                        <p className="text-[#C1A17C] font-['Inter'] mb-6">
                            Explore more insights on sustainability and corporate gifting
                        </p>
                        <Link
                            to="/journal"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#C1A17C] to-[#D4B896] text-[#1A3C27] rounded-full font-['Inter'] font-semibold hover:shadow-lg hover:shadow-[#C1A17C]/20 transition-all duration-300"
                        >
                            View All Articles
                        </Link>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BlogPost;
