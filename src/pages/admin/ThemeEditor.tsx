import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Eye,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Image,
    Type,
    Link as LinkIcon,
    Instagram,
    MessageSquare,
    Phone,
    Mail,
    MapPin,
    Check,
    AlertCircle,
    Trash2,
    Plus,
    Share2,
    Upload,
    X,
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import {
    getWebsiteContent,
    saveWebsiteContent,
    resetWebsiteContent,
    fetchWebsiteContent,
    generateId,
} from '../../utils/websiteContent';
import type { WebsiteContent, InstagramEmbed, SocialLink } from '../../utils/websiteContent';

type SectionKey = 'hero' | 'productShowcase' | 'shopByMood' | 'instagramEmbeds' | 'socialLinks' | 'corporateGifting' | 'footer';

interface Section {
    key: SectionKey;
    title: string;
    icon: React.ElementType;
}

const sections: Section[] = [
    { key: 'hero', title: 'Hero Section', icon: Image },
    { key: 'productShowcase', title: 'Product Showcase', icon: Type },
    { key: 'shopByMood', title: 'Shop by Mood', icon: Type },
    { key: 'instagramEmbeds', title: 'Instagram Embeds', icon: Instagram },
    { key: 'socialLinks', title: 'Social Media Links', icon: Share2 },
    { key: 'corporateGifting', title: 'Corporate Gifting', icon: MessageSquare },
    { key: 'footer', title: 'Footer', icon: MapPin },
];

