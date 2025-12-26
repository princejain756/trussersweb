import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const productsPath = path.join(dataDir, 'products.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const websiteContentPath = path.join(dataDir, 'websiteContent.json');
const sourceProductsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const sourceCategoriesPath = path.join(__dirname, '..', 'src', 'data', 'categories.json');
const sourceWebsiteContentPath = path.join(__dirname, '..', 'public', 'websiteContent.json');
const adminUser = process.env.ADMIN_USER?.trim() || 'trussers-admin';
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || 'Trussers-2024';
const adminToken = process.env.ADMIN_TOKEN?.trim() || 'trussers-admin-token-2024';

let products = [];
let categories = {};
let websiteContent = {};
let writeQueue = Promise.resolve();

function stringifyAscii(value) {
    const json = JSON.stringify(value, null, 2);
    return json.replace(/[\u007f-\uffff]/g, (char) => {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) {
            return '';
        }
        if (codePoint <= 0xffff) {
            return `\\u${codePoint.toString(16).padStart(4, '0')}`;
        }
        const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
        const low = ((codePoint - 0x10000) % 0x400) + 0xdc00;
        return `\\u${high.toString(16).padStart(4, '0')}\\u${low
            .toString(16)
            .padStart(4, '0')}`;
    });
}

async function readJsonFile(filePath) {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
}

async function persistJsonFile(filePath, data) {
    writeQueue = writeQueue.catch(() => undefined).then(async () => {
        const payload = `${stringifyAscii(data)}\n`;
        await fs.writeFile(filePath, payload);
    });
    return writeQueue;
}

async function ensureSeedData() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });

    try {
        products = await readJsonFile(productsPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        products = await readJsonFile(sourceProductsPath);
        await persistJsonFile(productsPath, products);
    }

    try {
        categories = await readJsonFile(categoriesPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        categories = await readJsonFile(sourceCategoriesPath);
        await persistJsonFile(categoriesPath, categories);
    }

    try {
        websiteContent = await readJsonFile(websiteContentPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        try {
            websiteContent = await readJsonFile(sourceWebsiteContentPath);
        } catch {
            websiteContent = {
                hero: {
                    heading: 'Turning Waste Into Purpose',
                    subheading: 'Premium stationery & lifestyle goods crafted from recycled bottles. Simple. Sustainable. New.',
                    ctaText: 'Shop Sustainable Goods',
                    ctaLink: '/shop',
                    backgroundImage: '/heroimage.webp',
                },
                productShowcase: { label: 'Selected Goods', heading: 'Curated Essentials.' },
                shopByMood: { heading: 'Shop by Mood', subheading: 'Curated collections for every aspect of your sustainable life.' },
                instagramFeed: { embedUrl: 'https://www.instagram.com/trussers.co/', username: '@trussers.co' },
                corporateGifting: {
                    heading: 'Corporate & Event Gifting',
                    description: 'Premium sustainable gifts for your corporate events, employee appreciation, and special occasions.',
                    ctaText: 'Explore Corporate Gifting',
                },
                footer: {
                    aboutText: 'Subscribe to receive updates on new sustainable collections, eco-conscious living tips, and exclusive offers.',
                    phone: '+91 98765 43210',
                    email: 'hello@trussers.com',
                    address: 'Made with ♥ in India',
                    instagramLink: 'https://instagram.com/trussers.co',
                    facebookLink: 'https://facebook.com/trussers',
                    twitterLink: 'https://twitter.com/trussers',
                },
                lastSaved: '',
            };
        }
        await persistJsonFile(websiteContentPath, websiteContent);
    }
}

function getAdminToken(req) {
    const headerToken = req.headers['x-admin-key'];
    if (typeof headerToken === 'string' && headerToken.trim()) {
        return headerToken.trim();
    }
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return null;
}

function requireAdmin(req, res, next) {
    const providedToken = getAdminToken(req);
    if (providedToken !== adminToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return next();
}

function normalizeString(value, field, { required }) {
    if (value === undefined || value === null) {
        return required ? { error: `${field} is required` } : { value: undefined };
    }
    if (typeof value === 'number') {
        return { value: value.toString() };
    }
    if (typeof value !== 'string') {
        return { error: `${field} must be a string` };
    }
    const trimmed = value.trim();
    if (!trimmed && required) {
        return { error: `${field} cannot be empty` };
    }
    return { value: trimmed };
}

function normalizeOptionalString(value, field) {
    if (value === undefined || value === null) {
        return { value: undefined };
    }
    if (typeof value === 'number') {
        return { value: value.toString() };
    }
    if (typeof value !== 'string') {
        return { error: `${field} must be a string` };
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return { value: undefined };
    }
    return { value: trimmed };
}

function normalizeStringArray(value, field, { required }) {
    if (value === undefined || value === null) {
        return required ? { error: `${field} is required` } : { value: undefined };
    }

    let items = [];
    if (Array.isArray(value)) {
        items = value;
    } else if (typeof value === 'string') {
        items = value.split(/\r?\n|,/);
    } else {
        return { error: `${field} must be an array of strings` };
    }

    const normalized = items
        .map((item) => (typeof item === 'number' ? item.toString() : item))
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);

    if (required && normalized.length === 0) {
        return { error: `${field} cannot be empty` };
    }

    return { value: normalized };
}

function buildCreatePayload(payload) {
    const errors = [];
    const name = normalizeString(payload?.name, 'name', { required: true });
    const price = normalizeString(payload?.price, 'price', { required: true });
    const image = normalizeString(payload?.image, 'image', { required: true });
    const tag = normalizeOptionalString(payload?.tag, 'tag');
    const description = normalizeString(payload?.description, 'description', { required: true });
    const features = normalizeStringArray(payload?.features, 'features', { required: true });
    const category = normalizeOptionalString(payload?.category, 'category');

    [name, price, image, tag, description, features, category].forEach((field) => {
        if (field.error) {
            errors.push(field.error);
        }
    });

    if (errors.length > 0) {
        return { errors };
    }

    return {
        value: {
            name: name.value,
            price: price.value,
            image: image.value,
            tag: tag.value ?? 'New',
            description: description.value,
            features: features.value,
            category: category.value,
        },
    };
}

function buildUpdatePayload(payload) {
    const errors = [];
    const updates = {};
    let clearTag = false;
    let clearDescription = false;
    let clearCategory = false;

    if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
        const field = normalizeString(payload.name, 'name', { required: true });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.name = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'price')) {
        const field = normalizeString(payload.price, 'price', { required: true });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.price = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'image')) {
        const field = normalizeString(payload.image, 'image', { required: true });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.image = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'tag')) {
        const field = normalizeOptionalString(payload.tag, 'tag');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearTag = true;
            updates.tag = undefined;
        } else {
            updates.tag = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
        const field = normalizeOptionalString(payload.description, 'description');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearDescription = true;
            updates.description = undefined;
        } else {
            updates.description = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'features')) {
        const field = normalizeStringArray(payload.features, 'features', { required: false });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.features = field.value ?? [];
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
        const field = normalizeOptionalString(payload.category, 'category');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearCategory = true;
            updates.category = undefined;
        } else {
            updates.category = field.value;
        }
    }

    if (errors.length > 0) {
        return { errors };
    }

    if (Object.keys(updates).length === 0) {
        return { errors: ['No valid fields to update'] };
    }

    return { value: updates, clearTag, clearDescription, clearCategory };
}

