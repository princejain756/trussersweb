import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
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
    X,
    Mail,
    Phone,
    AlertCircle,
    FileText,
    User,
    Copy,
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

interface OrderItem {
    id: string;
    name: string;
    variant?: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    size?: string;
}

interface OrderDetail {
    id: string;
    orderNumber: string;
    sequence: number;
    createdAt: string;
    formattedDate: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        userId?: string;
    };
    shipping: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        method: string;
    };
    items: OrderItem[];
    pricing: {
        subtotal: number;
        shipping: number;
        codCharges: number;
        tax: number;
        taxRate: string;
        discount: number;
        total: number;
    };
    payment: {
        method: string;
        status: string;
        providerOrderId?: string;
        providerPaymentId?: string;
        paidAt?: string;
        refundId?: string;
        refundAmount?: number;
        refundedAt?: string;
        approvedAt?: string;
        rejectedAt?: string;
        rejectionReason?: string;
    };
    fulfillmentStatus: string;
    deliveryStatus: string;
    clientInfo?: {
        ip: string;
        userAgent: string;
        capturedAt?: string;
    };
    invoice?: { number: string };
    notes?: string;
    cancelledAt?: string;
    timeline: { event: string; timestamp: string }[];
}

interface OrderStats {
    total: number;
    itemsOrdered: number;
    returns: number;
    fulfilled: number;
    delivered: number;
}

// Helper to format currency
const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

