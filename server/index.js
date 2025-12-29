import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import multer from 'multer';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { OAuth2Client } from 'google-auth-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch { }
try {
    process.loadEnvFile(path.join(__dirname, '..', '.env.local'));
} catch { }

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const productsPath = path.join(dataDir, 'products.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const websiteContentPath = path.join(dataDir, 'websiteContent.json');
const ordersPath = path.join(dataDir, 'orders.json');
const usersPath = path.join(dataDir, 'users.json');
const sessionsPath = path.join(dataDir, 'sessions.json');
const discountsPath = path.join(dataDir, 'discounts.json');
const blogsPath = path.join(dataDir, 'blogs.json');
const sourceProductsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
const sourceCategoriesPath = path.join(__dirname, '..', 'src', 'data', 'categories.json');
const sourceWebsiteContentPath = path.join(__dirname, '..', 'public', 'websiteContent.json');
const adminUser = process.env.ADMIN_USER?.trim() || 'trussers-admin';
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || 'Trussers-2024';
const adminToken = process.env.ADMIN_TOKEN?.trim() || 'trussers-admin-token-2024';
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleOAuthClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const businessDetails = {
    name: 'NAUTICREW ECO PRODUCTS PRIVATE LIMITED',
    addressLine1: 'No 5, 12th Cross Road, Cubbonpet',
    addressLine2: 'Bengaluru - 560002, Karnataka, India',
    gstin: '29AAJCN7013J1Z6',
    placeOfSupply: 'Karnataka (29)',
    contact: '+91 9008138404',
    email: 'info@trusser.in',
    hsnCode: '56021000',
};

const smtpConfig = {
    host: process.env.SMTP_HOST?.trim(),
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim(),
    secure: process.env.SMTP_SECURE === 'true',
    from: process.env.SMTP_FROM?.trim() || businessDetails.email,
};
let mailTransporter = null;
let mailerChecked = false;
const logoPath = path.join(__dirname, '..', 'src', 'assets', 'TrusserLOGO.avif');
let logoBufferCache;

let products = [];
let categories = {};
let websiteContent = {};
let orders = [];
let users = [];
let sessions = [];
let discounts = [];
let blogs = [];
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
                instagramFeed: { embedUrl: 'https://www.instagram.com/trusser.in/', username: '@trusser.in' },
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
                    instagramLink: 'https://instagram.com/trusser.in',
                    facebookLink: 'https://facebook.com/trussers',
                    twitterLink: 'https://twitter.com/trussers',
                },
                lastSaved: '',
            };
        }
        await persistJsonFile(websiteContentPath, websiteContent);
    }

    try {
        orders = await readJsonFile(ordersPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        orders = [];
        await persistJsonFile(ordersPath, orders);
    }

    try {
        users = await readJsonFile(usersPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        users = [];
        await persistJsonFile(usersPath, users);
    }

    try {
        sessions = await readJsonFile(sessionsPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        sessions = [];
        await persistJsonFile(sessionsPath, sessions);
    }

    try {
        discounts = await readJsonFile(discountsPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        discounts = [];
        await persistJsonFile(discountsPath, discounts);
    }

    try {
        blogs = await readJsonFile(blogsPath);
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
        blogs = [];
        await persistJsonFile(blogsPath, blogs);
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

function normalizeEmail(value, field, { required }) {
    const result = normalizeString(value, field, { required });
    if (result.error || !result.value) {
        return result;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.value)) {
        return { error: `${field} must be a valid email` };
    }
    return result;
}

function normalizePhone(value, field, { required }) {
    const result = normalizeString(value, field, { required });
    if (result.error) {
        return result;
    }
    const trimmed = (result.value ?? '').trim();
    if (!trimmed) {
        return required ? { error: `${field} is required` } : { value: undefined };
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
        return { error: `${field} must be a valid phone number` };
    }
    return { value: trimmed };
}

function normalizePincode(value, field, { required }) {
    const result = normalizeString(value, field, { required });
    if (result.error || !result.value) {
        return result;
    }
    const digits = result.value.replace(/\D/g, '');
    if (digits.length !== 6) {
        return { error: `${field} must be 6 digits` };
    }
    return { value: result.value };
}

function normalizeNumber(value, field, { required, min }) {
    if (value === undefined || value === null || value === '') {
        return required ? { error: `${field} is required` } : { value: undefined };
    }
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
        return { error: `${field} must be a number` };
    }
    if (min !== undefined && numberValue < min) {
        return { error: `${field} must be at least ${min}` };
    }
    return { value: numberValue };
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function createPasswordHash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    return { salt, hash: hashPassword(password, salt) };
}

function verifyPassword(password, salt, hash) {
    if (!salt || !hash) {
        return false;
    }
    const candidate = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

function sanitizeUser(user) {
    if (!user) {
        return null;
    }
    const { passwordHash, passwordSalt, googleSub, ...safe } = user;
    return safe;
}

function parseCookies(rawCookie) {
    if (!rawCookie) {
        return {};
    }
    return rawCookie.split(';').reduce((acc, part) => {
        const [key, ...rest] = part.trim().split('=');
        if (!key) {
            return acc;
        }
        acc[key] = decodeURIComponent(rest.join('='));
        return acc;
    }, {});
}

function getSessionToken(req) {
    const cookies = parseCookies(req.headers.cookie);
    return cookies.trussers_session || null;
}

function getSessionUser(req) {
    const token = getSessionToken(req);
    if (!token) {
        return null;
    }
    const session = sessions.find((entry) => entry.token === token);
    if (!session) {
        return null;
    }
    const user = users.find((entry) => entry.id === session.userId);
    return user || null;
}

function persistSessions(nextSessions) {
    sessions = nextSessions;
    return persistJsonFile(sessionsPath, sessions);
}

function createSession(userId) {
    const token = crypto.randomUUID();
    const entry = { token, userId, createdAt: new Date().toISOString() };
    return persistSessions([...sessions, entry]).then(() => entry);
}

function clearSession(token) {
    if (!token) {
        return Promise.resolve();
    }
    const nextSessions = sessions.filter((entry) => entry.token !== token);
    return persistSessions(nextSessions);
}

function setSessionCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    const parts = [
        `trussers_session=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=604800',
    ];
    if (isProd) {
        parts.push('Secure');
    }
    res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', 'trussers_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
}

async function getLogoBuffer() {
    if (logoBufferCache !== undefined) {
        return logoBufferCache;
    }
    try {
        const raw = await fs.readFile(logoPath);
        logoBufferCache = await sharp(raw).png().toBuffer();
    } catch {
        logoBufferCache = null;
    }
    return logoBufferCache;
}

function formatInr(amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) {
        return '₹0';
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numeric);
}

function formatAddress(address) {
    if (!address) {
        return '';
    }
    const parts = [
        address.address1,
        address.address2,
        `${address.city}, ${address.state} ${address.pincode}`,
        address.country,
    ].filter(Boolean);
    return parts.join(', ');
}

function numberToWordsIndian(value) {
    const number = Math.round(Number(value) || 0);
    if (number === 0) {
        return 'Zero';
    }

    const units = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertTwoDigits = (n) => {
        if (n < 20) {
            return units[n];
        }
        const ten = tens[Math.floor(n / 10)];
        const unit = units[n % 10];
        return unit ? `${ten} ${unit}` : ten;
    };

    const convertThreeDigits = (n) => {
        if (n < 100) {
            return convertTwoDigits(n);
        }
        const hundred = units[Math.floor(n / 100)];
        const rest = n % 100;
        return rest ? `${hundred} Hundred ${convertTwoDigits(rest)}` : `${hundred} Hundred`;
    };

    const parts = [];
    const scales = [
        { value: 10000000, label: 'Crore' },
        { value: 100000, label: 'Lakh' },
        { value: 1000, label: 'Thousand' },
    ];

    let remaining = number;
    scales.forEach((scale) => {
        if (remaining >= scale.value) {
            const count = Math.floor(remaining / scale.value);
            parts.push(`${convertThreeDigits(count)} ${scale.label}`);
            remaining %= scale.value;
        }
    });

    if (remaining > 0) {
        parts.push(convertThreeDigits(remaining));
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function getMailTransporter() {
    if (mailerChecked) {
        return mailTransporter;
    }
    mailerChecked = true;
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
        return null;
    }
    mailTransporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass,
        },
    });
    return mailTransporter;
}

function buildOrderEmailHtml(order) {
    const rows = order.items
        .map(
            (item) =>
                `<tr>
                    <td style="padding:8px 0;">${item.name} (x${item.quantity})</td>
                    <td style="padding:8px 0; text-align:right;">${formatInr(item.price * item.quantity)}</td>
                </tr>`
        )
        .join('');
    const invoiceBlock = order.invoice?.requested
        ? `<p style="margin:12px 0 0;"><strong>GST Invoice requested.</strong></p>
           <p style="margin:4px 0;">Customer GSTIN: ${order.invoice.gstNumber ?? 'N/A'}</p>`
        : '';

    return `
        <div style="font-family: Arial, sans-serif; color: #1A3C27;">
            <h2 style="margin-bottom:4px;">Thank you for your order</h2>
            <p style="margin-top:0;">Order ${order.orderNumber} · ${new Date(order.createdAt).toLocaleString()}</p>
            <h3 style="margin-top:24px;">Order summary</h3>
            <table style="width:100%; border-collapse:collapse;">
                <tbody>
                    ${rows}
                    <tr>
                        <td style="padding:8px 0; border-top:1px solid #E8DFD4;">Subtotal</td>
                        <td style="padding:8px 0; border-top:1px solid #E8DFD4; text-align:right;">${formatInr(order.pricing.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;">Shipping</td>
                        <td style="padding:8px 0; text-align:right;">${formatInr(order.pricing.shipping)}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;">Taxes</td>
                        <td style="padding:8px 0; text-align:right;">${formatInr(order.pricing.taxes)}</td>
                    </tr>
                    <tr>
                        <td style="padding:12px 0; font-weight:bold;">Total</td>
                        <td style="padding:12px 0; text-align:right; font-weight:bold;">${formatInr(order.pricing.total)}</td>
                    </tr>
                </tbody>
            </table>
            <h3 style="margin-top:24px;">Shipping address</h3>
            <p style="margin:4px 0;">${formatAddress(order.shipping)}</p>
            ${order.shipping?.instructions ? `<p style="margin:4px 0;">Instructions: ${order.shipping.instructions}</p>` : ''}
            ${invoiceBlock}
            <h3 style="margin-top:24px;">Invoice issuer</h3>
            <p style="margin:4px 0;">${businessDetails.name}</p>
            <p style="margin:4px 0;">${businessDetails.addressLine1}</p>
            <p style="margin:4px 0;">${businessDetails.addressLine2}</p>
            <p style="margin:4px 0;">GSTIN: ${businessDetails.gstin}</p>
            <p style="margin:4px 0;">Place of Supply: ${businessDetails.placeOfSupply}</p>
            <p style="margin:4px 0;">Contact: ${businessDetails.contact}</p>
            <p style="margin:4px 0;">Email: ${businessDetails.email}</p>
        </div>
    `;
}

function buildOrderEmailText(order) {
    const lines = [
        `Thank you for your order ${order.orderNumber}`,
        `Placed on ${new Date(order.createdAt).toLocaleString()}`,
        '',
        'Order summary:',
        ...order.items.map((item) => `${item.name} (x${item.quantity}) - ${formatInr(item.price * item.quantity)}`),
        `Subtotal: ${formatInr(order.pricing.subtotal)}`,
        `Shipping: ${formatInr(order.pricing.shipping)}`,
        `Taxes: ${formatInr(order.pricing.taxes)}`,
        `Total: ${formatInr(order.pricing.total)}`,
        '',
        `Shipping address: ${formatAddress(order.shipping)}`,
    ];

    if (order.shipping?.instructions) {
        lines.push(`Instructions: ${order.shipping.instructions}`);
    }

    if (order.invoice?.requested) {
        lines.push(`GST Invoice requested. Customer GSTIN: ${order.invoice.gstNumber ?? 'N/A'}`);
    }

    lines.push(
        '',
        `Invoice issuer: ${businessDetails.name}`,
        businessDetails.addressLine1,
        businessDetails.addressLine2,
        `GSTIN: ${businessDetails.gstin}`,
        `Place of Supply: ${businessDetails.placeOfSupply}`,
        `Contact: ${businessDetails.contact}`,
        `Email: ${businessDetails.email}`
    );

    return lines.join('\n');
}

async function buildInvoicePdf(order) {
    const logoBuffer = await getLogoBuffer();
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];
        const accent = '#1A3C27';
        const muted = '#5C5C5C';
        const lightLine = '#E8DFD4';

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width;
        const left = doc.page.margins.left;
        const right = pageWidth - doc.page.margins.right;
        const contentWidth = right - left;

        if (logoBuffer) {
            doc.image(logoBuffer, left, 40, { fit: [120, 50] });
        }

        const invoiceTitle = order.invoice?.requested ? 'TAX INVOICE' : 'INVOICE';
        doc.fillColor(accent).fontSize(18).font('Helvetica-Bold');
        doc.text(invoiceTitle, left, 50, { width: contentWidth, align: 'center' });

        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        doc.text('Original - For Recipient', right - 160, 40, { width: 160, align: 'right' });
        doc.text(`Invoice #: ${order.orderNumber}`, right - 160, 55, { width: 160, align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, right - 160, 70, { width: 160, align: 'right' });

        const headerBottom = 100;
        doc.moveTo(left, headerBottom).lineTo(right, headerBottom).lineWidth(1).strokeColor(accent).stroke();

        const sectionTop = headerBottom + 20;
        const columnGap = 30;
        const columnWidth = (contentWidth - columnGap) / 2;
        const rightColumnX = left + columnWidth + columnGap;

        doc.fillColor(accent).fontSize(11).font('Helvetica-Bold');
        doc.text('Supplier Details', left, sectionTop);
        doc.text('Bill To', rightColumnX, sectionTop);

        doc.moveTo(left, sectionTop + 15).lineTo(left + columnWidth, sectionTop + 15).strokeColor(lightLine).stroke();
        doc.moveTo(rightColumnX, sectionTop + 15).lineTo(right, sectionTop + 15).strokeColor(lightLine).stroke();

        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        const supplierY = sectionTop + 28;
        doc.text(businessDetails.name, left, supplierY, { width: columnWidth });
        doc.font('Helvetica').fillColor(muted);
        doc.text(businessDetails.addressLine1, left, supplierY + 15, { width: columnWidth });
        doc.text(businessDetails.addressLine2, left, supplierY + 28, { width: columnWidth });
        doc.text(`GSTIN: ${businessDetails.gstin}`, left, supplierY + 43, { width: columnWidth });
        doc.text(`Contact: ${businessDetails.contact}`, left, supplierY + 58, { width: columnWidth });
        doc.text(`Email: ${businessDetails.email}`, left, supplierY + 73, { width: columnWidth });

        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        const billY = sectionTop + 28;
        doc.text(order.customer?.fullName || 'Customer', rightColumnX, billY, { width: columnWidth });
        doc.font('Helvetica').fillColor(muted);
        doc.text(order.shipping?.address1 || '', rightColumnX, billY + 15, { width: columnWidth });
        if (order.shipping?.address2) {
            doc.text(order.shipping.address2, rightColumnX, billY + 28, { width: columnWidth });
        }
        const addrLine = `${order.shipping?.city ?? ''}, ${order.shipping?.state ?? ''} ${order.shipping?.pincode ?? ''}`.trim();
        doc.text(addrLine, rightColumnX, billY + 43, { width: columnWidth });
        doc.text(order.shipping?.country || '', rightColumnX, billY + 58, { width: columnWidth });
        if (order.invoice?.gstNumber) {
            doc.text(`GSTIN: ${order.invoice.gstNumber}`, rightColumnX, billY + 73, { width: columnWidth });
        }
        doc.text(`Place of Supply: ${businessDetails.placeOfSupply}`, rightColumnX, billY + 88, { width: columnWidth });
        doc.text(`Mode of Payment: ${order.payment?.method ?? 'Online'}`, rightColumnX, billY + 103, { width: columnWidth });

        let tableTop = billY + 135;
        doc.moveTo(left, tableTop).lineTo(right, tableTop).strokeColor(lightLine).stroke();
        tableTop += 10;

        const col = {
            sno: 30,
            desc: 200,
            hsn: 70,
            qty: 35,
            rate: 70,
            amount: 90,
        };
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        doc.text('S.No', left, tableTop, { width: col.sno });
        doc.text('Description', left + col.sno, tableTop, { width: col.desc });
        doc.text('HSN Code', left + col.sno + col.desc, tableTop, { width: col.hsn });
        doc.text('Qty', left + col.sno + col.desc + col.hsn, tableTop, { width: col.qty, align: 'right' });
        doc.text('Rate (INR)', left + col.sno + col.desc + col.hsn + col.qty, tableTop, { width: col.rate, align: 'right' });
        doc.text('Amount (INR)', left + col.sno + col.desc + col.hsn + col.qty + col.rate, tableTop, { width: col.amount, align: 'right' });

        let y = tableTop + 18;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(lightLine).stroke();
        y += 6;

        doc.font('Helvetica').fillColor(muted).fontSize(10);
        order.items.forEach((item, index) => {
            const descriptionHeight = doc.heightOfString(item.name, { width: col.desc });
            const rowHeight = Math.max(20, descriptionHeight + 4);

            if (y + rowHeight > 700) {
                doc.addPage();
                y = 80;
            }

            doc.fillColor(muted).text(String(index + 1), left, y, { width: col.sno });
            doc.fillColor('#000000').text(item.name, left + col.sno, y, { width: col.desc });
            doc.fillColor(muted).text(businessDetails.hsnCode, left + col.sno + col.desc, y, { width: col.hsn });
            doc.text(String(item.quantity), left + col.sno + col.desc + col.hsn, y, { width: col.qty, align: 'right' });
            doc.text(formatInr(item.price), left + col.sno + col.desc + col.hsn + col.qty, y, { width: col.rate, align: 'right' });
            doc.text(formatInr(item.price * item.quantity), left + col.sno + col.desc + col.hsn + col.qty + col.rate, y, { width: col.amount, align: 'right' });

            y += rowHeight + 6;
            doc.moveTo(left, y - 4).lineTo(right, y - 4).strokeColor(lightLine).stroke();
        });

        const taxable = Number(order.pricing?.subtotal || 0);
        const shipping = Number(order.pricing?.shipping || 0);
        const taxes = Number(order.pricing?.taxes || 0);
        const total = Number(order.pricing?.total || 0);
        const isIntraState = (order.shipping?.state || '').toLowerCase().includes('karnataka');
        const taxRate = taxable > 0 ? (taxes / taxable) * 100 : 0;
        const cgst = isIntraState ? taxes / 2 : 0;
        const sgst = isIntraState ? taxes / 2 : 0;
        const igst = isIntraState ? 0 : taxes;

        const summaryX = left + col.sno + col.desc + col.hsn + col.qty + col.rate - 10;
        const summaryWidth = col.amount + 80;
        let summaryY = y + 10;

        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        doc.text('Taxable Value', summaryX, summaryY, { width: summaryWidth, align: 'right' });
        doc.font('Helvetica').fillColor(muted).text(formatInr(taxable), right - col.amount, summaryY, { width: col.amount, align: 'right' });
        summaryY += 16;

        doc.font('Helvetica-Bold').fillColor('#000000').text('Shipping', summaryX, summaryY, { width: summaryWidth, align: 'right' });
        doc.font('Helvetica').fillColor(muted).text(formatInr(shipping), right - col.amount, summaryY, { width: col.amount, align: 'right' });
        summaryY += 16;

        if (isIntraState) {
            doc.font('Helvetica-Bold').fillColor('#000000').text(`CGST (${(taxRate / 2).toFixed(2)}%)`, summaryX, summaryY, { width: summaryWidth, align: 'right' });
            doc.font('Helvetica').fillColor(muted).text(formatInr(cgst), right - col.amount, summaryY, { width: col.amount, align: 'right' });
            summaryY += 16;
            doc.font('Helvetica-Bold').fillColor('#000000').text(`SGST (${(taxRate / 2).toFixed(2)}%)`, summaryX, summaryY, { width: summaryWidth, align: 'right' });
            doc.font('Helvetica').fillColor(muted).text(formatInr(sgst), right - col.amount, summaryY, { width: col.amount, align: 'right' });
            summaryY += 16;
        } else {
            doc.font('Helvetica-Bold').fillColor('#000000').text(`IGST (${taxRate.toFixed(2)}%)`, summaryX, summaryY, { width: summaryWidth, align: 'right' });
            doc.font('Helvetica').fillColor(muted).text(formatInr(igst), right - col.amount, summaryY, { width: col.amount, align: 'right' });
            summaryY += 16;
        }

        doc.font('Helvetica-Bold').fillColor(accent).text('Total Amount', summaryX, summaryY, { width: summaryWidth, align: 'right' });
        doc.font('Helvetica-Bold').fillColor(accent).text(formatInr(total), right - col.amount, summaryY, { width: col.amount, align: 'right' });

        const words = `${numberToWordsIndian(total)} Rupees Only`;
        doc.fillColor('#000000').fontSize(9).font('Helvetica-Oblique');
        doc.text(`Amount in Words: ${words}`, left, summaryY + 30, { width: contentWidth });

        doc.fontSize(9).fillColor(muted).font('Helvetica');
        doc.text('This is a computer-generated invoice. For queries, contact maitri@trusser.in.', left, summaryY + 50, { width: contentWidth });

        doc.end();
    });
}

async function sendOrderReceiptEmail(order) {
    const transporter = getMailTransporter();
    if (!transporter) {
        return;
    }
    if (!order?.customer?.email) {
        return;
    }
    const subject = `Trusser order receipt ${order.orderNumber}`;
    const html = buildOrderEmailHtml(order);
    const text = buildOrderEmailText(order);
    const attachments = [];

    try {
        const pdfBuffer = await buildInvoicePdf(order);
        attachments.push({
            filename: `invoice-${order.orderNumber.replace('#', '')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        });
    } catch (error) {
        console.error('Invoice PDF generation failed', error);
    }

    await transporter.sendMail({
        from: smtpConfig.from,
        to: order.customer.email,
        subject,
        text,
        html,
        attachments,
    });
}

function normalizeBoolean(value, field, { defaultValue = false } = {}) {
    if (value === undefined || value === null || value === '') {
        return { value: defaultValue };
    }
    if (typeof value === 'boolean') {
        return { value };
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return { value: true };
        }
        if (normalized === 'false') {
            return { value: false };
        }
    }
    return { error: `${field} must be a boolean` };
}

function calculateOrderPricing(items) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 3000 ? 0 : items.length > 0 ? 199 : 0;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + shipping + taxes;
    return { subtotal, shipping, taxes, total };
}

function getOrderSequence(order) {
    if (order && Number.isFinite(order.sequence)) {
        return order.sequence;
    }
    if (order && typeof order.orderNumber === 'string') {
        const match = order.orderNumber.match(/\d+/);
        if (match) {
            return Number(match[0]);
        }
    }
    return 1000;
}

function getNextOrderSequence(existingOrders) {
    const maxSequence = existingOrders.reduce((max, order) => Math.max(max, getOrderSequence(order)), 1000);
    return maxSequence + 1;
}

function buildCheckoutPayload(payload) {
    const errors = [];
    const fullName = normalizeString(payload?.customer?.fullName, 'fullName', { required: true });
    const username = normalizeOptionalString(payload?.customer?.username, 'username');
    const email = normalizeEmail(payload?.customer?.email, 'email', { required: true });
    const phone = normalizePhone(payload?.customer?.phone, 'phone', { required: true });
    const address1 = normalizeString(payload?.shipping?.address1, 'address1', { required: true });
    const address2 = normalizeOptionalString(payload?.shipping?.address2, 'address2');
    const city = normalizeString(payload?.shipping?.city, 'city', { required: true });
    const state = normalizeString(payload?.shipping?.state, 'state', { required: true });
    const pincode = normalizePincode(payload?.shipping?.pincode, 'pincode', { required: true });
    const country = normalizeString(payload?.shipping?.country, 'country', { required: true });
    const instructions = normalizeOptionalString(payload?.shipping?.instructions, 'instructions');
    const paymentMethod = normalizeString(payload?.paymentMethod, 'paymentMethod', { required: true });
    const invoiceRequested = normalizeBoolean(payload?.invoice?.requested, 'invoice.requested');
    const guestCheckout = normalizeBoolean(payload?.guestCheckout, 'guestCheckout');
    const gstNumber = normalizeOptionalString(payload?.invoice?.gstNumber, 'invoice.gstNumber');

    [
        fullName,
        username,
        email,
        phone,
        address1,
        address2,
        city,
        state,
        pincode,
        country,
        instructions,
        paymentMethod,
        invoiceRequested,
        guestCheckout,
        gstNumber,
    ].forEach((field) => {
        if (field.error) {
            errors.push(field.error);
        }
    });

    if (invoiceRequested.value) {
        const gstValue = gstNumber.value ? gstNumber.value.toUpperCase() : '';
        if (!gstValue) {
            errors.push('gstNumber is required for invoice');
        } else if (!/^[0-9A-Z]{15}$/.test(gstValue)) {
            errors.push('gstNumber must be 15 alphanumeric characters');
        }
    }

    const items = Array.isArray(payload?.items) ? payload.items : null;
    if (!items) {
        errors.push('items must be an array');
    }

    const normalizedItems = [];
    if (Array.isArray(items)) {
        items.forEach((item, index) => {
            const name = normalizeString(item?.name, `items[${index}].name`, { required: true });
            const image = normalizeOptionalString(item?.image, `items[${index}].image`);
            const price = normalizeNumber(item?.price, `items[${index}].price`, { required: true, min: 0 });
            const quantity = normalizeNumber(item?.quantity, `items[${index}].quantity`, { required: true, min: 1 });
            const idValue = item?.id;
            const id =
                typeof idValue === 'string' && idValue.trim()
                    ? idValue.trim()
                    : typeof idValue === 'number' && Number.isFinite(idValue)
                        ? idValue.toString()
                        : `item-${index + 1}`;

            [name, image, price, quantity].forEach((field) => {
                if (field.error) {
                    errors.push(field.error);
                }
            });

            if (!name.error && !price.error && !quantity.error) {
                normalizedItems.push({
                    id,
                    name: name.value,
                    image: image.value,
                    price: price.value,
                    quantity: quantity.value,
                });
            }
        });
    }

    if (paymentMethod.value && !['razorpay', 'cod'].includes(paymentMethod.value)) {
        errors.push('paymentMethod must be razorpay or cod');
    }

    if (errors.length > 0) {
        return { errors };
    }

    return {
        value: {
            customer: {
                fullName: fullName.value,
                username: username.value || (email.value ? email.value.split('@')[0] : 'guest'),
                email: email.value,
                phone: phone.value,
            },
            shipping: {
                address1: address1.value,
                address2: address2.value,
                city: city.value,
                state: state.value,
                pincode: pincode.value,
                country: country.value,
                instructions: instructions.value,
            },
            items: normalizedItems,
            paymentMethod: paymentMethod.value,
            invoice: {
                requested: Boolean(invoiceRequested.value),
                gstNumber: invoiceRequested.value ? gstNumber.value?.toUpperCase() : undefined,
            },
            guestCheckout: Boolean(guestCheckout.value),
        },
    };
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
    const origin = process.env.CORS_ORIGIN ?? req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

app.post('/api/auth/register', async (req, res) => {
    const fullName = normalizeString(req.body?.fullName, 'fullName', { required: true });
    const username = normalizeOptionalString(req.body?.username, 'username');
    const email = normalizeEmail(req.body?.email, 'email', { required: true });
    const phone = normalizePhone(req.body?.phone, 'phone', { required: false });
    const password = normalizeString(req.body?.password, 'password', { required: true });

    const errors = [fullName, username, email, phone, password]
        .filter((field) => field.error)
        .map((field) => field.error);

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Invalid payload', details: errors });
    }

    const existing = users.find((user) => user.email.toLowerCase() === email.value.toLowerCase());
    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (password.value.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { salt, hash } = createPasswordHash(password.value);
    const newUser = {
        id: crypto.randomUUID(),
        fullName: fullName.value,
        username: username.value || email.value.split('@')[0],
        email: email.value.toLowerCase(),
        phone: phone.value ?? '',
        gstNumber: undefined,
        createdAt: new Date().toISOString(),
        addresses: [],
        orders: [],
        passwordSalt: salt,
        passwordHash: hash,
    };

    users = [...users, newUser];
    await persistJsonFile(usersPath, users);

    const session = await createSession(newUser.id);
    setSessionCookie(res, session.token);

    return res.status(201).json({ account: sanitizeUser(newUser) });
});

app.post('/api/auth/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email, 'email', { required: true });
    const password = normalizeString(req.body?.password, 'password', { required: true });

    const errors = [email, password].filter((field) => field.error).map((field) => field.error);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Invalid payload', details: errors });
    }

    const user = users.find((entry) => entry.email.toLowerCase() === email.value.toLowerCase());
    if (!user || !verifyPassword(password.value, user.passwordSalt, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const session = await createSession(user.id);
    setSessionCookie(res, session.token);

    return res.json({ account: sanitizeUser(user) });
});

app.post('/api/auth/google', async (req, res) => {
    const credential = normalizeString(req.body?.credential, 'credential', { required: true });
    if (credential.error) {
        return res.status(400).json({ error: 'Invalid payload', details: [credential.error] });
    }

    if (!googleClientId || !googleOAuthClient) {
        return res.status(501).json({ error: 'Google sign-in is not configured on the server.' });
    }

    try {
        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: credential.value,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        const email = payload?.email?.toLowerCase();
        const emailVerified = payload?.email_verified;
        const subject = payload?.sub;

        if (!email || !subject) {
            return res.status(401).json({ error: 'Google sign-in failed.' });
        }

        if (emailVerified === false) {
            return res.status(401).json({ error: 'Google account email is not verified.' });
        }

        const name = payload?.name?.trim() || payload?.given_name?.trim() || email.split('@')[0];

        let user = users.find((entry) => entry.email.toLowerCase() === email);

        if (!user) {
            user = {
                id: crypto.randomUUID(),
                fullName: name,
                username: email.split('@')[0],
                email,
                phone: '',
                gstNumber: undefined,
                createdAt: new Date().toISOString(),
                addresses: [],
                orders: [],
                authProvider: 'google',
                googleSub: subject,
            };
            users = [...users, user];
            await persistJsonFile(usersPath, users);
        } else if (!user.googleSub || user.googleSub !== subject || user.authProvider !== 'google') {
            const updated = {
                ...user,
                authProvider: 'google',
                googleSub: subject,
                fullName: user.fullName || name,
            };
            users = users.map((entry) => (entry.id === user.id ? updated : entry));
            await persistJsonFile(usersPath, users);
            user = updated;
        }

        const session = await createSession(user.id);
        setSessionCookie(res, session.token);

        return res.json({ account: sanitizeUser(user) });
    } catch {
        return res.status(401).json({ error: 'Google sign-in failed.' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    const token = getSessionToken(req);
    await clearSession(token);
    clearSessionCookie(res);
    return res.json({ status: 'ok' });
});

app.get('/api/account', (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json(sanitizeUser(user));
});

app.patch('/api/account', async (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const fullName = normalizeOptionalString(req.body?.fullName, 'fullName');
    const phone = normalizeOptionalString(req.body?.phone, 'phone');
    const gstNumber = normalizeOptionalString(req.body?.gstNumber, 'gstNumber');

    const errors = [fullName, phone, gstNumber].filter((field) => field.error).map((field) => field.error);
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Invalid payload', details: errors });
    }

    if (gstNumber.value && !/^[0-9A-Z]{15}$/.test(gstNumber.value.toUpperCase())) {
        return res.status(400).json({ error: 'GSTIN must be 15 alphanumeric characters.' });
    }

    const updated = {
        ...user,
        fullName: fullName.value ?? user.fullName,
        phone: phone.value ?? user.phone,
        gstNumber: gstNumber.value ? gstNumber.value.toUpperCase() : user.gstNumber,
    };

    users = users.map((entry) => (entry.id === user.id ? updated : entry));
    await persistJsonFile(usersPath, users);

    return res.json(sanitizeUser(updated));
});

app.post('/api/account/addresses', async (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const label = normalizeOptionalString(req.body?.label, 'label');
    const address1 = normalizeString(req.body?.address1, 'address1', { required: true });
    const address2 = normalizeOptionalString(req.body?.address2, 'address2');
    const city = normalizeString(req.body?.city, 'city', { required: true });
    const state = normalizeString(req.body?.state, 'state', { required: true });
    const pincode = normalizePincode(req.body?.pincode, 'pincode', { required: true });
    const country = normalizeString(req.body?.country, 'country', { required: true });
    const instructions = normalizeOptionalString(req.body?.instructions, 'instructions');

    const errors = [label, address1, address2, city, state, pincode, country, instructions]
        .filter((field) => field.error)
        .map((field) => field.error);

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Invalid payload', details: errors });
    }

    const address = {
        id: crypto.randomUUID(),
        label: label.value || `${address1.value}, ${city.value} ${pincode.value}`,
        address1: address1.value,
        address2: address2.value,
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        country: country.value,
        instructions: instructions.value,
        lastUsedAt: new Date().toISOString(),
    };

    const updated = {
        ...user,
        addresses: [address, ...(user.addresses ?? [])],
    };

    users = users.map((entry) => (entry.id === user.id ? updated : entry));
    await persistJsonFile(usersPath, users);

    return res.json(sanitizeUser(updated));
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

// Admin Dashboard API Endpoints
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    // Calculate date range for comparisons (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Filter orders by date range
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const previousOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    // Calculate total sales (only paid orders)
    const totalSales = recentOrders
        .filter(o => o.payment?.status === 'paid')
        .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const previousSales = previousOrders
        .filter(o => o.payment?.status === 'paid')
        .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    // Calculate percentage changes
    const ordersChange = previousOrders.length > 0
        ? Math.round(((recentOrders.length - previousOrders.length) / previousOrders.length) * 100)
        : recentOrders.length > 0 ? 100 : 0;
    const salesChange = previousSales > 0
        ? Math.round(((totalSales - previousSales) / previousSales) * 100)
        : totalSales > 0 ? 100 : 0;

    // Quick action counts
    const ordersToFulfill = orders.filter(o =>
        o.payment?.status === 'paid' && !o.fulfillmentStatus || o.fulfillmentStatus === 'unfulfilled'
    ).length;
    const paymentsPending = orders.filter(o => o.payment?.status === 'pending').length;
    const returnRequests = orders.filter(o => o.returnRequest).length;

    // Recent orders (last 5)
    const recentOrdersList = orders
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(o => ({
            id: o.orderNumber || `#${o.sequence || o.id.slice(0, 4)}`,
            customer: o.customer?.fullName || o.customer?.email || 'Guest',
            date: formatOrderDate(o.createdAt),
            amount: formatInr(o.pricing?.total || 0),
            status: o.payment?.status === 'paid' ? 'Completed' :
                o.payment?.status === 'pending' ? 'Pending' :
                    o.payment?.status === 'failed' ? 'Failed' : 'Unknown',
        }));

    // Top products by revenue
    const productSales = {};
    orders
        .filter(o => o.payment?.status === 'paid')
        .forEach(o => {
            (o.items || []).forEach(item => {
                const name = item.name || 'Unknown Product';
                if (!productSales[name]) {
                    productSales[name] = { name, sold: 0, revenue: 0 };
                }
                productSales[name].sold += item.quantity || 1;
                productSales[name].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4)
        .map(p => ({ ...p, revenue: formatInr(p.revenue) }));

    // Summary stats
    const totalCustomers = users.length;
    const totalProducts = products.length;
    const avgOrderValue = recentOrders.length > 0
        ? Math.round(totalSales / recentOrders.filter(o => o.payment?.status === 'paid').length) || 0
        : 0;

    return res.json({
        analytics: {
            sessions: { value: '—', change: '—', trend: 'neutral' }, // No real analytics
            sales: {
                value: formatInr(totalSales),
                change: salesChange >= 0 ? `+${salesChange}%` : `${salesChange}%`,
                trend: salesChange >= 0 ? 'up' : 'down',
            },
            orders: {
                value: String(recentOrders.length),
                change: ordersChange >= 0 ? `+${ordersChange}%` : `${ordersChange}%`,
                trend: ordersChange >= 0 ? 'up' : 'down',
            },
            conversionRate: { value: '—', change: '—', trend: 'neutral' },
        },
        quickActions: [
            { label: `${ordersToFulfill} order${ordersToFulfill !== 1 ? 's' : ''} to fulfill`, count: ordersToFulfill },
            { label: `${paymentsPending} payment${paymentsPending !== 1 ? 's' : ''} to capture`, count: paymentsPending },
            { label: `${returnRequests} return request${returnRequests !== 1 ? 's' : ''}`, count: returnRequests },
        ],
        recentOrders: recentOrdersList,
        topProducts,
        summary: {
            totalCustomers,
            activeDiscounts: discounts.filter(d => {
                const now = new Date();
                const startDate = d.startDate ? new Date(d.startDate) : null;
                const endDate = d.endDate ? new Date(d.endDate) : null;
                if (endDate && now > endDate) return false;
                if (startDate && now < startDate) return false;
                return true;
            }).length,
            totalProducts,
            avgOrderValue: formatInr(avgOrderValue),
        },
    });
});

function formatOrderDate(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
}

app.get('/api/admin/orders', requireAdmin, (req, res) => {
    // Map orders to admin-friendly format
    const adminOrders = orders
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((o, idx) => ({
            id: o.id,
            orderNumber: o.orderNumber || `#${o.sequence || (1000 + idx)}`,
            date: formatOrderDate(o.createdAt),
            customer: o.customer?.fullName || o.customer?.email?.split('@')[0] || 'Guest',
            email: o.customer?.email || '',
            channel: 'Online Store',
            total: formatInr(o.pricing?.total || 0),
            paymentStatus: o.payment?.status === 'paid' ? 'Paid' :
                o.payment?.status === 'pending' ? 'Payment pending' :
                    o.payment?.status === 'failed' ? 'Voided' : 'Refunded',
            fulfillmentStatus: o.fulfillmentStatus === 'fulfilled' ? 'Fulfilled' :
                o.fulfillmentStatus === 'partial' ? 'Partially fulfilled' : 'Unfulfilled',
            items: (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
            deliveryStatus: o.deliveryStatus || 'Pending',
            deliveryMethod: o.shipping?.method || 'Standard Shipping',
            tags: [
                o.payment?.method === 'cod' ? 'COD' : null,
                o.payment?.method === 'razorpay' ? 'Razorpay' : null,
            ].filter(Boolean),
            hasNote: Boolean(o.notes),
        }));

    return res.json({
        orders: adminOrders,
        stats: {
            total: orders.length,
            itemsOrdered: orders.reduce((sum, o) =>
                sum + (o.items || []).reduce((s, item) => s + (item.quantity || 1), 0), 0),
            returns: 0,
            fulfilled: orders.filter(o => o.fulfillmentStatus === 'fulfilled').length,
            delivered: orders.filter(o => o.deliveryStatus === 'Delivered').length,
        },
    });
});

app.get('/api/admin/customers', requireAdmin, (req, res) => {
    // Build customer list from users with order data
    const customerList = users.map(user => {
        const userOrders = orders.filter(o => o.customer?.userId === user.id || o.customer?.email === user.email);
        const amountSpent = userOrders
            .filter(o => o.payment?.status === 'paid')
            .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

        return {
            id: user.id,
            name: user.fullName || user.email,
            email: user.email,
            emailSubscription: 'Subscribed', // Placeholder
            location: formatUserLocation(user),
            ordersCount: userOrders.length,
            amountSpent: formatInr(amountSpent),
            lastOrder: userOrders.length > 0 ? formatOrderDate(userOrders[0].createdAt) : undefined,
            phone: user.phone || '',
            tags: [],
        };
    });

    // Also include guest customers from orders
    const guestCustomers = orders
        .filter(o => !o.customer?.userId && o.customer?.email)
        .reduce((acc, o) => {
            const email = o.customer.email.toLowerCase();
            if (!acc[email] && !users.find(u => u.email.toLowerCase() === email)) {
                acc[email] = {
                    id: `guest-${email}`,
                    name: o.customer.fullName || email,
                    email: o.customer.email,
                    emailSubscription: 'Not subscribed',
                    location: o.shipping ? `${o.shipping.city || ''}, India` : 'India',
                    ordersCount: 0,
                    amountSpent: 0,
                    tags: ['Guest'],
                };
            }
            if (acc[email]) {
                acc[email].ordersCount += 1;
                if (o.payment?.status === 'paid') {
                    acc[email].amountSpent += o.pricing?.total || 0;
                }
            }
            return acc;
        }, {});

    const allCustomers = [
        ...customerList,
        ...Object.values(guestCustomers).map(c => ({
            ...c,
            amountSpent: formatInr(c.amountSpent),
        })),
    ];

    return res.json({
        customers: allCustomers,
        total: allCustomers.length,
    });
});

function formatUserLocation(user) {
    if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses[0];
        const parts = [addr.city, addr.state].filter(Boolean);
        return parts.length > 0 ? `${parts.join(' ')}, India` : 'India';
    }
    return 'India';
}

// Helper to compute discount status based on dates
function computeDiscountStatus(discount) {
    const now = new Date();
    const startDate = discount.startDate ? new Date(discount.startDate) : null;
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    if (endDate && now > endDate) {
        return 'Expired';
    }
    if (startDate && now < startDate) {
        return 'Scheduled';
    }
    return 'Active';
}

// Discount API Endpoints
app.get('/api/admin/discounts', requireAdmin, (req, res) => {
    const discountList = discounts.map(d => ({
        ...d,
        status: computeDiscountStatus(d),
    }));
    return res.json({ discounts: discountList });
});

app.post('/api/admin/discounts', requireAdmin, async (req, res) => {
    const { type, method, code, title, valueType, value, minRequirement, minAmount, minQuantity,
        customerEligibility, usageLimit, usageLimitValue, onePerCustomer, startDate, startTime,
        endDate, endTime, combinations } = req.body;

    // Validate required fields
    if (method === 'code' && !code) {
        return res.status(400).json({ error: 'Discount code is required' });
    }
    if (method === 'automatic' && !title) {
        return res.status(400).json({ error: 'Title is required for automatic discounts' });
    }
    if (!value || isNaN(Number(value))) {
        return res.status(400).json({ error: 'Valid discount value is required' });
    }

    // Build the discount object
    const discountId = crypto.randomUUID();
    const discountTitle = method === 'code' ? code : title;

    // Format value for display
    const formattedValue = valueType === 'percentage'
        ? `${value}%`
        : `₹${Number(value).toLocaleString('en-IN')}`;

    // Format description
    let description = `${formattedValue} off entire order`;
    if (minRequirement === 'amount' && minAmount) {
        description += ` • Minimum ₹${Number(minAmount).toLocaleString('en-IN')}`;
    } else if (minRequirement === 'quantity' && minQuantity) {
        description += ` • Minimum quantity of ${minQuantity}`;
    }
    if (onePerCustomer) {
        description += ' • One use per customer';
    }

    const newDiscount = {
        id: discountId,
        title: discountTitle,
        description,
        type: type === 'amount_off_order' ? 'Amount off order' :
            type === 'amount_off_products' ? 'Amount off products' :
                type === 'free_shipping' ? 'Free shipping' : 'Buy X get Y',
        method: method === 'code' ? 'Code' : 'Automatic',
        code: method === 'code' ? code : undefined,
        valueType,
        value: formattedValue,
        rawValue: Number(value),
        minRequirement,
        minAmount: minAmount ? Number(minAmount) : undefined,
        minQuantity: minQuantity ? Number(minQuantity) : undefined,
        customerEligibility,
        usageLimit: usageLimit ? Number(usageLimitValue) : undefined,
        onePerCustomer: Boolean(onePerCustomer),
        startDate: startDate || new Date().toISOString().split('T')[0],
        startTime: startTime || '00:00',
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        combinations: combinations || { products: false, orders: false, shipping: false },
        usedCount: 0,
        createdAt: new Date().toISOString(),
    };

    discounts = [...discounts, newDiscount];
    await persistJsonFile(discountsPath, discounts);

    return res.status(201).json({
        ...newDiscount,
        status: computeDiscountStatus(newDiscount),
    });
});

app.patch('/api/admin/discounts/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const index = discounts.findIndex(d => d.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Discount not found' });
    }

    const existing = discounts[index];
    const updates = req.body;

    const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    discounts = [...discounts.slice(0, index), updated, ...discounts.slice(index + 1)];
    await persistJsonFile(discountsPath, discounts);

    return res.json({
        ...updated,
        status: computeDiscountStatus(updated),
    });
});

app.delete('/api/admin/discounts/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const index = discounts.findIndex(d => d.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Discount not found' });
    }

    const removed = discounts[index];
    discounts = discounts.filter(d => d.id !== id);
    await persistJsonFile(discountsPath, discounts);

    return res.json(removed);
});

