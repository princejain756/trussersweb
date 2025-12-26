import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import {
    Edit3,
    MoreHorizontal,
    CheckCircle,
    Clock,
    Eye,
    Zap,
    Layout,
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { getWebsiteContent, formatLastSaved } from '../../utils/websiteContent';

export const OnlineStore = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(getWebsiteContent());

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    // Reload content when page is focused (after editing)
    useEffect(() => {
        const handleFocus = () => {
            setContent(getWebsiteContent());
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const performanceMetrics = [
        { label: 'LCP P75', value: '2.3s', change: '↗ 12%', status: 'good' },
        { label: 'INP P75', value: '176ms', change: '↗ 100%', status: 'good' },
        { label: 'Layout Shift', value: '0', change: '—', status: 'good' },
        { label: 'Sessions', value: '72.8K', change: '', status: 'neutral' },
    ];

    return (
        <AdminLayout title="Online Store">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1A3C27] flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Themes</h1>
                            <p className="text-sm text-gray-500">Manage your store's appearance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            View your store
                        </a>
                    </div>
                </div>

                {/* Performance Metrics Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">30 days</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {performanceMetrics.map((metric, index) => (
                            <div key={index} className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">{metric.label}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg font-semibold text-gray-900">{metric.value}</span>
                                    {metric.change && (
                                        <span className="text-xs text-gray-500">{metric.change}</span>
                                    )}
                                    {metric.status === 'good' && (
                                        <span className="flex items-center gap-1 text-xs text-green-600">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Good
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Current Theme Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                    {/* Theme Preview */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Desktop Preview */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="h-4 bg-gray-100 flex items-center gap-1 px-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                </div>
                                <div className="aspect-video bg-[#F4EFEC] relative overflow-hidden">
                                    <iframe
                                        src="/"
                                        title="Desktop Preview"
                                        className="w-[200%] h-[200%] scale-50 origin-top-left pointer-events-none"
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            </div>
                            {/* Mobile Preview */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-32 mx-auto md:mx-0">
                                <div className="h-3 bg-gray-100 flex items-center justify-center">
                                    <div className="w-8 h-1.5 rounded-full bg-gray-300" />
                                </div>
                                <div className="aspect-[9/16] bg-[#F4EFEC] relative overflow-hidden">
                                    <iframe
                                        src="/"
                                        title="Mobile Preview"
                                        className="w-[400%] h-[400%] scale-[0.25] origin-top-left pointer-events-none"
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Info */}
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1A3C27] to-[#2D5F3F] flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900 text-lg">Trussers Theme</h3>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            Current theme
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Last saved: {formatLastSaved(content.lastSaved)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Version 1.0.0
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                <Button
                                    onClick={() => navigate('/admin/online-store/editor')}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-5 py-2.5 flex items-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit theme
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Theme Library Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <h2 className="font-semibold text-gray-900 mb-2">Theme library</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        These themes are only visible to you. Publishing a theme from your library will switch it to your current theme.
                    </p>
                    <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <Layout className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">No themes in library</p>
                            <p className="text-gray-400 text-xs mt-1">Duplicate your current theme to create a backup</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
};
