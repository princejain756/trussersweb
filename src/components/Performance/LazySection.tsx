import { useEffect, useRef, useState, type ReactNode } from 'react';

type LazySectionProps = {
    children: ReactNode;
    className?: string;
    rootMargin?: string;
    minHeight?: number | string;
    placeholder?: ReactNode;
};

export const LazySection = ({
    children,
    className,
    rootMargin = '800px 0px',
    minHeight,
    placeholder,
}: LazySectionProps) => {
    const [shouldRender, setShouldRender] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (shouldRender) return;
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry) return;
                if (entry.isIntersecting) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [rootMargin, shouldRender]);

    return (
        <div ref={ref} className={className} style={minHeight ? { minHeight } : undefined}>
            {shouldRender ? children : placeholder ?? null}
        </div>
    );
};

