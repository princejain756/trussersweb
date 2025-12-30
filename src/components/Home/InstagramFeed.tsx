import { useState, useRef } from 'react';

const IPhoneVideoPlayer = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPoweredOn, setIsPoweredOn] = useState(true);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handlePowerToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPoweredOn(!isPoweredOn);
    };

    const handleVolumeUp = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling mute from video click
        if (videoRef.current) {
            // Unmute if muted
            if (videoRef.current.muted) {
                videoRef.current.muted = false;
                setIsMuted(false);
            }
            // Increase volume (max 1)
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
        }
    };

    const handleVolumeDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            // Decrease volume (min 0)
            const newVolume = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVolume;

            // Mute if volume hits 0
            if (newVolume < 0.01) {
                videoRef.current.muted = true;
                setIsMuted(true);
            }
        }
    };

    return (
        <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl ">
            {/* Notch */}
            <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-10"></div>

            {/* Volume Up Button */}
            <div className="absolute -left-[17px] top-[124px] group cursor-pointer z-20" onClick={handleVolumeUp} title="Volume Up">
                <div className="h-[46px] w-[3px] bg-gray-800 rounded-l-lg group-hover:bg-gray-700 transition-colors"></div>
                {/* Expanded click area */}
                <div className="absolute top-0 -left-[10px] right-0 bottom-0 min-w-[30px] min-h-[46px]"></div>
            </div>

            {/* Volume Down Button */}
            <div className="absolute -left-[17px] top-[178px] group cursor-pointer z-20" onClick={handleVolumeDown} title="Volume Down">
                <div className="h-[46px] w-[3px] bg-gray-800 rounded-l-lg group-hover:bg-gray-700 transition-colors"></div>
                {/* Expanded click area */}
                <div className="absolute top-0 -left-[10px] right-0 bottom-0 min-w-[30px] min-h-[46px]"></div>
            </div>

            {/* Power Button (Right) */}
            <div className="absolute -right-[17px] top-[142px] group cursor-pointer z-20" onClick={handlePowerToggle} title="Power On/Off">
                <div className="h-[64px] w-[3px] bg-gray-800 rounded-r-lg group-hover:bg-gray-700 transition-colors"></div>
                {/* Expanded click area */}
                <div className="absolute top-0 -right-[10px] left-0 bottom-0 min-w-[30px] min-h-[64px]"></div>
            </div>

            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black relative flex items-center justify-center">
                {isPoweredOn ? (
                    <video
                        ref={videoRef}
                        src={src}
                        className="w-full h-full object-cover cursor-pointer"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        onClick={toggleMute}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        <img
                            src="/favicon.png"
                            alt="Trusser Logo"
                            className="w-32 h-auto opacity-80"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const InstagramFeed = () => {
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
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.079-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        @trusser.in
                    </a>
                </div>

                {/* iPhone Video Interface */}
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {[1, 2].map((num) => (
                        <IPhoneVideoPlayer key={num} src={`/Instagram/video${num}_small.mp4`} />
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <a
                        href="https://www.instagram.com/trusser.in/#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-[#1A3C27] px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(26,60,39,0.2)] hover:bg-[#163022] hover:shadow-[0_15px_30px_rgba(26,60,39,0.3)] transition-all duration-300 transform hover:scale-105"
                    >
                        Load Instagram posts
                    </a>
                </div>
            </div>
        </section>
    );
};
