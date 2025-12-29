import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ShoppingBag, Mail, Info, ExternalLink } from 'lucide-react';
import categoriesData from '../../data/categories.json';
import productsData from '../../data/products.json';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174';

// WhatsApp number (replace with actual business number)
const WHATSAPP_NUMBER = '919008138404';

type ChatProduct = {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
};

// Helper to find product from categories by slug ID (e.g. "pouches-1")
const findProductBySlugId = (slugId: string): ChatProduct | null => {
    for (const [categorySlug, catData] of Object.entries(categoriesData)) {
        const categoryData = catData as any;
        const products = categoryData.products ?? [];
        for (let idx = 0; idx < products.length; idx++) {
            if (`${categorySlug}-${idx}` === slugId) {
                const prod = products[idx];
                return {
                    id: slugId,
                    name: prod.name || 'Product',
                    price: prod.price || '₹0',
                    image: prod.image || '',
                    category: categoryData.name || categorySlug,
                };
            }
        }
    }
    return null;
};

// Helper to find product from products.json by numeric ID
const findProductByNumericId = (numId: number): ChatProduct | null => {
    const prod = productsData.find(p => p.id === numId);
    if (prod) {
        return {
            id: String(numId),
            name: prod.name,
            price: prod.price,
            image: prod.image,
            category: prod.category,
        };
    }
    return null;
};

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [product, setProduct] = useState<ChatProduct | null>(null);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Extract product ID from URL path
    const isPDP = location.pathname.startsWith('/product/');
    const productId = isPDP ? location.pathname.split('/product/')[1] : null;

    // Load product when page changes
    useEffect(() => {
        setCustomMessage('');
        setProduct(null);

        if (!productId) return;

        // Check if numeric ID (try API first, then products.json)
        const numId = Number(productId);
        if (!isNaN(numId) && Number.isFinite(numId)) {
            // Try API first
            fetch(`${apiBaseUrl}/api/products/${numId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        setProduct({
                            id: String(numId),
                            name: data.name,
                            price: typeof data.price === 'number' ? `₹${data.price}` : data.price,
                            image: data.image,
                            category: data.category || '',
                        });
                    } else {
                        // Fall back to products.json
                        const found = findProductByNumericId(numId);
                        if (found) setProduct(found);
                    }
                })
                .catch(() => {
                    // Fall back to products.json
                    const found = findProductByNumericId(numId);
                    if (found) setProduct(found);
                });
        } else {
            // Slug-based ID - use categories.json
            const found = findProductBySlugId(productId);
            if (found) setProduct(found);
        }
    }, [location.pathname, productId]);

    if (isAdminRoute) {
        return null;
    }

    // Generate WhatsApp link
    const getWhatsAppLink = (extraMessage?: string) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        let message = '';

        if (product) {
            const productUrl = `${baseUrl}/product/${product.id}`;
            message = `Hi! I want to know more about this product:\n\n*${product.name}*\nPrice: ${product.price}\n\nProduct Link: ${productUrl}`;
            if (extraMessage) {
                message += `\n\nMy Question: ${extraMessage}`;
            }
        } else {
            message = extraMessage || `Hi! I'm interested in learning more about Trussers products.`;
        }

        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    };

    const handleSendMessage = () => {
        if (customMessage.trim()) {
            window.open(getWhatsAppLink(customMessage), '_blank');
            setCustomMessage('');
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-2xl hover:scale-110 transition-transform focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageCircle size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-28 right-6 z-50 w-[340px] sm:w-[380px] h-[70vh] max-h-[600px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1A3C27] to-[#2D5F3F] p-5 text-white">
                            <h3 className="font-serif text-xl font-semibold">Trussers Assistant</h3>
                            <p className="text-sm text-white/70 mt-1">
                                {isPDP && product ? 'Interested in this product?' : 'How can we help you today?'}
                            </p>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 p-5 overflow-y-auto min-h-0">
                            {isPDP && product ? (
                                /* PDP Mode */
                                <div className="space-y-4">
                                    {/* Product Card */}
                                    <div className="flex gap-4 items-start p-3 bg-[#F4EFEC] rounded-xl">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div>
                                            <h4 className="font-serif font-semibold text-[#1A3C27] line-clamp-2">{product.name}</h4>
                                            <p className="text-[#C1A17C] font-medium mt-1">{product.price}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#2D5F3F] text-white rounded">{product.category}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[#5C5C5C] leading-relaxed">
                                        Have questions about this item? Type your message below or tap "Enquire" to chat on WhatsApp!
                                    </p>

                                    {/* Quick Enquire Button */}
                                    <a
                                        href={getWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1DA851] transition-colors shadow-lg"
                                    >
                                        <Send size={18} />
                                        Enquire on WhatsApp
                                    </a>
                                </div>
                            ) : (
                                /* General Mode */
                                <div className="space-y-3">
                                    <p className="text-sm text-[#5C5C5C] mb-4">
                                        Welcome to Trussers! Explore our sustainable, premium goods.
                                    </p>

                                    <Link
                                        to="/shop"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-4 bg-[#F4EFEC] rounded-xl hover:bg-[#E8DFD4] transition-colors group"
                                    >
                                        <div className="p-2 bg-[#2D5F3F] rounded-lg text-white group-hover:scale-110 transition-transform">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#1A3C27]">Browse Products</h4>
                                            <p className="text-xs text-[#5C5C5C]">Explore our curated collection</p>
                                        </div>
                                    </Link>

                                    <a
                                        href={getWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-[#F4EFEC] rounded-xl hover:bg-[#E8DFD4] transition-colors group"
                                    >
                                        <div className="p-2 bg-[#25D366] rounded-lg text-white group-hover:scale-110 transition-transform">
                                            <ExternalLink size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#1A3C27]">Chat on WhatsApp</h4>
                                            <p className="text-xs text-[#5C5C5C]">Instant support & enquiries</p>
                                        </div>
                                    </a>

                                    <Link
                                        to="/#about"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-4 bg-[#F4EFEC] rounded-xl hover:bg-[#E8DFD4] transition-colors group"
                                    >
                                        <div className="p-2 bg-[#C1A17C] rounded-lg text-white group-hover:scale-110 transition-transform">
                                            <Info size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#1A3C27]">About Trussers</h4>
                                            <p className="text-xs text-[#5C5C5C]">Our story & values</p>
                                        </div>
                                    </Link>

                                    <a
                                        href="mailto:hello@trussers.com"
                                        className="flex items-center gap-3 p-4 bg-[#F4EFEC] rounded-xl hover:bg-[#E8DFD4] transition-colors group"
                                    >
                                        <div className="p-2 bg-[#1A3C27] rounded-lg text-white group-hover:scale-110 transition-transform">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#1A3C27]">Email Us</h4>
                                            <p className="text-xs text-[#5C5C5C]">hello@trussers.com</p>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Message Input - Always visible */}
                        <div className="p-4 border-t border-[#E8DFD4] bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={product ? `Ask about ${product.name}...` : "Type your message..."}
                                    className="flex-1 px-4 py-3 rounded-full bg-[#F4EFEC] border border-transparent focus:border-[#25D366] focus:outline-none text-sm text-[#1A3C27] placeholder:text-[#5C5C5C]/50"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!customMessage.trim()}
                                    className="p-3 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-[#E8DFD4] text-center">
                            <p className="text-xs text-[#5C5C5C]">
                                Powered by <span className="font-semibold text-[#1A3C27]">Trussers</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
