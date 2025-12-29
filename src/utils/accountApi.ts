export type AccountAddress = {
    id: string;
    label: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    instructions?: string;
    lastUsedAt?: string;
};

export type AccountOrder = {
    id: string;
    orderNumber: string;
    createdAt: string;
    total: number;
    paymentMethod: 'razorpay' | 'cod';
    paymentStatus: string;
    items: Array<{ id: string; name: string; quantity: number; price: number; image?: string }>;
    shipping: AccountAddress;
    invoice?: { requested: boolean; gstNumber?: string };
};

export type AccountProfile = {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    gstNumber?: string;
    createdAt: string;
    addresses: AccountAddress[];
    orders: AccountOrder[];
};

type AccountUpdateCallback = (account: AccountProfile | null) => void;

type AccountUpdateEvent = CustomEvent<AccountProfile | null>;

type AccountUpdateListener = (event: AccountUpdateEvent) => void;

type StorageEventListener = (event: StorageEvent) => void;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';
let cachedAccount: AccountProfile | null = null;

const emitAccountUpdate = (account: AccountProfile | null) => {
    if (typeof window === 'undefined') {
        return;
    }
    const event = new CustomEvent<AccountProfile | null>('account:updated', { detail: account });
    window.dispatchEvent(event);
};

const setCachedAccount = (account: AccountProfile | null) => {
    cachedAccount = account;
    emitAccountUpdate(account);
};

export const getCachedAccount = () => cachedAccount;

export const fetchAccount = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/account`, { credentials: 'include' });
        if (!response.ok) {
            setCachedAccount(null);
            return null;
        }
        const data = (await response.json()) as AccountProfile;
        setCachedAccount(data);
        return data;
    } catch {
        setCachedAccount(null);
        return null;
    }
};

export const loginAccount = async (payload: { email: string; password: string }) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        return { error: data?.error ?? 'Unable to sign in.' };
    }
    setCachedAccount(data.account ?? null);
    return { account: data.account as AccountProfile };
};

export const registerAccount = async (payload: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
}) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        return { error: data?.error ?? 'Unable to create account.' };
    }
    setCachedAccount(data.account ?? null);
    return { account: data.account as AccountProfile };
};

export const logoutAccount = async () => {
    try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
        setCachedAccount(null);
    }
};

export const updateAccountProfile = async (payload: Partial<AccountProfile>) => {
    const response = await fetch(`${apiBaseUrl}/api/account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        return { error: data?.error ?? 'Unable to update profile.' };
    }
    setCachedAccount(data);
    return { account: data as AccountProfile };
};

export const addAccountAddress = async (payload: Omit<AccountAddress, 'id'>) => {
    const response = await fetch(`${apiBaseUrl}/api/account/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        return { error: data?.error ?? 'Unable to save address.' };
    }
    setCachedAccount(data);
    return { account: data as AccountProfile };
};

export const subscribeToAccount = (callback: AccountUpdateCallback) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const handleUpdate: AccountUpdateListener = (event) => {
        callback(event.detail ?? null);
    };

    const handleStorage: StorageEventListener = (event) => {
        if (event.key === 'trussers_account_refresh') {
            callback(cachedAccount);
        }
    };

    window.addEventListener('account:updated', handleUpdate as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('account:updated', handleUpdate as EventListener);
        window.removeEventListener('storage', handleStorage);
    };
};
