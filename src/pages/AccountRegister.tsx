import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, Lock, Mail, Phone, User } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { registerAccount } from '../utils/accountApi';

export const AccountRegister = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
            setError('Please fill in the required fields.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        const result = await registerAccount({
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone,
            password: form.password,
        });

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        navigate('/account');
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC]">
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="rounded-3xl bg-[#1A3C27] text-white p-10 shadow-[0_30px_80px_rgba(26,60,39,0.35)]"
                        >
                            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Create account</p>
                            <h1 className="mt-4 font-serif text-4xl md:text-5xl">Save your addresses and orders.</h1>
                            <p className="mt-4 text-sm text-white/80">
                                Enjoy faster checkout, saved GST details, and priority support for every purchase.
                            </p>
                            <div className="mt-6 flex flex-col gap-2 text-sm">
                                <span>• One-tap repeat orders</span>
                                <span>• GST invoices on demand</span>
                                <span>• Track delivery in one place</span>
                            </div>
                            <Link
                                to="/account/login"
                                className="mt-8 inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white"
                            >
                                Already have an account? Sign in
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-8"
                        >
                            <h2 className="font-serif text-2xl text-[#1A3C27]">Create account</h2>
                            <p className="mt-2 text-sm text-[#5C5C5C]">It takes less than a minute.</p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Full name *</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <User className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="text"
                                            value={form.fullName}
                                            onChange={(event) => updateField('fullName', event.target.value)}
                                            placeholder="Aarav Sharma"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Username</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <BadgeCheck className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="text"
                                            value={form.username}
                                            onChange={(event) => updateField('username', event.target.value)}
                                            placeholder="@aarav"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Email *</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Mail className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(event) => updateField('email', event.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Phone</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Phone className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(event) => updateField('phone', event.target.value)}
                                            placeholder="+91 9008138404"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Password *</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Lock className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(event) => updateField('password', event.target.value)}
                                            placeholder="Minimum 6 characters"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Confirm password *</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Lock className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="password"
                                            value={form.confirmPassword}
                                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                                            placeholder="Re-enter password"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                {error && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full rounded-full bg-[#1A3C27] py-4 text-white text-lg font-semibold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating account...' : 'Create account'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
