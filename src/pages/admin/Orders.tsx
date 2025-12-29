import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Plus,
    Search,
    Filter,
    Download,
    Calendar,
    ChevronDown,
    MessageSquare,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Loader2,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

// Order Types
type PaymentStatus = 'Paid' | 'Payment pending' | 'Refunded' | 'Voided';
type FulfillmentStatus = 'Fulfilled' | 'Unfulfilled' | 'Partially fulfilled';
type DeliveryStatus = 'Delivered' | 'In transit' | 'Out for delivery' | 'Pending';

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    email: string;
    channel: string;
    total: string;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    items: number;
    deliveryStatus: DeliveryStatus;
    deliveryMethod: string;
    tags: string[];
    hasNote: boolean;
}

interface OrderStats {
    total: number;
    itemsOrdered: number;
    returns: number;
    fulfilled: number;
    delivered: number;
}

// Status Badge Components
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
    const styles = {
        Paid: 'bg-green-100 text-green-700',
        'Payment pending': 'bg-orange-100 text-orange-700',
        Refunded: 'bg-blue-100 text-blue-700',
        Voided: 'bg-gray-100 text-gray-600',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const FulfillmentBadge = ({ status }: { status: FulfillmentStatus }) => {
    const styles = {
        Fulfilled: 'bg-green-50 text-green-700 border-green-200',
        Unfulfilled: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'Partially fulfilled': 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const icons = {
        Fulfilled: CheckCircle2,
        Unfulfilled: Clock,
        'Partially fulfilled': Package,
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
};

const DeliveryBadge = ({ status }: { status: DeliveryStatus }) => {
    const styles = {
        Delivered: 'bg-green-50 text-green-700',
        'In transit': 'bg-blue-50 text-blue-700',
        'Out for delivery': 'bg-purple-50 text-purple-700',
        Pending: 'bg-gray-50 text-gray-600',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
            {status === 'In transit' && <Truck className="w-3 h-3" />}
            {status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
            {status}
        </span>
    );
};

export const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAdminToken = useCallback(() => {
        return typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
    }, []);

    const fetchOrders = useCallback(async () => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/orders`, {
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
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders || []);
            setOrderStats(data.stats || null);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
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
        fetchOrders();
    }, [getAdminToken, navigate, fetchOrders]);

    const tabs = ['All', 'Unfulfilled', 'Unpaid', 'Open', 'Archived', 'Return requests'];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === 'All') return matchesSearch;
        if (activeTab === 'Unfulfilled') return matchesSearch && order.fulfillmentStatus === 'Unfulfilled';
        if (activeTab === 'Unpaid') return matchesSearch && order.paymentStatus === 'Payment pending';
        return matchesSearch;
    });

    // Stats
    const stats = [
        { label: 'Orders', value: orderStats?.total || 0, change: '—' },
        { label: 'Items ordered', value: orderStats?.itemsOrdered || 0, change: '—' },
        { label: 'Returns', value: orderStats?.returns || 0, change: '₹0' },
        { label: 'Orders fulfilled', value: orderStats?.fulfilled || 0, change: '—' },
        { label: 'Orders delivered', value: orderStats?.delivered || 0, change: '—' },
        { label: 'Order to fulfillment time', value: '—', change: '' },
    ];

    if (loading) {
        return (
            <AdminLayout title="Orders">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Orders">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-[#1A3C27] text-white rounded-lg hover:bg-[#2D5F3F]"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Orders"
            actions={
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                        More actions
                        <ChevronDown className="w-4 h-4 inline ml-1" />
                    </button>
                    <Button className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2 text-sm font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        Create order
                    </Button>
                </div>
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Date Filter */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" />
                        Today
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg p-4 border border-gray-100"
                        >
                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-400">{stat.change}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <button className="px-3 py-3 text-gray-400 hover:text-gray-600">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        </div>
                        <div className="col-span-1">Order</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Customer</div>
                        <div className="col-span-1">Total</div>
                        <div className="col-span-1">Payment</div>
                        <div className="col-span-1">Fulfillment</div>
                        <div className="col-span-1">Items</div>
                        <div className="col-span-1">Delivery</div>
                        <div className="col-span-1">Tags</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-50">
                        {filteredOrders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="col-span-1 flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                            {order.hasNote && <MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
                                        </div>
                                        <div className="col-span-1">
                                            <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600">{order.date}</div>
                                        <div className="col-span-2 text-sm text-gray-900">{order.customer}</div>
                                        <div className="col-span-1 text-sm font-medium text-gray-900">{order.total}</div>
                                        <div className="col-span-1">
                                            <PaymentBadge status={order.paymentStatus} />
                                        </div>
                                        <div className="col-span-1">
                                            <FulfillmentBadge status={order.fulfillmentStatus} />
                                        </div>
                                        <div className="col-span-1 text-sm text-gray-600">
                                            {order.items} item{order.items !== 1 ? 's' : ''}
                                        </div>
                                        <div className="col-span-1">
                                            <DeliveryBadge status={order.deliveryStatus} />
                                        </div>
                                        <div className="col-span-1 flex flex-wrap gap-1">
                                            {order.tags.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                            {order.tags.length > 2 && (
                                                <span className="text-[10px] text-gray-400">+{order.tags.length - 2}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                            &lt;
                        </button>
                        <span className="text-sm text-gray-600">1-{filteredOrders.length}</span>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
