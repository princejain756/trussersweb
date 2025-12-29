import { useState, useEffect, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
	BookOpen,
	Clock,
	Eye,
	FileText,
	PenTool,
	Plus,
	Search,
	Tag,
	BarChart3,
	Sparkles,
} from 'lucide-react';

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    publishedDate: string;
    status: 'published' | 'draft';
    tags: string[];
    seoKeywords: string[];
    readingTime: number;
    wordCount: number;
    featured: boolean;
};

type Stats = {
	total: number;
	published: number;
	draft: number;
	totalWords: number;
};

type StatCardProps = {
	icon: ComponentType<{ className?: string }>;
	label: string;
	value: number;
	gradient: string;
};

const gradients = [
    'from-purple-500 via-pink-500 to-red-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-green-500 via-emerald-500 to-cyan-500',
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-rose-500 via-fuchsia-500 to-purple-500',
];

export const Journal = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, totalWords: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/api/admin/blogs', {
                headers: {
                    'x-admin-key': localStorage.getItem('adminToken') || '',
                },
            });
            const data = await response.json();
            setBlogs(data.blogs || []);
            setStats(data.stats || { total: 0, published: 0, draft: 0, totalWords: 0 });
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

	const StatCard = ({ icon: Icon, label, value, gradient }: StatCardProps) => (
		<motion.div
			whileHover={{ scale: 1.02, y: -4 }}
			className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl`}
		>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
                <Icon className="w-8 h-8 mb-3 opacity-90" />
                <p className="text-sm font-medium opacity-90">{label}</p>
                <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            </div>
        </motion.div>
    );

    const BlogCard = ({ blog, index }: { blog: Blog; index: number }) => {
        const gradient = gradients[index % gradients.length];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradient}`} />

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {blog.featured && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                                        <Sparkles className="w-3 h-3" />
                                        Featured
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.status === 'published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {blog.status === 'published' ? '● Published' : '○ Draft'}
                                </span>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                                {blog.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{blog.excerpt}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {blog.wordCount.toLocaleString()} words
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {blog.readingTime} min
                            </span>
                        </div>
                        <Link
                            to={`/admin/journal/${blog.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all"
                        >
                            <PenTool className="w-4 h-4" />
                            Edit
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                                Journal & Blogs
                            </h1>
                            <p className="text-gray-600">Manage your content and track performance</p>
                        </div>
                        <Link
                            to="/admin/journal/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Blog
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={BookOpen}
                            label="Total Blogs"
                            value={stats.total}
                            gradient="from-purple-500 to-indigo-600"
                        />
                        <StatCard
                            icon={Eye}
                            label="Published"
                            value={stats.published}
                            gradient="from-green-500 to-emerald-600"
                        />
                        <StatCard
                            icon={FileText}
                            label="Drafts"
                            value={stats.draft}
                            gradient="from-orange-500 to-red-600"
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Total Words"
                            value={stats.totalWords}
                            gradient="from-blue-500 to-cyan-600"
                        />
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl p-4 shadow-lg">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'published', 'draft'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterStatus === status
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Blog Grid */}
                {filteredBlogs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No blogs found</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog, index) => (
                            <BlogCard key={blog.id} blog={blog} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