export const ThemeEditor = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState<WebsiteContent>(getWebsiteContent());
    const [expandedSection, setExpandedSection] = useState<SectionKey | null>('hero');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('adminToken') : null;
        if (!token) {
            navigate('/admin');
        }
        // Fetch fresh content from server
        fetchWebsiteContent().then(setContent);
    }, [navigate]);

    const updateContent = <K extends keyof WebsiteContent>(
        section: K,
        field: keyof WebsiteContent[K],
        value: string
    ) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            },
        }));
        setHasChanges(true);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await saveWebsiteContent(content);
            setContent(updated);
            setSaveSuccess(true);
            setHasChanges(false);
        } catch (error) {
            alert('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const token = localStorage.getItem('adminToken') || '';
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${apiBaseUrl}/api/uploads`, {
                method: 'POST',
                headers: { 'X-Admin-Key': token },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            updateContent('hero', 'backgroundImage', result.url);
        } catch (error) {
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
            try {
                const reset = await resetWebsiteContent();
                setContent(reset);
                setHasChanges(false);
                setSaveSuccess(false);
            } catch {
                alert('Failed to reset. Please try again.');
            }
        }
    };

    const renderInput = (
        label: string,
        value: string,
        onChange: (val: string) => void,
        type: 'text' | 'textarea' | 'url' = 'text',
        icon?: React.ElementType
    ) => {
        const Icon = icon;
        return (
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    {label}
                </label>
                {type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] resize-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                    />
                )}
            </div>
        );
    };

    const renderSectionContent = (section: SectionKey) => {
        switch (section) {
            case 'hero':
                return (
                    <div className="space-y-4">
                        {renderInput('Heading', content.hero.heading, (val) => updateContent('hero', 'heading', val), 'text', Type)}
                        {renderInput('Subheading', content.hero.subheading, (val) => updateContent('hero', 'subheading', val), 'textarea', Type)}
                        {renderInput('Button Text', content.hero.ctaText, (val) => updateContent('hero', 'ctaText', val), 'text', Type)}
                        {renderInput('Button Link', content.hero.ctaLink, (val) => updateContent('hero', 'ctaLink', val), 'url', LinkIcon)}

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Image className="w-4 h-4 text-gray-400" />
                                Hero Background Image
                            </label>

                            {/* Image Preview */}
                            {content.hero.backgroundImage && (
                                <div className="relative group">
                                    <img
                                        src={content.hero.backgroundImage}
                                        alt="Hero background preview"
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        onClick={() => updateContent('hero', 'backgroundImage', '')}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div className="flex gap-2">
                                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2D5F3F] hover:bg-gray-50 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                    <Upload className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                </label>
                            </div>

                            <p className="text-xs text-gray-400">
                                Recommended: 1920x1080px or larger, WebP or PNG format
                            </p>
                        </div>
                    </div>
                );
            case 'productShowcase':
                return (
                    <div className="space-y-4">
                        {renderInput('Section Label', content.productShowcase.label, (val) => updateContent('productShowcase', 'label', val))}
                        {renderInput('Section Heading', content.productShowcase.heading, (val) => updateContent('productShowcase', 'heading', val))}
                    </div>
                );
            case 'shopByMood':
                return (
                    <div className="space-y-4">
                        {renderInput('Section Heading', content.shopByMood.heading, (val) => updateContent('shopByMood', 'heading', val))}
                        {renderInput('Section Subheading', content.shopByMood.subheading, (val) => updateContent('shopByMood', 'subheading', val))}
                    </div>
                );
            case 'instagramEmbeds':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Instagram Profile Embeds</h4>
                            <button
                                onClick={() => {
                                    const newEmbed: InstagramEmbed = { id: generateId(), url: '', username: '' };
                                    setContent(prev => ({ ...prev, instagramEmbeds: [...(prev.instagramEmbeds || []), newEmbed] }));
                                    setHasChanges(true);
                                }}
                                className="flex items-center gap-1 text-sm text-[#2D5F3F] hover:text-[#1A3C27]"
                            >
                                <Plus className="w-4 h-4" /> Add Embed
                            </button>
                        </div>
                        {(content.instagramEmbeds || []).map((embed, index) => (
                            <div key={embed.id} className="p-4 bg-gray-100 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Embed #{index + 1}</span>
                                    <button
                                        onClick={() => {
                                            setContent(prev => ({
                                                ...prev,
                                                instagramEmbeds: prev.instagramEmbeds.filter(e => e.id !== embed.id)
                                            }));
                                            setHasChanges(true);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="url"
                                    placeholder="Instagram Profile URL"
                                    value={embed.url}
                                    onChange={(e) => {
                                        const updated = content.instagramEmbeds.map(em =>
                                            em.id === embed.id ? { ...em, url: e.target.value } : em
                                        );
                                        setContent(prev => ({ ...prev, instagramEmbeds: updated }));
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                />
                                <input
                                    type="text"
                                    placeholder="@username"
                                    value={embed.username}
                                    onChange={(e) => {
                                        const updated = content.instagramEmbeds.map(em =>
                                            em.id === embed.id ? { ...em, username: e.target.value } : em
                                        );
                                        setContent(prev => ({ ...prev, instagramEmbeds: updated }));
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                />
                            </div>
                        ))}
                        {(content.instagramEmbeds || []).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No Instagram embeds. Click "Add Embed" to add one.</p>
                        )}
                    </div>
                );
            case 'socialLinks':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Footer Social Links</h4>
                            <button
                                onClick={() => {
                                    const newLink: SocialLink = { id: generateId(), platform: 'Other', url: '', label: '' };
                                    setContent(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), newLink] }));
                                    setHasChanges(true);
                                }}
                                className="flex items-center gap-1 text-sm text-[#2D5F3F] hover:text-[#1A3C27]"
                            >
                                <Plus className="w-4 h-4" /> Add Link
                            </button>
                        </div>
                        {(content.socialLinks || []).map((link, index) => (
                            <div key={link.id} className="p-4 bg-gray-100 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Link #{index + 1}</span>
                                    <button
                                        onClick={() => {
                                            setContent(prev => ({
                                                ...prev,
                                                socialLinks: prev.socialLinks.filter(l => l.id !== link.id)
                                            }));
                                            setHasChanges(true);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <select
                                    value={link.platform}
                                    onChange={(e) => {
                                        const platform = e.target.value;
                                        const updated = content.socialLinks.map(l =>
                                            l.id === link.id ? { ...l, platform, label: platform === 'Twitter' ? 'Twitter/X' : platform } : l
                                        );
                                        setContent(prev => ({ ...prev, socialLinks: updated }));
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20 bg-white"
                                >
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Twitter">Twitter/X</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Pinterest">Pinterest</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Display Label (e.g., Instagram)"
                                    value={link.label}
                                    onChange={(e) => {
                                        const updated = content.socialLinks.map(l =>
                                            l.id === link.id ? { ...l, label: e.target.value } : l
                                        );
                                        setContent(prev => ({ ...prev, socialLinks: updated }));
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                />
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={link.url}
                                    onChange={(e) => {
                                        const updated = content.socialLinks.map(l =>
                                            l.id === link.id ? { ...l, url: e.target.value } : l
                                        );
                                        setContent(prev => ({ ...prev, socialLinks: updated }));
                                        setHasChanges(true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3C27]/20"
                                />
                            </div>
                        ))}
                        {(content.socialLinks || []).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No social links. Click "Add Link" to add one.</p>
                        )}
                    </div>
                );
            case 'corporateGifting':
                return (
                    <div className="space-y-4">
                        {renderInput('Section Heading', content.corporateGifting.heading, (val) => updateContent('corporateGifting', 'heading', val))}
                        {renderInput('Description', content.corporateGifting.description, (val) => updateContent('corporateGifting', 'description', val), 'textarea')}
                        {renderInput('Button Text', content.corporateGifting.ctaText, (val) => updateContent('corporateGifting', 'ctaText', val))}
                    </div>
                );
            case 'footer':
                return (
                    <div className="space-y-4">
                        {renderInput('About/Newsletter Text', content.footer.aboutText, (val) => updateContent('footer', 'aboutText', val), 'textarea', MessageSquare)}
                        <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                            {renderInput('Phone', content.footer.phone, (val) => updateContent('footer', 'phone', val), 'text', Phone)}
                            {renderInput('Email', content.footer.email, (val) => updateContent('footer', 'email', val), 'text', Mail)}
                            {renderInput('Address/Tagline', content.footer.address, (val) => updateContent('footer', 'address', val), 'text', MapPin)}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/online-store')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Exit editor</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200" />
                        <span className="font-semibold text-gray-900">Theme Editor</span>
                        {hasChanges && (
                            <span className="flex items-center gap-1 text-amber-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Unsaved changes
                            </span>
                        )}
                        {saveSuccess && (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Check className="w-4 h-4" />
                                Saved
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </a>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="bg-[#1A3C27] text-white hover:bg-[#2D5F3F] rounded-lg px-5 py-2 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </motion.div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex min-h-screen pt-16">
                {/* Edit Panel (Left) - Scrollable Sidebar */}
                <aside className="w-96 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="font-semibold text-gray-900">Edit Sections</h2>
                        <p className="text-sm text-gray-500 mt-1">Click a section to edit its content</p>
                    </div>
                    <div className="divide-y divide-gray-100 pb-20">
                        {sections.map((section) => (
                            <div key={section.key}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <section.icon className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">{section.title}</span>
                                    </div>
                                    {expandedSection === section.key ? (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {expandedSection === section.key && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 bg-gray-50">
                                                {renderSectionContent(section.key)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Preview Panel (Right) - offset for fixed sidebar */}
                <div className="flex-1 bg-gray-100 p-6 overflow-hidden ml-96">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-hidden">
                        <div className="h-8 bg-gray-100 flex items-center gap-2 px-3 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="flex-1 mx-4">
                                <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-500 flex items-center gap-2">
                                    <span>localhost:5173</span>
                                </div>
                            </div>
                        </div>
                        <iframe
                            src="/"
                            title="Website Preview"
                            className="w-full h-[calc(100%-32px)]"
                            style={{ border: 'none' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
