import { useState, useEffect } from 'react';
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
} from 'lucide-react';

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

// Mock Customers Data
const mockCustomers: Customer[] = [
    { id: '1', name: 'poikiingkathal4141@gmail.com', email: 'poikiingkathal4141@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '2', name: 'Khusro Qasim', email: 'khusro@example.com', emailSubscription: 'Subscribed', location: 'ALIGARH UP, India', ordersCount: 1, amountSpent: '₹0.00', tags: [] },
    { id: '3', name: 'Pamarty Venkataramana Bhagoda saala chor', email: 'pamarty@example.com', emailSubscription: 'Subscribed', location: 'HYDERABAD TG, India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '4', name: 'Sagar salot', email: 'sagar@example.com', emailSubscription: 'Subscribed', location: 'BHAVNAGAR GJ, India', ordersCount: 1, amountSpent: '₹3,990.00', tags: [] },
    { id: '5', name: 'Shekhar Sharmaji', email: 'shekhar@example.com', emailSubscription: 'Subscribed', location: 'LUDHIANA PB, India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '6', name: 'MANOSHI MAJUMDER', email: 'manoshi@example.com', emailSubscription: 'Subscribed', location: 'KOLKATA WB, India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '7', name: 'rajivvermadhurra@gmail.com', email: 'rajivvermadhurra@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '8', name: 'mashipooja41@gmail.com', email: 'mashipooja41@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '9', name: 'Anita Kamani', email: 'anita@example.com', emailSubscription: 'Subscribed', location: 'GORAKHPUR UP, India', ordersCount: 1, amountSpent: '₹3,399.00', tags: [] },
    { id: '10', name: 'aabhishekyadav2476@gmail.com', email: 'aabhishekyadav2476@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '11', name: 'manojmajumder18@gmail.com', email: 'manojmajumder18@gmail.com', emailSubscription: 'Not subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '12', name: 'sachy545664@gmail.com', email: 'sachy545664@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '13', name: 'yoglanik15556@gmail.com', email: 'yoglanik15556@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '14', name: 'Yogamonica K', email: 'yogamonica@example.com', emailSubscription: 'Subscribed', location: 'BANGALORE KA, India', ordersCount: 2, amountSpent: '₹3,890.00', tags: [] },
    { id: '15', name: 'ssunnychoudhary19@gmail.com', email: 'ssunnychoudhary19@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '16', name: 'monikabairwa8969@gmail.com', email: 'monikabairwa8969@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '17', name: 'Sonu Sonu', email: 'sonu@example.com', emailSubscription: 'Subscribed', location: 'Ajmer RJ, India', ordersCount: 1, amountSpent: '₹0.00', tags: [] },
    { id: '18', name: 'rayalmenpower@gmail.com', email: 'rayalmenpower@gmail.com', emailSubscription: 'Subscribed', location: 'India', ordersCount: 0, amountSpent: '₹0.00', tags: [] },
    { id: '19', name: 'Ena Gpi', email: 'ena@example.com', emailSubscription: 'Subscribed', location: 'Ajmer RJ, India', ordersCount: 4, amountSpent: '₹0.00', tags: [] },
    { id: '20', name: 'Jayashree .', email: 'jayashree@example.com', emailSubscription: 'Subscribed', location: 'CHENNAI TN, India', ordersCount: 1, amountSpent: '₹9,979.00', tags: [] },
    { id: '21', name: 'Mina Shah', email: 'mina@example.com', emailSubscription: 'Subscribed', location: 'AHMEDABAD GJ, India', ordersCount: 1, amountSpent: '₹3,399.00', tags: [] },
    { id: '22', name: 'Santosh Jain', email: 'santosh@example.com', emailSubscription: 'Subscribed', location: 'SURAT GJ, India', ordersCount: 1, amountSpent: '₹2,780.00', tags: [] },
    { id: '23', name: 'Pooja Jaisingh', email: 'pooja@example.com', emailSubscription: 'Subscribed', location: 'Mumbai MH, India', ordersCount: 1, amountSpent: '₹2,780.00', tags: [] },
    { id: '24', name: 'Nimmy Chacko', email: 'nimmy@example.com', emailSubscription: 'Subscribed', location: 'ERNAKULAM KL, India', ordersCount: 1, amountSpent: '₹3,990.00', tags: [] },
    { id: '25', name: 'Sangita Shah', email: 'sangita@example.com', emailSubscription: 'Subscribed', location: 'AHMEDABAD GJ, India', ordersCount: 1, amountSpent: '₹3,399.00', tags: [] },
    { id: '26', name: 'Shruti solanki', email: 'shruti@example.com', emailSubscription: 'Subscribed', location: 'JUNAGADH GJ, India', ordersCount: 1, amountSpent: '₹2,780.00', tags: [] },
];

export const Customers = () => {
    const navigate = useNavigate();
    const [customers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    const filteredCustomers = customers.filter(customer => {
        return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.location.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalCustomers = customers.length;


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
                        <span className="text-2xl font-semibold text-gray-900">{totalCustomers} customers</span>
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
