#!/usr/bin/env node

/**
 * Product Auto-Naming Script using OpenRouter API with Qwen Vision Model
 * 
 * This script analyzes product images and generates descriptive names for products
 * that currently have generic names like "Gift Bag 1", "Tote Bag 2", etc.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OPENROUTER_API_KEY = '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';
const MODEL = 'google/gemma-3-4b-it:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Paths
const CATEGORIES_PATH = path.join(__dirname, '../src/data/categories.json');
const PUBLIC_PATH = path.join(__dirname, '../public');

// Check if a product name is generic (contains just category + number)
function isGenericName(name) {
    // Matches patterns like "Category Name 1", "Category Name 10", etc.
    return /^[A-Za-z\s]+\d+$/.test(name.trim());
}

// Try to find image in multiple locations
function findImagePath(imagePath, productName, categorySlug) {
    const possiblePaths = [];

    // 1. Original path from categories.json
    possiblePaths.push(path.join(PUBLIC_PATH, imagePath));

    // 2. Try /products/ directory directly with the filename
    const filename = path.basename(imagePath);
    possiblePaths.push(path.join(PUBLIC_PATH, 'products', filename));

    // 3. Try /products/categories/[category]/ with the filename
    possiblePaths.push(path.join(PUBLIC_PATH, 'products', 'categories', categorySlug, filename));

    // 4. Try finding a similar file in /products/ based on category name patterns
    const productsDir = path.join(PUBLIC_PATH, 'products');
    if (fs.existsSync(productsDir)) {
        const files = fs.readdirSync(productsDir);
        const categoryKeywords = categorySlug.split('-').filter(w => w.length > 2);

        for (const file of files) {
            if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
                const fileLower = file.toLowerCase();
                // Check if any keyword from category matches the filename
                if (categoryKeywords.some(kw => fileLower.includes(kw))) {
                    possiblePaths.push(path.join(productsDir, file));
                }
            }
        }
    }

    // Return first existing path
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    return null;
}

// Convert image to base64
function imageToBase64(imagePath, productName, categorySlug) {
    try {
        const absolutePath = findImagePath(imagePath, productName, categorySlug);
        if (!absolutePath) {
            console.log(`  ⚠️ Image not found in any location`);
            return null;
        }
        console.log(`  📷 Found image: ${path.basename(absolutePath)}`);
        const imageBuffer = fs.readFileSync(absolutePath);
        const base64 = imageBuffer.toString('base64');
        const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
        const mimeType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.log(`  ⚠️ Error reading image: ${error.message}`);
        return null;
    }
}

// Call OpenRouter API to analyze image and generate name
async function generateProductName(imageBase64, categoryName, currentName) {
    const prompt = `You are a product naming expert for Trusser, a sustainable eco-friendly gift company that makes products from recycled materials.

Look at this product image and generate a short, catchy, and descriptive product name.

Category: ${categoryName}
Current generic name: ${currentName}

Rules for the new name:
1. Keep it SHORT (2-4 words maximum)
2. Make it descriptive and appealing
3. Focus on the key visual features (color, pattern, style, material appearance)
4. Use words that convey eco-friendliness when appropriate
5. Do NOT include numbers or generic words like "bag 1" or "item"
6. Make it unique and memorable

Examples of good names:
- "Rustic Olive Tote"
- "Ocean Blue Bottle Carrier"
- "Forest Green Portfolio"
- "Sunset Weave Coaster Set"
- "Eco Kraft Gift Box"

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
                            {
                                type: 'text',
                                text: prompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const newName = data.choices?.[0]?.message?.content?.trim();

        if (!newName) {
            throw new Error('No name generated');
        }

        return newName;
    } catch (error) {
        console.log(`  ❌ API Error: ${error.message}`);
        return null;
    }
}

// Main function
async function main() {
    console.log('🏷️  Trusser Product Auto-Naming Tool');
    console.log('====================================');
    console.log(`Using model: ${MODEL}`);
    console.log('');

    // Read categories.json
    let categories;
    try {
        const rawData = fs.readFileSync(CATEGORIES_PATH, 'utf8');
        categories = JSON.parse(rawData);
    } catch (error) {
        console.error('❌ Error reading categories.json:', error.message);
        process.exit(1);
    }

    // Count products to process
    let totalProducts = 0;
    let genericProducts = 0;

    for (const [slug, category] of Object.entries(categories)) {
        for (const product of category.products || []) {
            totalProducts++;
            if (isGenericName(product.name)) {
                genericProducts++;
            }
        }
    }

    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`🔄 Products with generic names: ${genericProducts}`);
    console.log('');

    if (genericProducts === 0) {
        console.log('✅ All products already have descriptive names!');
        return;
    }

    // Process each category
    let processed = 0;
    let updated = 0;
    let failed = 0;

    for (const [slug, category] of Object.entries(categories)) {
        const categoryGenericCount = (category.products || []).filter(p => isGenericName(p.name)).length;

        if (categoryGenericCount === 0) continue;

        console.log(`\n📁 ${category.name} (${categoryGenericCount} products to rename)`);
        console.log('─'.repeat(50));

        for (let i = 0; i < category.products.length; i++) {
            const product = category.products[i];

            if (!isGenericName(product.name)) {
                continue;
            }

            processed++;
            console.log(`\n[${processed}/${genericProducts}] Processing: ${product.name}`);

            // Get image as base64
            const imageBase64 = imageToBase64(product.image, product.name, slug);
            if (!imageBase64) {
                failed++;
                continue;
            }

            // Generate new name using AI
            const newName = await generateProductName(imageBase64, category.name, product.name);

            if (newName) {
                console.log(`  ✅ New name: "${newName}"`);
                categories[slug].products[i].name = newName;
                updated++;
            } else {
                failed++;
            }

            // Rate limiting - wait 4 seconds between API calls to avoid 429 errors
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    // Save updated categories.json
    console.log('\n');
    console.log('====================================');
    console.log('📊 Summary');
    console.log('====================================');
    console.log(`✅ Successfully renamed: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (updated > 0) {
        try {
            fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
            console.log('💾 categories.json updated successfully!');
        } catch (error) {
            console.error('❌ Error saving categories.json:', error.message);
        }
    }
}

// Run the script
main().catch(console.error);
