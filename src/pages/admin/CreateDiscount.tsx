import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '../../components/Admin/AdminLayout';
import { Button } from '../../components/UI/Button';
import {
    ArrowLeft,
    Tag,
    Percent,
    DollarSign,
    Truck,
    Gift,
    Info,
} from 'lucide-react';

// Discount Type Options
const discountTypes = [
    { id: 'amount_off_order', label: 'Amount off order', icon: Tag, description: 'Discount the entire order' },
    { id: 'amount_off_products', label: 'Amount off products', icon: Percent, description: 'Discount specific products' },
    { id: 'free_shipping', label: 'Free shipping', icon: Truck, description: 'Offer free shipping' },
    { id: 'buy_x_get_y', label: 'Buy X get Y', icon: Gift, description: 'Buy and get rewards' },
];

export const CreateDiscount = () => {
    const navigate = useNavigate();
    const [discountType, setDiscountType] = useState('amount_off_order');
    const [method, setMethod] = useState<'code' | 'automatic'>('code');
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [valueType, setValueType] = useState<'percentage' | 'fixed'>('fixed');
    const [discountValue, setDiscountValue] = useState('');
    const [minRequirement, setMinRequirement] = useState<'none' | 'amount' | 'quantity'>('none');
    const [minAmount, setMinAmount] = useState('');
    const [minQuantity, setMinQuantity] = useState('');
    const [customerEligibility, setCustomerEligibility] = useState<'all' | 'specific' | 'segments'>('all');
    const [usageLimit, setUsageLimit] = useState(false);
    const [usageLimitValue, setUsageLimitValue] = useState('');
    const [onePerCustomer, setOnePerCustomer] = useState(false);
    const [hasEndDate, setHasEndDate] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('12:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('12:00');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    // Generate random code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        navigate('/admin/discounts');
    };

    return (
        <AdminLayout title="Create discount">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/admin/discounts"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Discounts</span>
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Discount Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Discount type</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {discountTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setDiscountType(type.id)}
                                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${discountType === type.id
                                            ? 'border-[#1A3C27] bg-[#1A3C27]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${discountType === type.id ? 'bg-[#1A3C27] text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <type.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-medium text-sm ${discountType === type.id ? 'text-[#1A3C27]' : 'text-gray-900'}`}>
                                                {type.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Method */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Method</h2>
                            <div className="flex gap-4 mb-4">
                                {(['code', 'automatic'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMethod(m)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${method === m
                                            ? 'border-[#1A3C27] bg-[#1A3C27]/5 text-[#1A3C27]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === m ? 'border-[#1A3C27]' : 'border-gray-300'
                                            }`}>
                                            {method === m && <div className="w-2 h-2 rounded-full bg-[#1A3C27]" />}
                                        </div>
                                        <span className="text-sm font-medium capitalize">{m === 'code' ? 'Discount code' : 'Automatic discount'}</span>
                                    </button>
                                ))}
                            </div>

                            {method === 'code' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            placeholder="e.g. SUMMER20"
                                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={generateCode}
                                            className="rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Customers must enter this code at checkout</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Summer Sale"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Customers will see this at checkout</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Discount Value */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Value</h2>
                            <div className="flex gap-4 mb-4">
                                {(['fixed', 'percentage'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setValueType(t)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${valueType === t
                                            ? 'border-[#1A3C27] bg-[#1A3C27]/5 text-[#1A3C27]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {t === 'fixed' ? <DollarSign className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
                                        <span className="text-sm font-medium">{t === 'fixed' ? 'Fixed amount' : 'Percentage'}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    {valueType === 'fixed' ? '₹' : ''}
                                </span>
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    placeholder={valueType === 'fixed' ? '0.00' : '0'}
                                    className={`w-full py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] ${valueType === 'fixed' ? 'pl-8 pr-4' : 'px-4'
                                        }`}
                                />
                                {valueType === 'percentage' && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                )}
                            </div>
                        </motion.div>

                        {/* Minimum Requirements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Minimum purchase requirements</h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'none', label: 'No minimum requirements' },
                                    { id: 'amount', label: 'Minimum purchase amount (₹)' },
                                    { id: 'quantity', label: 'Minimum quantity of items' },
                                ].map((option) => (
                                    <div key={option.id}>
                                        <button
                                            onClick={() => setMinRequirement(option.id as typeof minRequirement)}
                                            className="flex items-center gap-3 w-full text-left"
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${minRequirement === option.id ? 'border-[#1A3C27]' : 'border-gray-300'
                                                }`}>
                                                {minRequirement === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1A3C27]" />}
                                            </div>
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </button>
                                        {minRequirement === 'amount' && option.id === 'amount' && (
                                            <div className="mt-3 ml-8">
                                                <div className="relative w-48">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        value={minAmount}
                                                        onChange={(e) => setMinAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {minRequirement === 'quantity' && option.id === 'quantity' && (
                                            <div className="mt-3 ml-8">
                                                <input
                                                    type="number"
                                                    value={minQuantity}
                                                    onChange={(e) => setMinQuantity(e.target.value)}
                                                    placeholder="0"
                                                    className="w-48 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Customer Eligibility */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Customer eligibility</h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'all', label: 'All customers' },
                                    { id: 'specific', label: 'Specific customers' },
                                    { id: 'segments', label: 'Specific customer segments' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setCustomerEligibility(option.id as typeof customerEligibility)}
                                        className="flex items-center gap-3 w-full text-left"
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${customerEligibility === option.id ? 'border-[#1A3C27]' : 'border-gray-300'
                                            }`}>
                                            {customerEligibility === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1A3C27]" />}
                                        </div>
                                        <span className="text-sm text-gray-700">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Usage Limits */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Maximum discount uses</h2>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27] mt-0.5"
                                    />
                                    <div>
                                        <span className="text-sm text-gray-700">Limit number of times this discount can be used in total</span>
                                        {usageLimit && (
                                            <input
                                                type="number"
                                                value={usageLimitValue}
                                                onChange={(e) => setUsageLimitValue(e.target.value)}
                                                placeholder="0"
                                                className="mt-2 w-32 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                            />
                                        )}
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={onePerCustomer}
                                        onChange={(e) => setOnePerCustomer(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                                    />
                                    <span className="text-sm text-gray-700">Limit to one use per customer</span>
                                </label>
                            </div>
                        </motion.div>

                        {/* Active Dates */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Active dates</h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start time (IST)</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    checked={hasEndDate}
                                    onChange={(e) => setHasEndDate(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#1A3C27] focus:ring-[#1A3C27]"
                                />
                                <span className="text-sm text-gray-700">Set end date</span>
                            </label>
                            {hasEndDate && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End time (IST)</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6"
                        >
                            <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
                            <div className="space-y-3 text-sm">
                                {method === 'code' && code && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Code</span>
                                        <span className="font-mono font-medium text-gray-900">{code}</span>
                                    </div>
                                )}
                                {method === 'automatic' && title && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Title</span>
                                        <span className="font-medium text-gray-900">{title}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Type</span>
                                    <span className="text-gray-900">
                                        {discountTypes.find(t => t.id === discountType)?.label}
                                    </span>
                                </div>
                                {discountValue && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Value</span>
                                        <span className="font-medium text-gray-900">
                                            {valueType === 'fixed' ? `₹${discountValue}` : `${discountValue}%`} off
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Method</span>
                                    <span className="text-gray-900 capitalize">{method}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 mt-4 pt-4">
                                <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>
                                        {method === 'code'
                                            ? 'Customers will need to enter this code at checkout to apply the discount.'
                                            : 'This discount will be automatically applied when conditions are met.'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || (!code && method === 'code') || (!title && method === 'automatic')}
                                    className="w-full bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg py-3 font-medium disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save discount'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/admin/discounts')}
                                    className="w-full rounded-lg py-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Discard
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
