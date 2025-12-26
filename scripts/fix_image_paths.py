import json

# Read the existing categories.json
with open('./src/data/categories.json', 'r') as f:
    categories = json.load(f)

# Update all image paths to use /products/categories instead of /assets/products/categories
for category_key, category_data in categories.items():
    for product in category_data.get('products', []):
        if 'image' in product:
            # Replace /assets/products/categories with /products/categories
            product['image'] = product['image'].replace('/assets/products/categories', '/products/categories')

# Write back the updated categories.json
with open('./src/data/categories.json', 'w') as f:
    json.dump(categories, f, indent=2)

print("✓ Updated all image paths to use public folder")
print(f"✓ Total categories: {len(categories)}")
total_products = sum(len(cat.get('products', [])) for cat in categories.values())
print(f"✓ Total products: {total_products}")
