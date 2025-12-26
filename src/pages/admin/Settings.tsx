import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    Store,
    MapPin,
    Sun,
    Moon,
    FileText,
    ChevronDown,
    Check,
    Palette,
    Users,
    Plus,
    Search,
    Download,
    X,
    ShieldCheck,
    Ban,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Copy,
    Key,
} from 'lucide-react';

// Theme Types
type ThemeMode = 'light' | 'dark' | 'paper';

const themes: { id: ThemeMode; name: string; icon: React.ElementType; description: string }[] = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
    { id: 'paper', name: 'Paper', icon: FileText, description: 'Monochrome paper-like texture' },
];

// User Types
type UserStatus = 'Active' | 'Pending' | 'Inactive';
type UserRole = 'Store owner' | 'Staff' | 'Limited staff' | 'App-only';
type ModulePermission = 'Home' | 'Orders' | 'Products' | 'Customers' | 'Marketing' | 'Discounts' | 'Settings';

const ALL_MODULES: ModulePermission[] = ['Home', 'Orders', 'Products', 'Customers', 'Marketing', 'Discounts', 'Settings'];

interface AdminUser {
    id: string;
    name: string;
    email: string;
    password: string;
    status: UserStatus;
    role: UserRole;
    lastLogin?: string;
    twoFactorEnabled: boolean;
    permissions: ModulePermission[];
}

// Password generator function
const generatePassword = (): string => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*';
    const all = upper + lower + numbers + special;

    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 0; i < 8; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

const mockUsers: AdminUser[] = [
    { id: '1', name: 'Maitri Wadher', email: 'maitri@trussers.com', password: generatePassword(), status: 'Active', role: 'Store owner', lastLogin: 'Today', twoFactorEnabled: true, permissions: ALL_MODULES },
    { id: '2', name: 'GoKwik Commerce Solution', email: 'support@gokwik.co', password: generatePassword(), status: 'Active', role: 'App-only', lastLogin: 'Yesterday', twoFactorEnabled: false, permissions: ['Orders', 'Products'] },
];