function buildCategoryUpdatePayload(payload) {
    const errors = [];
    const updates = {};
    let clearTag = false;
    let clearDescription = false;
    let clearPrice = false;

    if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
        const field = normalizeString(payload.name, 'name', { required: true });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.name = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'image')) {
        const field = normalizeString(payload.image, 'image', { required: true });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.image = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'filename')) {
        const field = normalizeOptionalString(payload.filename, 'filename');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value !== undefined) {
            updates.filename = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'price')) {
        const field = normalizeOptionalString(payload.price, 'price');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearPrice = true;
            updates.price = undefined;
        } else {
            updates.price = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'tag')) {
        const field = normalizeOptionalString(payload.tag, 'tag');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearTag = true;
            updates.tag = undefined;
        } else {
            updates.tag = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
        const field = normalizeOptionalString(payload.description, 'description');
        if (field.error) {
            errors.push(field.error);
        } else if (field.value === undefined) {
            clearDescription = true;
            updates.description = undefined;
        } else {
            updates.description = field.value;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'features')) {
        const field = normalizeStringArray(payload.features, 'features', { required: false });
        if (field.error) {
            errors.push(field.error);
        } else {
            updates.features = field.value ?? [];
        }
    }

    if (errors.length > 0) {
        return { errors };
    }

    if (Object.keys(updates).length === 0) {
        return { errors: ['No valid fields to update'] };
    }

    return { value: updates, clearTag, clearDescription, clearPrice };
}

function getNextProductId(list) {
    return list.reduce((maxId, product) => {
        const id = Number(product?.id);
        return Number.isFinite(id) ? Math.max(maxId, id) : maxId;
    }, 0) + 1;
}

await ensureSeedData();

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, callback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = allowedImageExtensions.has(ext) ? ext : '.jpg';
        const fileName = `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
        callback(null, fileName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (allowedImageTypes.has(file.mimetype)) {
            callback(null, true);
            return;
        }
        callback(new Error('Only image uploads are allowed.'));
    },
});

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    return next();
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/uploads', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return res.json({
        url: `${baseUrl}/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
    });
});

