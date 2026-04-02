import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    ShieldAlert,
    ShieldOff,
    ShieldCheck,
    Globe,
    Mail,
    Phone,
    MapPin,
    Loader2,
    AlertCircle,
    Ban,
    X,
    ChevronDown,
    ChevronUp,
    Copy,
} from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface IpOrder {
    id: string;
    orderNumber: string;
    date: string;
    customer: string;
    email: string;
    phone: string;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
}

interface IpStat {
    ip: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
    isBanned: boolean;
    orders: IpOrder[];
}

interface BannedEntity {
    id: string;
    type: 'ip' | 'email' | 'phone' | 'address';
    value: string;
    reason: string;
    bannedAt: string;
    bannedBy: string;
}

interface FraudStats {
    totalOrdersWithIp: number;
    uniqueIps: number;
    totalBanned: number;
    bannedByType: {
        ip: number;
        email: number;
        phone: number;
        address: number;
    };
}

interface FraudData {
    stats: FraudStats;
    ipStats: IpStat[];
    bannedEntities: BannedEntity[];
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

const BanModal = ({
    onClose,
    onBan,
    isLoading,
    initialType,
    initialValue,
}: {
    onClose: () => void;
    onBan: (type: string, value: string, reason: string) => void;
    isLoading: boolean;
    initialType?: string;
    initialValue?: string;
}) => {
    const [type, setType] = useState(initialType || 'ip');
    const [value, setValue] = useState(initialValue || '');
    const [reason, setReason] = useState('');

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
                className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Ban className="w-5 h-5 text-red-600" />
                        Ban Entity
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="ip">IP Address</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="address">Address</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Value</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={type === 'ip' ? '192.168.1.1' : type === 'email' ? 'maitri@trusser.in' : type === 'phone' ? '+91 9876543210' : 'Address to ban'}
                            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Reason (Optional)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for banning..."
                            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={() => onBan(type, value, reason)}
                        disabled={isLoading || !value.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        {isLoading ? 'Banning...' : 'Ban Entity'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const IpRow = ({
    ipStat,
    onBanIp,
    isLoading
}: {
    ipStat: IpStat;
    onBanIp: (ip: string) => void;
    isLoading: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="border-b border-gray-50 last:border-0">
            <div
                className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="col-span-3 flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(ipStat.ip); }} className="p-1 hover:bg-gray-200 rounded">
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <span className="text-sm font-mono text-gray-900">{ipStat.ip}</span>
                    {ipStat.isBanned && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-medium">BANNED</span>
                    )}
                </div>
                <div className="col-span-2 text-sm text-gray-600">{ipStat.orderCount} orders</div>
                <div className="col-span-2 text-sm font-medium text-gray-900">₹{ipStat.totalSpent.toLocaleString('en-IN')}</div>
                <div className="col-span-3 text-sm text-gray-600">
                    {ipStat.lastOrder ? new Date(ipStat.lastOrder).toLocaleDateString('en-IN') : '-'}
                </div>
                <div className="col-span-2 flex items-center gap-2 justify-end">
                    {!ipStat.isBanned && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onBanIp(ipStat.ip); }}
                            disabled={isLoading}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                        >
                            Ban IP
                        </button>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Orders from this IP</h4>
                            <div className="space-y-2">
                                {ipStat.orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-2 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                            <span className="text-gray-500">{order.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-700">{order.customer}</span>
                                            <span className="text-gray-500">{order.email}</span>
                                            <span className="font-medium text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                                            <span className={`px-1.5 py-0.5 text-xs rounded ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Fraud = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<FraudData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ips' | 'banned'>('ips');
    const [showBanModal, setShowBanModal] = useState(false);
    const [banModalDefaults, setBanModalDefaults] = useState<{ type?: string; value?: string }>({});
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
            const response = await fetch(`${apiBaseUrl}/api/admin/fraud`, {
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                throw new Error('Failed to fetch fraud data');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch fraud data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load fraud data');
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

    const handleBan = async (type: string, value: string, reason: string) => {
        const token = getAdminToken();
        if (!token) return;

        try {
            setActionLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/fraud/ban`, {
                method: 'POST',
                headers: {
                    'X-Admin-Key': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, value, reason }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to ban entity');
            }

            await fetchData();
            setShowBanModal(false);
            setBanModalDefaults({});
        } catch (err) {
            console.error('Ban error:', err);
            alert(err instanceof Error ? err.message : 'Failed to ban entity');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async (id: string) => {
        const token = getAdminToken();
        if (!token) return;

        if (!confirm('Are you sure you want to unban this entity?')) return;

        try {
            setActionLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/fraud/unban/${id}`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to unban entity');
            }

            await fetchData();
        } catch (err) {
            console.error('Unban error:', err);
            alert(err instanceof Error ? err.message : 'Failed to unban entity');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBanIp = (ip: string) => {
        setBanModalDefaults({ type: 'ip', value: ip });
        setShowBanModal(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ip': return Globe;
            case 'email': return Mail;
            case 'phone': return Phone;
            case 'address': return MapPin;
            default: return ShieldAlert;
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Fraud Detection">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3C27]" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Fraud Detection">
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
            title="Fraud Detection"
            actions={
                <button
                    onClick={() => { setBanModalDefaults({}); setShowBanModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Ban className="w-4 h-4" />
                    Ban Entity
                </button>
            }
        >
            <div className="max-w-full mx-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Unique IPs"
                        value={data?.stats.uniqueIps || 0}
                        icon={Globe}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Total Banned"
                        value={data?.stats.totalBanned || 0}
                        icon={ShieldOff}
                        color="bg-red-50 text-red-600"
                    />
                    <StatCard
                        title="Banned IPs"
                        value={data?.stats.bannedByType?.ip || 0}
                        icon={ShieldAlert}
                        color="bg-orange-50 text-orange-600"
                    />
                    <StatCard
                        title="Orders Tracked"
                        value={data?.stats.totalOrdersWithIp || 0}
                        icon={ShieldCheck}
                        color="bg-green-50 text-green-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('ips')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ips' ? 'border-[#1A3C27] text-[#1A3C27]' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        IP Addresses ({data?.ipStats.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('banned')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'banned' ? 'border-[#1A3C27] text-[#1A3C27]' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Banned Entities ({data?.bannedEntities.length || 0})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'ips' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <div className="col-span-3">IP Address</div>
                            <div className="col-span-2">Orders</div>
                            <div className="col-span-2">Total Spent</div>
                            <div className="col-span-3">Last Order</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {(data?.ipStats.length || 0) === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No IP addresses tracked yet. Orders placed after this update will include IP tracking.
                                </div>
                            ) : (
                                data?.ipStats.map((ipStat) => (
                                    <IpRow key={ipStat.ip} ipStat={ipStat} onBanIp={handleBanIp} isLoading={actionLoading} />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'banned' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <div className="col-span-2">Type</div>
                            <div className="col-span-4">Value</div>
                            <div className="col-span-3">Reason</div>
                            <div className="col-span-2">Banned At</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {(data?.bannedEntities.length || 0) === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No banned entities yet
                                </div>
                            ) : (
                                data?.bannedEntities.map((ban) => {
                                    const Icon = getTypeIcon(ban.type);
                                    return (
                                        <div key={ban.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="col-span-2 flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-900 capitalize">{ban.type}</span>
                                            </div>
                                            <div className="col-span-4 text-sm font-mono text-gray-700 truncate">{ban.value}</div>
                                            <div className="col-span-3 text-sm text-gray-600 truncate">{ban.reason}</div>
                                            <div className="col-span-2 text-sm text-gray-600">
                                                {new Date(ban.bannedAt).toLocaleDateString('en-IN')}
                                            </div>
                                            <div className="col-span-1 flex justify-end">
                                                <button
                                                    onClick={() => handleUnban(ban.id)}
                                                    disabled={actionLoading}
                                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                                                >
                                                    Unban
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Ban Modal */}
            <AnimatePresence>
                {showBanModal && (
                    <BanModal
                        onClose={() => { setShowBanModal(false); setBanModalDefaults({}); }}
                        onBan={handleBan}
                        isLoading={actionLoading}
                        initialType={banModalDefaults.type}
                        initialValue={banModalDefaults.value}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};
