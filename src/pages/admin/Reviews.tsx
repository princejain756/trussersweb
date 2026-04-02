import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    MessageSquare,
    Star,
    Loader2,
    AlertCircle,
    Trash2,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    Mail,
    Filter,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface Review {
    id: string;
    productId: string;
    userName: string;
    email: string;
    rating: number;
    title: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    clientInfo?: {
        ip: string;
        userAgent: string;
    };
}

interface ReviewStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface ReviewsData {
    stats: ReviewStats;
    reviews: Review[];
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    </motion.div>
);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={14}
                className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
            />
        ))}
    </div>
);

export const Reviews = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<ReviewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());

    const getAdminToken = useCallback(() => {
        return typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
    }, []);

    const fetchData = useCallback(async () => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/reviews`, {
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch reviews data');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch reviews data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load reviews data');
        } finally {
            setLoading(false);
        }
    }, [getAdminToken, navigate]);

    useEffect(() => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [getAdminToken, navigate, fetchData]);

    const handleDelete = async (id: string) => {
        const token = getAdminToken();
        if (!token) return;

        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            setActionLoading(id);
            const response = await fetch(`${apiBaseUrl}/api/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete review');
            }

            await fetchData();
            setSelectedReviews(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (err) {
            console.error('Delete error:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete review');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkDelete = async () => {
        const token = getAdminToken();
        if (!token) return;

        if (selectedReviews.size === 0) {
            alert('No reviews selected');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedReviews.size} reviews?`)) return;

        try {
            setActionLoading('bulk');
            const response = await fetch(`${apiBaseUrl}/api/admin/reviews/bulk-delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Key': token,
                },
                body: JSON.stringify({ ids: Array.from(selectedReviews) }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete reviews');
            }

            await fetchData();
            setSelectedReviews(new Set());
        } catch (err) {
            console.error('Bulk delete error:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete reviews');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: string) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(id);
            const response = await fetch(`${apiBaseUrl}/api/admin/reviews/${id}/approve`, {
                method: 'PATCH',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to approve review');
            }

            await fetchData();
        } catch (err) {
            console.error('Approve error:', err);
            alert(err instanceof Error ? err.message : 'Failed to approve review');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(id);
            const response = await fetch(`${apiBaseUrl}/api/admin/reviews/${id}/reject`, {
                method: 'PATCH',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to reject review');
            }

            await fetchData();
        } catch (err) {
            console.error('Reject error:', err);
            alert(err instanceof Error ? err.message : 'Failed to reject review');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSelectReview = (id: string) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedReviews.size === filteredReviews.length) {
            setSelectedReviews(new Set());
        } else {
            setSelectedReviews(new Set(filteredReviews.map(r => r.id)));
        }
    };

    const filteredReviews = (data?.reviews || []).filter(r => {
        if (activeTab === 'all') return true;
        return r.status === activeTab;
    });

    if (loading) {
        return (
            <AdminLayout title="Reviews">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Reviews">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchData} className="px-4 py-2 bg-[#1A3C27] text-white rounded-lg hover:bg-[#2D5F3F]">
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Product Reviews"
            actions={
                selectedReviews.size > 0 ? (
                    <button
                        onClick={handleBulkDelete}
                        disabled={actionLoading === 'bulk'}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {actionLoading === 'bulk' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Delete Selected ({selectedReviews.size})
                    </button>
                ) : undefined
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Reviews"
                        value={data?.stats.total || 0}
                        icon={MessageSquare}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Pending"
                        value={data?.stats.pending || 0}
                        icon={Filter}
                        color="bg-yellow-50 text-yellow-600"
                    />
                    <StatCard
                        title="Approved"
                        value={data?.stats.approved || 0}
                        icon={CheckCircle}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="Rejected"
                        value={data?.stats.rejected || 0}
                        icon={XCircle}
                        color="bg-red-50 text-red-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSelectedReviews(new Set());
                            }}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                    ? 'border-[#1A3C27] text-[#1A3C27]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab} ({tab === 'all' ? data?.stats.total : data?.stats[tab]} )
                        </button>
                    ))}
                </div>

                {/* Reviews Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">
                            <input
                                type="checkbox"
                                checked={filteredReviews.length > 0 && selectedReviews.size === filteredReviews.length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                            />
                        </div>
                        <div className="col-span-2">Reviewer</div>
                        <div className="col-span-1">Rating</div>
                        <div className="col-span-3">Review</div>
                        <div className="col-span-2">Product ID</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filteredReviews.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No reviews found
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredReviews.map((review) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-12 gap-3 items-center px-4 py-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="col-span-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedReviews.has(review.id)}
                                                onChange={() => toggleSelectReview(review.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {review.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-sm font-medium text-gray-900 truncate">{review.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2">{review.content}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm font-mono text-gray-600">{review.productId}</span>
                                        </div>
                                        <div className="col-span-1">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${review.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : review.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-1">
                                            {review.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={actionLoading === review.id}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {actionLoading === review.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(review.id)}
                                                        disabled={actionLoading === review.id}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                disabled={actionLoading === review.id}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {actionLoading === review.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Date info */}
                {filteredReviews.length > 0 && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last review: {new Date(filteredReviews[0].createdAt).toLocaleString('en-IN')}
                    </p>
                )}
            </div>
        </AdminLayout>
    );
};
