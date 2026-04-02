import { Star, User } from 'lucide-react';

type Review = {
    id: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
};

type ReviewListProps = {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ReviewList = ({ reviews, averageRating, totalReviews }: ReviewListProps) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white/40 rounded-2xl border border-[#E8DFD4]">
                <p className="text-[#5C5C5C] text-lg">No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex text-[#D4AF37]">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={24}
                                fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                                className={i < Math.round(averageRating) ? '' : 'text-[#E8DFD4]'}
                            />
                        ))}
                    </div>
                    <span className="text-2xl font-serif text-[#1A3C27]">{averageRating.toFixed(1)}</span>
                    <span className="text-[#5C5C5C]">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white/60 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-[#E8DFD4] hover:border-[#C1A17C]/30 transition-colors"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#2D5F3F]/10 flex items-center justify-center">
                                    <User size={20} className="text-[#2D5F3F]" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-[#1A3C27]">{review.userName}</h4>
                                    <p className="text-sm text-[#9C8F84]">{formatDate(review.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex text-[#D4AF37]">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < review.rating ? 'currentColor' : 'none'}
                                        className={i < review.rating ? '' : 'text-[#E8DFD4]'}
                                    />
                                ))}
                            </div>
                        </div>
                        <h5 className="font-medium text-[#1A3C27] mb-2">{review.title}</h5>
                        <p className="text-[#5C5C5C] leading-relaxed">{review.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
