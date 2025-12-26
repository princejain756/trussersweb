import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    BadgeCheck,
    CircleAlert,
    Edit3,
    ImageIcon,
    LogOut,
    Plus,
    RefreshCcw,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { AdminLayout } from '../components/Admin/AdminLayout';
import categoriesData from '../data/categories.json';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

type ProductSource = 'catalog' | 'category';

type Product = {
    id: string;
    source: ProductSource;
    name: string;
    price: string;
    image: string;
    tag?: string;
    description?: string;
    features?: string[];
    category?: string;
    categorySlug?: string;
    categoryIndex?: number;
};

type CategoryData = {
    name?: string;
    slug?: string;
    url?: string;
    products?: Array<{
        name?: string;
        image?: string;
        filename?: string;
        price?: string | number;
        tag?: string;
        description?: string;
        features?: string[];
    }>;
};

type ProductDraft = {
    name: string;
    price: string;
    image: string;
    tag: string;
    description: string;
    features: string[];
    category: string;
};

const defaultFeatures = [
    'Made from 100% recycled materials',
    'Handcrafted by local artisans',
    'Eco-friendly and sustainable',
    'Unique design, no two pieces are identical',
];

const baseCategoryOptions = Array.from(
    new Set(
        Object.values(categoriesData as Record<string, { name?: string }>)
            .map((category) => category?.name)
            .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
    )
).sort((a, b) => a.localeCompare(b));

type CategoryGalleryEntry = {
    slug: string;
    name: string;
    count: number;
    images: string[];
};

const getStoredToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem('adminToken');
};

const buildAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    return token ? { 'X-Admin-Key': token } : {};
};

const buildDefaultDescription = (name: string) =>
    `Handcrafted with sustainable materials, this ${name} combines traditional craftsmanship with modern design. Made from upcycled waste materials, each piece contributes to environmental conservation while offering premium quality.`;

