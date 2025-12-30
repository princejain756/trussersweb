export type CartItem = {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    category?: string;
};

const CART_STORAGE_KEY = 'trusser_cart_v1';

type CartUpdateCallback = (items: CartItem[]) => void;

type CartUpdateEvent = CustomEvent<CartItem[]>;
type CartAddedEvent = CustomEvent<CartItem>;

type CartUpdateListener = (event: CartUpdateEvent) => void;
type CartAddedListener = (event: CartAddedEvent) => void;

type StorageEventListener = (event: StorageEvent) => void;

let lastCartAdded: { item: CartItem; at: number } | null = null;

const toNumber = (value: unknown, fallback = 0) => {
    const numeric = typeof value === 'string' ? Number(value.replace(/[₹$,\s]/g, '')) : Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeCartItem = (item: Partial<CartItem>, fallbackId: string): CartItem => {
    const rawId = item.id ?? fallbackId;
    const id = typeof rawId === 'string' ? rawId.trim() : String(rawId);
    const name = typeof item.name === 'string' ? item.name.trim() : 'Item';
    const image = typeof item.image === 'string' ? item.image : '';
    const price = toNumber(item.price, 0);
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));
    const category = typeof item.category === 'string' ? item.category : undefined;

    return {
        id: id || fallbackId,
        name: name || 'Item',
        image,
        price,
        quantity,
        category,
    };
};

export const getCartItems = (): CartItem[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((item, index) => normalizeCartItem(item, `item-${index + 1}`))
            .filter((item) => item.quantity > 0);
    } catch {
        return [];
    }
};

const emitCartUpdate = (items: CartItem[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    const event = new CustomEvent<CartItem[]>('cart:updated', { detail: items });
    window.dispatchEvent(event);
};

const emitCartAdded = (item: CartItem) => {
    if (typeof window === 'undefined') {
        return;
    }
    lastCartAdded = { item, at: Date.now() };
    const event = new CustomEvent<CartItem>('cart:item-added', { detail: item });
    window.dispatchEvent(event);
};

export const getLastCartAdded = () => lastCartAdded;

export const clearLastCartAdded = () => {
    lastCartAdded = null;
};

export const setCartItems = (items: CartItem[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    const normalized = items.map((item, index) => normalizeCartItem(item, `item-${index + 1}`));
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
    emitCartUpdate(normalized);
};

export const addToCart = (item: Partial<CartItem>, quantity = 1) => {
    const items = getCartItems();
    const normalized = normalizeCartItem({ ...item, quantity }, `item-${items.length + 1}`);
    const existingIndex = items.findIndex((entry) => entry.id === normalized.id);

    if (existingIndex >= 0) {
        const existing = items[existingIndex];
        const next = [...items];
        next[existingIndex] = {
            ...existing,
            quantity: existing.quantity + normalized.quantity,
        };
        setCartItems(next);
        emitCartAdded(next[existingIndex]);
        return next;
    }

    const next = [...items, normalized];
    setCartItems(next);
    emitCartAdded(normalized);
    return next;
};

export const updateCartQuantity = (id: string, quantity: number) => {
    const items = getCartItems();
    const safeQuantity = Math.max(0, Math.floor(toNumber(quantity, 0)));
    const normalizedId = String(id);

    const next = items
        .map((item) => (item.id === normalizedId ? { ...item, quantity: safeQuantity } : item))
        .filter((item) => item.quantity > 0);

    setCartItems(next);
    return next;
};

export const removeCartItem = (id: string) => {
    const normalizedId = String(id);
    const next = getCartItems().filter((item) => item.id !== normalizedId);
    setCartItems(next);
    return next;
};

export const clearCart = () => {
    setCartItems([]);
};

export const getCartCount = (items: CartItem[] = getCartItems()) =>
    items.reduce((sum, item) => sum + item.quantity, 0);

export const subscribeToCart = (callback: CartUpdateCallback) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const handleUpdate: CartUpdateListener = (event) => {
        const detail = Array.isArray(event.detail) ? event.detail : getCartItems();
        callback(detail);
    };

    const handleStorage: StorageEventListener = (event) => {
        if (event.key === CART_STORAGE_KEY) {
            callback(getCartItems());
        }
    };

    window.addEventListener('cart:updated', handleUpdate as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('cart:updated', handleUpdate as EventListener);
        window.removeEventListener('storage', handleStorage);
    };
};

export const subscribeToCartAdds = (callback: (item: CartItem) => void) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const handleAdded: CartAddedListener = (event) => {
        if (event.detail) {
            callback(event.detail);
        }
    };

    window.addEventListener('cart:item-added', handleAdded as EventListener);

    return () => {
        window.removeEventListener('cart:item-added', handleAdded as EventListener);
    };
};
