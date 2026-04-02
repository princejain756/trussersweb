import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Image as ImageIcon,
    Zap,
    Check,
    AlertCircle,
    RefreshCw,
    Filter,
    HardDrive,
    FileImage,
    CheckCircle2,
    XCircle,
    Package,
    FileText,
    Globe,
    Loader2,
    Trash2,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface ImageUsage {
    type: 'product' | 'blog' | 'blog-content' | 'website';
    name: string;
    id: string;
}

interface ImageItem {
    filename: string;
    path: string;
    size: number;
    uploadedAt: string;
    isOptimized: boolean;
    usedIn: ImageUsage[];
}

interface ImageStats {
    total: number;
    optimized: number;
    unoptimized: number;
    unused: number;
    totalSize: number;
}

type FilterType = 'all' | 'optimized' | 'unoptimized' | 'unused';

function getStoredToken(): string | null {
    try {
        return localStorage.getItem('adminToken');
    } catch {
        return null;
    }
}

function buildAuthHeaders(): Record<string, string> {
    const token = getStoredToken();
    return token ? { 'X-Admin-Key': token } : {};
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getUsageIcon(type: string) {
    switch (type) {
        case 'product': return Package;
        case 'blog':
        case 'blog-content': return FileText;
        case 'website': return Globe;
        default: return FileImage;
    }
}

export default function ImageLibrary() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [stats, setStats] = useState<ImageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [optimizing, setOptimizing] = useState<string | null>(null);
    const [bulkOptimizing, setBulkOptimizing] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadImages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/images`, {
                headers: buildAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to load images');
            const data = await response.json();
            setImages(data.images || []);
            setStats(data.stats || null);
            setSelectedImages(new Set());
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to load image library' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const handleOptimizeSingle = async (filename: string) => {
        try {
            setOptimizing(filename);
            const response = await fetch(`${apiBaseUrl}/api/admin/images/${encodeURIComponent(filename)}/optimize`, {
                method: 'POST',
                headers: {
                    ...buildAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Optimization failed');
            const result = await response.json();

            if (result.alreadyOptimized) {
                setNotice({ type: 'success', message: 'Image is already optimized' });
            } else {
                setNotice({
                    type: 'success',
                    message: `Optimized! Saved ${formatBytes(result.savedBytes)} (${result.compressionPercent}%)`
                });
            }
            await loadImages();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to optimize image' });
        } finally {
            setOptimizing(null);
        }
    };

    const handleOptimizeAll = async () => {
        if (!confirm(`Optimize ${stats?.unoptimized || 0} unoptimized images? This may take a moment.`)) {
            return;
        }

        try {
            setBulkOptimizing(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/images/optimize`, {
                method: 'POST',
                headers: {
                    ...buildAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Bulk optimization failed');
            const result = await response.json();

            setNotice({
                type: 'success',
                message: `${result.message}. Total saved: ${formatBytes(result.totalSaved)}`
            });
            await loadImages();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to optimize images' });
        } finally {
            setBulkOptimizing(false);
        }
    };

    const handleDelete = async (filenamesToDelete: string[]) => {
        const count = filenamesToDelete.length;
        if (!confirm(`Are you sure you want to delete ${count} image${count !== 1 ? 's' : ''}? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/images`, {
                method: 'DELETE',
                headers: {
                    ...buildAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filenames: filenamesToDelete }),
            });

            if (!response.ok) throw new Error('Delete failed');
            const result = await response.json();

            setNotice({ type: 'success', message: result.message });
            await loadImages();
        } catch (error) {
            setNotice({ type: 'error', message: 'Failed to delete images' });
        } finally {
            setDeleting(false);
        }
    };

    const filteredImages = images.filter(img => {
        switch (filter) {
            case 'optimized': return img.isOptimized;
            case 'unoptimized': return !img.isOptimized;
            case 'unused': return img.usedIn.length === 0;
            default: return true;
        }
    });

    const handleToggleSelect = (filename: string) => {
        const newSelected = new Set(selectedImages);
        if (newSelected.has(filename)) {
            newSelected.delete(filename);
        } else {
            newSelected.add(filename);
        }
        setSelectedImages(newSelected);
    };

    const handleSelectAll = () => {
        const allFilteredSelected = filteredImages.length > 0 && filteredImages.every(img => selectedImages.has(img.filename));

        if (allFilteredSelected) {
            const newSelected = new Set(selectedImages);
            filteredImages.forEach(img => newSelected.delete(img.filename));
            setSelectedImages(newSelected);
        } else {
            const newSelected = new Set(selectedImages);
            filteredImages.forEach(img => newSelected.add(img.filename));
            setSelectedImages(newSelected);
        }
    };

    return (
        <AdminLayout title="Image Library">
            <div className="p-6 space-y-6">
                {/* Notice */}
                <AnimatePresence>
                    {notice && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-lg flex items-center gap-3 ${notice.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {notice.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span>{notice.message}</span>
                            <button
                                onClick={() => setNotice(null)}
                                className="ml-auto text-current opacity-60 hover:opacity-100"
                            >
                                ×
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ImageIcon className="w-7 h-7 text-indigo-600" />
                            Image Library
                        </h1>
                        <p className="text-gray-500 mt-1">Manage and optimize uploaded images</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {selectedImages.size > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => handleDelete(Array.from(selectedImages))}
                                disabled={deleting}
                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedImages.size})
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            onClick={loadImages}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleOptimizeAll}
                            disabled={bulkOptimizing || !stats?.unoptimized}
                        >
                            {bulkOptimizing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4 mr-2" />
                            )}
                            Optimize All ({stats?.unoptimized || 0})
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <FileImage className="w-4 h-4" />
                                Total Images
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Optimized
                            </div>
                            <div className="text-2xl font-bold text-green-600">{stats.optimized}</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
                                <XCircle className="w-4 h-4" />
                                Unoptimized
                            </div>
                            <div className="text-2xl font-bold text-amber-600">{stats.unoptimized}</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <AlertCircle className="w-4 h-4" />
                                Unused
                            </div>
                            <div className="text-2xl font-bold text-gray-600">{stats.unused}</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <HardDrive className="w-4 h-4" />
                                Total Size
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
                            {(['all', 'optimized', 'unoptimized', 'unused'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                            Showing {filteredImages.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 hover:text-gray-900 px-2">
                            <input
                                type="checkbox"
                                checked={filteredImages.length > 0 && filteredImages.every(img => selectedImages.has(img.filename))}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            Select All
                        </label>
                    </div>
                </div>

                {/* Image Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredImages.map((image) => {
                            const isSelected = selectedImages.has(image.filename);
                            return (
                                <motion.div
                                    key={image.filename}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-white rounded-xl border overflow-hidden group relative transition-all ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md' : 'border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    {/* Selection Checkbox Overlay */}
                                    <div className={`absolute top-2 left-2 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleSelect(image.filename)}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shadow-sm cursor-pointer"
                                        />
                                    </div>

                                    {/* Thumbnail */}
                                    <div
                                        className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                                        onClick={() => handleToggleSelect(image.filename)}
                                    >
                                        <img
                                            src={`${apiBaseUrl}${image.path}`}
                                            alt={image.filename}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        {/* Status badge */}
                                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-white/90 backdrop-blur-sm shadow-sm ${image.isOptimized
                                            ? 'text-green-700'
                                            : 'text-amber-700'
                                            }`}>
                                            {image.isOptimized ? 'Optimized' : 'Pending'}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="text-sm font-medium text-gray-900 truncate flex-1" title={image.filename}>
                                                {image.filename}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete([image.filename]);
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                                title="Delete image"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatBytes(image.size)}</span>
                                            <span>{formatDate(image.uploadedAt)}</span>
                                        </div>

                                        {/* Used in */}
                                        {image.usedIn.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {image.usedIn.slice(0, 3).map((usage, idx) => {
                                                    const Icon = getUsageIcon(usage.type);
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                            title={usage.name}
                                                        >
                                                            <Icon className="w-3 h-3" />
                                                            <span className="truncate max-w-[80px]">{usage.name}</span>
                                                        </span>
                                                    );
                                                })}
                                                {image.usedIn.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                                        +{image.usedIn.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Not used anywhere</span>
                                        )}

                                        {/* Optimize button */}
                                        {!image.isOptimized && (
                                            <button
                                                onClick={() => handleOptimizeSingle(image.filename)}
                                                disabled={optimizing === image.filename}
                                                className="w-full mt-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {optimizing === image.filename ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Zap className="w-4 h-4" />
                                                )}
                                                Optimize
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout >
    );
}
