#!/usr/bin/env node

/**
 * Product Data Sync Script
 * 
 * This script syncs categories.json with the better-organized data from image-mapping.json
 * which already has descriptive product names derived from filenames.
 */

const fs = require('fs');
const path = require('path');

// Paths
const CATEGORIES_PATH = path.join(__dirname, '../src/data/categories.json');
const IMAGE_MAPPING_PATH = path.join(__dirname, '../public/products/categories/image-mapping.json');

function main() {
    console.log('🔄 Syncing Product Data');
    console.log('========================');
    console.log('');

    // Read both files
    let categories, imageMapping;

    try {
        categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
        console.log('✅ Loaded categories.json');
    } catch (error) {
        console.error('❌ Error reading categories.json:', error.message);
        process.exit(1);
    }

    try {
        imageMapping = JSON.parse(fs.readFileSync(IMAGE_MAPPING_PATH, 'utf8'));
        console.log('✅ Loaded image-mapping.json');
    } catch (error) {
        console.error('❌ Error reading image-mapping.json:', error.message);
        process.exit(1);
    }

    const mappedData = imageMapping.categorized;

    let totalUpdated = 0;

    // For each category in categories.json, check if there's better data in image-mapping
    for (const [slug, category] of Object.entries(categories)) {
        if (!mappedData[slug]) {
            console.log(`⏩ Skipping ${slug} - not in image-mapping.json`);
            continue;
        }

        const mappedProducts = mappedData[slug].products || [];

        // Filter to only unique webp products (avoid duplicates from jpg/png versions)
        const webpProducts = mappedProducts.filter(p =>
            p.filename.endsWith('.webp') &&
            !p.name.match(/\d+$/) // Exclude names that still end in numbers
        );

        if (webpProducts.length === 0) {
            console.log(`⏩ Skipping ${slug} - no improved names available`);
            continue;
        }

        console.log(`\n📁 ${category.name}:`);
        console.log(`   Current products: ${category.products.length}`);
        console.log(`   Available from mapping: ${webpProducts.length}`);

        // Replace products with better-named ones
        categories[slug].products = webpProducts.map(p => ({
            name: p.name,
            image: p.image,
            filename: p.filename
        }));

        totalUpdated++;
        console.log(`   ✅ Updated with ${webpProducts.length} products`);
    }

    console.log('\n========================');
    console.log(`📊 Updated ${totalUpdated} categories`);

    if (totalUpdated > 0) {
        try {
            fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
            console.log('💾 categories.json saved successfully!');
        } catch (error) {
            console.error('❌ Error saving categories.json:', error.message);
        }
    }
}

main();
