import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, LogOut, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';
import {
    addAccountAddress,
    fetchAccount,
    getCachedAccount,
    logoutAccount,
    subscribeToAccount,
    updateAccountProfile,
} from '../utils/accountApi';
import type { AccountAddress, AccountProfile } from '../utils/accountApi';
import { formatPriceSimple } from '../utils/currency';

const emptyAddress: Omit<AccountAddress, 'id'> = {
    label: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    instructions: '',
};

export const Account = () => {
    const navigate = useNavigate();
    const [account, setAccount] = useState<AccountProfile | null>(() => getCachedAccount());
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [profileForm, setProfileForm] = useState({ phone: '', gstNumber: '' });

    useEffect(() => {
        fetchAccount().then((next) => setAccount(next));
        return subscribeToAccount((next) => setAccount(next));
    }, []);

    useEffect(() => {
        if (!account) {
            navigate('/account/login');
            return;
        }
        setProfileForm({
            phone: account.phone ?? '',
            gstNumber: account.gstNumber ?? '',
        });
    }, [account, navigate]);

    const latestAddress = useMemo(() => account?.addresses?.[0], [account]);

    if (!account) {
        return null;
    }

    const handleSignOut = () => {
        logoutAccount().then(() => navigate('/'));
    };

    const handleAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!addressForm.address1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
            return;
        }
        await addAccountAddress(addressForm);
        setAddressForm(emptyAddress);
        setShowAddressForm(false);
    };

    const handleProfileSave = async () => {
        await updateAccountProfile({
            phone: profileForm.phone,
            gstNumber: profileForm.gstNumber.trim() || undefined,
        });
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC]">
            <Seo title="Account | Trusser" canonicalPath="/account" noindex />
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="mx-auto max-w-6xl px-6 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-8"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#C1A17C]">Account</p>
                                <h1 className="mt-3 font-serif text-3xl md:text-4xl text-[#1A3C27]">Welcome, {account.fullName}</h1>
                                <p className="mt-2 text-sm text-[#5C5C5C]">Manage saved addresses, GST details, and orders.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-full border-[#1A3C27] text-[#1A3C27]"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
                        <div className="space-y-8">
                            <div className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6">
                                <h2 className="font-serif text-2xl text-[#1A3C27]">Profile</h2>
                                <div className="mt-4 space-y-3 text-sm text-[#5C5C5C]">
                                    <div className="flex items-center gap-3">
                                        <BadgeCheck className="h-4 w-4 text-[#C1A17C]" />
                                        <span>{account.username}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-[#C1A17C]" />
                                        <span>{account.email}</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="space-y-2">
                                        <span className="text-sm text-[#1A3C27]">Phone</span>
                                        <div className="flex items-center gap-2 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                            <Phone className="h-4 w-4 text-[#C1A17C]" />
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                                                className="w-full bg-transparent text-[#1A3C27] focus:outline-none"
                                            />
                                        </div>
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm text-[#1A3C27]">GSTIN (optional)</span>
                                        <div className="flex items-center gap-2 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                            <BadgeCheck className="h-4 w-4 text-[#C1A17C]" />
                                            <input
                                                type="text"
                                                value={profileForm.gstNumber}
                                                onChange={(event) => setProfileForm((prev) => ({ ...prev, gstNumber: event.target.value.toUpperCase() }))}
                                                placeholder="15-character GSTIN"
                                                className="w-full bg-transparent text-[#1A3C27] focus:outline-none"
                                            />
                                        </div>
                                    </label>
                                </div>
                                <Button
                                    onClick={handleProfileSave}
                                    className="mt-4 rounded-full bg-[#1A3C27] text-white"
                                >
                                    Save profile
                                </Button>
                            </div>

                            <div className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-[#C1A17C]">Saved addresses</p>
                                        <h2 className="mt-2 font-serif text-2xl text-[#1A3C27]">Delivery locations</h2>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-[#1A3C27] text-[#1A3C27]"
                                        onClick={() => setShowAddressForm((prev) => !prev)}
                                    >
                                        {showAddressForm ? 'Close' : 'Add address'}
                                    </Button>
                                </div>

                                {latestAddress ? (
                                    <div className="mt-4 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] p-4 text-sm text-[#5C5C5C]">
                                        <div className="flex items-center gap-2 text-[#1A3C27] font-semibold">
                                            <MapPin className="h-4 w-4 text-[#C1A17C]" />
                                            {latestAddress.label}
                                        </div>
                                        <p className="mt-2">{latestAddress.address1}</p>
                                        {latestAddress.address2 && <p>{latestAddress.address2}</p>}
                                        <p>
                                            {latestAddress.city}, {latestAddress.state} {latestAddress.pincode}
                                        </p>
                                        <p>{latestAddress.country}</p>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-[#5C5C5C]">No saved addresses yet.</p>
                                )}

                                {showAddressForm && (
                                    <form onSubmit={handleAddressSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            value={addressForm.label}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
                                            placeholder="Label (Home, Office)"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.address1}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, address1: event.target.value }))}
                                            placeholder="Street address"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.address2}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, address2: event.target.value }))}
                                            placeholder="Apartment / landmark"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.city}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                                            placeholder="City"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.state}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
                                            placeholder="State"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.pincode}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, pincode: event.target.value }))}
                                            placeholder="Pincode"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.country}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
                                            placeholder="Country"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm"
                                        />
                                        <input
                                            value={addressForm.instructions}
                                            onChange={(event) => setAddressForm((prev) => ({ ...prev, instructions: event.target.value }))}
                                            placeholder="Delivery instructions"
                                            className="w-full rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3 text-sm md:col-span-2"
                                        />
                                        <Button type="submit" className="rounded-full bg-[#1A3C27] text-white md:col-span-2">
                                            Save address
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-3xl bg-[#1A3C27] text-white p-6 shadow-[0_20px_60px_rgba(26,60,39,0.3)]">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
                                    <Sparkles className="h-4 w-4" />
                                    Saved checkout
                                </div>
                                <p className="mt-3 text-sm text-white/80">
                                    Use your account details at checkout for a faster experience. GST invoices will be applied when requested.
                                </p>
                                <Link
                                    to="/checkout"
                                    className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1A3C27]"
                                >
                                    Go to checkout
                                </Link>
                            </div>

                            <div className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_20px_60px_rgba(26,60,39,0.12)] p-6">
                                <h2 className="font-serif text-2xl text-[#1A3C27]">Recent orders</h2>
                                {account.orders.length === 0 ? (
                                    <p className="mt-3 text-sm text-[#5C5C5C]">No orders yet.</p>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        {account.orders.map((order) => (
                                            <div key={order.id} className="rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] p-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-[#1A3C27]">{order.orderNumber}</span>
                                                    <span className="text-[#5C5C5C]">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="mt-2 text-xs text-[#5C5C5C]">{order.items.length} items · {formatPriceSimple(order.total)}</p>
                                                <p className="mt-1 text-xs text-[#5C5C5C]">Payment: {order.paymentMethod}</p>
                                                {order.invoice?.requested && order.invoice.gstNumber && (
                                                    <p className="mt-1 text-xs text-[#5C5C5C]">GSTIN: {order.invoice.gstNumber}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
