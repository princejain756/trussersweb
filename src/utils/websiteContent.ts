// Website content management utility for visual editor
// Fetches content from server API so changes apply to ALL users

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    label: string;
}

export interface InstagramEmbed {
    id: string;
    url: string;
    username: string;
}

export interface WebsiteContent {
    hero: {
        heading: string;
        subheading: string;
        ctaText: string;
        ctaLink: string;
        backgroundImage: string;
    };
    productShowcase: {
        label: string;
        heading: string;
    };
    shopByMood: {
        heading: string;
        subheading: string;
    };
    instagramEmbeds: InstagramEmbed[];
    socialLinks: SocialLink[];
    corporateGifting: {
        heading: string;
        description: string;
        ctaText: string;
    };
    footer: {
        aboutText: string;
        phone: string;
        email: string;
        address: string;
    };
    lastSaved: string;
}

// Generate unique ID
export const generateId = () => Math.random().toString(36).substring(2, 9);

// These are the ACTUAL values from the website components
export const DEFAULT_CONTENT: WebsiteContent = {
    hero: {
        heading: 'Turning Waste Into Purpose',
        subheading: 'Premium stationery & lifestyle goods crafted from recycled bottles. Simple. Sustainable. New.',
        ctaText: 'Shop Sustainable Goods',
        ctaLink: '/shop',
        backgroundImage: '/heroimage.webp',
    },
    productShowcase: {
        label: 'Selected Goods',
        heading: 'Curated Essentials.',
    },
    shopByMood: {
        heading: 'Shop by Mood',
        subheading: 'Curated collections for every aspect of your sustainable life.',
    },
    instagramEmbeds: [
        { id: 'ig1', url: 'https://www.instagram.com/reel/DL2Tc7yvAdV/', username: '@authormeghabajaj' },
        { id: 'ig2', url: 'https://www.instagram.com/reel/DCriab4Sbj-/', username: '@trusser.in' },
        { id: 'ig3', url: 'https://www.instagram.com/reel/CwfDXUXJq8K/', username: '@trusser.in' },
        { id: 'ig4', url: 'https://www.instagram.com/reel/CxKsKFsLqZK/', username: '@trusser.in' },
        { id: 'ig5', url: 'https://www.instagram.com/reel/CwAWXUIIR-P/', username: '@trusser.in' },
        { id: 'ig6', url: 'https://www.instagram.com/reel/DARHFn5PTeW/', username: '@trusser.in' },
    ],
    socialLinks: [
        { id: generateId(), platform: 'Instagram', url: 'https://instagram.com/trusser.in', label: 'Instagram' },
    ],
    corporateGifting: {
        heading: 'Corporate & Event Gifting',
        description: 'Premium sustainable gifts for your corporate events, employee appreciation, and special occasions.',
        ctaText: 'Explore Corporate Gifting',
    },
    footer: {
        aboutText: 'Subscribe to receive updates on new sustainable collections, eco-conscious living tips, and exclusive offers.',
        phone: '+91 9008138404',
        email: 'info@trusser.in',
        address: 'Made with ♥ in India',
    },
    lastSaved: '',
};

// Cache for content to avoid repeated API calls on same page
let cachedContent: WebsiteContent | null = null;

// Synchronous getter using cache (for components)
export const getWebsiteContent = (): WebsiteContent => {
    return cachedContent ?? DEFAULT_CONTENT;
};

// Async fetcher from API
export const fetchWebsiteContent = async (): Promise<WebsiteContent> => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/website-content`);
        if (response.ok) {
            const data = await response.json();
            cachedContent = { ...DEFAULT_CONTENT, ...data };
            return cachedContent!;
        }
    } catch {
        // Fall back to defaults
    }
    return DEFAULT_CONTENT;
};

// Save content to server (requires admin auth)
export const saveWebsiteContent = async (content: Partial<WebsiteContent>): Promise<WebsiteContent> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const response = await fetch(`${apiBaseUrl}/api/website-content`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': token || '',
        },
        body: JSON.stringify(content),
    });

    if (!response.ok) {
        throw new Error('Failed to save content');
    }

    const updated = await response.json();
    cachedContent = { ...DEFAULT_CONTENT, ...updated };
    return cachedContent!;
};

export const resetWebsiteContent = async (): Promise<WebsiteContent> => {
    return saveWebsiteContent(DEFAULT_CONTENT);
};

export const formatLastSaved = (isoString: string): string => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

// Initialize cache on module load
fetchWebsiteContent().catch(() => { });