// Status Badge Components
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
    const styles = {
        'Paid': 'bg-green-50 text-green-700',
        'Payment pending': 'bg-orange-50 text-orange-700',
        'Refunded': 'bg-gray-100 text-gray-600',
        'Voided': 'bg-red-50 text-red-700',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

const FulfillmentBadge = ({ status }: { status: FulfillmentStatus }) => {
    const styles = {
        'Fulfilled': 'bg-green-50 text-green-700',
        'Unfulfilled': 'bg-yellow-50 text-yellow-700',
        'Partially fulfilled': 'bg-blue-50 text-blue-700',
    };
    const icons = {
        'Fulfilled': <CheckCircle2 className="w-3 h-3" />,
        'Unfulfilled': <Clock className="w-3 h-3" />,
        'Partially fulfilled': <Package className="w-3 h-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
};

const DeliveryBadge = ({ status }: { status: DeliveryStatus }) => {
    const styles = {
        'Delivered': 'bg-green-50 text-green-700',
        'In transit': 'bg-blue-50 text-blue-700',
        'Out for delivery': 'bg-purple-50 text-purple-700',
        'Pending': 'bg-gray-100 text-gray-600',
    };
    const icons = {
        'Delivered': <CheckCircle2 className="w-3 h-3" />,
        'In transit': <Truck className="w-3 h-3" />,
        'Out for delivery': <Truck className="w-3 h-3" />,
        'Pending': <Clock className="w-3 h-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
            {icons[status]}
        </span>
    );
};

// Order Detail Modal Component
const OrderDetailModal = ({
    orderId,
    onClose,
    getAdminToken,
    onOrderUpdated,
}: {
    orderId: string;
    onClose: () => void;
    getAdminToken: () => string | null;
    onOrderUpdated?: () => void;
}) => {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        notes: '',
    });

    const fetchOrderDetail = async () => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}`, {
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            setOrder(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId, getAdminToken]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleSendInvoice = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        try {
            setActionLoading('send-invoice');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}/send-invoice`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
            });

            const result = await response.json();
            if (result.success) {
                // If email is not configured, just open the link without popup
                if (result.message && result.message.includes('email not configured')) {
                    window.open(result.invoiceUrl, '_blank');
                } else {
                    alert(`${result.message}\n\nInvoice URL: ${result.invoiceUrl}`);
                }
            } else {
                alert(result.error || 'Failed to send invoice');
            }
        } catch (err) {
            alert('Failed to send invoice');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkPaid = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        if (!confirm('Mark this order as paid?')) return;

        try {
            setActionLoading('mark-paid');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}/mark-paid`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
            });

            const result = await response.json();
            if (result.success) {
                alert('Order marked as paid!');
                await fetchOrderDetail();
                onOrderUpdated?.();
            } else {
                alert(result.error || 'Failed to mark as paid');
            }
        } catch (err) {
            alert('Failed to mark as paid');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePrintInvoice = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        try {
            setActionLoading('print');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}/invoice`, {
                headers: { 'X-Admin-Key': token },
            });

            const result = await response.json();
            if (result.invoiceUrl) {
                window.open(result.invoiceUrl, '_blank');
            } else {
                alert('Invoice URL not available');
            }
        } catch (err) {
            alert('Failed to get invoice');
        } finally {
            setActionLoading(null);
            setShowPrintMenu(false);
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-orange-100 text-orange-800';
            case 'refunded': return 'bg-gray-100 text-gray-600';
            default: return 'bg-red-100 text-red-700';
        }
    };

    // Handle Edit Order
    const handleEdit = () => {
        if (!order) return;
        setEditForm({
            fullName: order.customer.name || '',
            email: order.customer.email || '',
            phone: order.customer.phone || '',
            addressLine1: order.shipping.addressLine1 || '',
            addressLine2: order.shipping.addressLine2 || '',
            city: order.shipping.city || '',
            state: order.shipping.state || '',
            pincode: order.shipping.pincode || '',
            notes: order.notes || '',
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        try {
            setActionLoading('edit');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'X-Admin-Key': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer: {
                        fullName: editForm.fullName,
                        email: editForm.email,
                        phone: editForm.phone,
                    },
                    shipping: {
                        addressLine1: editForm.addressLine1,
                        addressLine2: editForm.addressLine2,
                        city: editForm.city,
                        state: editForm.state,
                        pincode: editForm.pincode,
                    },
                    notes: editForm.notes,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Order updated successfully!');
                setShowEditModal(false);
                await fetchOrderDetail();
                onOrderUpdated?.();
            } else {
                alert(result.error || 'Failed to update order');
            }
        } catch (err) {
            alert('Failed to update order');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle Return Order
    const handleReturn = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        const reason = prompt('Enter return reason (optional):') || 'Customer return';

        try {
            setActionLoading('return');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}/return`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            const result = await response.json();
            if (result.success) {
                const refundMsg = result.refund
                    ? `\nRefund of ₹${result.refund.amount.toLocaleString('en-IN')} initiated.`
                    : '';
                alert(`Order marked as returned!${refundMsg}`);
                await fetchOrderDetail();
                onOrderUpdated?.();
            } else {
                alert(result.error || 'Failed to process return');
            }
        } catch (err) {
            alert('Failed to process return');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle Restock
    const handleRestock = async () => {
        const token = getAdminToken();
        if (!token || !order) return;

        if (!confirm('Mark items from this order as restocked?')) return;

        try {
            setActionLoading('restock');
            const response = await fetch(`${apiBaseUrl}/api/admin/orders/${order.id}/restock`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
            });

            const result = await response.json();
            if (result.success) {
                alert('Order items marked as restocked!');
                await fetchOrderDetail();
                onOrderUpdated?.();
            } else {
                alert(result.error || 'Failed to restock order');
            }
        } catch (err) {
            alert('Failed to restock order');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-center text-gray-600">{error || 'Order not found'}</p>
                    <button onClick={onClose} className="mt-4 w-full py-2 bg-[#1A3C27] text-white rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal Content */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-[#F9F9F9] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                                    {order.orderNumber}
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment.status)}`}>
                                        {order.payment.status === 'paid' ? 'Paid' : order.payment.status === 'pending' ? 'Payment pending' : order.payment.status}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                        {order.fulfillmentStatus === 'fulfilled' ? 'Fulfilled' : order.fulfillmentStatus}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {order.formattedDate} from {order.customer.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRestock}
                                disabled={actionLoading === 'restock'}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                            >
                                {actionLoading === 'restock' && <Loader2 className="w-4 h-4 animate-spin" />}
                                Restock
                            </button>
                            <button
                                onClick={handleReturn}
                                disabled={actionLoading === 'return'}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                            >
                                {actionLoading === 'return' && <Loader2 className="w-4 h-4 animate-spin" />}
                                Return
                            </button>
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Edit
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowPrintMenu(!showPrintMenu)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                >
                                    {actionLoading === 'print' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Print'}
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showPrintMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                        <button
                                            onClick={handlePrintInvoice}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Print Invoice
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.print();
                                                setShowPrintMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Print Order Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="col-span-2 space-y-6">
                            {/* Fulfillment Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-gray-900">
                                            {order.fulfillmentStatus === 'fulfilled' ? 'Fulfilled' : 'Unfulfilled'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">{order.orderNumber}-F1</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Confirmed</span>
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> {order.formattedDate}
                                        </span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4 mt-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 m-3 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {item.size && <span className="text-[#C1A17C]">Size: {item.size} • </span>}
                                                        {item.variant} • {item.sku}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">
                                                        {formatInr(item.price)} × {item.quantity}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{formatInr(item.total)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        <span className="font-medium text-orange-800">
                                            {order.payment.status === 'pending' ? 'Payment pending' :
                                                order.payment.status === 'paid' ? 'Payment received' : order.payment.status}
                                        </span>
                                    </div>
                                </div>
                                {order.payment.status === 'pending' && (
                                    <div className="px-4 py-3 bg-orange-50/50 border-b border-orange-100">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                                            <p className="text-sm text-orange-700">
                                                Payment is still processing for this order. Make sure you get paid before fulfilling.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                        <span className="font-medium text-gray-900">{formatInr(order.pricing.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-600">{order.shipping.method}</span>
                                        <span className="font-medium text-gray-900">{formatInr(order.pricing.shipping)}</span>
                                    </div>
                                    {order.pricing.codCharges > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">COD Charges</span>
                                            <span></span>
                                            <span className="font-medium text-gray-900">{formatInr(order.pricing.codCharges)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Taxes</span>
                                        <span className="text-gray-600">IGST {order.pricing.taxRate} (Included)</span>
                                        <span className="font-medium text-gray-900">{formatInr(order.pricing.tax)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 font-semibold text-lg border-b border-gray-200">
                                        <span className="text-gray-900">Total</span>
                                        <span></span>
                                        <span className="text-gray-900">{formatInr(order.pricing.total)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Paid</span>
                                        <span></span>
                                        <span className="font-medium text-gray-900">
                                            {order.payment.status === 'paid' ? formatInr(order.pricing.total) : formatInr(0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 font-semibold">
                                        <span className="text-gray-900">Balance</span>
                                        <span></span>
                                        <span className="text-gray-900">
                                            {order.payment.status === 'paid' ? formatInr(0) : formatInr(order.pricing.total)}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                    <button
                                        onClick={handleSendInvoice}
                                        disabled={actionLoading === 'send-invoice'}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading === 'send-invoice' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        Send invoice
                                    </button>
                                    {order.payment.status === 'pending' && (
                                        <button
                                            onClick={handleMarkPaid}
                                            disabled={actionLoading === 'mark-paid'}
                                            className="px-4 py-2 text-sm font-medium text-white bg-[#1A3C27] rounded-lg hover:bg-[#2D5F3F] disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading === 'mark-paid' && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Mark as paid
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-medium text-gray-900 mb-4">Timeline</h3>
                                <div className="space-y-4">
                                    {order.timeline.map((event, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-[#1A3C27] rounded-full mt-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{event.event}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(event.timestamp).toLocaleString('en-IN', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Notes */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-gray-900">Notes</h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {order.notes || 'No notes from customer'}
                                </p>
                            </div>

                            {/* Customer */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-medium text-gray-900 mb-4">Customer</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-[#1A3C27] font-medium">{order.customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${order.customer.email}`} className="text-sm text-blue-600 hover:underline">
                                            {order.customer.email}
                                        </a>
                                    </div>
                                    {order.customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <a href={`tel:${order.customer.phone}`} className="text-sm text-gray-600">
                                                {order.customer.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-medium text-gray-900 mb-4">Shipping Address</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                                    <p>{order.shipping.addressLine1}</p>
                                    {order.shipping.addressLine2 && <p>{order.shipping.addressLine2}</p>}
                                    <p>{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p>
                                    <p>{order.shipping.country}</p>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-900">Additional details</h3>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">payment_method</p>
                                        <p className="text-gray-900 font-medium">{order.payment.method.toUpperCase()}</p>
                                    </div>
                                    {order.payment.providerOrderId && (
                                        <div>
                                            <p className="text-gray-500 mb-1">provider_order_id</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 font-mono text-xs break-all">
                                                    {order.payment.providerOrderId}
                                                </p>
                                                <button onClick={() => copyToClipboard(order.payment.providerOrderId || '')} className="text-gray-400 hover:text-gray-600">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {order.clientInfo && (
                                        <>
                                            <div>
                                                <p className="text-gray-500 mb-1">user_agent</p>
                                                <p className="text-gray-900 text-xs break-all">{order.clientInfo.userAgent}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">customer_ip</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-gray-900 font-mono">{order.clientInfo.ip}</p>
                                                    <button onClick={() => copyToClipboard(order.clientInfo?.ip || '')} className="text-gray-400 hover:text-gray-600">
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Order Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
                    <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Order</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Shipping Address</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        value={editForm.addressLine1}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (optional)"
                                        value={editForm.addressLine2}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={editForm.city}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={editForm.state}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={editForm.pincode}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, pincode: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Order Notes</h4>
                                <textarea
                                    placeholder="Add notes about this order..."
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 resize-none"
                                />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={actionLoading === 'edit'}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#1A3C27] rounded-lg hover:bg-[#2D5F3F] disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === 'edit' && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);

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

    const handleExport = () => {
        const token = getAdminToken();
        if (!token) return;

        // Download via direct link with auth
        const exportUrl = `${apiBaseUrl}/api/admin/orders/export`;

        // Create a hidden form to submit with headers (or use fetch + blob)
        fetch(exportUrl, {
            headers: { 'X-Admin-Key': token },
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(err => {
                console.error('Export failed:', err);
                alert('Failed to export orders');
            });
    };

    // Bulk selection handlers
    const toggleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const clearSelection = () => setSelectedOrders(new Set());

    // Bulk action handlers
    const handleBulkMarkFulfilled = async () => {
        const token = getAdminToken();
        if (!token) return;
        if (!confirm(`Mark ${selectedOrders.size} order(s) as fulfilled?`)) return;

        setBulkActionLoading('fulfill');
        let successCount = 0;
        for (const orderId of selectedOrders) {
            try {
                const res = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/fulfill`, {
                    method: 'POST',
                    headers: { 'X-Admin-Key': token },
                });
                if (res.ok) successCount++;
            } catch { /* ignore */ }
        }
        setBulkActionLoading(null);
        alert(`${successCount} order(s) marked as fulfilled`);
        clearSelection();
        fetchOrders();
    };

    const handleBulkMarkPaid = async () => {
        const token = getAdminToken();
        if (!token) return;
        if (!confirm(`Mark ${selectedOrders.size} order(s) as paid?`)) return;

        setBulkActionLoading('paid');
        let successCount = 0;
        for (const orderId of selectedOrders) {
            try {
                const res = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/mark-paid`, {
                    method: 'POST',
                    headers: { 'X-Admin-Key': token },
                });
                if (res.ok) successCount++;
            } catch { /* ignore */ }
        }
        setBulkActionLoading(null);
        alert(`${successCount} order(s) marked as paid`);
        clearSelection();
        fetchOrders();
    };

    const handleBulkCancel = async () => {
        const token = getAdminToken();
        if (!token) return;
        if (!confirm(`Cancel ${selectedOrders.size} order(s)? This may trigger refunds for paid orders.`)) return;

        setBulkActionLoading('cancel');
        let successCount = 0;
        for (const orderId of selectedOrders) {
            try {
                const res = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}/cancel`, {
                    method: 'POST',
                    headers: { 'X-Admin-Key': token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Bulk cancellation' }),
                });
                if (res.ok) successCount++;
            } catch { /* ignore */ }
        }
        setBulkActionLoading(null);
        alert(`${successCount} order(s) cancelled`);
        clearSelection();
        fetchOrders();
    };

    const handleBulkDelete = async () => {
        const token = getAdminToken();
        if (!token) return;
        if (!confirm(`PERMANENTLY DELETE ${selectedOrders.size} order(s)? This cannot be undone!`)) return;

        setBulkActionLoading('delete');
        let successCount = 0;
        let errorMessages: string[] = [];
        for (const orderId of selectedOrders) {
            try {
                const res = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: { 'X-Admin-Key': token },
                });
                if (res.ok) {
                    successCount++;
                } else {
                    const data = await res.json().catch(() => ({}));
                    if (data.error) errorMessages.push(data.error);
                }
            } catch { /* ignore */ }
        }
        setBulkActionLoading(null);
        if (errorMessages.length > 0) {
            alert(`${successCount} order(s) deleted. Errors: ${errorMessages.join(', ')}`);
        } else {
            alert(`${successCount} order(s) deleted permanently`);
        }
        clearSelection();
        fetchOrders();
    };

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
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchOrders} className="px-4 py-2 bg-[#1A3C27] text-white rounded-lg hover:bg-[#2D5F3F]">
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-6 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-[#1A3C27] text-[#1A3C27]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
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
                        {/* Bulk Actions */}
                        {selectedOrders.size > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {selectedOrders.size} selected
                                </span>
                                <button
                                    onClick={handleBulkMarkFulfilled}
                                    disabled={bulkActionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {bulkActionLoading === 'fulfill' ? 'Processing...' : 'Mark Fulfilled'}
                                </button>
                                <button
                                    onClick={handleBulkMarkPaid}
                                    disabled={bulkActionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {bulkActionLoading === 'paid' ? 'Processing...' : 'Mark Paid'}
                                </button>
                                <button
                                    onClick={handleBulkCancel}
                                    disabled={bulkActionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {bulkActionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Orders'}
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={bulkActionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {bulkActionLoading === 'delete' ? 'Deleting...' : 'Delete Orders'}
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">
                            <input
                                type="checkbox"
                                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                            />
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
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="col-span-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.has(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                                            />
                                            {order.hasNote && <MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
                                        </div>
                                        <div className="col-span-1">
                                            <span className="text-sm font-medium text-gray-900 group-hover:text-[#1A3C27]">{order.orderNumber}</span>
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

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrderId && (
                    <OrderDetailModal
                        orderId={selectedOrderId}
                        onClose={() => setSelectedOrderId(null)}
                        getAdminToken={getAdminToken}
                        onOrderUpdated={fetchOrders}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};
