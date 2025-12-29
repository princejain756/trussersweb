import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { Button } from '../components/UI/Button';
import { loginAccount, loginWithGoogle } from '../utils/accountApi';
import { GoogleSignInButton } from '../components/Auth/GoogleSignInButton';

export const AccountLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setIsSubmitting(true);
        const result = await loginAccount({ email, password });
        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        navigate('/account');
    };

    const handleGoogleCredential = async (credential: string) => {
        if (!credential) {
            return;
        }
        setError(null);
        setIsGoogleSubmitting(true);

        const result = await loginWithGoogle({ credential });
        if (result.error) {
            setError(result.error);
            setIsGoogleSubmitting(false);
            return;
        }

        navigate('/account');
    };

    return (
        <div className="min-h-screen bg-[#F4EFEC]">
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-xs uppercase tracking-[0.3em] text-[#C1A17C]">Welcome back</p>
                            <h1 className="mt-4 font-serif text-4xl md:text-5xl text-[#1A3C27]">
                                Sign in to manage your orders.
                            </h1>
                            <p className="mt-4 text-[#5C5C5C] max-w-lg">
                                Access your saved addresses, track recent purchases, and unlock a smoother checkout experience.
                            </p>
                            <div className="mt-8 flex items-center gap-4">
                                <Link
                                    to="/checkout"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#1A3C27] px-6 py-3 text-sm font-semibold text-[#1A3C27]"
                                >
                                    Checkout as guest
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/account/register"
                                    className="text-sm font-semibold text-[#1A3C27] underline decoration-[#C1A17C]"
                                >
                                    Create a new account
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="rounded-3xl bg-white/85 border border-white/70 shadow-[0_30px_80px_rgba(26,60,39,0.12)] p-8"
                        >
                            <h2 className="font-serif text-2xl text-[#1A3C27]">Sign in</h2>
                            <p className="mt-2 text-sm text-[#5C5C5C]">Use the email you registered with.</p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Email</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Mail className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-transparent text-[#1A3C27] placeholder:text-[#9C8F84] focus:outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="space-y-2 block">
                                    <span className="text-sm text-[#1A3C27]">Password</span>
                                    <div className="flex items-center gap-3 rounded-2xl border border-[#E8DFD4] bg-[#FBF8F4] px-4 py-3">
                                        <Lock className="h-5 w-5 text-[#C1A17C]" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder="••••••••"
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
                                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </form>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-px flex-1 bg-[#E8DFD4]" />
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C5C5C]">or</span>
                                <div className="h-px flex-1 bg-[#E8DFD4]" />
                            </div>

                            <div className="mt-6">
                                <GoogleSignInButton
                                    clientId={googleClientId}
                                    disabled={isGoogleSubmitting || !googleClientId}
                                    onCredential={handleGoogleCredential}
                                />
                                {!googleClientId ? (
                                    <div className="mt-3 text-center text-xs text-[#5C5C5C]">
                                        Google sign-in is not configured.
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
