import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Calendar,
    ChevronDown,
    Mail,
    BarChart3,
    Eye,
    ShoppingCart,
    Percent,
    IndianRupee,
    Globe,
    Search as GoogleIcon,
    Facebook,
    Instagram,
} from 'lucide-react';

// Marketing Channels Data
const channels = [
    { name: 'Google', icon: GoogleIcon, type: 'paid', sessions: 60674, sales: '₹0.00', orders: 0, conversionRate: '0%', roas: '—', cpa: '—', ctr: '—' },
    { name: 'Google syndication', icon: GoogleIcon, type: 'paid', sessions: 9332, sales: '₹0.00', orders: 0, conversionRate: '0%', roas: '—', cpa: '—', ctr: '—' },
    { name: 'Instagram', icon: Instagram, type: 'unknown', sessions: 1068, sales: '₹0.00', orders: 0, conversionRate: '0%', roas: '—', cpa: '—', ctr: '—' },
    { name: 'Facebook', icon: Facebook, type: 'unknown', sessions: 717, sales: '₹0.00', orders: 0, conversionRate: '0%', roas: '—', cpa: '—', ctr: '—' },
    { name: 'Direct', icon: Globe, type: 'direct', sessions: 552, sales: '₹0.00', orders: 0, conversionRate: '0%', roas: '—', cpa: '—', ctr: '—' },
];

// Stats data
const stats = [
    { label: 'Sessions', value: '74,434', icon: Eye, sparkline: true },
    { label: 'Sales attributed to marketing', value: '₹0', icon: IndianRupee },
    { label: 'Orders attributed to marketing', value: '0', icon: ShoppingCart },
    { label: 'Conversion rate', value: '0%', icon: Percent },
    { label: 'AOV attr.', value: '₹0', icon: IndianRupee },
];

// Marketing Apps
const marketingApps = [
    { name: 'Messaging', drafts: 0, sending: 7, lastActivity: 'Oct 12, 2025' },
];

export const Marketing = () => {
    const navigate = useNavigate();
    const [dateRange] = useState('Last 30 days');

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    return (
        <AdminLayout title="Marketing">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Calendar className="w-4 h-4" />
                            {dateRange}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            No comparison
                        </button>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                        <BarChart3 className="w-4 h-4" />
                        Last non-direct click
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg p-4 border border-gray-100"
                        >
                            <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                                {stat.sparkline && (
                                    <div className="h-8 w-16 flex items-end gap-0.5">
                                        {[3, 5, 4, 7, 6, 8, 5, 7, 9].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-blue-100 rounded-t"
                                                style={{ height: `${h * 10}%` }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Top Marketing Channels */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Top marketing channels</h2>
                        <a href="#" className="text-sm text-blue-600 hover:underline">View report</a>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs">i</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Cost, click, and impression metrics are now available for supported marketing apps.{' '}
                            <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                        </p>
                        <button className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Channel</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-right font-medium">Sessions</th>
                                    <th className="px-4 py-3 text-right font-medium">Sales</th>
                                    <th className="px-4 py-3 text-right font-medium">Orders</th>
                                    <th className="px-4 py-3 text-right font-medium">Conversion rate</th>
                                    <th className="px-4 py-3 text-right font-medium">ROAS</th>
                                    <th className="px-4 py-3 text-right font-medium">CPA</th>
                                    <th className="px-4 py-3 text-right font-medium">CTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {channels.map((channel, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <channel.icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-900">{channel.name}</span>
                                                {index === 0 && <ChevronDown className="w-3 h-3 text-gray-400" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{channel.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{channel.sessions.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{channel.sales}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{channel.orders}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{channel.conversionRate}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 text-right">{channel.roas}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 text-right">{channel.cpa}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 text-right">{channel.ctr}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Campaign Tracking Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <div className="flex items-start gap-6">
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900 mb-2">Centralize your campaign tracking</h2>
                            <p className="text-sm text-gray-600 mb-4 max-w-xl">
                                Create campaigns to evaluate how marketing initiatives drive business goals. Capture online
                                and offline touchpoints, add campaign activities from multiple marketing channels, and monitor results.
                            </p>
                            <Button variant="outline" className="rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50">
                                Create campaign
                            </Button>
                        </div>
                        <div className="hidden md:block w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Marketing App Activities */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Marketing app activities</h2>
                        <a href="#" className="text-sm text-blue-600 hover:underline">Explore apps</a>
                    </div>

                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">App</th>
                                <th className="px-4 py-3 text-left font-medium">Activities in progress</th>
                                <th className="px-4 py-3 text-left font-medium">Last activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {marketingApps.map((app, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-900">{app.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {app.drafts > 0 && (
                                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                    Draft ({app.drafts})
                                                </span>
                                            )}
                                            {app.sending > 0 && (
                                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                    Sending ({app.sending})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{app.lastActivity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-gray-500">
                    Learn more about <a href="#" className="text-blue-600 hover:underline">marketing campaigns</a> and how{' '}
                    <a href="#" className="text-blue-600 hover:underline">Ecomsh syncs report data</a>.
                </p>
            </div>
        </AdminLayout>
    );
};
