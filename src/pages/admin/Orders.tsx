import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Calendar,
    ChevronDown,
    Eye,
    MessageSquare,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';

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

// Mock Orders Data
const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: '#1108',
        date: 'Tuesday at 07:40 am',
        customer: 'Sagar salot',
        email: 'sagar@example.com',
        channel: 'Online Store',
        total: '₹3,990.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Unfulfilled',
        items: 1,
        deliveryStatus: 'Pending',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'MEDIUM RTO Risk'],
        hasNote: false,
    },
    {
        id: '2',
        orderNumber: '#1107',
        date: 'Saturday at 09:45 am',
        customer: 'Anita Komani',
        email: 'anita@example.com',
        channel: 'Online Store',
        total: '₹3,399.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Unfulfilled',
        items: 1,
        deliveryStatus: 'Pending',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'MEDIUM RTO Risk'],
        hasNote: false,
    },
    {
        id: '3',
        orderNumber: '#1106',
        date: 'Dec 10 at 6:57 pm',
        customer: 'MANOSHI MAJUMDER',
        email: 'manoshi@example.com',
        channel: 'Online Store',
        total: '₹0.00',
        paymentStatus: 'Voided',
        fulfillmentStatus: 'Unfulfilled',
        items: 0,
        deliveryStatus: 'Pending',
        deliveryMethod: 'Standard Shipping',
        tags: ['GoKwik', 'MEDIUM RTO Risk'],
        hasNote: false,
    },
    {
        id: '4',
        orderNumber: '#1102',
        date: 'Dec 13 at 7:25 am',
        customer: 'Jayashree',
        email: 'jayashree@example.com',
        channel: 'Online Store',
        total: '₹9,979.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Fulfilled',
        items: 3,
        deliveryStatus: 'In transit',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'MEDIUM RTO Risk'],
        hasNote: false,
    },
    {
        id: '5',
        orderNumber: '#1101',
        date: 'Dec 12 at 10:18 pm',
        customer: 'Yogamonica K',
        email: 'yogamonica@example.com',
        channel: 'Online Store',
        total: '₹3,990.00',
        paymentStatus: 'Voided',
        fulfillmentStatus: 'Unfulfilled',
        items: 0,
        deliveryStatus: 'Pending',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'MEDIUM RTO Risk'],
        hasNote: true,
    },
    {
        id: '6',
        orderNumber: '#1100',
        date: 'Dec 12 at 9:52 pm',
        customer: 'Mina Shah',
        email: 'mina@example.com',
        channel: 'Online Store',
        total: '₹3,399.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Fulfilled',
        items: 1,
        deliveryStatus: 'Delivered',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'MEDIUM RTO Risk'],
        hasNote: false,
    },
    {
        id: '7',
        orderNumber: '#1099',
        date: 'Dec 12 at 8:03 pm',
        customer: 'Santosh Jain',
        email: 'santosh@example.com',
        channel: 'Online Store',
        total: '₹2,780.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Fulfilled',
        items: 1,
        deliveryStatus: 'In transit',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'LOW RTO Risk'],
        hasNote: false,
    },
    {
        id: '8',
        orderNumber: '#1098',
        date: 'Dec 12 at 9:53 am',
        customer: 'Pooja Jaisingh',
        email: 'pooja@example.com',
        channel: 'Online Store',
        total: '₹2,780.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Fulfilled',
        items: 1,
        deliveryStatus: 'In transit',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk', 'LOW RTO Risk'],
        hasNote: false,
    },
    {
        id: '9',
        orderNumber: '#1097',
        date: 'Dec 11 at 7:02 pm',
        customer: 'Nimmy Chacko',
        email: 'nimmy@example.com',
        channel: 'Online Store',
        total: '₹3,990.00',
        paymentStatus: 'Paid',
        fulfillmentStatus: 'Fulfilled',
        items: 1,
        deliveryStatus: 'In transit',
        deliveryMethod: 'Standard Shipping',
        tags: ['GoKwik', 'UPI'],
        hasNote: false,
    },
    {
        id: '10',
        orderNumber: '#1089',
        date: 'Dec 4 at 2:21 pm',
        customer: 'Prince Jain',
        email: 'prince@example.com',
        channel: 'Online Store',
        total: '₹13,700.00',
        paymentStatus: 'Payment pending',
        fulfillmentStatus: 'Fulfilled',
        items: 1,
        deliveryStatus: 'Delivered',
        deliveryMethod: 'Standard Shipping',
        tags: ['COD', 'GoKwik', 'High Risk'],
        hasNote: false,
    },
];

// Status Badge Components
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
    const styles = {
        Paid: 'bg-green-100 text-green-700',
        'Payment pending': 'bg-orange-100 text-orange-700',
        Refunded: 'bg-blue-100 text-blue-700',
        Voided: 'bg-gray-100 text-gray-600',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
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

    const Icon = icons[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${styles[status]}`}>
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
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
            {status === 'In transit' && <Truck className="w-3 h-3" />}
            {status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
            {status}
        </span>
    );
};

export const Orders = () => {
    const navigate = useNavigate();
    const [orders] = useState<Order[]>(mockOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

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
        { label: 'Orders', value: orders.length, change: '—' },
        { label: 'Items ordered', value: orders.reduce((acc, o) => acc + o.items, 0), change: '—' },
        { label: 'Returns', value: 0, change: '₹0' },
        { label: 'Orders fulfilled', value: orders.filter(o => o.fulfillmentStatus === 'Fulfilled').length, change: '—' },
        { label: 'Orders delivered', value: orders.filter(o => o.deliveryStatus === 'Delivered').length, change: '—' },
        { label: 'Order to fulfillment time', value: '—', change: '' },
    ];

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