// Get active discounts count for dashboard
app.get('/api/admin/discounts/active-count', requireAdmin, (req, res) => {
    const activeCount = discounts.filter(d => computeDiscountStatus(d) === 'Active').length;
    return res.json({ count: activeCount });
});

// Public endpoint: Validate discount code (for cart/checkout)
app.post('/api/discounts/validate', (req, res) => {
    const { code, subtotal, itemCount } = req.body;

    if (!code) {
        return res.status(400).json({ valid: false, error: 'Coupon code is required' });
    }

    // Find discount by code (case-insensitive)
    const discount = discounts.find(d =>
        d.method === 'Code' &&
        d.code &&
        d.code.toUpperCase() === code.toUpperCase()
    );

    if (!discount) {
        return res.status(404).json({ valid: false, error: 'Invalid coupon code' });
    }

    // Check if discount is active
    const status = computeDiscountStatus(discount);
    if (status !== 'Active') {
        return res.status(400).json({
            valid: false,
            error: status === 'Expired' ? 'This coupon has expired' : 'This coupon is not yet active'
        });
    }

    // Check minimum amount requirement
    if (discount.minAmount && subtotal && Number(subtotal) < discount.minAmount) {
        return res.status(400).json({
            valid: false,
            error: `Minimum order of ₹${discount.minAmount.toLocaleString('en-IN')} required`
        });
    }

    // Check minimum quantity requirement
    if (discount.minQuantity && itemCount && Number(itemCount) < discount.minQuantity) {
        return res.status(400).json({
            valid: false,
            error: `Minimum ${discount.minQuantity} items required`
        });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return res.status(400).json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    // Return valid discount info
    return res.json({
        valid: true,
        discount: {
            id: discount.id,
            code: discount.code,
            title: discount.title,
            type: discount.valueType === 'percentage' ? 'percent' : 'fixed',
            value: discount.rawValue,
            description: discount.description,
        },
    });
});

// Blog API endpoints
app.get('/api/admin/blogs', requireAdmin, (req, res) => {
    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.status === 'published').length,
        draft: blogs.filter(b => b.status === 'draft').length,
        totalWords: blogs.reduce((sum, b) => sum + (b.wordCount || 0), 0),
    };
    return res.json({ blogs, stats });
});

