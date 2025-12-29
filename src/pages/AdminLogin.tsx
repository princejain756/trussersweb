import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Database, Eye, EyeOff, KeyRound, LayoutGrid, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Seo } from '../seo/Seo';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedToken = window.localStorage.getItem('adminToken');
        if (storedToken) {
            setSuccess('You are already signed in on this device.');
            navigate('/admin/products');
        }
    }, [navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = typeof data?.error === 'string' ? data.error : 'Login failed';
                throw new Error(message);
            }

            if (typeof data?.token !== 'string' || !data.token) {
                throw new Error('Login failed');
            }

            if (typeof window !== 'undefined') {
                window.localStorage.setItem('adminToken', data.token);
                window.localStorage.setItem('adminUser', data.user ?? username.trim());
            }

            setSuccess('Login successful. Admin access unlocked in this browser.');
            setPassword('');
            navigate('/admin/products');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formReady = username.trim().length > 0 && password.trim().length > 0;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F4EFEC]">
            <Seo title="Admin login | Trusser" canonicalPath="/admin/login" noindex />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%)]" />
            <motion.div
                className="pointer-events-none absolute -left-32 top-6 h-72 w-72 rounded-full bg-[#C1A17C]/35 blur-3xl"
                animate={{ y: [0, 16, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="pointer-events-none absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[#2D5F3F]/20 blur-3xl"
                animate={{ y: [0, -20, 0], opacity: [0.45, 0.7, 0.45] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
                <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#2D5F3F] shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-[#D45D48]" />
                            Admin Vault
                        </div>

                        <div className="space-y-5">
                            <h1 className="text-4xl font-serif leading-tight text-[#1A3C27] sm:text-5xl lg:text-6xl">
                                Trusser Admin Console
                            </h1>
                            <p className="max-w-xl text-lg text-[#5C5C5C]">
                                Secure access to the product catalog, pricing, and media. Log in to update inventory
                                and keep the storefront fresh.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur">
                                <div className="flex items-center gap-3 text-sm font-semibold text-[#2D5F3F]">
                                    <Database size={18} />
                                    Live Catalog
                                </div>
                                <p className="mt-3 text-sm text-[#5C5C5C]">
                                    Add, edit, or retire products in seconds with the latest inventory state.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur">
                                <div className="flex items-center gap-3 text-sm font-semibold text-[#2D5F3F]">
                                    <LayoutGrid size={18} />
                                    Visual Control
                                </div>
                                <p className="mt-3 text-sm text-[#5C5C5C]">
                                    Keep images, tags, and pricing aligned with the on-site brand story.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F] text-white shadow-lg">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-[#1A3C27]">Admin Login</h2>
                                <p className="text-sm text-[#5C5C5C]">
                                    Use your credentials to unlock admin tools.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label htmlFor="admin-username" className="text-sm font-medium text-[#2D5F3F]">
                                    Admin ID
                                </label>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#E2D6C8] bg-white/90 px-4 py-3 shadow-sm focus-within:border-[#2D5F3F] focus-within:ring-2 focus-within:ring-[#2D5F3F]/20">
                                    <User size={18} className="text-[#2D5F3F]/70" />
                                    <input
                                        id="admin-username"
                                        type="text"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        placeholder="trusser-admin"
                                        autoComplete="username"
                                        className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9B8F82] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="admin-password" className="text-sm font-medium text-[#2D5F3F]">
                                    Password
                                </label>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#E2D6C8] bg-white/90 px-4 py-3 shadow-sm focus-within:border-[#2D5F3F] focus-within:ring-2 focus-within:ring-[#2D5F3F]/20">
                                    <KeyRound size={18} className="text-[#2D5F3F]/70" />
                                    <input
                                        id="admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9B8F82] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="text-[#2D5F3F] transition-opacity hover:opacity-70"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-2xl border border-[#D45D48]/30 bg-[#D45D48]/10 px-4 py-3 text-sm text-[#8B2E22]" role="alert">
                                    {error}
                                </div>
                            ) : null}

                            {success ? (
                                <div className="rounded-2xl border border-[#2D5F3F]/20 bg-[#2D5F3F]/10 px-4 py-3 text-sm text-[#1A3C27]" aria-live="polite">
                                    {success}
                                </div>
                            ) : null}

                            <Button
                                type="submit"
                                size="lg"
                                disabled={!formReady || isSubmitting}
                                isLoading={isSubmitting}
                                className="w-full justify-center rounded-full bg-[#2D5F3F] py-5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01]"
                            >
                                Sign in to Admin
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A6F64]">
                            <span>API: {apiBaseUrl}</span>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="font-semibold text-[#2D5F3F] transition-opacity hover:opacity-70"
                            >
                                Go to Admin Panel
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
