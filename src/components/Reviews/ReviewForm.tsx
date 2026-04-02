import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type ReviewFormProps = {
    productId: string;
    onSuccess?: () => void;
};

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setMessage({ type: 'error', text: 'Please select a rating' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, email, rating, title, content }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Thank you! Your review has been submitted.' });
                setRating(0);
                setUserName('');
                setEmail('');
                setTitle('');
                setContent('');
                onSuccess?.();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to submit review' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#E8DFD4]">
            <h3 className="font-serif text-2xl text-[#1A3C27] mb-6">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
                        Your Rating *
                    </label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={28}
                                    className={`transition-colors ${star <= (hoverRating || rating)
                                        ? 'text-[#D4AF37] fill-[#D4AF37]'
                                        : 'text-[#E8DFD4]'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            placeholder="Maitri"
                            className="w-full px-4 py-3 rounded-lg border border-[#E8DFD4] bg-white/80 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
                            Your Email *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="maitri@trusser.in"
                            className="w-full px-4 py-3 rounded-lg border border-[#E8DFD4] bg-white/80 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
                        Review Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Summarize your experience"
                        className="w-full px-4 py-3 rounded-lg border border-[#E8DFD4] bg-white/80 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all"
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-[#5C5C5C] mb-2">
                        Your Review *
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                        placeholder="Share your thoughts about this product..."
                        className="w-full px-4 py-3 rounded-lg border border-[#E8DFD4] bg-white/80 focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20 outline-none transition-all resize-none"
                    />
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-[#2D5F3F] hover:bg-[#1A3C27] text-white font-medium rounded-full transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Submit Review
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