app.get('/api/admin/blogs/:id', requireAdmin, (req, res) => {
    const blog = blogs.find(b => b.id === req.params.id);
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    return res.json(blog);
});

app.post('/api/admin/blogs', requireAdmin, async (req, res) => {
    const { title, content, excerpt, tags, seoKeywords, status } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const newBlog = {
        id: `blog-${Date.now()}`,
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...',
        author: 'Trussers Team',
        publishedDate: new Date().toISOString(),
        status: status || 'draft',
        tags: tags || [],
        seoKeywords: seoKeywords || [],
        readingTime,
        wordCount,
        featured: false,
    };

    blogs.push(newBlog);
    await persistJsonFile(blogsPath, blogs);
    return res.json(newBlog);
});

app.put('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    const index = blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    const { title, content, excerpt, tags, seoKeywords, status, author, featured, coverImage, slug } = req.body;
    const wordCount = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : blogs[index].wordCount;
    const readingTime = Math.ceil(wordCount / 200);

    blogs[index] = {
        ...blogs[index],
        ...(title && { title }),
        ...(slug && { slug }),
        ...(title && !slug && { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }),
        ...(content && { content, wordCount, readingTime }),
        ...(excerpt && { excerpt }),
        ...(tags && { tags }),
        ...(seoKeywords && { seoKeywords }),
        ...(status && { status }),
        ...(author && { author }),
        ...(typeof featured === 'boolean' && { featured }),
        ...(coverImage !== undefined && { coverImage }),
    };

    await persistJsonFile(blogsPath, blogs);
    return res.json(blogs[index]);
});