app.post('/api/admin/login', (req, res) => {
    const username = normalizeString(req.body?.username, 'username', { required: true });
    const password = normalizeString(req.body?.password, 'password', { required: true });

    if (username.error || password.error) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: [username.error, password.error].filter(Boolean),
        });
    }

    if (username.value !== adminUser || password.value !== adminPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({ token: adminToken, user: adminUser });
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
    }
    const product = products.find((item) => Number(item.id) === id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(product);
});

app.post('/api/products', requireAdmin, async (req, res) => {
    const result = buildCreatePayload(req.body);
    if (result.errors) {
        return res.status(400).json({ error: 'Invalid payload', details: result.errors });
    }

    const newProduct = {
        id: getNextProductId(products),
        ...result.value,
    };

    products = [...products, newProduct];
    await persistJsonFile(productsPath, products);

    return res.status(201).json(newProduct);
});

app.patch('/api/products/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
    }

    const index = products.findIndex((item) => Number(item.id) === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const result = buildUpdatePayload(req.body ?? {});
    if (result.errors) {
        return res.status(400).json({ error: 'Invalid payload', details: result.errors });
    }

    const updated = { ...products[index], ...result.value };
    if (result.clearTag) {
        delete updated.tag;
    }
    if (result.clearDescription) {
        delete updated.description;
    }
    if (result.clearCategory) {
        delete updated.category;
    }
    products = [...products.slice(0, index), updated, ...products.slice(index + 1)];
    await persistJsonFile(productsPath, products);

    return res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
    }

    const index = products.findIndex((item) => Number(item.id) === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const removed = products[index];
    products = [...products.slice(0, index), ...products.slice(index + 1)];
    await persistJsonFile(productsPath, products);

    return res.json(removed);
});

app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// Website Content API
app.get('/api/website-content', (req, res) => {
    res.json(websiteContent);
});

app.post('/api/website-content', requireAdmin, async (req, res) => {
    const content = req.body;
    if (!content || typeof content !== 'object') {
        return res.status(400).json({ error: 'Invalid content payload' });
    }

    websiteContent = {
        ...websiteContent,
        ...content,
        lastSaved: new Date().toISOString(),
    };

    await persistJsonFile(websiteContentPath, websiteContent);

    return res.json(websiteContent);
});

app.patch('/api/categories/:slug/products/:index', requireAdmin, async (req, res) => {
    const slug = req.params.slug;
    const index = Number(req.params.index);
    if (!slug) {
        return res.status(400).json({ error: 'Category slug is required' });
    }
    if (!Number.isFinite(index)) {
        return res.status(400).json({ error: 'Invalid category product index' });
    }

    const category = categories[slug];
    if (!category || !Array.isArray(category.products)) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = category.products[index];
    if (!existing) {
        return res.status(404).json({ error: 'Category product not found' });
    }

    const result = buildCategoryUpdatePayload(req.body ?? {});
    if (result.errors) {
        return res.status(400).json({ error: 'Invalid payload', details: result.errors });
    }

    const updated = { ...existing, ...result.value };
    if (result.clearTag) {
        delete updated.tag;
    }
    if (result.clearDescription) {
        delete updated.description;
    }
    if (result.clearPrice) {
        delete updated.price;
    }
    if (Array.isArray(updated.features) && updated.features.length === 0) {
        delete updated.features;
    }

    const products = [...category.products];
    products[index] = updated;
    categories = {
        ...categories,
        [slug]: {
            ...category,
            products,
        },
    };
    await persistJsonFile(categoriesPath, categories);

    return res.json(updated);
});

app.delete('/api/categories/:slug/products/:index', requireAdmin, async (req, res) => {
    const slug = req.params.slug;
    const index = Number(req.params.index);
    if (!slug) {
        return res.status(400).json({ error: 'Category slug is required' });
    }
    if (!Number.isFinite(index)) {
        return res.status(400).json({ error: 'Invalid category product index' });
    }

    const category = categories[slug];
    if (!category || !Array.isArray(category.products)) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const existing = category.products[index];
    if (!existing) {
        return res.status(404).json({ error: 'Category product not found' });
    }

    const products = category.products.filter((_, idx) => idx !== index);
    categories = {
        ...categories,
        [slug]: {
            ...category,
            products,
        },
    };
    await persistJsonFile(categoriesPath, categories);

    return res.json(existing);
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof Error && err.message.includes('Only image uploads')) {
        return res.status(400).json({ error: err.message });
    }
    return next(err);
});

const port = Number(process.env.PORT) || 5174;
app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});
