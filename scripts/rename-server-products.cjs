#!/usr/bin/env node

/**
 * Server Products Naming Script using OpenRouter API
 * 
 * This script renames products in server/data/products.json 
 * using AI vision to generate descriptive names from product images.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OPENROUTER_API_KEY = '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';
const MODEL = 'google/gemma-3-4b-it:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Paths
const PRODUCTS_PATH = path.join(__dirname, '../server/data/products.json');
const PUBLIC_PATH = path.join(__dirname, '../public');

// Check if a product name is generic
function isGenericName(name) {
    // Matches patterns like "Gift bag 34", "Gift bags 13", "Gift Bag 01", etc.
    const patterns = [
        /^Gift\s*bag[s]?\s*\d+$/i,
        /^Gift\s*Bag\s*\d+$/i,
        /^[A-Za-z\s]+\d{2}$/,  // Ends with 2 digits
    ];
    return patterns.some(p => p.test(name.trim()));
}

// Convert image to base64
function imageToBase64(imagePath) {
    try {
        const absolutePath = path.join(PUBLIC_PATH, imagePath);
        if (!fs.existsSync(absolutePath)) {
            // Try without leading slash
            const altPath = path.join(PUBLIC_PATH, imagePath.replace(/^\//, ''));
            if (fs.existsSync(altPath)) {
                const imageBuffer = fs.readFileSync(altPath);
                const base64 = imageBuffer.toString('base64');
                const ext = path.extname(altPath).toLowerCase().replace('.', '');
                const mimeType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
                return `data:${mimeType};base64,${base64}`;
            }
            console.log(`  ⚠️ Image not found: ${imagePath}`);
            return null;
        }
        const imageBuffer = fs.readFileSync(absolutePath);
        const base64 = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase().replace('.', '');
        const mimeType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.log(`  ⚠️ Error reading image: ${error.message}`);
        return null;
    }
}

// Call OpenRouter API to generate name
async function generateProductName(imageBase64, currentName, category = '') {
    const prompt = `You are a product naming expert for Trusser, a sustainable eco-friendly gift company that makes products from recycled materials.

Look at this product image and generate a short, catchy, and descriptive product name.

Current name: ${currentName}
${category ? `Category: ${category}` : ''}

Rules for the new name:
1. Keep it SHORT (2-4 words maximum)
2. Make it descriptive and appealing
3. Focus on the key visual features (color, pattern, style)
4. Use words that convey eco-friendliness when appropriate
5. Do NOT include numbers like "34" or "08"
6. Make it unique and memorable

Examples of good names:
- "Lotus Bloom Tote"
- "Ocean Blue Carrier"  
- "Emerald Forest Pouch"
- "Sunset Wave Bag"
- "Golden Leaf Gift Bag"

Respond with ONLY the new product name, nothing else.`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://trusser.in',
                'X-Title': 'Trusser Product Naming'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageBase64 } }
                        ]
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        const newName = data.choices?.[0]?.message?.content?.trim();

        if (!newName) throw new Error('No name generated');

        // Clean up the name (remove quotes if present)
        return newName.replace(/^["']|["']$/g, '');
    } catch (error) {
        console.log(`  ❌ API Error: ${error.message}`);
        return null;
    }
}

// Main function
async function main() {
    console.log('🏷️  Server Products Naming Tool');
    console.log('================================');
    console.log(`Using model: ${MODEL}`);
    console.log('');

    // Read products.json
    let products;
    try {
        const rawData = fs.readFileSync(PRODUCTS_PATH, 'utf8');
        products = JSON.parse(rawData);
    } catch (error) {
        console.error('❌ Error reading products.json:', error.message);
        process.exit(1);
    }

    // Find products with generic names
    const genericProducts = products.filter(p => isGenericName(p.name));

    console.log(`📦 Total products: ${products.length}`);
    console.log(`🔄 Products with generic names: ${genericProducts.length}`);
    console.log('');

    if (genericProducts.length === 0) {
        console.log('✅ All products already have descriptive names!');
        return;
    }

    // Process each generic product
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        if (!isGenericName(product.name)) continue;

        const current = updated + failed + 1;
        console.log(`\n[${current}/${genericProducts.length}] Processing: ${product.name}`);
        console.log(`  📷 Image: ${product.image}`);

        // Get image as base64
        const imageBase64 = imageToBase64(product.image);
        if (!imageBase64) {
            failed++;
            continue;
        }

        // Generate new name
        const newName = await generateProductName(imageBase64, product.name, product.category);

        if (newName) {
            console.log(`  ✅ New name: "${newName}"`);
            products[i].name = newName;

            // Also update description if it contains the old name
            if (products[i].description && products[i].description.includes(product.name)) {
                products[i].description = products[i].description.replace(
                    new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
                    newName
                );
            }

            updated++;
        } else {
            failed++;
        }

        // Rate limiting - wait 4 seconds
        await new Promise(resolve => setTimeout(resolve, 4000));
    }

    // Save updated products
    console.log('\n');
    console.log('================================');
    console.log('📊 Summary');
    console.log('================================');
    console.log(`✅ Successfully renamed: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (updated > 0) {
        try {
            fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
            console.log('💾 server/data/products.json updated successfully!');
        } catch (error) {
            console.error('❌ Error saving products.json:', error.message);
        }
    }
}

// Run
main().catch(console.error);
