import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
}

/**
 * Optimized lazy-loading image component for performance
 * - Uses native loading="lazy" for below-fold images
 * - Supports priority loading for above-fold images
 * - Includes blur placeholder option
 * - Explicit dimensions for CLS prevention
 */
export const LazyImage = ({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    placeholder = 'empty',
    blurDataURL,
}: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);

    // Use Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Start loading 200px before visible
                threshold: 0.01,
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [priority]);

    // Generate a simple blur placeholder if not provided
    const defaultBlurPlaceholder =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRThERkQ0Ii8+PC9zdmc+';

    const showPlaceholder = placeholder === 'blur' && !isLoaded;

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Blur placeholder */}
            {showPlaceholder && (
                <img
                    src={blurDataURL || defaultBlurPlaceholder}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
                    style={{ filter: 'blur(20px)' }}
                />
            )}

            {/* Main image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : 'auto'}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}

            {/* Empty placeholder for non-blur mode */}
            {!isInView && placeholder === 'empty' && (
                <div
                    className="w-full h-full bg-[#E8DFD4] animate-pulse"
                    style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
                />
            )}
        </div>
    );
};
