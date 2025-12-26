import { useState, useEffect } from 'react';
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
} from 'lucide-react';

// Mock Analytics Data
const analyticsData = {
    sessions: { value: '74K', change: '+642%', trend: 'up' as const },
    sales: { value: '₹1,07,499.68', change: '+76%', trend: 'up' as const },
    orders: { value: '26', change: '+63%', trend: 'up' as const },
    conversionRate: { value: '0%', change: '0%', trend: 'neutral' as const },
};

const quickActions = [
    { label: '2 orders to fulfill', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: '31 payments to capture', icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
    { label: '1 return request', icon: RotateCcw, color: 'bg-purple-50 text-purple-600' },
];

const recentOrders = [
    { id: '#1024', customer: 'Rahul Sharma', date: 'Today, 10:45 AM', amount: '₹2,499', status: 'Pending' },
    { id: '#1023', customer: 'Priya Patel', date: 'Today, 9:30 AM', amount: '₹4,150', status: 'Completed' },
    { id: '#1022', customer: 'Amit Kumar', date: 'Yesterday', amount: '₹1,899', status: 'Shipped' },
    { id: '#1021', customer: 'Sneha Reddy', date: 'Yesterday', amount: '₹3,299', status: 'Completed' },
    { id: '#1020', customer: 'Vikram Singh', date: '2 days ago', amount: '₹5,499', status: 'Completed' },
];

const topProducts = [
    { name: 'Corporate Gift Set Premium', sold: 45, revenue: '₹1,12,275' },
    { name: 'Eco-Friendly Bottle Bag', sold: 89, revenue: '₹44,411' },
    { name: 'Festive Celebration Hamper', sold: 32, revenue: '₹28,768' },
    { name: "Women's Gift Collection", sold: 28, revenue: '₹36,372' },
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
    const [dateRange, setDateRange] = useState('Last 30 days');
    const [liveVisitors, setLiveVisitors] = useState(9);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    // Simulate live visitors update
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveVisitors(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout title="Dashboard">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Calendar className="w-4 h-4" />
                        {dateRange}
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
                        value={analyticsData.sessions.value}
                        change={analyticsData.sessions.change}
                        trend={analyticsData.sessions.trend}
                        icon={Eye}
                        sparkline
                    />
                    <StatCard
                        title="Total sales breakdown"
                        value={analyticsData.sales.value}
                        change={analyticsData.sales.change}
                        trend={analyticsData.sales.trend}
                        icon={IndianRupee}
                    />
                    <StatCard
                        title="Orders"
                        value={analyticsData.orders.value}
                        change={analyticsData.orders.change}
                        trend={analyticsData.orders.trend}
                        icon={ShoppingCart}
                        sparkline
                    />
                    <StatCard
                        title="Conversion rate"
                        value={analyticsData.conversionRate.value}
                        change={analyticsData.conversionRate.change}
                        trend={analyticsData.conversionRate.trend}
                        icon={Percent}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {action.label}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    ))}
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
                            {recentOrders.map((order, index) => (
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
                                                    'bg-blue-50 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
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
                            {topProducts.map((product, index) => (
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
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Customers', value: '1,234', icon: Users },
                        { label: 'Active Discounts', value: '8', icon: Percent },
                        { label: 'Products', value: '156', icon: Package },
                        { label: 'Avg Order Value', value: '₹2,456', icon: IndianRupee },
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
