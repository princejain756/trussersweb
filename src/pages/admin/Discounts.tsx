import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Tag,

    ShoppingCart,
    Trash2,
    Edit3,
    Copy,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';

// Discount Types
type DiscountStatus = 'Active' | 'Scheduled' | 'Expired';
type DiscountMethod = 'Code' | 'Automatic';
type DiscountType = 'Amount off order' | 'Amount off products' | 'Free shipping' | 'Buy X get Y';

interface Discount {
    id: string;
    title: string;
    description: string;
    status: DiscountStatus;
    method: DiscountMethod;
    type: DiscountType;
    usedCount: number;
    usageLimit?: number;
    code?: string;
    value: string;
    minRequirement?: string;
    startDate: string;
    endDate?: string;
    combinations: {
        products: boolean;
        orders: boolean;
        shipping: boolean;
    };
}

// Mock Discounts Data
const mockDiscounts: Discount[] = [
    {
        id: '1',
        title: 'SECOND ORDER DISCOUNT',
        description: '₹150.00 off entire order',
        status: 'Expired',
        method: 'Automatic',
        type: 'Amount off order',
        usedCount: 0,
        value: '₹150',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '2',
        title: 'gokwik-test_yash',
        description: '₹2,493.00 off entire order',
        status: 'Expired',
        method: 'Code',
        type: 'Amount off order',
        usedCount: 2,
        code: 'GOKWIK2493',
        value: '₹2,493',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '3',
        title: 'WELCOME10',
        description: '₹100.00 off entire order • One use per customer',
        status: 'Active',
        method: 'Code',
        type: 'Amount off order',
        usedCount: 30,
        code: 'WELCOME10',
        value: '₹100',
        minRequirement: 'Minimum ₹1,000',
        startDate: '2024-01-01',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '4',
        title: 'BUNDLE200',
        description: '₹200.00 off entire order • Minimum quantity of 4',
        status: 'Active',
        method: 'Code',
        type: 'Amount off order',
        usedCount: 0,
        code: 'BUNDLE200',
        value: '₹200',
        minRequirement: 'Minimum 4 items',
        startDate: '2024-06-01',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '5',
        title: 'Buy 6 Get ₹1800 OFF',
        description: '₹1,800.00 off entire order • Minimum quantity of 6',
        status: 'Active',
        method: 'Automatic',
        type: 'Amount off order',
        usedCount: 0,
        value: '₹1,800',
        minRequirement: 'Minimum 6 items',
        startDate: '2024-06-01',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '6',
        title: 'Buy 6 Get ₹1800 OFF',
        description: '₹1,800.00 off entire order • Minimum quantity of 6',
        status: 'Expired',
        method: 'Code',
        type: 'Amount off order',
        usedCount: 0,
        code: 'BUY6OFF',
        value: '₹1,800',
        minRequirement: 'Minimum 6 items',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '7',
        title: 'Buy 4 Get ₹1000 OFF',
        description: '₹1,000.00 off entire order • Minimum quantity of 4',
        status: 'Active',
        method: 'Automatic',
        type: 'Amount off order',
        usedCount: 0,
        value: '₹1,000',
        minRequirement: 'Minimum 4 items',
        startDate: '2024-06-01',
        combinations: { products: false, orders: false, shipping: false },
    },
    {
        id: '8',
        title: 'Buy 2 Get ₹500 OFF',
        description: '₹500.00 off entire order • Minimum quantity of 2',
        status: 'Active',
        method: 'Automatic',
        type: 'Amount off order',
        usedCount: 3,
        value: '₹500',
        minRequirement: 'Minimum 2 items',
        startDate: '2024-06-01',
        combinations: { products: false, orders: false, shipping: false },
    },
];

