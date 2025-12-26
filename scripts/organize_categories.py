import os
import shutil
import json

# Categories structure
categories = [
    'tote-bags',
    'corporate-gift-sets',
    'women-gift-sets',
    'kids-gifts-set',
    'bottles',
    'bottle-bags',
    'festive-bags',
    'posters',
    'laundry-bags',
    'table-mat-coasters',
    'cash-pouches',
    'luggage-tags',
    'picnic-bags',
    'passport-holders',
    'keychains',
    'notebooks',
    'pouches',
    'files-folders',
    'desk-mouse-pads',
    'laptop-sleeves',
]

# Base directories
PUBLIC_PRODUCTS_DIR = './public/products'
ASSETS_CATEGORIES_DIR = './src/assets/products/categories'

# Keyword mappings for automatic categorization
category_keywords = {
    'tote-bags': ['carry-bag', 'tote', 'shopping-bag'],
    'corporate-gift-sets': ['corporate', 'gift-set', 'business'],
    'women-gift-sets': ['women', 'ladies'],
    'kids-gifts-set': ['kids', 'children', 'unicorn', 'mermaid', 'panda', 'pixie', 'explorer', 'little'],
    'bottles': ['bottle', 't150b'],
    'bottle-bags': ['bottle-bag', 'bottle-holder', 'water-bottle'],
    'festive-bags': ['festive', 'wedding', 'marriage', 'thank-you', 'save-the-date', 'baby-shower'],
    'posters': ['poster'],
    'laundry-bags': ['laundry'],
    'table-mat-coasters': ['placemat', 'coaster', 'table-mat'],
    'cash-pouches': ['cash-pouch'],
    'luggage-tags': ['luggage-tag', 'tag'],
    'picnic-bags': ['picnic', 'caddy'],
    'passport-holders': ['passport'],
    'keychains': ['keychain'],
    'notebooks': ['notebook'],
    'pouches': ['pouch', 'art-pouch', 'pencil-pouch'],
    'files-folders': ['file', 'folder', 'document'],
    'desk-mouse-pads': ['desk', 'mouse-pad'],
    'laptop-sleeves': ['laptop-sleeve', 'laptop'],
}

# Special gift bag patterns
gift_bag_keywords = ['gift-bag', 'gift-bags']

def get_existing_images():
    """Get list of existing images in public/products"""
    existing = []
    if os.path.exists(PUBLIC_PRODUCTS_DIR):
        for file in os.listdir(PUBLIC_PRODUCTS_DIR):
            if file.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                existing.append(file)
    return sorted(existing)

def categorize_image(filename):
    """Automatically categorize an image based on filename"""
    filename_lower = filename.lower()
    
    # Check for gift bags first - they go to festive-bags
    for keyword in gift_bag_keywords:
        if keyword in filename_lower:
            return 'festive-bags'
    
    # Check other categories
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in filename_lower:
                return category
    
    return None

def create_category_structure():
    """Create category folders and organize images"""
    
    # Create base directory
    os.makedirs(ASSETS_CATEGORIES_DIR, exist_ok=True)
    
    # Get existing images
    existing_images = get_existing_images()
    print(f"Found {len(existing_images)} images in public/products\n")
    
    # Initialize category data
    category_data = {}
    uncategorized = []
    
    # Create category folders
    for category in categories:
        category_dir = os.path.join(ASSETS_CATEGORIES_DIR, category)
        os.makedirs(category_dir, exist_ok=True)
        category_data[category] = {
            'name': category.replace('-', ' ').title(),
            'slug': category,
            'products': []
        }
    
    # Categorize images
    for filename in existing_images:
        category = categorize_image(filename)
        
        if category:
            # Create symlink or note in category
            product_name = filename.rsplit('.', 1)[0].replace('-', ' ').title()
            category_data[category]['products'].append({
                'name': product_name,
                'image': f'/products/{filename}',
                'filename': filename
            })
            print(f"✓ {filename} → {category}")
        else:
            uncategorized.append(filename)
            print(f"? {filename} → uncategorized")
    
    # Create a mapping file
    mapping_file = os.path.join(ASSETS_CATEGORIES_DIR, 'image-mapping.json')
    with open(mapping_file, 'w') as f:
        json.dump({
            'categorized': category_data,
            'uncategorized': uncategorized
        }, f, indent=2)
    
    # Save category data
    output_file = './src/data/categories.json'
    os.makedirs('./src/data', exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(category_data, f, indent=2)
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for category in categories:
        count = len(category_data[category]['products'])
        if count > 0:
            print(f"{category}: {count} products")
    
    print(f"\nUncategorized: {len(uncategorized)} images")
    if uncategorized:
        print("\nUncategorized files:")
        for img in uncategorized[:20]:  # Show first 20
            print(f"  - {img}")
        if len(uncategorized) > 20:
            print(f"  ... and {len(uncategorized) - 20} more")
    
    print(f"\n✓ Category data saved to {output_file}")
    print(f"✓ Image mapping saved to {mapping_file}")

if __name__ == '__main__':
    create_category_structure()
