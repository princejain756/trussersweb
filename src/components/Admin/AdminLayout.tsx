import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

// Sidebar Navigation Items
const navItems = [
    { name: 'Home', path: '/admin/home', icon: Home },
    { name: 'Online Store', path: '/admin/online-store', icon: Store },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: 32 },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Marketing', path: '/admin/marketing', icon: Megaphone },
    { name: 'Discounts', path: '/admin/discounts', icon: Percent },
];

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, actions }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('adminToken');
            window.localStorage.removeItem('adminUser');
        }
        navigate('/admin');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#F7F7F7]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <span className="ml-4 font-semibold text-gray-900">Trussers Admin</span>
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
                                <span className="font-bold text-lg text-gray-900">Trussers</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <nav className="p-4 space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                            ? 'bg-gray-100 text-gray-900 font-medium'
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
                        <img src="/src/assets/TrusserLOGO.avif" alt="Trussers" className="h-8 w-auto" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
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
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
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
