import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Eye,
    FileText,
    ImageIcon,
    PenTool,
    Plus,
    Save,
    Search,
    Sparkles,
    Tag,
    Trash2,
    X,
    Calendar,
    User,
    Bold,
    Italic,
    Underline,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
} from 'lucide-react';
import { AdminLayout } from '../../components/Admin/AdminLayout';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type Blog = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    publishedDate: string;
    status: 'published' | 'draft';
    tags: string[];
    seoKeywords: string[];
    readingTime: number;
    wordCount: number;
    featured: boolean;
    coverImage?: string;
};

type BlogDraft = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    status: 'published' | 'draft';
    tags: string[];
    featured: boolean;
    coverImage: string;
};

const getStoredToken = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('adminToken');
};

const buildAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    return token ? { 'X-Admin-Key': token } : {};
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

// Helper to resolve image URLs properly for display
const resolveImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '';
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

const defaultBlogDraft: BlogDraft = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Trusser Team',
    status: 'draft',
    tags: [],
    featured: false,
    coverImage: '',
};

export const Journal = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

    // Form states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [blogDraft, setBlogDraft] = useState<BlogDraft>(defaultBlogDraft);
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/blogs`, {
                headers: buildAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch blogs');
            const data = await response.json();
            // API returns { blogs: [...], stats: {...} }
            const blogsList = Array.isArray(data) ? data : (data.blogs || []);
            setBlogs(blogsList);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch blogs';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${apiBaseUrl}/api/uploads`, {
            method: 'POST',
            headers: buildAuthHeaders(),
            body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data?.error || 'Image upload failed');
        }
        return data.url;
    };

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');
        try {
            const url = await uploadImage(file);
            setBlogDraft(prev => ({ ...prev, coverImage: url }));
            setNotice('Image uploaded successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Image upload failed';
            setError(message);
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleTitleChange = (value: string) => {
        setBlogDraft(prev => ({
            ...prev,
            title: value,
            slug: editingId ? prev.slug : slugify(value),
        }));
    };

    const addTag = () => {
        const tag = newTag.trim();
        if (tag && !blogDraft.tags.includes(tag)) {
            setBlogDraft(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setBlogDraft(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    };

    const beginEdit = (blog: Blog) => {
        setEditingId(blog.id);
        setBlogDraft({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            author: blog.author,
            status: blog.status,
            tags: [...blog.tags],
            featured: blog.featured,
            coverImage: blog.coverImage || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setBlogDraft(defaultBlogDraft);
        setNewTag('');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!blogDraft.title.trim() || !blogDraft.excerpt.trim()) {
            setError('Title and excerpt are required');
            return;
        }

        setSaving(true);
        setError('');
        setNotice('');

        try {
            const payload = {
                ...blogDraft,
                title: blogDraft.title.trim(),
                slug: blogDraft.slug.trim() || slugify(blogDraft.title),
                excerpt: blogDraft.excerpt.trim(),
                content: blogDraft.content.trim(),
                author: blogDraft.author.trim() || 'Trusser Team',
            };

            const isEditing = !!editingId;
            const endpoint = isEditing
                ? `${apiBaseUrl}/api/admin/blogs/${editingId}`
                : `${apiBaseUrl}/api/admin/blogs`;

            const response = await fetch(endpoint, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...buildAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to save blog');
            }

            setNotice(isEditing ? 'Blog updated successfully' : 'Blog created successfully');
            cancelEdit();
            fetchBlogs();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save blog';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (blog: Blog) => {
        if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;

        setDeleting(prev => ({ ...prev, [blog.id]: true }));
        setError('');
        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/blogs/${blog.id}`, {
                method: 'DELETE',
                headers: buildAuthHeaders(),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.error || 'Failed to delete blog');
            }
            setNotice('Blog deleted successfully');
            fetchBlogs();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete blog';
            setError(message);
        } finally {
            setDeleting(prev => ({ ...prev, [blog.id]: false }));
        }
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        draft: blogs.filter(b => b.status === 'draft').length,
    };

    const isFormValid = blogDraft.title.trim() && blogDraft.excerpt.trim();

    return (
        <AdminLayout title="Journal">
            <div className="relative min-h-screen overflow-hidden bg-[#F4EFEC] -m-4 lg:-m-6">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%)]" />
                <motion.div
                    className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-[#1A3C27]/20 blur-3xl"
                    animate={{ y: [0, 18, 0], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 p-4 lg:p-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-['Playfair_Display'] font-bold text-[#1A3C27]">
                                    Journal Management
                                </h1>
                                <p className="text-[#5C5C5C] text-sm">Create, edit, and manage your blog posts</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="px-3 py-1.5 bg-[#1A3C27] text-white rounded-full">
                                    {stats.total} Total
                                </span>
                                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                    {stats.published} Published
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                                    {stats.draft} Draft
                                </span>
                            </div>
                        </div>

                        {/* Notifications */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        {notice && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                                {notice}
                            </div>
                        )}
                    </motion.div>

                    {/* Main Content - Split Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Left Panel - Blog Editor Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="xl:col-span-5"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E1D8] shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A3C27] to-[#2D5F3F] flex items-center justify-center">
                                        {editingId ? <PenTool className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-[#1A3C27]">
                                            {editingId ? 'Edit Blog Post' : 'Create New Blog'}
                                        </h2>
                                        <p className="text-xs text-[#5C5C5C]">
                                            {editingId ? 'Update the blog post details' : 'Fill in the details to publish a new post'}
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            Blog Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={blogDraft.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            placeholder="Enter an engaging title..."
                                            className="w-full px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm"
                                        />
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            URL Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={blogDraft.slug}
                                            onChange={(e) => setBlogDraft(prev => ({ ...prev, slug: e.target.value }))}
                                            placeholder="auto-generated-from-title"
                                            className="w-full px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm font-mono"
                                        />
                                    </div>

                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            Cover Image
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="relative h-40 bg-[#F4EFEC] rounded-xl border-2 border-dashed border-[#C1A17C]/50 overflow-hidden cursor-pointer hover:border-[#1A3C27] transition-colors group"
                                                onClick={() => document.getElementById('blog-image-upload')?.click()}
                                            >
                                                {blogDraft.coverImage ? (
                                                    <>
                                                        <img
                                                            src={resolveImageUrl(blogDraft.coverImage)}
                                                            alt="Cover"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-sm font-medium">Click to replace</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-[#5C5C5C]">
                                                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                        <span className="text-sm">Click to upload cover image</span>
                                                        <span className="text-xs opacity-70">JPG, PNG, WebP up to 8MB</span>
                                                    </div>
                                                )}
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A3C27] border-t-transparent" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="blog-image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    {/* Author & Status Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                                Author
                                            </label>
                                            <input
                                                type="text"
                                                value={blogDraft.author}
                                                onChange={(e) => setBlogDraft(prev => ({ ...prev, author: e.target.value }))}
                                                placeholder="Trusser Team"
                                                className="w-full px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={blogDraft.status}
                                                onChange={(e) => setBlogDraft(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                                                className="w-full px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Featured Toggle */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setBlogDraft(prev => ({ ...prev, featured: !prev.featured }))}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${blogDraft.featured ? 'bg-[#C1A17C]' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${blogDraft.featured ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-sm text-[#5C5C5C] flex items-center gap-1">
                                            <Sparkles className="w-4 h-4 text-[#C1A17C]" />
                                            Featured Article
                                        </span>
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            Excerpt *
                                        </label>
                                        <textarea
                                            value={blogDraft.excerpt}
                                            onChange={(e) => setBlogDraft(prev => ({ ...prev, excerpt: e.target.value }))}
                                            placeholder="A brief summary that appears in listings..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm resize-none"
                                        />
                                    </div>

                                    {/* Rich Text Content Editor */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            Content
                                        </label>

                                        {/* Formatting Toolbar */}
                                        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#E5E1D8]/50 rounded-t-xl border-b border-[#E5E1D8]">
                                            {/* Text Style Group */}
                                            <div className="flex items-center gap-0.5 pr-2 border-r border-[#C1A17C]/30">
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('bold')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Bold (Ctrl+B)"
                                                >
                                                    <Bold className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('italic')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Italic (Ctrl+I)"
                                                >
                                                    <Italic className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('underline')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Underline (Ctrl+U)"
                                                >
                                                    <Underline className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                            </div>

                                            {/* Headings Group */}
                                            <div className="flex items-center gap-0.5 px-2 border-r border-[#C1A17C]/30">
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('formatBlock', false, 'h2')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Heading 1"
                                                >
                                                    <Heading1 className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('formatBlock', false, 'h3')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Heading 2"
                                                >
                                                    <Heading2 className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('formatBlock', false, 'p')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Normal Text"
                                                >
                                                    <Type className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                            </div>

                                            {/* Lists Group */}
                                            <div className="flex items-center gap-0.5 px-2 border-r border-[#C1A17C]/30">
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('insertUnorderedList')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Bullet List"
                                                >
                                                    <List className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('insertOrderedList')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Numbered List"
                                                >
                                                    <ListOrdered className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('formatBlock', false, 'blockquote')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Quote"
                                                >
                                                    <Quote className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                            </div>

                                            {/* Alignment Group */}
                                            <div className="flex items-center gap-0.5 pl-2">
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('justifyLeft')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Align Left"
                                                >
                                                    <AlignLeft className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('justifyCenter')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Align Center"
                                                >
                                                    <AlignCenter className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => document.execCommand('justifyRight')}
                                                    className="p-2 hover:bg-[#1A3C27]/10 rounded-lg transition-colors"
                                                    title="Align Right"
                                                >
                                                    <AlignRight className="w-4 h-4 text-[#1A3C27]" />
                                                </button>
                                            </div>

                                            {/* Font Size Dropdown */}
                                            <div className="ml-auto">
                                                <select
                                                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                                                    className="px-2 py-1.5 bg-white border border-[#E5E1D8] rounded-lg text-xs text-[#1A3C27] outline-none"
                                                    title="Font Size"
                                                >
                                                    <option value="">Size</option>
                                                    <option value="1">Small</option>
                                                    <option value="3">Normal</option>
                                                    <option value="5">Large</option>
                                                    <option value="7">Extra Large</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Editable Content Area */}
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="w-full min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-b-xl outline-none transition-all text-sm prose prose-sm max-w-none"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                            onInput={(e) => {
                                                const content = (e.target as HTMLDivElement).innerHTML;
                                                setBlogDraft(prev => ({ ...prev, content }));
                                            }}
                                            onBlur={(e) => {
                                                const content = (e.target as HTMLDivElement).innerHTML;
                                                setBlogDraft(prev => ({ ...prev, content }));
                                            }}
                                            dangerouslySetInnerHTML={{ __html: blogDraft.content }}
                                        />

                                        <p className="mt-1 text-xs text-[#5C5C5C]">
                                            Select text and use the toolbar to format. Supports Bold, Italic, Headings, Lists, and more.
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1A3C27] uppercase tracking-wider mb-2">
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {blogDraft.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#1A3C27]/10 text-[#1A3C27] rounded-full text-xs"
                                                >
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(index)}
                                                        className="ml-1 hover:text-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag();
                                                    }
                                                }}
                                                placeholder="Add a tag..."
                                                className="flex-1 px-4 py-2 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="px-4 py-2 bg-[#1A3C27]/10 text-[#1A3C27] rounded-xl hover:bg-[#1A3C27]/20 transition-colors text-sm font-medium"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-[#E5E1D8]">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={!isFormValid || saving}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1A3C27] to-[#2D5F3F] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    {editingId ? 'Update Blog' : 'Create Blog'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>

                        {/* Right Panel - Blog List */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="xl:col-span-7"
                        >
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E5E1D8] shadow-sm">
                                {/* List Header */}
                                <div className="p-4 border-b border-[#E5E1D8]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-[#1A3C27] flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            All Blog Posts
                                        </h2>
                                        <span className="text-sm text-[#5C5C5C]">
                                            Showing {filteredBlogs.length} of {blogs.length}
                                        </span>
                                    </div>

                                    {/* Search & Filter */}
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5C5C]" />
                                            <input
                                                type="text"
                                                placeholder="Search blogs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-[#F4EFEC] border-2 border-transparent focus:border-[#1A3C27] rounded-xl outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-1.5">
                                            {(['all', 'published', 'draft'] as const).map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => setFilterStatus(status)}
                                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterStatus === status
                                                        ? 'bg-[#1A3C27] text-white'
                                                        : 'bg-[#F4EFEC] text-[#5C5C5C] hover:bg-[#E5E1D8]'
                                                        }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Blog List */}
                                <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A3C27] border-t-transparent" />
                                        </div>
                                    ) : filteredBlogs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-[#5C5C5C]">No blogs found</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[#E5E1D8]">
                                            {filteredBlogs.map((blog, index) => (
                                                <motion.div
                                                    key={blog.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-4 hover:bg-[#F4EFEC]/50 transition-colors ${editingId === blog.id ? 'bg-[#1A3C27]/5 ring-2 ring-[#1A3C27]/20' : ''}`}
                                                >
                                                    <div className="flex gap-4">
                                                        {/* Thumbnail */}
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F4EFEC] flex-shrink-0">
                                                            {blog.coverImage ? (
                                                                <img
                                                                    src={resolveImageUrl(blog.coverImage)}
                                                                    alt={blog.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {blog.featured && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C1A17C] text-white text-xs font-bold rounded-full">
                                                                            <Sparkles className="w-3 h-3" />
                                                                            Featured
                                                                        </span>
                                                                    )}
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {blog.status === 'published' ? '● Published' : '○ Draft'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <h3 className="font-semibold text-[#1A3C27] line-clamp-1 mb-1">
                                                                {blog.title}
                                                            </h3>

                                                            <p className="text-sm text-[#5C5C5C] line-clamp-1 mb-2">
                                                                {blog.excerpt}
                                                            </p>

                                                            <div className="flex items-center gap-4 text-xs text-[#5C5C5C]">
                                                                <span className="flex items-center gap-1">
                                                                    <User className="w-3 h-3" />
                                                                    {blog.author}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(blog.publishedDate).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {blog.readingTime} min read
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => window.open(`/journal/${blog.slug}`, '_blank')}
                                                                className="px-3 py-1.5 text-xs font-medium text-[#5C5C5C] border border-[#E5E1D8] rounded-lg hover:bg-[#F4EFEC] transition-colors flex items-center gap-1"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => beginEdit(blog)}
                                                                className="px-3 py-1.5 text-xs font-medium text-[#1A3C27] border border-[#1A3C27]/30 rounded-lg hover:bg-[#1A3C27]/10 transition-colors flex items-center gap-1"
                                                            >
                                                                <PenTool className="w-3 h-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(blog)}
                                                                disabled={deleting[blog.id]}
                                                                className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                {deleting[blog.id] ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent" />
                                                                ) : (
                                                                    <Trash2 className="w-3 h-3" />
                                                                )}
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
