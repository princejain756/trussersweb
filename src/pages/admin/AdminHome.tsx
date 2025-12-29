import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    TrendingUp,
    TrendingDown,
    Package,
    CreditCard,
    RotateCcw,
    Eye,
    ShoppingCart,
    IndianRupee,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    Users,
    Percent,
    Loader2,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

// Types for API response
interface AnalyticsData {
    sessions: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
    sales: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
    orders: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
    conversionRate: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
}

interface QuickAction {
    label: string;
    count: number;
}

interface RecentOrder {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: string;
}

interface TopProduct {
    name: string;
    sold: number;
    revenue: string;
}

interface Summary {
    totalCustomers: number;
    activeDiscounts: number;
    totalProducts: number;
    avgOrderValue: string;
}

interface DashboardStats {
    analytics: AnalyticsData;
    quickActions: QuickAction[];
    recentOrders: RecentOrder[];
    topProducts: TopProduct[];
    summary: Summary;
}

const quickActionIcons = [Package, CreditCard, RotateCcw];
const quickActionColors = [
    'bg-blue-50 text-blue-600',
    'bg-orange-50 text-orange-600',
    'bg-purple-50 text-purple-600',
];

// Stat Card Component
const StatCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    sparkline
}: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon?: React.ElementType;
    sparkline?: boolean;
}) => {
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{title}</span>
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
                    <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                        {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
                        <span>{change}</span>
                    </div>
                </div>
                {sparkline && (
                    <div className="h-10 w-20 flex items-end gap-0.5">
                        {[4, 6, 3, 8, 5, 7, 9, 6, 8].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-green-100 rounded-t"
                                style={{ height: `${h * 10}%` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const AdminHome = () => {
    const navigate = useNavigate();
    const [_dateRange, _setDateRange] = useState('Last 30 days');
    const [liveVisitors, setLiveVisitors] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getAdminToken = useCallback(() => {
        return typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
    }, []);

    const fetchStats = useCallback(async () => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/stats`, {
                headers: {
                    'X-Admin-Key': token,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch dashboard stats');
            }

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
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
        fetchStats();
    }, [getAdminToken, navigate, fetchStats]);

    // Simulate live visitors update (this would need real analytics integration)
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveVisitors(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error || !stats) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
                    <button
                        onClick={fetchStats}
                        className="px-4 py-2 bg-[#1A3C27] text-white rounded-lg hover:bg-[#2D5F3F]"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const { analytics, quickActions, recentOrders, topProducts, summary } = stats;

    return (
        <AdminLayout title="Dashboard">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Calendar className="w-4 h-4" />
                        {_dateRange}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        All channels
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {liveVisitors} live visitors
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Sessions"
                        value={analytics.sessions.value}
                        change={analytics.sessions.change}
                        trend={analytics.sessions.trend}
                        icon={Eye}
                        sparkline
                    />
                    <StatCard
                        title="Total sales breakdown"
                        value={analytics.sales.value}
                        change={analytics.sales.change}
                        trend={analytics.sales.trend}
                        icon={IndianRupee}
                    />
                    <StatCard
                        title="Orders"
                        value={analytics.orders.value}
                        change={analytics.orders.change}
                        trend={analytics.orders.trend}
                        icon={ShoppingCart}
                        sparkline
                    />
                    <StatCard
                        title="Conversion rate"
                        value={analytics.conversionRate.value}
                        change={analytics.conversionRate.change}
                        trend={analytics.conversionRate.trend}
                        icon={Percent}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = quickActionIcons[index] || Package;
                        const color = quickActionColors[index] || quickActionColors[0];
                        return (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left group"
                            >
                                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    {action.label}
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="text-sm text-[#1A3C27] font-medium hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No orders yet
                                </div>
                            ) : (
                                recentOrders.map((order, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{order.customer}</p>
                                                <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900 text-sm">{order.amount}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-green-50 text-green-700' :
                                                order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
                                                    order.status === 'Failed' ? 'bg-red-50 text-red-700' :
                                                        'bg-blue-50 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900">Top Products</h2>
                            <button
                                onClick={() => navigate('/admin/products')}
                                className="text-sm text-[#1A3C27] font-medium hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {topProducts.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No sales data yet
                                </div>
                            ) : (
                                topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#F4EFEC] flex items-center justify-center">
                                                <Package className="w-5 h-5 text-[#1A3C27]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.sold} sold</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm">{product.revenue}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Customers', value: String(summary.totalCustomers), icon: Users },
                        { label: 'Active Discounts', value: String(summary.activeDiscounts), icon: Percent },
                        { label: 'Products', value: String(summary.totalProducts), icon: Package },
                        { label: 'Avg Order Value', value: summary.avgOrderValue, icon: IndianRupee },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="bg-white rounded-xl p-4 border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-[#1A3C27]/10 flex items-center justify-center">
                                    <item.icon className="w-4 h-4 text-[#1A3C27]" />
                                </div>
                            </div>
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                            <p className="text-sm text-gray-500">{item.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};
