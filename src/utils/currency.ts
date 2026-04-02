// Currency utility for global price formatting

export type Currency = 'INR' | 'USD';

// USD to INR conversion rate (approximate)
const USD_TO_INR_RATE = 83;

export const getCurrency = (): Currency => {
    if (typeof window === 'undefined') return 'INR';

    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            return settings.currency || 'INR';
        } catch {
            return 'INR';
        }
    }
    return 'INR';
};

export const getCurrencySymbol = (currency: Currency = getCurrency()): string => {
    return currency === 'USD' ? '$' : '₹';
};

export const formatPrice = (price: number | string, targetCurrency?: Currency): string => {
    const currency = targetCurrency || getCurrency();

    // Parse the price if it's a string
    let numericPrice: number;
    if (typeof price === 'string') {
        // Remove any existing currency symbols and commas
        const cleanedPrice = price.replace(/[₹$,\s]/g, '');
        numericPrice = parseFloat(cleanedPrice);
        if (isNaN(numericPrice)) {
            return price; // Return original if can't parse
        }
    } else {
        numericPrice = price;
    }

    // Prices in the database are assumed to be in INR
    // If target currency is USD, convert
    if (currency === 'USD') {
        const usdPrice = numericPrice / USD_TO_INR_RATE;
        return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        return `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
};

// Simple format without decimals (for display consistency)
export const formatPriceSimple = (price: number | string, targetCurrency?: Currency): string => {
    const currency = targetCurrency || getCurrency();

    let numericPrice: number;
    if (typeof price === 'string') {
        const cleanedPrice = price.replace(/[₹$,\s]/g, '');
        numericPrice = parseFloat(cleanedPrice);
        if (isNaN(numericPrice)) {
            return price;
        }
    } else {
        numericPrice = price;
    }

    if (currency === 'USD') {
        const usdPrice = numericPrice / USD_TO_INR_RATE;
        return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else {
        return `₹${numericPrice.toLocaleString('en-IN')}`;
    }
};

// Type for size entries
export type SizeEntry = { size: string; price: string | number };

// Get price range from sizes - returns formatted string like "₹129-190" or "₹129" if all same
export const formatPriceRange = (
    sizes: SizeEntry[] | undefined,
    fallbackPrice: string | number | undefined,
    targetCurrency?: Currency
): string => {
    // If no sizes or empty, use fallback price
    if (!sizes || sizes.length === 0) {
        if (fallbackPrice !== undefined) {
            return formatPriceSimple(fallbackPrice, targetCurrency);
        }
        return 'Price on request';
    }

    // Extract numeric prices from sizes
    const prices = sizes
        .map((s) => {
            const p = typeof s.price === 'number' ? s.price : parseFloat(String(s.price).replace(/[₹$,\s]/g, ''));
            return isNaN(p) ? null : p;
        })
        .filter((p): p is number => p !== null);

    if (prices.length === 0) {
        // All sizes have invalid prices, use fallback
        if (fallbackPrice !== undefined) {
            return formatPriceSimple(fallbackPrice, targetCurrency);
        }
        return 'Price on request';
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const currency = targetCurrency || getCurrency();
    const symbol = getCurrencySymbol(currency);

    // If all prices are the same, show just one price
    if (minPrice === maxPrice) {
        return formatPriceSimple(minPrice, targetCurrency);
    }

    // Show range
    if (currency === 'USD') {
        const minUsd = minPrice / 83;
        const maxUsd = maxPrice / 83;
        return `${symbol}${minUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}-${maxUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else {
        return `${symbol}${minPrice.toLocaleString('en-IN')}-${maxPrice.toLocaleString('en-IN')}`;
    }
};
