import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Seo } from '../../seo/Seo';
import {
    Home,
    ShoppingBag,
    Package,
    Users,
    Megaphone,
    Percent,
    LogOut,
    Menu,
    X,
    Settings,
    Bell,
    Search,
    Store,
    BookOpen,
    CreditCard,
    ShieldAlert,
    Newspaper,
    AlertCircle,
    Truck,
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'new_order' | 'pending_payment' | 'unfulfilled';
    title: string;
    message: string;
    amount?: number;
    timestamp: string;
    read: boolean;
    link: string;
    orderId: string;
}

interface NavItem {
    name: string;
    path: string;
    icon: any;
    badge?: number;
}

// Sidebar Navigation Items
const navItems: NavItem[] = [
    { name: 'Home', path: '/admin/home', icon: Home },
    { name: 'Online Store', path: '/admin/online-store', icon: Store },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Fraud', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Marketing', path: '/admin/marketing', icon: Megaphone },
    { name: 'Discounts', path: '/admin/discounts', icon: Percent },
    { name: 'Journal', path: '/admin/journal', icon: BookOpen },
    { name: 'Newsletter', path: '/admin/newsletter', icon: Newspaper },
];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, actions }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ordersCount, setOrdersCount] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch stats and notifications
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = window.localStorage.getItem('adminToken');
                if (!token) return;

                // Fetch stats
                const statsResponse = await fetch(`${apiBaseUrl}/api/admin/stats`, {
                    headers: { 'X-Admin-Key': token }
                });
                if (statsResponse.ok) {
                    const data = await statsResponse.json();
                    if (data.summary?.totalOrders !== undefined) {
                        setOrdersCount(data.summary.totalOrders);
                    }
                }

                // Fetch notifications
                const notifResponse = await fetch(`${apiBaseUrl}/api/admin/notifications`, {
                    headers: { 'X-Admin-Key': token }
                });
                if (notifResponse.ok) {
                    const notifData = await notifResponse.json();
                    setNotifications(notifData.notifications || []);
                    setUnreadCount(notifData.unreadCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();

        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'new_order': return <ShoppingBag className="w-4 h-4 text-green-600" />;
            case 'pending_payment': return <AlertCircle className="w-4 h-4 text-orange-600" />;
            case 'unfulfilled': return <Truck className="w-4 h-4 text-blue-600" />;
            default: return <Bell className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const handleNotificationClick = (notification: Notification) => {
        setNotificationsOpen(false);
        navigate(notification.link);
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('adminToken');
            window.localStorage.removeItem('adminUser');
        }
        navigate('/admin');
    };

    const isActive = (path: string) => location.pathname === path;

    const sidebarItems = navItems.map(item => {
        if (item.name === 'Orders' && ordersCount !== null) {
            return { ...item, badge: ordersCount };
        }
        return item;
    });

    return (
        <div className="min-h-screen bg-[#F7F7F7]">
            <Seo title={title ? `${title} | Trusser Admin` : 'Trusser Admin'} canonicalPath={location.pathname} noindex />
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <span className="ml-4 font-semibold text-gray-900">Trusser Admin</span>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-xl"
                        >
                            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                                <span className="font-bold text-lg text-gray-900">Trusser</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
                                {sidebarItems.map((item: NavItem) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[240px] bg-white border-r border-gray-200 z-30">
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-gray-100">
                    <Link to="/admin/home" className="flex items-center gap-2">
                        <img src="/TrusserLOGO.avif" alt="Trusser" className="h-8 w-auto" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item: NavItem) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.badge && (
                                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100">
                    <Link
                        to="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-sm">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-[240px] min-h-screen pt-16 lg:pt-0">
                {/* Top Bar */}
                <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        {title && (
                            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            />
                        </div>
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {notificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <p className="text-xs text-gray-500">{unreadCount} new notifications</p>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-gray-500">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p className="text-sm">No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <button
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="p-2 rounded-lg bg-gray-100">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {notification.message}
                                                            </p>
                                                            {notification.amount && (
                                                                <p className="text-xs font-medium text-green-600">
                                                                    ₹{notification.amount.toLocaleString('en-IN')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                                            {formatTimeAgo(notification.timestamp)}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>

                                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                                            <button
                                                onClick={() => {
                                                    setNotificationsOpen(false);
                                                    navigate('/admin/orders');
                                                }}
                                                className="w-full text-center text-sm text-[#1A3C27] font-medium hover:underline"
                                            >
                                                View all orders →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* Actions */}
                        {actions}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};
