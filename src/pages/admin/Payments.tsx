import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    CreditCard,
    Banknote,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Clock,
    Loader2,
    AlertCircle,
    Eye,
    X,
    IndianRupee,
    Package,
    User,
    Mail,
    Phone,
    MapPin,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    size?: string;
}

interface PaymentOrder {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    email: string;
    phone: string;
    total: string;
    totalAmount: number;
    items: number;
    itemsList: OrderItem[];
    paymentMethod: 'cod' | 'razorpay';
    paymentStatus: string;
    providerPaymentId?: string;
    refundId?: string;
    refundAmount?: number;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    refundedAt?: string;
    shipping?: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
}

interface PaymentStats {
    pendingCodCount: number;
    approvedCodCount: number;
    rejectedCodCount: number;
    paidRazorpayCount: number;
    refundedCount: number;
    codRevenue: string;
    razorpayRevenue: string;
    totalRefunded: string;
}

interface PaymentsData {
    stats: PaymentStats;
    codOrders: {
        pending: PaymentOrder[];
        approved: PaymentOrder[];
        rejected: PaymentOrder[];
    };
    razorpayOrders: {
        paid: PaymentOrder[];
        refunded: PaymentOrder[];
        failed: PaymentOrder[];
        pending: PaymentOrder[];
    };
}

type Tab = 'cod-pending' | 'cod-history' | 'razorpay-paid' | 'razorpay-refunds';

