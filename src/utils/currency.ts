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
