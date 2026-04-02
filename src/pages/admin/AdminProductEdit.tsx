import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronDown,
    ExternalLink,
    GripVertical,
    ImageIcon,
    Plus,
    Save,
    Trash2,
    X,
    Eye,
    Copy,
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { AdminLayout } from '../../components/Admin/AdminLayout';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type SizeEntry = {
    size: string;
    price: string;
};

type ProductMetafields = {
    sku?: string;
    material?: string;
    dimensions?: string;
    capacity?: string;
    closureType?: string;
    handleType?: string;
    waterResistant?: string;
    ecoCertification?: string;
    weight?: string;
    careInstructions?: string;
    color?: string;
    packContain?: string;
};

type ProductSeo = {
    title: string;
    description: string;
    urlHandle: string;
};

type Product = {
    id: number | string;
    name: string;
    price: string;
    image: string;
    images: string[];
    tag?: string;
    description?: string;
    features?: string[];
    sizes?: SizeEntry[];
    category?: string;
    status: 'active' | 'draft';
    vendor?: string;
    collections?: string[];
    tags?: string[];
    metafields?: ProductMetafields;
    seo?: ProductSeo;
};

const defaultProduct: Omit<Product, 'id'> = {
    name: '',
    price: '',
    image: '',
    images: [],
    tag: 'New',
    description: '',
    features: [],
    sizes: [],
    category: '',
    status: 'active',
    vendor: 'Trusser',
    collections: [],
    tags: [],
    metafields: {},
    seo: { title: '', description: '', urlHandle: '' },
};

const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('adminToken');
};

const buildAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    return token ? { 'X-Admin-Key': token } : {};
};

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const parsePriceValue = (value: string) => Number(value.replace(/[₹$,\s]/g, ''));
const hasPositivePrice = (value: string) => {
    const parsed = parsePriceValue(value);
    return Number.isFinite(parsed) && parsed > 0;
};
const validatePricing = (price: string, sizes: SizeEntry[]) => {
    const normalizedSizes = sizes.filter((size) => typeof size?.size === 'string' && size.size.trim());
    if (normalizedSizes.length > 0) {
        const hasInvalidVariant = normalizedSizes.some((size) => !hasPositivePrice(size.price));
        if (hasInvalidVariant) {
            return 'Each variant must have a valid price greater than 0.';
        }
        return null;
    }
    if (!hasPositivePrice(price)) {
        return 'Set a valid main price greater than 0 when no variants are configured.';
    }
    return null;
};

const normalizeStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const normalizeSizes = (value: unknown): SizeEntry[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => {
            if (!entry || typeof entry !== 'object') return null;
            const candidate = entry as Partial<SizeEntry>;
            return {
                size: typeof candidate.size === 'string' ? candidate.size : '',
                price: typeof candidate.price === 'string' ? candidate.price : '',
            };
        })
        .filter((entry): entry is SizeEntry => entry !== null);
};

const categoryProductIdPattern = /^(.*)-(\d+)$/;