// PATCH endpoint for partial blog updates
app.patch('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    const index = blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    const { title, content, excerpt, tags, seoKeywords, status, author, featured, coverImage, slug } = req.body;

    // Calculate word count and reading time if content is provided
    let wordCount = blogs[index].wordCount;
    let readingTime = blogs[index].readingTime;
    if (content) {
        wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
        readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Update blog with provided fields
    blogs[index] = {
        ...blogs[index],
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(title && !slug && { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }),
        ...(content !== undefined && { content, wordCount, readingTime }),
        ...(excerpt !== undefined && { excerpt }),
        ...(tags !== undefined && { tags }),
        ...(seoKeywords !== undefined && { seoKeywords }),
        ...(status !== undefined && { status }),
        ...(author !== undefined && { author }),
        ...(typeof featured === 'boolean' && { featured }),
        ...(coverImage !== undefined && { coverImage }),
        publishedDate: status === 'published' && blogs[index].status !== 'published'
            ? new Date().toISOString()
            : blogs[index].publishedDate,
    };

    await persistJsonFile(blogsPath, blogs);
    return res.json(blogs[index]);
});

app.delete('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    const index = blogs.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Blog not found' });
    }

    blogs.splice(index, 1);
    await persistJsonFile(blogsPath, blogs);
    return res.json({ success: true });
});