export const Settings = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<ThemeMode>('light');
    const [storeDetails, setStoreDetails] = useState({
        name: 'Trussers',
        email: 'contact@trussers.com',
        phone: '+91 98765 43210',
    });
    const [billingAddress, setBillingAddress] = useState({
        line1: 'Trussers Eco Products',
        line2: 'Plot No. 45, Industrial Area',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        pincode: '560078',
    });
    const [currency, setCurrency] = useState('INR');
    const [region, setRegion] = useState('India');
    const [unitSystem, setUnitSystem] = useState('Metric system');
    const [weightUnit, setWeightUnit] = useState('Kilogram (kg)');
    const [timezone, setTimezone] = useState('(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
    const [orderPrefix, setOrderPrefix] = useState('#');
    const [orderSuffix, setOrderSuffix] = useState('');

    // Users state
    const [users, setUsers] = useState<AdminUser[]>(mockUsers);
    const [userTab, setUserTab] = useState('All');
    const [userSearch, setUserSearch] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Staff' as UserRole, permissions: [...ALL_MODULES] as ModulePermission[] });

    // Edit modals
    const [showEditStore, setShowEditStore] = useState(false);
    const [showEditAddress, setShowEditAddress] = useState(false);
    const [editStoreDetails, setEditStoreDetails] = useState(storeDetails);
    const [editBillingAddress, setEditBillingAddress] = useState(billingAddress);

    // Credentials modal
    const [showCredentials, setShowCredentials] = useState(false);
    const [createdUserCredentials, setCreatedUserCredentials] = useState<{ email: string; password: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Change password modal
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
        // Load saved theme
        const savedTheme = localStorage.getItem('adminTheme') as ThemeMode;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }

        // Load saved store settings
        const savedSettings = localStorage.getItem('storeSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.storeDetails) setStoreDetails(settings.storeDetails);
            if (settings.billingAddress) setBillingAddress(settings.billingAddress);
            if (settings.currency) setCurrency(settings.currency);
            if (settings.region) setRegion(settings.region);
            if (settings.unitSystem) setUnitSystem(settings.unitSystem);
            if (settings.weightUnit) setWeightUnit(settings.weightUnit);
            if (settings.timezone) setTimezone(settings.timezone);
            if (settings.orderPrefix) setOrderPrefix(settings.orderPrefix);
            if (settings.orderSuffix !== undefined) setOrderSuffix(settings.orderSuffix);
        }
    }, [navigate]);

    const applyTheme = (newTheme: ThemeMode) => {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove('theme-light', 'theme-dark', 'theme-paper');

        // Add new theme class
        root.classList.add(`theme-${newTheme}`);

        // Save to localStorage
        localStorage.setItem('adminTheme', newTheme);
    };

    const handleThemeChange = (newTheme: ThemeMode) => {
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <AdminLayout title="Settings">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Theme Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Appearance</h2>
                            <p className="text-sm text-gray-500">Customize how the admin panel looks</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleThemeChange(t.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${theme === t.id
                                    ? 'border-[#1A3C27] bg-[#1A3C27]/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {theme === t.id && (
                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1A3C27] flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center ${t.id === 'light' ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                                    t.id === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' :
                                        'bg-gradient-to-br from-amber-50 to-stone-100'
                                    }`}>
                                    <t.icon className={`w-6 h-6 ${t.id === 'dark' ? 'text-yellow-400' : 'text-gray-700'
                                        }`} />
                                </div>
                                <p className="font-medium text-gray-900">{t.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                            </button>
                        ))}
                    </div>

                    {/* Theme Preview */}
                    <div className="mt-6 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Preview</p>
                        <div className={`rounded-lg p-4 transition-all ${theme === 'light' ? 'bg-white border border-gray-200' :
                            theme === 'dark' ? 'bg-gray-900 text-white' :
                                'bg-amber-50 border border-amber-200'
                            }`} style={theme === 'paper' ? {
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
                            } : {}}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'}`} />
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sample Order #1001</span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                This is how content will appear in {theme} mode.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Store Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <h2 className="font-semibold text-gray-900 mb-4">Store details</h2>

                    <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:border-gray-300 transition-colors cursor-pointer group" onClick={() => { setEditStoreDetails(storeDetails); setShowEditStore(true); }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <Store className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">{storeDetails.name}</p>
                                    <p className="text-sm text-gray-600">{storeDetails.email} • {storeDetails.phone}</p>
                                </div>
                            </div>
                            <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer group" onClick={() => { setEditBillingAddress(billingAddress); setShowEditAddress(true); }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">Billing address</p>
                                    <p className="text-sm text-gray-600">
                                        {billingAddress.line1}, {billingAddress.line2}, {billingAddress.city}, {billingAddress.pincode} {billingAddress.state}, {billingAddress.country}
                                    </p>
                                </div>
                            </div>
                            <Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </motion.div>

                {/* Users Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Users</h2>
                                    <p className="text-sm text-gray-500">Manage who has access to your admin panel</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                                <Button
                                    onClick={() => setShowAddUser(true)}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2 text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add users
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* User Tabs */}
                    <div className="flex items-center gap-1 px-4 border-b border-gray-100 overflow-x-auto">
                        {['All', 'Active', 'Pending', 'POS app-only', 'Requests'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setUserTab(tab)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${userTab === tab
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-2 py-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="divide-y divide-gray-50">
                        <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <div className="col-span-1">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                            </div>
                            <div className="col-span-3">User</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-2">2FA</div>
                            <div className="col-span-2">Actions</div>
                        </div>
                        {users
                            .filter(user => {
                                const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                                    user.email.toLowerCase().includes(userSearch.toLowerCase());
                                if (userTab === 'All') return matchesSearch;
                                if (userTab === 'Active') return matchesSearch && user.status === 'Active';
                                if (userTab === 'Pending') return matchesSearch && user.status === 'Pending';
                                if (userTab === 'POS app-only') return matchesSearch && user.role === 'App-only';
                                return matchesSearch;
                            })
                            .map((user) => (
                                <div key={user.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors group">
                                    <div className="col-span-1">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-sm text-gray-600">{user.role}</div>
                                    <div className="col-span-2">
                                        {user.twoFactorEnabled ? (
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Ban className="w-4 h-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        {user.role !== 'Store owner' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUserForPassword(user);
                                                        setShowChangePassword(true);
                                                    }}
                                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Change password"
                                                >
                                                    <Key className="w-3.5 h-3.5" />
                                                    Password
                                                </button>
                                                <button
                                                    onClick={() => setUsers(users.filter(u => u.id !== user.id))}
                                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    <div className="p-4 text-center border-t border-gray-100">
                        <a href="#" className="text-sm text-blue-600 hover:underline">Learn more about users</a>
                    </div>
                </motion.div>

                {/* Add User Modal */}
                {showAddUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Add new user</h3>
                                <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <div className="relative">
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        >
                                            <option value="Staff">Staff</option>
                                            <option value="Limited staff">Limited staff</option>
                                            <option value="App-only">App-only</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Staff can access most admin features. Limited staff has restricted access.</p>
                                </div>

                                {/* Module Permissions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Module Access</label>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">Select which modules this user can access</span>
                                            <button
                                                type="button"
                                                onClick={() => setNewUser({ ...newUser, permissions: newUser.permissions.length === ALL_MODULES.length ? [] : [...ALL_MODULES] })}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {newUser.permissions.length === ALL_MODULES.length ? 'Deselect all' : 'Select all'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ALL_MODULES.map((module) => (
                                                <label key={module} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-[#1A3C27] transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUser.permissions.includes(module)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewUser({ ...newUser, permissions: [...newUser.permissions, module] });
                                                            } else {
                                                                setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== module) });
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                                                    />
                                                    <span className="text-sm text-gray-700">{module}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => setShowAddUser(false)} className="rounded-lg px-4 py-2">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (newUser.name && newUser.email) {
                                            const generatedPassword = generatePassword();
                                            setUsers([...users, {
                                                id: String(users.length + 1),
                                                name: newUser.name,
                                                email: newUser.email,
                                                password: generatedPassword,
                                                status: 'Pending',
                                                role: newUser.role,
                                                twoFactorEnabled: false,
                                                permissions: newUser.permissions,
                                            }]);
                                            setCreatedUserCredentials({ email: newUser.email, password: generatedPassword });
                                            setNewUser({ name: '', email: '', role: 'Staff', permissions: [...ALL_MODULES] });
                                            setShowAddUser(false);
                                            setShowCredentials(true);
                                        }
                                    }}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2"
                                >
                                    Create User
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Store Defaults */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <h2 className="font-semibold text-gray-900 mb-4">Store defaults</h2>

                    {/* Currency Display */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency display</label>
                        <div className="relative">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            >
                                <option value="INR">Indian Rupee (INR ₹)</option>
                                <option value="USD">US Dollar (USD $)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Currency used to display prices across the store</p>
                    </div>

                    {/* Backup Region */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Region</label>
                        <div className="relative">
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            >
                                <option value="India">India</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Australia">Australia</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Determines settings for customers outside of your markets</p>
                    </div>

                    {/* Unit System & Weight */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit system</label>
                            <div className="relative">
                                <select
                                    value={unitSystem}
                                    onChange={(e) => setUnitSystem(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                >
                                    <option value="Metric system">Metric system</option>
                                    <option value="Imperial system">Imperial system</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default weight unit</label>
                            <div className="relative">
                                <select
                                    value={weightUnit}
                                    onChange={(e) => setWeightUnit(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                >
                                    <option value="Kilogram (kg)">Kilogram (kg)</option>
                                    <option value="Gram (g)">Gram (g)</option>
                                    <option value="Pound (lb)">Pound (lb)</option>
                                    <option value="Ounce (oz)">Ounce (oz)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time zone</label>
                        <div className="relative">
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            >
                                <option value="(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                                <option value="(GMT+00:00) London, Dublin">(GMT+00:00) London, Dublin</option>
                                <option value="(GMT-05:00) New York, Toronto">(GMT-05:00) New York, Toronto</option>
                                <option value="(GMT-08:00) Los Angeles, Vancouver">(GMT-08:00) Los Angeles, Vancouver</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Sets the time for when orders and analytics are recorded</p>
                    </div>

                    <p className="text-sm text-gray-500 mt-6 p-3 bg-gray-50 rounded-lg">
                        To change your user level time zone and language visit your <a href="#" className="text-blue-600 hover:underline">account settings</a>
                    </p>
                </motion.div>

                {/* Order ID */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <h2 className="font-semibold text-gray-900 mb-2">Order ID</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Shown on the order page, customer pages, and customer order notifications to identify order
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                            <input
                                type="text"
                                value={orderPrefix}
                                onChange={(e) => setOrderPrefix(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                            <input
                                type="text"
                                value={orderSuffix}
                                onChange={(e) => setOrderSuffix(e.target.value)}
                                placeholder="Optional"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                            />
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Your order ID will appear as <span className="font-mono font-medium">{orderPrefix}1001{orderSuffix}</span>, <span className="font-mono font-medium">{orderPrefix}1002{orderSuffix}</span>, <span className="font-mono font-medium">{orderPrefix}1003{orderSuffix}</span> ...
                    </p>
                </motion.div>

                {/* Edit Store Details Modal */}
                {showEditStore && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Edit store details</h3>
                                <button onClick={() => setShowEditStore(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store name</label>
                                    <input
                                        type="text"
                                        value={editStoreDetails.name}
                                        onChange={(e) => setEditStoreDetails({ ...editStoreDetails, name: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={editStoreDetails.email}
                                        onChange={(e) => setEditStoreDetails({ ...editStoreDetails, email: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={editStoreDetails.phone}
                                        onChange={(e) => setEditStoreDetails({ ...editStoreDetails, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => setShowEditStore(false)} className="rounded-lg px-4 py-2">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setStoreDetails(editStoreDetails);
                                        setShowEditStore(false);
                                    }}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2"
                                >
                                    Save
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Edit Billing Address Modal */}
                {showEditAddress && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Edit billing address</h3>
                                <button onClick={() => setShowEditAddress(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address line 1</label>
                                    <input
                                        type="text"
                                        value={editBillingAddress.line1}
                                        onChange={(e) => setEditBillingAddress({ ...editBillingAddress, line1: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address line 2</label>
                                    <input
                                        type="text"
                                        value={editBillingAddress.line2}
                                        onChange={(e) => setEditBillingAddress({ ...editBillingAddress, line2: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            value={editBillingAddress.city}
                                            onChange={(e) => setEditBillingAddress({ ...editBillingAddress, city: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            value={editBillingAddress.state}
                                            onChange={(e) => setEditBillingAddress({ ...editBillingAddress, state: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            value={editBillingAddress.pincode}
                                            onChange={(e) => setEditBillingAddress({ ...editBillingAddress, pincode: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <input
                                            type="text"
                                            value={editBillingAddress.country}
                                            onChange={(e) => setEditBillingAddress({ ...editBillingAddress, country: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => setShowEditAddress(false)} className="rounded-lg px-4 py-2">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setBillingAddress(editBillingAddress);
                                        setShowEditAddress(false);
                                    }}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2"
                                >
                                    Save
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Credentials Display Modal */}
                {showCredentials && createdUserCredentials && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">User Created Successfully</h3>
                                </div>
                                <button onClick={() => { setShowCredentials(false); setShowPassword(false); }} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-sm text-amber-800">
                                        <strong>Important:</strong> Save these credentials. The password won't be shown again.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Login ID (Email)</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono">
                                            {createdUserCredentials.email}
                                        </div>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(createdUserCredentials.email)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copy email"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono">
                                            {showPassword ? createdUserCredentials.password : '•'.repeat(12)}
                                        </div>
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(createdUserCredentials.password)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Copy password"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                <Button
                                    onClick={() => { setShowCredentials(false); setShowPassword(false); }}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2"
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showChangePassword && selectedUserForPassword && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Change Password</h3>
                                <button onClick={() => { setShowChangePassword(false); setSelectedUserForPassword(null); setNewPassword(''); }} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">Changing password for: <strong>{selectedUserForPassword.name}</strong></p>
                                    <p className="text-xs text-gray-500">{selectedUserForPassword.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewPassword(generatePassword())}
                                            className="px-3 py-2.5 text-sm font-medium text-[#1A3C27] bg-[#1A3C27]/10 rounded-lg hover:bg-[#1A3C27]/20 transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Password should be at least 8 characters with uppercase, lowercase, numbers, and symbols.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => { setShowChangePassword(false); setSelectedUserForPassword(null); setNewPassword(''); }} className="rounded-lg px-4 py-2">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (newPassword && selectedUserForPassword) {
                                            setUsers(users.map(u => u.id === selectedUserForPassword.id ? { ...u, password: newPassword } : u));
                                            setShowChangePassword(false);
                                            setSelectedUserForPassword(null);
                                            setNewPassword('');
                                        }
                                    }}
                                    disabled={!newPassword}
                                    className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-4 py-2 disabled:opacity-50"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={() => {
                            const settings = {
                                storeDetails,
                                billingAddress,
                                currency,
                                region,
                                unitSystem,
                                weightUnit,
                                timezone,
                                orderPrefix,
                                orderSuffix,
                            };
                            localStorage.setItem('storeSettings', JSON.stringify(settings));
                            alert('Settings saved successfully!');
                        }}
                        className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-6 py-2.5"
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};