const StatCard = ({
    title,
    value,
    icon: Icon,
    color
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}) => (
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

const OrderDetailsModal = ({
    order,
    onClose,
    onApprove,
    onReject,
    onRefund,
    isLoading,
    type
}: {
    order: PaymentOrder;
    onClose: () => void;
    onApprove?: () => void;
    onReject?: (reason: string) => void;
    onRefund?: (amount: number) => void;
    isLoading: boolean;
    type: 'cod' | 'razorpay';
}) => {
    const [rejectReason, setRejectReason] = useState('');
    const [refundAmount, setRefundAmount] = useState(order.totalAmount);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [showRefundInput, setShowRefundInput] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order {order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Customer Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4" /> Customer
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                            {order.email && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" /> {order.email}
                                </p>
                            )}
                            {order.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5" /> {order.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Shipping Address
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                    {order.shipping.address1}
                                    {order.shipping.address2 && `, ${order.shipping.address2}`}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                                </p>
                                <p className="text-sm text-gray-600">{order.shipping.country}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Items ({order.items})
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {order.itemsList.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-700">
                                        {item.size && <span className="text-[#C1A17C]">[{item.size}] </span>}
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="font-semibold text-gray-900">{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Payment
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Method</span>
                                <span className="text-gray-900 font-medium uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status</span>
                                <span className={`font-medium capitalize ${order.paymentStatus === 'paid' || order.paymentStatus === 'approved'
                                    ? 'text-green-600'
                                    : order.paymentStatus === 'pending'
                                        ? 'text-orange-600'
                                        : order.paymentStatus === 'refunded'
                                            ? 'text-blue-600'
                                            : 'text-red-600'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            {order.providerPaymentId && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{order.providerPaymentId}</span>
                                </div>
                            )}
                            {order.refundId && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Refund ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{order.refundId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reject Input */}
                    {showRejectInput && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Rejection Reason (Optional)</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onReject?.(rejectReason)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Refund Input */}
                    {showRefundInput && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Refund Amount</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    max={order.totalAmount}
                                    min={1}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Max refundable: {order.total}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onRefund?.(refundAmount)}
                                    disabled={isLoading || refundAmount <= 0 || refundAmount > order.totalAmount}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Processing...' : `Refund ₹${refundAmount.toLocaleString('en-IN')}`}
                                </button>
                                <button
                                    onClick={() => setShowRefundInput(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!showRejectInput && !showRefundInput && (
                    <div className="p-5 pt-0 flex gap-3">
                        {type === 'cod' && order.paymentStatus === 'pending' && (
                            <>
                                <button
                                    onClick={onApprove}
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    Approve Order
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(true)}
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject Order
                                </button>
                            </>
                        )}
                        {type === 'razorpay' && order.paymentStatus === 'paid' && (
                            <button
                                onClick={() => setShowRefundInput(true)}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Issue Refund
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const OrderRow = ({
    order,
    onView,
    onQuickApprove,
    onQuickReject,
    type,
    isLoading,
}: {
    order: PaymentOrder;
    onView: () => void;
    onQuickApprove?: () => void;
    onQuickReject?: () => void;
    type: 'cod' | 'razorpay';
    isLoading: boolean;
}) => {
    const getStatusBadge = () => {
        const statusStyles: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            paid: 'bg-green-100 text-green-700',
            refunded: 'bg-blue-100 text-blue-700',
            partially_refunded: 'bg-purple-100 text-purple-700',
            failed: 'bg-red-100 text-red-700',
        };

        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${statusStyles[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                {order.paymentStatus.replace('_', ' ')}
            </span>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
        >
            <div className="col-span-2">
                <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="col-span-2 text-sm text-gray-600">{order.date}</div>
            <div className="col-span-2 text-sm text-gray-900 truncate">{order.customer}</div>
            <div className="col-span-1 text-sm font-medium text-gray-900">{order.total}</div>
            <div className="col-span-1 text-sm text-gray-600">{order.items} items</div>
            <div className="col-span-2">{getStatusBadge()}</div>
            <div className="col-span-2 flex items-center gap-2 justify-end">
                {type === 'cod' && order.paymentStatus === 'pending' && (
                    <>
                        <button
                            onClick={onQuickApprove}
                            disabled={isLoading}
                            className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                            title="Approve"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onQuickReject}
                            disabled={isLoading}
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                            title="Reject"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </>
                )}
                <button
                    onClick={onView}
                    className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export const Payments = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<PaymentsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('cod-pending');
    const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

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
            const response = await fetch(`${apiBaseUrl}/api/admin/payments`, {
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch payments data');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch payments:', err);
            setError(err instanceof Error ? err.message : 'Failed to load payments');
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

    const handleApprove = async (orderId: string) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/cod/approve`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to approve order');
            }

            await fetchData();
            setSelectedOrder(null);
        } catch (err) {
            console.error('Approve error:', err);
            alert(err instanceof Error ? err.message : 'Failed to approve order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (orderId: string, reason: string) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/cod/reject`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to reject order');
            }

            await fetchData();
            setSelectedOrder(null);
        } catch (err) {
            console.error('Reject error:', err);
            alert(err instanceof Error ? err.message : 'Failed to reject order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async (orderId: string, amount: number) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/refund`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to process refund');
            }

            await fetchData();
            setSelectedOrder(null);
            setActiveTab('razorpay-refunds');
        } catch (err) {
            console.error('Refund error:', err);
            alert(err instanceof Error ? err.message : 'Failed to process refund');
        } finally {
            setActionLoading(false);
        }
    };

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'cod-pending', label: 'COD Pending', count: data?.stats.pendingCodCount },
        { id: 'cod-history', label: 'COD History', count: (data?.stats.approvedCodCount || 0) + (data?.stats.rejectedCodCount || 0) },
        { id: 'razorpay-paid', label: 'Razorpay Paid', count: data?.stats.paidRazorpayCount },
        { id: 'razorpay-refunds', label: 'Refunds', count: data?.stats.refundedCount },
    ];

    const getCurrentOrders = (): PaymentOrder[] => {
        if (!data) return [];
        switch (activeTab) {
            case 'cod-pending':
                return data.codOrders.pending;
            case 'cod-history':
                return [...data.codOrders.approved, ...data.codOrders.rejected];
            case 'razorpay-paid':
                return data.razorpayOrders.paid;
            case 'razorpay-refunds':
                return data.razorpayOrders.refunded;
            default:
                return [];
        }
    };

    const getCurrentType = (): 'cod' | 'razorpay' => {
        return activeTab.startsWith('cod') ? 'cod' : 'razorpay';
    };

    if (loading) {
        return (
            <AdminLayout title="Payments">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Payments">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-[#1A3C27] text-white rounded-lg hover:bg-[#2D5F3F]"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Payments">
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Pending COD Orders"
                        value={data?.stats.pendingCodCount || 0}
                        icon={Clock}
                        color="bg-orange-50 text-orange-600"
                    />
                    <StatCard
                        title="Razorpay Revenue"
                        value={data?.stats.razorpayRevenue || '₹0'}
                        icon={CreditCard}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="COD Revenue"
                        value={data?.stats.codRevenue || '₹0'}
                        icon={Banknote}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Total Refunded"
                        value={data?.stats.totalRefunded || '₹0'}
                        icon={RefreshCw}
                        color="bg-purple-50 text-purple-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-[#1A3C27] text-[#1A3C27]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-[#1A3C27] text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-2">Order</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Customer</div>
                        <div className="col-span-1">Total</div>
                        <div className="col-span-1">Items</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-50">
                        {getCurrentOrders().length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No orders found in this category
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {getCurrentOrders().map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        type={getCurrentType()}
                                        isLoading={actionLoading}
                                        onView={() => setSelectedOrder(order)}
                                        onQuickApprove={() => handleApprove(order.id)}
                                        onQuickReject={() => handleReject(order.id, '')}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailsModal
                        order={selectedOrder}
                        type={getCurrentType()}
                        isLoading={actionLoading}
                        onClose={() => setSelectedOrder(null)}
                        onApprove={() => handleApprove(selectedOrder.id)}
                        onReject={(reason) => handleReject(selectedOrder.id, reason)}
                        onRefund={(amount) => handleRefund(selectedOrder.id, amount)}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};