// Status Badge Component
const StatusBadge = ({ status }: { status: DiscountStatus }) => {
    const styles = {
        Active: 'bg-green-100 text-green-700 border-green-200',
        Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
        Expired: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    const icons = {
        Active: CheckCircle2,
        Scheduled: Clock,
        Expired: XCircle,
    };

    const Icon = icons[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
};

// Discount Row Component
const DiscountRow = ({ discount, onDelete }: { discount: Discount; onDelete: (id: string) => void }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group grid grid-cols-12 gap-4 items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
            {/* Checkbox */}
            <div className="col-span-1">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]" />
            </div>

            {/* Title & Description */}
            <div className="col-span-4 md:col-span-3">
                <p className="font-medium text-gray-900 text-sm">{discount.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{discount.description}</p>
            </div>

            {/* Status */}
            <div className="col-span-2 hidden md:block">
                <StatusBadge status={discount.status} />
            </div>

            {/* Method */}
            <div className="col-span-2 hidden lg:block">
                <span className="text-sm text-gray-600">{discount.method}</span>
            </div>

            {/* Type */}
            <div className="col-span-3 hidden xl:flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{discount.type}</span>
            </div>

            {/* Combinations */}
            <div className="col-span-2 hidden xl:flex items-center gap-1">
                {discount.combinations.products && <ShoppingCart className="w-4 h-4 text-gray-400" />}
                {discount.combinations.orders && <Tag className="w-4 h-4 text-gray-400" />}
                {discount.combinations.shipping && <Tag className="w-4 h-4 text-gray-400" />}
                {!discount.combinations.products && !discount.combinations.orders && !discount.combinations.shipping && (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </div>

            {/* Used Count */}
            <div className="col-span-2 md:col-span-1 text-right">
                <span className="text-sm text-gray-600">{discount.usedCount}</span>
            </div>

            {/* Actions */}
            <div className="col-span-2 md:col-span-1 flex justify-end relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20"
                            >
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Edit3 className="w-4 h-4" /> Edit
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Copy className="w-4 h-4" /> Duplicate
                                </button>
                                <button
                                    onClick={() => onDelete(discount.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export const Discounts = () => {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | DiscountStatus>('All');

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this discount?')) {
            setDiscounts(prev => prev.filter(d => d.id !== id));
        }
    };

    const filteredDiscounts = discounts.filter(discount => {
        const matchesSearch = discount.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            discount.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || discount.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        All: discounts.length,
        Active: discounts.filter(d => d.status === 'Active').length,
        Scheduled: discounts.filter(d => d.status === 'Scheduled').length,
        Expired: discounts.filter(d => d.status === 'Expired').length,
    };

    return (
        <AdminLayout
            title="Discounts"
            actions={
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link to="/admin/discounts/create">
                        <Button className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2 text-sm font-medium">
                            <Plus className="w-4 h-4 mr-2" />
                            Create discount
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
                    {(['All', 'Active', 'Scheduled', 'Expired'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${statusFilter === tab
                                ? 'border-[#1A3C27] text-[#1A3C27]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {statusCounts[tab]}
                            </span>
                        </button>
                    ))}
                    <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search discounts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            Sort by
                            <button className="flex items-center gap-1 font-medium text-gray-700">
                                Created date
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <div className="col-span-1">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        </div>
                        <div className="col-span-4 md:col-span-3">Title</div>
                        <div className="col-span-2 hidden md:block">Status</div>
                        <div className="col-span-2 hidden lg:block">Method</div>
                        <div className="col-span-3 hidden xl:block">Type</div>
                        <div className="col-span-2 hidden xl:block">Combinations</div>
                        <div className="col-span-2 md:col-span-1 text-right">Used</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Table Body */}
                    <AnimatePresence mode="popLayout">
                        {filteredDiscounts.length > 0 ? (
                            filteredDiscounts.map((discount) => (
                                <DiscountRow
                                    key={discount.id}
                                    discount={discount}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">No discounts found</p>
                                <Link to="/admin/discounts/create" className="text-[#1A3C27] font-medium text-sm hover:underline mt-2 inline-block">
                                    Create your first discount
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    <a href="#" className="text-[#1A3C27] hover:underline">Learn more about discounts</a>
                </p>
            </div>
        </AdminLayout>
    );
};
