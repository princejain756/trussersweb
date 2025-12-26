import { useEffect } from 'react';
import { getWebsiteContent } from '../../utils/websiteContent';

export const InstagramFeed = () => {
    const content = getWebsiteContent();
    const embeds = content.instagramEmbeds || [];

    useEffect(() => {
        // Load Instagram embed script
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);

        // Process embeds if script already loaded
        if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }

        return () => {
            // Cleanup script on unmount
            const existingScript = document.querySelector('script[src="//www.instagram.com/embed.js"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [embeds]);

    // Re-process embeds when content changes
    useEffect(() => {
        if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    }, [embeds]);

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#F4EFEC] to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
                        Follow Our Journey
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        See what our community is creating and sharing with Trusser
                    </p>
                    <a
                        href="https://www.instagram.com/trusser.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#C1A17C] hover:text-[#A68763] transition-colors font-medium"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        @trusser.in
                    </a>
                </div>

                {/* Instagram Posts Grid - Dynamic from Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {embeds.map((embed) => (
                        <div key={embed.id} className="instagram-embed-wrapper flex justify-center">
                            <blockquote
                                className="instagram-media"
                                data-instgrm-permalink={`${embed.url}?utm_source=ig_embed&utm_campaign=loading`}
                                data-instgrm-version="14"
                                style={{
                                    background: '#FFF',
                                    border: 0,
                                    borderRadius: '3px',
                                    boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                                    margin: '1px',
                                    maxWidth: '540px',
                                    minWidth: '326px',
                                    padding: 0,
                                    width: '99.375%'
                                }}
                            >
                            </blockquote>
                        </div>
                    ))}
                </div>

                {embeds.length === 0 && (
                    <p className="text-center text-gray-500 py-12">
                        No Instagram embeds configured. Add them in the Online Store editor.
                    </p>
                )}

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <a
                        href="https://www.instagram.com/trusser.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-3 bg-[#C1A17C] text-white font-medium rounded-full hover:bg-[#A68763] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        View More on Instagram
                    </a>
                </div>
            </div>
        </section>
    );
};