// Public blog endpoints
app.get('/api/blogs', (req, res) => {
    const publishedBlogs = blogs.filter(b => b.status === 'published');
    return res.json(publishedBlogs);
});

app.get('/api/blogs/:slug', (req, res) => {
    const blog = blogs.find(b => b.slug === req.params.slug && b.status === 'published');
    if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
    }
    return res.json(blog);
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

async function createRazorpayOrder({ amount, currency, receipt }) {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
        const error = new Error('Razorpay is not configured');
        error.code = 'RAZORPAY_UNCONFIGURED';
        throw error;
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount,
            currency,
            receipt,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.id) {
        const description = payload?.error?.description || payload?.message || 'Unable to create Razorpay order';
        const error = new Error(description);
        error.code = 'RAZORPAY_CREATE_FAILED';
        error.details = payload;
        throw error;
    }

    return { keyId, orderId: payload.id };
}

// Website Content API
app.get('/api/website-content', (req, res) => {
    res.json(websiteContent);
});

app.post('/api/checkout', async (req, res) => {
    const result = buildCheckoutPayload(req.body);
    if (result.errors) {
        return res.status(400).json({ error: 'Invalid payload', details: result.errors });
    }

    if (result.value.items.length === 0) {
        return res.status(400).json({ error: 'Order must include at least one item' });
    }

    const pricing = calculateOrderPricing(result.value.items);
    const sequence = getNextOrderSequence(orders);
    const orderId = crypto.randomUUID();
    const amountPaise = Math.round(pricing.total * 100);
    const currency = 'INR';
    let providerOrderId;
    let paymentAction;

    if (result.value.paymentMethod === 'razorpay') {
        try {
            const razorpayOrder = await createRazorpayOrder({
                amount: amountPaise,
                currency,
                receipt: orderId,
            });
            providerOrderId = razorpayOrder.orderId;
            paymentAction = {
                kind: 'razorpay',
                status: 'ready',
                keyId: razorpayOrder.keyId,
                orderId: providerOrderId,
                amount: amountPaise,
                currency,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to initialise Razorpay payment.';
            return res.status(503).json({ error: message });
        }
    }
    const sessionUser = getSessionUser(req);
    const shouldAttachUser = Boolean(sessionUser && !result.value.guestCheckout);

    const order = {
        id: orderId,
        sequence,
        orderNumber: `#${sequence}`,
        createdAt: new Date().toISOString(),
        customer: {
            ...result.value.customer,
            userId: shouldAttachUser ? sessionUser.id : undefined,
        },
        shipping: result.value.shipping,
        items: result.value.items,
        pricing,
        invoice: result.value.invoice,
        payment: {
            method: result.value.paymentMethod,
            status: 'pending',
            providerOrderId,
        },
    };

    orders = [...orders, order];
    await persistJsonFile(ordersPath, orders);

    if (shouldAttachUser) {
        const address = {
            id: crypto.randomUUID(),
            label: 'Recent delivery',
            ...result.value.shipping,
            lastUsedAt: new Date().toISOString(),
        };

        const orderSummary = {
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            total: order.pricing.total,
            paymentMethod: order.payment.method,
            paymentStatus: order.payment.status,
            items: order.items,
            shipping: address,
            invoice: order.invoice,
        };

        const updatedUser = {
            ...sessionUser,
            gstNumber: order.invoice?.gstNumber || sessionUser.gstNumber,
            addresses: [address, ...(sessionUser.addresses ?? [])],
            orders: [orderSummary, ...(sessionUser.orders ?? [])],
        };

        users = users.map((entry) => (entry.id === sessionUser.id ? updatedUser : entry));
        await persistJsonFile(usersPath, users);
    }

    if (result.value.paymentMethod !== 'razorpay') {
        try {
            await sendOrderReceiptEmail(order);
        } catch (error) {
            console.error('Order receipt email failed', error);
        }
    }

    return res.status(201).json({ order, paymentAction });
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((item) => item.id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
});

app.post('/api/checkout/razorpay/confirm', async (req, res) => {
    const orderId = normalizeString(req.body?.orderId, 'orderId', { required: true });
    const paymentId = normalizeString(req.body?.razorpayPaymentId, 'razorpayPaymentId', { required: true });
    const providerOrderId = normalizeString(req.body?.razorpayOrderId, 'razorpayOrderId', { required: true });
    const signature = normalizeString(req.body?.razorpaySignature, 'razorpaySignature', { required: true });

    if (orderId.error || paymentId.error || providerOrderId.error || signature.error) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: [orderId.error, paymentId.error, providerOrderId.error, signature.error].filter(Boolean),
        });
    }

    const index = orders.findIndex((item) => item.id === orderId.value);
    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[index];
    if (order.payment?.method !== 'razorpay') {
        return res.status(400).json({ error: 'Order is not a Razorpay payment' });
    }
    if (order.payment?.status === 'paid') {
        return res.json(order);
    }
    if (order.payment?.providerOrderId && order.payment.providerOrderId !== providerOrderId.value) {
        return res.status(400).json({ error: 'Razorpay order mismatch' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
        return res.status(503).json({ error: 'Razorpay is not configured' });
    }

    const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${providerOrderId.value}|${paymentId.value}`)
        .digest('hex');
    const provided = signature.value;
    if (expected.length !== provided.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) {
        return res.status(400).json({ error: 'Invalid Razorpay signature' });
    }

    const updated = {
        ...order,
        payment: {
            ...order.payment,
            status: 'paid',
            providerPaymentId: paymentId.value,
            providerOrderId: providerOrderId.value,
            providerSignature: signature.value,
            confirmedAt: new Date().toISOString(),
        },
    };

    orders = [...orders.slice(0, index), updated, ...orders.slice(index + 1)];
    await persistJsonFile(ordersPath, orders);

    if (updated.customer?.userId) {
        const userIndex = users.findIndex((entry) => entry.id === updated.customer.userId);
        if (userIndex !== -1) {
            const existingUser = users[userIndex];
            const nextOrders = (existingUser.orders ?? []).map((entry) =>
                entry.id === updated.id ? { ...entry, paymentStatus: updated.payment.status } : entry,
            );
            const nextUser = {
                ...existingUser,
                orders: nextOrders,
            };
            users = [...users.slice(0, userIndex), nextUser, ...users.slice(userIndex + 1)];
            await persistJsonFile(usersPath, users);
        }
    }

    try {
        await sendOrderReceiptEmail(updated);
    } catch (error) {
        console.error('Order receipt email failed', error);
    }

    return res.json(updated);
});

app.post('/api/checkout/razorpay/fail', async (req, res) => {
    const orderId = normalizeString(req.body?.orderId, 'orderId', { required: true });
    const reason = normalizeOptionalString(req.body?.reason, 'reason');

    if (orderId.error || reason.error) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: [orderId.error, reason.error].filter(Boolean),
        });
    }

    const index = orders.findIndex((item) => item.id === orderId.value);
    if (index === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[index];
    if (order.payment?.method !== 'razorpay') {
        return res.status(400).json({ error: 'Order is not a Razorpay payment' });
    }
    if (order.payment?.status === 'paid') {
        return res.json(order);
    }

    const updated = {
        ...order,
        payment: {
            ...order.payment,
            status: 'failed',
            failureReason: reason.value,
            failedAt: new Date().toISOString(),
        },
    };

    orders = [...orders.slice(0, index), updated, ...orders.slice(index + 1)];
    await persistJsonFile(ordersPath, orders);

    if (updated.customer?.userId) {
        const userIndex = users.findIndex((entry) => entry.id === updated.customer.userId);
        if (userIndex !== -1) {
            const existingUser = users[userIndex];
            const nextOrders = (existingUser.orders ?? []).map((entry) =>
                entry.id === updated.id ? { ...entry, paymentStatus: updated.payment.status } : entry,
            );
            const nextUser = {
                ...existingUser,
                orders: nextOrders,
            };
            users = [...users.slice(0, userIndex), nextUser, ...users.slice(userIndex + 1)];
            await persistJsonFile(usersPath, users);
        }
    }

    return res.json(updated);
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