export const AdminProductEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';
    const categoryProductRef = useMemo(() => {
        if (!id || isNew) return null;
        const match = id.match(categoryProductIdPattern);
        if (!match) return null;
        return { slug: match[1], index: Number(match[2]) };
    }, [id, isNew]);

    const [product, setProduct] = useState<Product>({ id: 0, ...defaultProduct });
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        categoryMetafields: true,
        productMetafields: true,
        seo: true,
    });
    const [newTag, setNewTag] = useState('');
    const [bulkUpdatingField, setBulkUpdatingField] = useState<string | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
        setToast({ type, message });
        window.setTimeout(() => {
            setToast((current) => (current?.message === message ? null : current));
        }, 3000);
    }, []);

    // Fetch product data
    useEffect(() => {
        if (isNew) return;

        const fetchProduct = async () => {
            try {
                let data: any;
                if (categoryProductRef) {
                    const categoriesResponse = await fetch(`${apiBaseUrl}/api/categories`, {
                        headers: buildAuthHeaders(),
                    });
                    if (!categoriesResponse.ok) {
                        throw new Error('Product not found');
                    }
                    const categories = await categoriesResponse.json();
                    const category = categories?.[categoryProductRef.slug];
                    const categoryProduct = category?.products?.[categoryProductRef.index];
                    if (!categoryProduct) {
                        throw new Error('Product not found');
                    }
                    data = {
                        id,
                        ...categoryProduct,
                        status: 'active',
                        vendor: 'Trusser',
                        category: category?.name ?? '',
                    };
                } else {
                    const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
                        headers: buildAuthHeaders(),
                    });
                    if (!response.ok) {
                        throw new Error('Product not found');
                    }
                    data = await response.json();
                }

                // Helper functions for SEO auto-population
                const generateSlug = (title: string): string =>
                    title.toLowerCase().trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');

                const truncateDesc = (text: string, maxLength = 160): string =>
                    (!text || text.length <= maxLength) ? text : text.slice(0, maxLength - 3).trim() + '...';

                // Auto-populate SEO if not set
                const existingSeo = data.seo ?? {};
                const autoSeo = {
                    title: existingSeo.title || data.name || '',
                    description: existingSeo.description || truncateDesc(data.description || ''),
                    urlHandle: existingSeo.urlHandle || generateSlug(data.name || ''),
                };

                setProduct({
                    ...defaultProduct,
                    ...data,
                    name: typeof data.name === 'string' ? data.name : '',
                    price: typeof data.price === 'string' ? data.price : '',
                    image: typeof data.image === 'string' ? data.image : '',
                    images: normalizeStringArray(data.images),
                    status: data.status ?? 'active',
                    features: normalizeStringArray(data.features),
                    sizes: normalizeSizes(data.sizes),
                    collections: normalizeStringArray(data.collections),
                    tags: normalizeStringArray(data.tags),
                    metafields: data.metafields ?? {},
                    seo: autoSeo,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id, isNew, categoryProductRef]);

    const handleLogout = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('adminToken');
            window.localStorage.removeItem('adminUser');
        }
        navigate('/admin');
    }, [navigate]);

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${apiBaseUrl}/api/uploads`, {
            method: 'POST',
            headers: buildAuthHeaders(),
            body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }
        if (!response.ok || typeof data?.url !== 'string') {
            throw new Error(data?.error ?? 'Image upload failed');
        }
        return data.url;
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isPrimary = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');
        try {
            const url = await uploadImage(file);
            if (isPrimary) {
                setProduct((prev) => ({ ...prev, image: url }));
            } else {
                setProduct((prev) => ({ ...prev, images: [...prev.images, url] }));
            }
            setNotice('Image uploaded successfully');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setError(msg);
            if (msg.includes('Session expired')) handleLogout();
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Helper to generate URL-friendly slug from title
    const generateUrlHandle = (title: string): string => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Remove consecutive hyphens
    };

    // Helper to truncate description for SEO (max 160 chars)
    const truncateForSeo = (text: string, maxLength = 160): string => {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3).trim() + '...';
    };

    const updateField = <K extends keyof Product>(field: K, value: Product[K]) => {
        setProduct((prev) => {
            const updated = { ...prev, [field]: value };

            // Auto-populate SEO fields when name changes
            if (field === 'name' && typeof value === 'string') {
                updated.seo = {
                    ...prev.seo!,
                    title: value,
                    urlHandle: generateUrlHandle(value),
                };
            }

            // Auto-populate SEO description when product description changes
            if (field === 'description' && typeof value === 'string') {
                updated.seo = {
                    ...updated.seo!,
                    description: truncateForSeo(value),
                };
            }

            return updated;
        });
    };

    const updateMetafield = (key: keyof ProductMetafields, value: string) => {
        setProduct((prev) => ({
            ...prev,
            metafields: { ...prev.metafields, [key]: value },
        }));
    };

    const updateSeo = (key: keyof ProductSeo, value: string) => {
        setProduct((prev) => ({
            ...prev,
            seo: { ...prev.seo!, [key]: value },
        }));
    };

    const addSize = () => {
        setProduct((prev) => ({
            ...prev,
            sizes: [...(prev.sizes ?? []), { size: '', price: prev.price }],
        }));
    };

    const updateSize = (index: number, field: keyof SizeEntry, value: string) => {
        setProduct((prev) => {
            const sizes = [...(prev.sizes ?? [])];
            sizes[index] = { ...sizes[index], [field]: value };
            return { ...prev, sizes };
        });
    };

    const removeSize = (index: number) => {
        setProduct((prev) => ({
            ...prev,
            sizes: (prev.sizes ?? []).filter((_, i) => i !== index),
        }));
    };

    const addTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed || (product.tags ?? []).includes(trimmed)) return;
        setProduct((prev) => ({
            ...prev,
            tags: [...(prev.tags ?? []), trimmed],
        }));
        setNewTag('');
    };

    const removeTag = (tag: string) => {
        setProduct((prev) => ({
            ...prev,
            tags: (prev.tags ?? []).filter((t) => t !== tag),
        }));
    };

    const addFeature = () => {
        setProduct((prev) => ({
            ...prev,
            features: [...(prev.features ?? []), ''],
        }));
    };

    const updateFeature = (index: number, value: string) => {
        setProduct((prev) => {
            const features = [...(prev.features ?? [])];
            features[index] = value;
            return { ...prev, features };
        });
    };

    const removeFeature = (index: number) => {
        setProduct((prev) => ({
            ...prev,
            features: (prev.features ?? []).filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        const pricingError = validatePricing(product.price, product.sizes ?? []);
        if (pricingError) {
            setError(pricingError);
            setNotice('');
            showToast(pricingError, 'error');
            return;
        }
        setIsSaving(true);
        setError('');
        setNotice('');

        try {
            const payload = {
                name: product.name.trim(),
                price: product.price.trim(),
                image: product.image.trim(),
                images: product.images,
                tag: product.tag?.trim() || 'New',
                description: product.description?.trim() || '',
                features: (product.features ?? []).filter((f) => typeof f === 'string' && f.trim()),
                sizes: (product.sizes ?? []).filter((s) => typeof s?.size === 'string' && s.size.trim()),
                category: product.category?.trim() || '',
                status: product.status,
                vendor: product.vendor?.trim() || '',
                collections: product.collections ?? [],
                tags: product.tags ?? [],
                metafields: product.metafields ?? {},
                seo: product.seo ?? { title: '', description: '', urlHandle: '' },
            };

            const method = isNew ? 'POST' : 'PATCH';
            const url = isNew
                ? `${apiBaseUrl}/api/products`
                : categoryProductRef
                    ? `${apiBaseUrl}/api/categories/${categoryProductRef.slug}/products/${categoryProductRef.index}`
                    : `${apiBaseUrl}/api/products/${id}`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...buildAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (response.status === 401) {
                throw new Error('Session expired. Please log in again.');
            }
            if (!response.ok) {
                throw new Error(data?.error ?? 'Failed to save product');
            }

            setNotice('Product saved successfully!');
            if (isNew && data.id) {
                navigate(`/admin/products/${data.id}`, { replace: true });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to save';
            setError(msg);
            if (msg.includes('Session expired')) handleLogout();
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };



    const seoPreviewUrl = useMemo(() => {
        const handle = product.seo?.urlHandle || slugify(product.name || 'product');
        return `https://trusser.in/product/${product.id || handle}`;
    }, [product.seo?.urlHandle, product.name, product.id]);

    const canSave = Boolean((product.name ?? '').trim()) && validatePricing(product.price ?? '', product.sizes ?? []) === null;

    if (isLoading) {
        return (
            <AdminLayout title="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-[#2D5F3F] border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={isNew ? 'Add product' : product.name || 'Edit Product'}>
            <div className="max-w-[1400px] mx-auto">
                {toast && (
                    <div
                        className={`fixed right-6 top-24 z-[120] rounded-xl border px-4 py-3 text-sm shadow-lg ${toast.type === 'success'
                            ? 'bg-[#E8F5EC] border-[#2D5F3F]/30 text-[#1A3C27]'
                            : 'bg-[#FFF1EF] border-[#D45D48]/30 text-[#8B2E22]'
                            }`}
                    >
                        {toast.message}
                    </div>
                )}
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/products"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {isNew ? 'Add product' : product.name || 'Untitled'}
                            </h1>
                            <span
                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${product.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {product.status === 'active' ? 'Active' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300"
                                    onClick={() => navigator.clipboard.writeText(`https://trusser.in/product/${product.id}`)}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </Button>
                                <a
                                    href={`https://trusser.in/product/${product.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </a>
                            </>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !canSave}
                            isLoading={isSaving}
                            className="bg-[#1A3C27] hover:bg-[#2D5F3F]"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isNew ? 'Create product' : 'Save'}
                        </Button>
                    </div>
                </div>

                {/* Notices */}
                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}
                {notice && (
                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                        {notice}
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm"
                                        placeholder="Short sleeve t-shirt"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={product.description ?? ''}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm resize-none"
                                        placeholder="Add a detailed description of your product..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Media Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Media</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Primary Image */}
                                <div className="relative aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group">
                                    {product.image ? (
                                        <>
                                            <img
                                                src={product.image}
                                                alt="Primary"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded">
                                                Primary
                                            </div>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500">Add image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, true)}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Additional Images */}
                                {product.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group"
                                    >
                                        <img src={img} alt={`Product ${idx + 2}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        >
                                            <X className="w-3 h-3 text-red-600" />
                                        </button>
                                        <div className="absolute top-1 left-1 p-1 bg-white/90 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                                            <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                    </div>
                                ))}

                                {/* Add More */}
                                <label className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-colors">
                                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">
                                        {uploadingImage ? 'Uploading...' : 'Add'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e)}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                </label>
                            </div>
                        </section>

                        {/* Pricing Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Pricing</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="text"
                                            value={product.price.replace('₹', '').trim()}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/^₹\s*/, '').trim();
                                                updateField('price', raw ? `₹${raw}` : '');
                                            }}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={product.category ?? ''}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm"
                                        placeholder="e.g., Festive Bags"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Variants Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900">Variants</h3>
                                <button
                                    onClick={addSize}
                                    className="inline-flex items-center text-sm text-[#1A3C27] font-medium hover:underline"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add variant
                                </button>
                            </div>

                            {(product.sizes ?? []).length > 0 ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide px-2">
                                        <div className="col-span-5">Size</div>
                                        <div className="col-span-5">Price</div>
                                        <div className="col-span-2"></div>
                                    </div>
                                    {(product.sizes ?? []).map((size, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <input
                                                type="text"
                                                value={size.size}
                                                onChange={(e) => updateSize(idx, 'size', e.target.value)}
                                                className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                placeholder="XS, S, M, L..."
                                            />
                                            <div className="col-span-5 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                                <input
                                                    type="text"
                                                    value={size.price}
                                                    onChange={(e) => updateSize(idx, 'price', e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeSize(idx)}
                                                className="col-span-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    No variants added. Click "Add variant" to create size options.
                                </p>
                            )}
                        </section>

                        {/* Features Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900">Key Features</h3>
                                <button
                                    onClick={addFeature}
                                    className="inline-flex items-center text-sm text-[#1A3C27] font-medium hover:underline"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add feature
                                </button>
                            </div>
                            {(product.features ?? []).length > 0 ? (
                                <div className="space-y-2">
                                    {(product.features ?? []).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(idx, e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                placeholder="Feature detail"
                                            />
                                            <button
                                                onClick={() => removeFeature(idx)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    No features added.
                                </p>
                            )}
                        </section>

                        {/* Product Metafields */}
                        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection('productMetafields')}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-gray-900">Product Metafields</h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.productMetafields ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {expandedSections.productMetafields && (
                                <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'sku', label: 'SKU' },
                                        { key: 'material', label: 'Material' },
                                        { key: 'dimensions', label: 'Dimensions (L x W x H)' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'closureType', label: 'Closure Type' },
                                        { key: 'handleType', label: 'Handle Type' },
                                        { key: 'waterResistant', label: 'Water Resistant' },
                                        { key: 'ecoCertification', label: 'Eco Certification' },
                                        { key: 'weight', label: 'Weight' },
                                        { key: 'careInstructions', label: 'Care Instructions' },
                                        { key: 'color', label: 'Color' },
                                        { key: 'packContain', label: 'Pack Contains' },
                                    ].map(({ key, label }) => {
                                        const fieldValue = (product.metafields as Record<string, string>)?.[key] ?? '';
                                        const isBulkUpdating = bulkUpdatingField === key;

                                        const handleBulkUpdate = async () => {
                                            if (!fieldValue.trim()) {
                                                setError(`Please enter a value for ${label} before updating all products`);
                                                return;
                                            }

                                            const confirmed = window.confirm(
                                                `Are you sure you want to update "${label}" to "${fieldValue}" for ALL products?`
                                            );
                                            if (!confirmed) return;

                                            setBulkUpdatingField(key);
                                            setError('');
                                            setNotice('');

                                            try {
                                                const response = await fetch(`${apiBaseUrl}/api/products/bulk-update-metafield`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        ...buildAuthHeaders(),
                                                    },
                                                    body: JSON.stringify({ metafieldKey: key, metafieldValue: fieldValue }),
                                                });

                                                const data = await response.json().catch(() => ({}));
                                                if (!response.ok) {
                                                    throw new Error(data?.error ?? 'Failed to update all products');
                                                }

                                                setNotice(`Successfully updated "${label}" for ${data.updated ?? 'all'} products!`);
                                            } catch (err) {
                                                setError(err instanceof Error ? err.message : 'Bulk update failed');
                                            } finally {
                                                setBulkUpdatingField(null);
                                            }
                                        };

                                        return (
                                            <div key={key}>
                                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                                    {label}
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={fieldValue}
                                                        onChange={(e) => updateMetafield(key as keyof ProductMetafields, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleBulkUpdate}
                                                        disabled={isBulkUpdating || !fieldValue.trim()}
                                                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${isBulkUpdating
                                                            ? 'bg-gray-200 text-gray-500 cursor-wait'
                                                            : fieldValue.trim()
                                                                ? 'bg-[#1A3C27] text-white hover:bg-[#2D5F3F]'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={`Apply "${fieldValue}" to all products`}
                                                    >
                                                        {isBulkUpdating ? 'Updating...' : 'Update All'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* SEO Section */}
                        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection('seo')}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-gray-900">Search engine listing</h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.seo ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {expandedSections.seo && (
                                <div className="px-6 pb-6 space-y-4">
                                    {/* Preview */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Trusser</p>
                                        <p className="text-xs text-gray-400 truncate">{seoPreviewUrl}</p>
                                        <p className="text-blue-700 text-base font-medium hover:underline cursor-pointer mt-1">
                                            {product.seo?.title || product.name || 'Product Title'}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                            {product.seo?.description ||
                                                `Shop ${product.name || 'this product'} at Trusser. Premium eco-friendly products.`}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Page title
                                        </label>
                                        <input
                                            type="text"
                                            value={product.seo?.title ?? ''}
                                            onChange={(e) => updateSeo('title', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm"
                                            placeholder={product.name || 'Product title'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={product.seo?.description ?? ''}
                                            onChange={(e) => updateSeo('description', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm resize-none"
                                            placeholder="Brief description for search engines"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL handle
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">trusser.in/product/</span>
                                            <input
                                                type="text"
                                                value={product.seo?.urlHandle ?? ''}
                                                onChange={(e) => updateSeo('urlHandle', e.target.value)}
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm"
                                                placeholder={slugify(product.name || 'product-name')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={product.status}
                                onChange={(e) => updateField('status', e.target.value as 'active' | 'draft')}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27] text-sm bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </section>

                        {/* Publishing */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Publishing</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Online Store
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Point of Sale
                                </div>
                            </div>
                        </section>

                        {/* Product Organization */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Product organization</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Vendor
                                    </label>
                                    <input
                                        type="text"
                                        value={product.vendor ?? ''}
                                        onChange={(e) => updateField('vendor', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        placeholder="e.g., Trusser"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Product Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={product.tag ?? ''}
                                        onChange={(e) => updateField('tag', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                        placeholder="e.g., New, Sale, Bestseller"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(product.tags ?? []).map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3C27]/20 focus:border-[#1A3C27]"
                                            placeholder="Add a tag"
                                        />
                                        <button
                                            onClick={addTag}
                                            className="px-3 py-2 text-sm text-[#1A3C27] border border-[#1A3C27] rounded-lg hover:bg-[#1A3C27] hover:text-white transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        {!isNew && (
                            <section className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h3>
                                <div className="space-y-2">
                                    <a
                                        href={`https://trusser.in/product/${product.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-[#1A3C27] hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View on store
                                    </a>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProductEdit;
