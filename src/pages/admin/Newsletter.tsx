import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    Newspaper,
    Mail,
    Users,
    UserMinus,
    Loader2,
    AlertCircle,
    Download,
    Trash2,
    Globe,
    Calendar,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface Subscriber {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    subscribedAt: string;
    unsubscribedAt?: string;
    source: string;
    ip?: string;
}

interface NewsletterStats {
    total: number;
    active: number;
    unsubscribed: number;
}

interface NewsletterData {
    stats: NewsletterStats;
    subscribers: Subscriber[];
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

export const Newsletter = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<NewsletterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'unsubscribed'>('active');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
            const response = await fetch(`${apiBaseUrl}/api/admin/newsletter`, {
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch newsletter data');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch newsletter data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load newsletter data');
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

    const handleUnsubscribe = async (id: string) => {
        const token = getAdminToken();
        if (!token) return;

        if (!confirm('Are you sure you want to unsubscribe this email?')) return;

        try {
            setActionLoading(id);
            const response = await fetch(`${apiBaseUrl}/api/admin/newsletter/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to unsubscribe');
            }

            await fetchData();
        } catch (err) {
            console.error('Unsubscribe error:', err);
            alert(err instanceof Error ? err.message : 'Failed to unsubscribe');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExport = () => {
        const token = getAdminToken();
        if (!token) return;

        window.open(`${apiBaseUrl}/api/admin/newsletter/export?token=${token}`, '_blank');
    };

    const filteredSubscribers = data?.subscribers.filter(s =>
        activeTab === 'active' ? s.status === 'active' : s.status === 'unsubscribed'
    ) || [];

    if (loading) {
        return (
            <AdminLayout title="Newsletter">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Newsletter">
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
            title="Newsletter Subscribers"
            actions={
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A3C27] text-white text-sm font-medium rounded-lg hover:bg-[#2D5F3F] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Subscribers"
                        value={data?.stats.total || 0}
                        icon={Newspaper}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Active Subscribers"
                        value={data?.stats.active || 0}
                        icon={Users}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="Unsubscribed"
                        value={data?.stats.unsubscribed || 0}
                        icon={UserMinus}
                        color="bg-gray-50 text-gray-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-[#1A3C27] text-[#1A3C27]' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active ({data?.stats.active || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('unsubscribed')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'unsubscribed' ? 'border-[#1A3C27] text-[#1A3C27]' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Unsubscribed ({data?.stats.unsubscribed || 0})
                    </button>
                </div>

                {/* Subscribers Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-2">IP Address</div>
                        <div className="col-span-2">Subscribed At</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filteredSubscribers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {activeTab === 'active' ? 'No active subscribers yet' : 'No unsubscribed users'}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredSubscribers.map((subscriber) => (
                                    <motion.div
                                        key={subscriber.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="col-span-4 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-600 capitalize">{subscriber.source || 'footer'}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1">
                                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-600 font-mono">{subscriber.ip || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                {new Date(subscriber.subscribedAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            {subscriber.status === 'active' && (
                                                <button
                                                    onClick={() => handleUnsubscribe(subscriber.id)}
                                                    disabled={actionLoading === subscriber.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Unsubscribe"
                                                >
                                                    {actionLoading === subscriber.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            {subscriber.status === 'unsubscribed' && (
                                                <span className="text-xs text-gray-400">
                                                    {subscriber.unsubscribedAt
                                                        ? `Removed ${new Date(subscriber.unsubscribedAt).toLocaleDateString('en-IN')}`
                                                        : 'Removed'}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
