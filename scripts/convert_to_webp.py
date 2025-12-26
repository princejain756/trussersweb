from PIL import Image
import os
import json
from pathlib import Path

# Directories
CATEGORIES_DIR = './public/products/categories'
CATEGORIES_JSON = './src/data/categories.json'

def convert_to_webp(image_path, quality=95):
    """Convert an image to WebP format with high quality"""
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Convert RGBA to RGB if necessary (WebP supports both, but RGB is smaller)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create a white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Create WebP filename
        webp_path = str(image_path).rsplit('.', 1)[0] + '.webp'
        
        # Save as WebP with high quality
        img.save(webp_path, 'WebP', quality=quality, method=6)
        
        # Get file sizes for comparison
        original_size = os.path.getsize(image_path)
        webp_size = os.path.getsize(webp_path)
        reduction = ((original_size - webp_size) / original_size) * 100
        
        print(f"  ✓ {os.path.basename(image_path)} → {os.path.basename(webp_path)} ({reduction:.1f}% smaller)")
        
        # Remove original file
        os.remove(image_path)
        
        return webp_path, os.path.basename(webp_path)
    
    except Exception as e:
        print(f"  ✗ Error converting {image_path}: {str(e)}")
        return None, None

def process_category_images():
    """Process all category images"""
    print("="*60)
    print("Converting Category Images to WebP")
    print("="*60)
    
    total_converted = 0
    total_skipped = 0
    
    # Walk through all category folders
    for root, dirs, files in os.walk(CATEGORIES_DIR):
        for file in files:
            # Skip if already WebP or if it's the JSON mapping file
            if file.endswith('.webp') or file.endswith('.json'):
                continue
            
            # Only process image files
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(root, file)
                category = os.path.basename(root)
                
                print(f"\n[{category}] Converting {file}")
                webp_path, webp_filename = convert_to_webp(image_path, quality=95)
                
                if webp_path:
                    total_converted += 1
                else:
                    total_skipped += 1
    
    print("\n" + "="*60)
    print(f"✓ Converted: {total_converted} images")
    print(f"✗ Skipped: {total_skipped} images")
    print("="*60)
    
    return total_converted

def update_categories_json():
    """Update categories.json to use WebP paths"""
    print("\nUpdating categories.json with WebP paths...")
    
    # Read categories.json
    with open(CATEGORIES_JSON, 'r') as f:
        categories = json.load(f)
    
    updated_count = 0
    
    # Update all image paths to .webp
    for category_key, category_data in categories.items():
        for product in category_data.get('products', []):
            if 'image' in product:
                original_image = product['image']
                
                # Replace extension with .webp
                for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']:
                    if original_image.endswith(ext):
                        product['image'] = original_image.rsplit('.', 1)[0] + '.webp'
                        updated_count += 1
                        break
                
                # Update filename too
                if 'filename' in product:
                    for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']:
                        if product['filename'].endswith(ext):
                            product['filename'] = product['filename'].rsplit('.', 1)[0] + '.webp'
                            break
    
    # Write back
    with open(CATEGORIES_JSON, 'w') as f:
        json.dump(categories, f, indent=2)
    
    print(f"✓ Updated {updated_count} product image paths to WebP")

def main():
    # Check if PIL is available
    try:
        from PIL import Image
    except ImportError:
        print("Error: Pillow library not found. Installing...")
        import subprocess
        subprocess.run(['pip3', 'install', 'Pillow'], check=True)
        print("✓ Pillow installed successfully")
    
    # Convert images
    converted = process_category_images()
    
    if converted > 0:
        # Update JSON
        update_categories_json()
        print("\n✓ All images converted to WebP format!")
    else:
        print("\n✓ No images needed conversion")

if __name__ == '__main__':
    main()
