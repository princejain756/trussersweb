import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Plus,
    Search,
    Download,
    Upload,
    ChevronDown,
    Mail,
    MapPin,
    ShoppingBag,
    IndianRupee,
    Loader2,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

// Customer Types
interface Customer {
    id: string;
    name: string;
    email: string;
    emailSubscription: 'Subscribed' | 'Not subscribed';
    location: string;
    ordersCount: number;
    amountSpent: string;
    lastOrder?: string;
    phone?: string;
    tags: string[];
}

export const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAdminToken = useCallback(() => {
        return typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
    }, []);

    const fetchCustomers = useCallback(async () => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/customers`, {
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
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();
            setCustomers(data.customers || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customers');
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
        fetchCustomers();
    }, [getAdminToken, navigate, fetchCustomers]);

    const filteredCustomers = customers.filter(customer => {
        return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.location.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalCustomers = customers.length;

    if (loading) {
        return (
            <AdminLayout title="Customers">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Customers">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchCustomers}
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
            title="Customers"
            actions={
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <Button className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2 text-sm font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add customer
                    </Button>
                </div>
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold text-gray-900">{totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}</span>
                        <span className="text-sm text-gray-500">100% of your customer base</span>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                        <ChevronDown className="w-4 h-4 inline" />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        </div>
                        <div className="col-span-3">Customer name</div>
                        <div className="col-span-2">Email subscription</div>
                        <div className="col-span-3">Location</div>
                        <div className="col-span-1 text-right">Orders</div>
                        <div className="col-span-2 text-right">Amount spent</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                        {filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredCustomers.map((customer, index) => (
                                    <motion.div
                                        key={customer.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.01 }}
                                        onClick={() => setSelectedCustomer(customer)}
                                        className={`grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="col-span-1">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                        </div>
                                        <div className="col-span-3">
                                            <span className="text-sm text-gray-900 hover:text-blue-600 transition-colors">
                                                {customer.name}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${customer.emailSubscription === 'Subscribed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {customer.emailSubscription}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm text-gray-600">{customer.location}</div>
                                        <div className="col-span-1 text-sm text-gray-600 text-right">
                                            {customer.ordersCount} order{customer.ordersCount !== 1 ? 's' : ''}
                                        </div>
                                        <div className="col-span-2 text-sm font-medium text-gray-900 text-right">
                                            {customer.amountSpent}
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
                        <span className="text-sm text-gray-600">1-{filteredCustomers.length}</span>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                            &gt;
                        </button>
                    </div>
                </div>

                {/* Customer Detail Panel (when selected) */}
                <AnimatePresence>
                    {selectedCustomer && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#1A3C27] flex items-center justify-center text-white font-semibold text-lg">
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-wide">Orders</span>
                                    </div>
                                    <p className="text-2xl font-semibold text-gray-900">{selectedCustomer.ordersCount}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <IndianRupee className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-wide">Amount Spent</span>
                                    </div>
                                    <p className="text-2xl font-semibold text-gray-900">{selectedCustomer.amountSpent}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-wide">Location</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.location}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-wide">Email Status</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded ${selectedCustomer.emailSubscription === 'Subscribed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {selectedCustomer.emailSubscription}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
};