const normalizeFeatureList = (features: string[]) =>
    features.map((feature) => feature.trim()).filter(Boolean);

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Record<string, CategoryData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editing, setEditing] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [uploadingNewImage, setUploadingNewImage] = useState(false);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [creating, setCreating] = useState(false);
    const [categoryGallery, setCategoryGallery] = useState<CategoryGalleryEntry[]>([]);
    const [uncategorizedCount, setUncategorizedCount] = useState(0);
    const [categorySuggestions, setCategorySuggestions] = useState<string[]>(baseCategoryOptions);
    const [newProduct, setNewProduct] = useState<ProductDraft>({
        name: '',
        price: '',
        image: '',
        tag: 'New',
        description: '',
        features: [...defaultFeatures],
        category: '',
    });

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${apiBaseUrl}/api/uploads`, {
            method: 'POST',
            headers: {
                ...buildAuthHeaders(),
            },
            body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
        }
        if (!response.ok) {
            const message = typeof data?.error === 'string' ? data.error : 'Image upload failed';
            throw new Error(message);
        }
        if (typeof data?.url !== 'string') {
            throw new Error('Image upload failed');
        }

        return data.url;
    };

    const handleNewImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setUploadingNewImage(true);
        setError('');
        setNotice('');

        try {
            const url = await uploadImage(file);
            setNewProduct((prev) => ({ ...prev, image: url }));
            setNotice('Image uploaded successfully.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Image upload failed';
            setError(message);
            if (message.includes('Session expired')) {
                handleLogout();
            }
        } finally {
            setUploadingNewImage(false);
            event.target.value = '';
        }
    };

    const handleEditImageUpload = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setUploading((prev) => ({ ...prev, [id]: true }));
        setError('');
        setNotice('');

        try {
            const url = await uploadImage(file);
            updateDraft(id, 'image', url);
            setNotice('Image updated successfully.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Image upload failed';
            setError(message);
            if (message.includes('Session expired')) {
                handleLogout();
            }
        } finally {
            setUploading((prev) => ({ ...prev, [id]: false }));
            event.target.value = '';
        }
    };

    const categoryProducts = useMemo<Product[]>(() => {
        const items: Product[] = [];
        Object.entries(categories).forEach(([slug, category]) => {
            const products = category.products ?? [];
            products.forEach((product, index) => {
                const name = product?.name?.trim() || `${category.name ?? slug} ${index + 1}`;
                const price =
                    typeof product?.price === 'number'
                        ? product.price.toString()
                        : typeof product?.price === 'string'
                            ? product.price
                            : '';
                items.push({
                    id: `${slug}-${index}`,
                    source: 'category',
                    name,
                    price,
                    image: product?.image ?? '',
                    tag: product?.tag,
                    description: product?.description,
                    features: product?.features,
                    category: category.name ?? slug,
                    categorySlug: slug,
                    categoryIndex: index,
                });
            });
        });
        return items;
    }, [categories]);

    const allProducts = useMemo(
        () => [...catalogProducts, ...categoryProducts],
        [catalogProducts, categoryProducts]
    );

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return allProducts;
        }
        const query = searchQuery.trim().toLowerCase();
        return allProducts.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.price.toLowerCase().includes(query) ||
                product.image.toLowerCase().includes(query) ||
                (product.tag ?? '').toLowerCase().includes(query) ||
                (product.description ?? '').toLowerCase().includes(query) ||
                (product.features ?? []).some((feature) => feature.toLowerCase().includes(query)) ||
                (product.category ?? '').toLowerCase().includes(query)
            );
        });
    }, [allProducts, searchQuery]);

    const fetchProducts = useCallback(async () => {
        setError('');
        setNotice('');
        setIsLoading(true);

        try {
            const [catalogResult, categoriesResult] = await Promise.allSettled([
                fetch(`${apiBaseUrl}/api/products`),
                fetch(`${apiBaseUrl}/api/categories`),
            ]);

            let catalogError = '';
            let categoryNotice = '';

            if (catalogResult.status === 'fulfilled' && catalogResult.value.ok) {
                const data = (await catalogResult.value.json()) as Array<{
                    id: number | string;
                    name: string;
                    image: string;
                    price: string | number;
                    tag?: string;
                    description?: string;
                    features?: string[];
                    category?: string;
                }>;
                const normalized = (Array.isArray(data) ? data : []).map((product) => ({
                    id: String(product.id),
                    source: 'catalog' as const,
                    name: product.name ?? 'Product',
                    price: typeof product.price === 'number' ? product.price.toString() : product.price ?? '',
                    image: product.image ?? '',
                    tag: product.tag,
                    description: product.description,
                    features: product.features,
                    category: product.category,
                    categorySlug: product.category ? slugify(product.category) : 'catalog',
                }));
                setCatalogProducts(normalized);
            } else {
                catalogError = 'Unable to load catalog products';
                setCatalogProducts([]);
            }

            if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
                const data = (await categoriesResult.value.json()) as Record<string, CategoryData>;
                setCategories(data ?? {});
            } else {
                categoryNotice = 'Loaded category data from local files.';
                setCategories(categoriesData as Record<string, CategoryData>);
            }

            if (catalogError) {
                setError(catalogError);
            }
            if (categoryNotice) {
                setNotice(categoryNotice);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to load products';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadCategoryGallery = async () => {
            try {
                const response = await fetch('/products/categories/image-mapping.json');
                if (!response.ok) {
                    throw new Error('Failed to load category images');
                }
                const data = (await response.json()) as {
                    categorized?: Record<string, { name?: string; slug?: string; products?: Array<{ image?: string }> }>;
                    uncategorized?: string[];
                };
                if (!isActive) {
                    return;
                }
                const categorized = data.categorized ?? {};
                const entries = Object.entries(categorized).map(([slug, category]) => ({
                    slug,
                    name: category.name ?? slug,
                    count: category.products?.length ?? 0,
                    images: (category.products ?? [])
                        .map((product) => product.image)
                        .filter((image): image is string => typeof image === 'string' && image.length > 0)
                        .slice(0, 6),
                }));
                entries.sort((a, b) => a.name.localeCompare(b.name));
                setCategoryGallery(entries);
                setUncategorizedCount(Array.isArray(data.uncategorized) ? data.uncategorized.length : 0);

            } catch (error) {
                if (!isActive) {
                    return;
                }
                const fallbackEntries = Object.entries(categoriesData as Record<string, { name?: string; products?: Array<{ image?: string }> }>)
                    .map(([slug, category]) => ({
                        slug,
                        name: category.name ?? slug,
                        count: category.products?.length ?? 0,
                        images: (category.products ?? [])
                            .map((product) => product.image)
                            .filter((image): image is string => typeof image === 'string' && image.length > 0)
                            .slice(0, 6),
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                setCategoryGallery(fallbackEntries);
            }
        };

        loadCategoryGallery();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const categoryNames = Object.values(categories)
            .map((category) => category?.name)
            .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
        const mergedSuggestions = Array.from(
            new Set([...baseCategoryOptions, ...categoryGallery.map((entry) => entry.name), ...categoryNames])
        ).sort((a, b) => a.localeCompare(b));
        setCategorySuggestions(mergedSuggestions);
    }, [categories, categoryGallery]);

    useEffect(() => {
        const token = getStoredToken();
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchProducts();
    }, [fetchProducts, navigate]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchProducts();
        setIsRefreshing(false);
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('adminToken');
            window.localStorage.removeItem('adminUser');
        }
        navigate('/admin');
    };

    const beginEdit = (product: Product) => {
        const fallbackDescription = buildDefaultDescription(product.name);
        const fallbackFeatures = product.features?.length ? product.features : defaultFeatures;
        setEditing((prev) => ({ ...prev, [product.id]: true }));
        setDrafts((prev) => ({
            ...prev,
            [product.id]: {
                name: product.name,
                price: product.price,
                image: product.image,
                tag: product.tag ?? '',
                description: product.description?.trim() || fallbackDescription,
                features: [...fallbackFeatures],
                category: product.category ?? '',
            },
        }));
    };

    const cancelEdit = (id: string) => {
        setEditing((prev) => ({ ...prev, [id]: false }));
        setDrafts((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const updateDraft = <K extends keyof ProductDraft>(id: string, field: K, value: ProductDraft[K]) => {
        setDrafts((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const updateDraftFeature = (id: string, index: number, value: string) => {
        setDrafts((prev) => {
            const current = prev[id];
            if (!current) {
                return prev;
            }
            const features = [...current.features];
            features[index] = value;
            return {
                ...prev,
                [id]: {
                    ...current,
                    features,
                },
            };
        });
    };

    const addDraftFeature = (id: string) => {
        setDrafts((prev) => {
            const current = prev[id];
            if (!current) {
                return prev;
            }
            return {
                ...prev,
                [id]: {
                    ...current,
                    features: [...current.features, ''],
                },
            };
        });
    };

    const removeDraftFeature = (id: string, index: number) => {
        setDrafts((prev) => {
            const current = prev[id];
            if (!current) {
                return prev;
            }
            const features = current.features.filter((_, idx) => idx !== index);
            return {
                ...prev,
                [id]: {
                    ...current,
                    features: features.length > 0 ? features : [''],
                },
            };
        });
    };

    const updateNewFeature = (index: number, value: string) => {
        setNewProduct((prev) => {
            const features = [...prev.features];
            features[index] = value;
            return {
                ...prev,
                features,
            };
        });
    };

    const addNewFeature = () => {
        setNewProduct((prev) => ({
            ...prev,
            features: [...prev.features, ''],
        }));
    };

    const removeNewFeature = (index: number) => {
        setNewProduct((prev) => {
            const features = prev.features.filter((_, idx) => idx !== index);
            return {
                ...prev,
                features: features.length > 0 ? features : [''],
            };
        });
    };

    const persistProduct = async (product: Product) => {
        const id = product.id;
        const draft = drafts[id];
        if (!draft) {
            return;
        }

        setSaving((prev) => ({ ...prev, [id]: true }));
        setError('');
        setNotice('');

        try {
            const payload: Record<string, string | string[]> = {
                name: draft.name.trim(),
                price: draft.price.trim(),
                image: draft.image.trim(),
                tag: draft.tag.trim(),
                description: draft.description.trim(),
                features: normalizeFeatureList(draft.features),
                category: draft.category.trim(),
            };
            if (product.source === 'category') {
                delete payload.category;
            }

            const isCategoryProduct = product.source === 'category';
            if (isCategoryProduct && (!product.categorySlug || product.categoryIndex === undefined)) {
                throw new Error('Missing category reference for this product.');
            }

            const endpoint = isCategoryProduct
                ? `${apiBaseUrl}/api/categories/${product.categorySlug}/products/${product.categoryIndex}`
                : `${apiBaseUrl}/api/products/${id}`;

            const response = await fetch(endpoint, {
                method: 'PATCH',
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
                const message = typeof data?.error === 'string' ? data.error : 'Unable to update product';
                throw new Error(message);
            }

            if (isCategoryProduct) {
                setCategories((prev) => {
                    const category = prev[product.categorySlug ?? ''];
                    if (!category) {
                        return prev;
                    }
                    const products = [...(category.products ?? [])];
                    const index = product.categoryIndex ?? -1;
                    if (!products[index]) {
                        return prev;
                    }
                    products[index] = data;
                    return {
                        ...prev,
                        [product.categorySlug ?? '']: {
                            ...category,
                            products,
                        },
                    };
                });
            } else {
                const updatedCatalogProduct = {
                    id: String(data?.id ?? id),
                    source: 'catalog' as const,
                    name: data?.name ?? payload.name,
                    price: typeof data?.price === 'number' ? data.price.toString() : data?.price ?? payload.price,
                    image: data?.image ?? payload.image,
                    tag: data?.tag,
                    description: data?.description,
                    features: Array.isArray(data?.features) ? data.features : payload.features,
                    category: data?.category ?? payload.category,
                    categorySlug: data?.category ? slugify(data.category) : 'catalog',
                };
                setCatalogProducts((prev) =>
                    prev.map((item) => (item.id === id ? updatedCatalogProduct : item))
                );
            }
            setNotice('Product updated successfully.');
            cancelEdit(id);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to update product';
            setError(message);
            if (message.includes('Session expired')) {
                handleLogout();
            }
        } finally {
            setSaving((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleDelete = async (product: Product) => {
        const id = product.id;
        const confirmDelete = window.confirm('Remove this product permanently?');
        if (!confirmDelete) {
            return;
        }
        setDeleting((prev) => ({ ...prev, [id]: true }));
        setError('');
        setNotice('');

        try {
            const isCategoryProduct = product.source === 'category';
            if (isCategoryProduct && (!product.categorySlug || product.categoryIndex === undefined)) {
                throw new Error('Missing category reference for this product.');
            }

            const endpoint = isCategoryProduct
                ? `${apiBaseUrl}/api/categories/${product.categorySlug}/products/${product.categoryIndex}`
                : `${apiBaseUrl}/api/products/${id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    ...buildAuthHeaders(),
                },
            });
            const data = await response.json().catch(() => ({}));
            if (response.status === 401) {
                throw new Error('Session expired. Please log in again.');
            }
            if (!response.ok) {
                const message = typeof data?.error === 'string' ? data.error : 'Unable to delete product';
                throw new Error(message);
            }

            if (isCategoryProduct) {
                setCategories((prev) => {
                    const category = prev[product.categorySlug ?? ''];
                    if (!category) {
                        return prev;
                    }
                    const index = product.categoryIndex ?? -1;
                    const products = (category.products ?? []).filter((_, idx) => idx !== index);
                    return {
                        ...prev,
                        [product.categorySlug ?? '']: {
                            ...category,
                            products,
                        },
                    };
                });
            } else {
                setCatalogProducts((prev) => prev.filter((item) => item.id !== id));
            }
            setNotice('Product removed.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to delete product';
            setError(message);
            if (message.includes('Session expired')) {
                handleLogout();
            }
        } finally {
            setDeleting((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setCreating(true);

        try {
            const payload = {
                name: newProduct.name.trim(),
                price: newProduct.price.trim(),
                image: newProduct.image.trim(),
                tag: newProduct.tag.trim(),
                description: newProduct.description.trim(),
                features: normalizeFeatureList(newProduct.features),
                category: newProduct.category.trim(),
            };

            const response = await fetch(`${apiBaseUrl}/api/products`, {
                method: 'POST',
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
                const message = typeof data?.error === 'string' ? data.error : 'Unable to add product';
                throw new Error(message);
            }

            const createdProduct: Product = {
                id: String(data?.id ?? Date.now()),
                source: 'catalog',
                name: data?.name ?? payload.name,
                price: typeof data?.price === 'number' ? data.price.toString() : data?.price ?? payload.price,
                image: data?.image ?? payload.image,
                tag: data?.tag,
                description: data?.description,
                features: Array.isArray(data?.features) ? data.features : payload.features,
                category: data?.category ?? payload.category,
                categorySlug: data?.category ? slugify(data.category) : 'catalog',
            };
            setCatalogProducts((prev) => [createdProduct, ...prev]);
            setNotice('New product added.');
            setNewProduct({
                name: '',
                price: '',
                image: '',
                tag: 'New',
                description: '',
                features: [...defaultFeatures],
                category: '',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to add product';
            setError(message);
            if (message.includes('Session expired')) {
                handleLogout();
            }
        } finally {
            setCreating(false);
        }
    };

    const createFeaturesReady = normalizeFeatureList(newProduct.features).length > 0;
    const createReady =
        !!newProduct.name.trim() &&
        !!newProduct.price.trim() &&
        !!newProduct.image.trim() &&
        !!newProduct.description.trim() &&
        createFeaturesReady;

    return (
        <AdminLayout title="Products">
            <div className="relative min-h-screen overflow-hidden bg-[#F4EFEC] -m-4 lg:-m-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%)]" />
                <motion.div
                    className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-[#C1A17C]/30 blur-3xl"
                    animate={{ y: [0, 18, 0], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="pointer-events-none absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[#2D5F3F]/18 blur-3xl"
                    animate={{ y: [0, -24, 0], opacity: [0.4, 0.65, 0.4] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative mx-auto w-full max-w-[1400px] px-6 py-14 lg:px-10">
                    <datalist id="admin-category-list">
                        {categorySuggestions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
                    <header className="flex flex-col gap-6 border-b border-white/60 pb-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2D5F3F] shadow-sm">
                                <BadgeCheck size={14} />
                                Admin Studio
                            </span>
                            <h1 className="text-4xl font-serif text-[#1A3C27] sm:text-5xl">Product Command Center</h1>
                            <p className="max-w-2xl text-sm text-[#5C5C5C]">
                                Create, refine, and remove products in real time. Every change syncs with the live catalog
                                data.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#1A3C27] text-[#1A3C27] hover:bg-[#1A3C27] hover:text-white"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="bg-white text-[#1A3C27] hover:bg-[#E8DFD4]"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </header>

                    <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                        <section className="space-y-6">
                            <div className="rounded-[30px] border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur">
                                <div className="flex items-center gap-3 text-[#1A3C27]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5F3F] text-white shadow-lg">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif">Add New Product</h2>
                                        <p className="text-sm text-[#5C5C5C]">
                                            Fill in the essentials to publish a new listing instantly.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreate} className="mt-6 space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(event) =>
                                                setNewProduct((prev) => ({ ...prev, name: event.target.value }))
                                            }
                                            className="mt-2 w-full rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                            placeholder="Sage Leaf Utility Tote"
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                                Price
                                            </label>
                                            <input
                                                type="text"
                                                value={newProduct.price}
                                                onChange={(event) =>
                                                    setNewProduct((prev) => ({ ...prev, price: event.target.value }))
                                                }
                                                className="mt-2 w-full rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                                placeholder="Rs 499.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                                Tag (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={newProduct.tag}
                                                onChange={(event) =>
                                                    setNewProduct((prev) => ({ ...prev, tag: event.target.value }))
                                                }
                                                className="mt-2 w-full rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                                placeholder="New"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                            Category (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            list="admin-category-list"
                                            value={newProduct.category}
                                            onChange={(event) =>
                                                setNewProduct((prev) => ({ ...prev, category: event.target.value }))
                                            }
                                            className="mt-2 w-full rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                            placeholder="Select or type a category"
                                        />
                                    </div>

                                    <div className="rounded-2xl border border-[#E2D6C8] bg-white/90 p-4 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                                Product Image
                                            </label>
                                            <label
                                                htmlFor="new-product-image"
                                                className="cursor-pointer rounded-full border border-[#2D5F3F] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2D5F3F] transition hover:bg-[#2D5F3F] hover:text-white"
                                            >
                                                {uploadingNewImage ? 'Uploading...' : 'Upload Image'}
                                            </label>
                                            <input
                                                id="new-product-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleNewImageUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                                            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#C1A17C]/50 bg-[#F4EFEC]">
                                                {newProduct.image ? (
                                                    <img
                                                        src={newProduct.image}
                                                        alt="New product preview"
                                                        className="h-full w-full object-cover"
                                                        onError={(event) => {
                                                            event.currentTarget.src = '/heroimage.webp';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-[#9B8F82]">Preview</span>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xs text-[#5C5C5C]">
                                                    Upload JPG, PNG, WebP, or AVIF up to 8MB.
                                                </p>
                                                <div className="flex items-center gap-3 rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus-within:border-[#2D5F3F] focus-within:ring-2 focus-within:ring-[#2D5F3F]/20">
                                                    <ImageIcon size={18} className="text-[#2D5F3F]/70" />
                                                    <input
                                                        type="text"
                                                        value={newProduct.image}
                                                        onChange={(event) =>
                                                            setNewProduct((prev) => ({ ...prev, image: event.target.value }))
                                                        }
                                                        className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9B8F82] focus:outline-none"
                                                        placeholder="Image URL will appear here"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                            Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={newProduct.description}
                                            onChange={(event) =>
                                                setNewProduct((prev) => ({ ...prev, description: event.target.value }))
                                            }
                                            className="mt-2 w-full resize-none rounded-2xl border border-[#E2D6C8] bg-white px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                            placeholder="Describe the product story, materials, and why it stands out."
                                        />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D5F3F]">
                                                Key Features
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addNewFeature}
                                                className="rounded-full border border-[#2D5F3F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F] transition hover:bg-[#2D5F3F] hover:text-white"
                                            >
                                                Add Feature
                                            </button>
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            {newProduct.features.map((feature, index) => (
                                                <div key={`new-feature-${index}`} className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(event) => updateNewFeature(index, event.target.value)}
                                                        className="w-full rounded-2xl border border-[#E2D6C8] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                                        placeholder="Feature detail"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFeature(index)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2D6C8] text-[#5C5C5C] transition hover:border-[#D45D48] hover:text-[#D45D48]"
                                                        aria-label="Remove feature"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full justify-center rounded-full bg-[#2D5F3F] py-4 text-base font-semibold text-white shadow-lg"
                                        disabled={creating || !createReady}
                                        isLoading={creating}
                                    >
                                        Publish Product
                                    </Button>
                                </form>
                            </div>

                            <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-lg">
                                <h3 className="font-serif text-xl text-[#1A3C27]">Admin Checklist</h3>
                                <ul className="mt-4 space-y-3 text-sm text-[#5C5C5C]">
                                    <li className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#D45D48]" />
                                        Verify pricing and product name accuracy.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#2D5F3F]" />
                                        Upload a crisp product image or paste a direct URL.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#C1A17C]" />
                                        Keep descriptions and key features aligned with the brand story.
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-xl">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-serif text-xl text-[#1A3C27]">Category Library</h3>
                                        <p className="text-xs text-[#5C5C5C]">
                                            {categoryGallery.length} categories loaded
                                        </p>
                                    </div>
                                    {uncategorizedCount > 0 ? (
                                        <span className="rounded-full border border-[#D45D48]/40 bg-[#D45D48]/10 px-3 py-1 text-xs font-semibold text-[#8B2E22]">
                                            {uncategorizedCount} uncategorized assets
                                        </span>
                                    ) : null}
                                </div>

                                <div className="mt-5 max-h-[520px] space-y-4 overflow-y-auto pr-2">
                                    {categoryGallery.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-[#C1A17C]/40 bg-[#F4EFEC] px-4 py-6 text-center text-xs text-[#9B8F82]">
                                            No category images found yet.
                                        </div>
                                    ) : (
                                        categoryGallery.map((category) => (
                                            <div key={category.slug} className="rounded-2xl border border-[#E2D6C8] bg-white/90 p-4 shadow-sm">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-[#1A3C27]">{category.name}</h4>
                                                        <p className="text-xs text-[#9B8F82]">/{category.slug}</p>
                                                    </div>
                                                    <span className="text-xs font-semibold text-[#2D5F3F]">
                                                        {category.count} images
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                                    {category.images.length > 0 ? (
                                                        category.images.map((image, index) => (
                                                            <div
                                                                key={`${category.slug}-${index}`}
                                                                className="aspect-square overflow-hidden rounded-xl border border-[#E2D6C8] bg-[#F4EFEC]"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`${category.name} ${index + 1}`}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(event) => {
                                                                        event.currentTarget.src = '/heroimage.webp';
                                                                    }}
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full rounded-xl border border-dashed border-[#C1A17C]/40 bg-[#F4EFEC] px-4 py-6 text-center text-xs text-[#9B8F82]">
                                                            No images linked for this category yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-2xl text-[#1A3C27]">All Products</h2>
                                        <p className="text-sm text-[#5C5C5C]">
                                            Showing {filteredProducts.length} of {allProducts.length} products
                                        </p>
                                    </div>
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]" size={16} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(event) => setSearchQuery(event.target.value)}
                                            placeholder="Search by name, price, tag, feature, category"
                                            className="w-full rounded-full border border-[#E2D6C8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                        />
                                    </div>
                                </div>

                                {error ? (
                                    <div className="flex items-center gap-2 rounded-2xl border border-[#D45D48]/30 bg-[#D45D48]/10 px-4 py-3 text-sm text-[#8B2E22]">
                                        <CircleAlert size={16} />
                                        {error}
                                    </div>
                                ) : null}

                                {notice ? (
                                    <div className="flex items-center gap-2 rounded-2xl border border-[#2D5F3F]/20 bg-[#2D5F3F]/10 px-4 py-3 text-sm text-[#1A3C27]">
                                        <BadgeCheck size={16} />
                                        {notice}
                                    </div>
                                ) : null}

                                {isLoading ? (
                                    <div className="py-16 text-center text-sm text-[#5C5C5C]">Loading products...</div>
                                ) : null}

                                {!isLoading && filteredProducts.length === 0 ? (
                                    <div className="py-16 text-center text-sm text-[#5C5C5C]">No products found.</div>
                                ) : null}
                            </div>

                            <div className="mt-6 space-y-5">
                                {filteredProducts.map((product) => {
                                    const isEditing = editing[product.id];
                                    const draft = drafts[product.id];
                                    const isCategoryProduct = product.source === 'category';
                                    const display = draft ?? {
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                        tag: product.tag ?? '',
                                        description: product.description ?? '',
                                        features: product.features ?? [],
                                        category: product.category ?? '',
                                    };
                                    const displayPrice = display.price.trim() ? display.price : 'Price on request';

                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                            className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl"
                                        >
                                            <div className="flex flex-col gap-5">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#C1A17C]">
                                                            <span>ID {product.id}</span>
                                                            <span className="rounded-full border border-[#1A3C27]/20 bg-white px-3 py-1 text-[10px] font-semibold text-[#1A3C27]">
                                                                {isCategoryProduct ? 'Category' : 'Catalog'}
                                                            </span>
                                                            {display.tag ? (
                                                                <span className="rounded-full bg-[#1A3C27]/90 px-3 py-1 text-[10px] font-semibold text-white">
                                                                    {display.tag}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <h3 className="mt-3 font-serif text-xl text-[#1A3C27]">{product.name}</h3>
                                                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#5C5C5C]">
                                                            <span>{displayPrice}</span>
                                                            {display.category ? (
                                                                <span>Category: {display.category}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-full border border-[#2D5F3F] px-4 py-2 text-xs font-semibold text-[#2D5F3F] transition hover:bg-[#2D5F3F] hover:text-white"
                                                        >
                                                            View PDP
                                                        </Link>
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    className="rounded-full bg-[#2D5F3F] px-4 py-2 text-xs text-white"
                                                                    onClick={() => persistProduct(product)}
                                                                    disabled={saving[product.id]}
                                                                    isLoading={saving[product.id]}
                                                                >
                                                                    <Save className="mr-2 h-3 w-3" />
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-full border-[#1A3C27] px-4 py-2 text-xs text-[#1A3C27]"
                                                                    onClick={() => cancelEdit(product.id)}
                                                                >
                                                                    <X className="mr-2 h-3 w-3" />
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-full border-[#1A3C27] px-4 py-2 text-xs text-[#1A3C27]"
                                                                onClick={() => beginEdit(product)}
                                                            >
                                                                <Edit3 className="mr-2 h-3 w-3" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-full border-[#D45D48] px-4 py-2 text-xs text-[#D45D48] hover:bg-[#D45D48] hover:text-white"
                                                            onClick={() => handleDelete(product)}
                                                            disabled={deleting[product.id]}
                                                        >
                                                            <Trash2 className="mr-2 h-3 w-3" />
                                                            {deleting[product.id] ? 'Deleting...' : 'Delete'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
                                                        <div className="space-y-4">
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                {(
                                                                    [
                                                                        { label: 'Name', field: 'name' },
                                                                        { label: 'Price', field: 'price' },
                                                                        { label: 'Tag', field: 'tag' },
                                                                        { label: 'Category', field: 'category' },
                                                                    ] as const
                                                                ).map(({ label, field }) => (
                                                                    <div key={field}>
                                                                        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F]">
                                                                            {label}
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            list={field === 'category' ? 'admin-category-list' : undefined}
                                                                            value={display[field]}
                                                                            onChange={(event) =>
                                                                                updateDraft(product.id, field, event.target.value)
                                                                            }
                                                                            disabled={field === 'category' && isCategoryProduct}
                                                                            readOnly={field === 'category' && isCategoryProduct}
                                                                            className={`mt-2 w-full rounded-2xl border border-[#E2D6C8] px-3 py-2 text-sm focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20 ${field === 'category' && isCategoryProduct
                                                                                ? 'bg-[#F4EFEC] text-[#9B8F82]'
                                                                                : 'bg-white text-[#1A1A1A]'
                                                                                }`}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div>
                                                                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F]">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    rows={4}
                                                                    value={display.description}
                                                                    onChange={(event) =>
                                                                        updateDraft(product.id, 'description', event.target.value)
                                                                    }
                                                                    className="mt-2 w-full resize-none rounded-2xl border border-[#E2D6C8] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                                                    placeholder="Add a product description."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-5">
                                                            <div className="rounded-2xl border border-[#E2D6C8] bg-white/90 p-4 shadow-sm">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F]">
                                                                        Product Image
                                                                    </span>
                                                                    <label
                                                                        htmlFor={`edit-product-image-${product.id}`}
                                                                        className="cursor-pointer rounded-full border border-[#2D5F3F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F] transition hover:bg-[#2D5F3F] hover:text-white"
                                                                    >
                                                                        {uploading[product.id] ? 'Uploading...' : 'Upload Image'}
                                                                    </label>
                                                                    <input
                                                                        id={`edit-product-image-${product.id}`}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(event) => handleEditImageUpload(product.id, event)}
                                                                        className="hidden"
                                                                    />
                                                                </div>
                                                                <div className="mt-4 grid gap-4 sm:grid-cols-[100px_1fr]">
                                                                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#C1A17C]/50 bg-[#F4EFEC]">
                                                                        {display.image ? (
                                                                            <img
                                                                                src={display.image}
                                                                                alt={display.name}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(event) => {
                                                                                    event.currentTarget.src = '/heroimage.webp';
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-xs text-[#9B8F82]">Preview</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-3 rounded-2xl border border-[#E2D6C8] bg-white px-4 py-2 text-sm text-[#1A1A1A] focus-within:border-[#2D5F3F] focus-within:ring-2 focus-within:ring-[#2D5F3F]/20">
                                                                            <ImageIcon size={16} className="text-[#2D5F3F]/70" />
                                                                            <input
                                                                                type="text"
                                                                                value={display.image}
                                                                                onChange={(event) => updateDraft(product.id, 'image', event.target.value)}
                                                                                className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9B8F82] focus:outline-none"
                                                                                placeholder="Image URL"
                                                                            />
                                                                        </div>
                                                                        <p className="text-xs text-[#5C5C5C]">
                                                                            Upload JPG, PNG, WebP, or AVIF up to 8MB.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F]">
                                                                        Key Features
                                                                    </label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addDraftFeature(product.id)}
                                                                        className="rounded-full border border-[#2D5F3F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D5F3F] transition hover:bg-[#2D5F3F] hover:text-white"
                                                                    >
                                                                        Add Feature
                                                                    </button>
                                                                </div>
                                                                <div className="mt-3 space-y-3">
                                                                    {display.features.map((feature, index) => (
                                                                        <div key={`feature-${product.id}-${index}`} className="flex items-center gap-3">
                                                                            <input
                                                                                type="text"
                                                                                value={feature}
                                                                                onChange={(event) =>
                                                                                    updateDraftFeature(product.id, index, event.target.value)
                                                                                }
                                                                                className="w-full rounded-2xl border border-[#E2D6C8] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#2D5F3F] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F]/20"
                                                                                placeholder="Feature detail"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeDraftFeature(product.id, index)}
                                                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2D6C8] text-[#5C5C5C] transition hover:border-[#D45D48] hover:text-[#D45D48]"
                                                                                aria-label="Remove feature"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

