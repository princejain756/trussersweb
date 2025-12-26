import requests
from bs4 import BeautifulSoup
import os
import json
import time
from urllib.parse import urljoin, urlparse
import re

# Categories to download
categories = {
    'tote-bags': 'https://www.trusser.in/category/tote-bags',
    'corporate-gift-sets': 'https://www.trusser.in/category/corporate-gift-sets',
    'women-gift-sets': 'https://www.trusser.in/category/women-gift-sets',
    'kids-gifts-set': 'https://www.trusser.in/category/kids-gifts-set',
    'bottles': 'https://www.trusser.in/category/bottles',
    'bottle-bags': 'https://www.trusser.in/category/bottle-bags',
    'festive-bags': 'https://www.trusser.in/category/festive-bags',
    'posters': 'https://www.trusser.in/category/posters',
    'laundry-bags': 'https://www.trusser.in/category/laundry-bags',
    'table-mat-coasters': 'https://www.trusser.in/category/table-mat-coasters',
    'cash-pouches': 'https://www.trusser.in/category/cash-pouches',
    'luggage-tags': 'https://www.trusser.in/category/luggage-tags',
    'picnic-bags': 'https://www.trusser.in/category/picnic-bags',
    'passport-holders': 'https://www.trusser.in/category/passport-holders',
    'keychains': 'https://www.trusser.in/category/keychains',
    'notebooks': 'https://www.trusser.in/category/notebooks',
    'pouches': 'https://www.trusser.in/category/pouches',
    'files-folders': 'https://www.trusser.in/category/files-folders',
    'desk-mouse-pads': 'https://www.trusser.in/category/desk-mouse-pads',
    'laptop-sleeves': 'https://www.trusser.in/category/laptop-sleeves',
}

ASSETS_CATEGORIES_DIR = './src/assets/products/categories'
PUBLIC_PRODUCTS_DIR = './public/products'

def sanitize_filename(name):
    """Convert product name to filename"""
    name = name.lower()
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'[-\s]+', '-', name)
    return name.strip('-')

def download_image(url, filepath):
    """Download an image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer': 'https://www.trusser.in/'
        }
        
        response = requests.get(url, headers=headers, timeout=15, stream=True)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except Exception as e:
        print(f"  ✗ Error downloading: {str(e)}")
        return False

def scrape_category_with_api(category_name, category_url):
    """Try to scrape using the page source and extract image URLs"""
    print(f"\n{'='*60}", flush=True)
    print(f"Processing: {category_name}", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"Fetching page...", flush=True)
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.trusser.in/',
        }
        
        response = requests.get(category_url, headers=headers, timeout=15)
        response.raise_for_status()
        print(f"Page loaded successfully", flush=True)
        
        # Extract all image URLs from the page
        image_urls = set()
        
        # Look for Wix static image URLs in the HTML
        wix_pattern = r'(https://static\.wixstatic\.com/media/[a-zA-Z0-9_~\-]+\.(?:jpg|jpeg|png|webp))'
        matches = re.findall(wix_pattern, response.text)
        
        # Filter out small images (likely icons/logos)
        for url in matches:
            # Skip very small images (usually logos/icons)
            if 'w_49' not in url and 'w_39' not in url and 'h_49' not in url and 'h_39' not in url and 'w_54' not in url:
                image_urls.add(url)
        
        # Convert to list
        image_urls = list(image_urls)
        
        print(f"Found {len(image_urls)} potential product images", flush=True)
        
        # Create category directory
        category_dir = os.path.join(ASSETS_CATEGORIES_DIR, category_name)
        os.makedirs(category_dir, exist_ok=True)
        
        products = []
        downloaded_count = 0
        
        for idx, img_url in enumerate(image_urls, 1):
            # Get extension from URL
            ext = img_url.split('.')[-1].split('?')[0].split('/')[0]
            
            # Generate filename
            filename = f"{category_name}-{idx}.{ext}"
            filepath = os.path.join(category_dir, filename)
            
            # Check if already exists in public/products
            existing_path = os.path.join(PUBLIC_PRODUCTS_DIR, filename)
            if os.path.exists(existing_path):
                print(f"  [{idx}/{len(image_urls)}] ✓ Exists in public/products: {filename}", flush=True)
                products.append({
                    'name': f"{category_name.replace('-', ' ').title()} {idx}",
                    'image': f'/products/{filename}',
                    'filename': filename
                })
                continue
            
            # Check if already downloaded
            if os.path.exists(filepath):
                print(f"  [{idx}/{len(image_urls)}] ✓ Already downloaded: {filename}", flush=True)
                products.append({
                    'name': f"{category_name.replace('-', ' ').title()} {idx}",
                    'image': f'/assets/products/categories/{category_name}/{filename}',
                    'filename': filename
                })
                continue
            
            # Download
            print(f"  [{idx}/{len(image_urls)}] ↓ Downloading: {filename}", flush=True)
            if download_image(img_url, filepath):
                downloaded_count += 1
                products.append({
                    'name': f"{category_name.replace('-', ' ').title()} {idx}",
                    'image': f'/assets/products/categories/{category_name}/{filename}',
                    'filename': filename
                })
                time.sleep(0.5)  # Be polite to the server
        
        print(f"\n✓ Category complete: {len(products)} products ({downloaded_count} newly downloaded)", flush=True)
        
        return {
            'name': category_name.replace('-', ' ').title(),
            'slug': category_name,
            'url': category_url,
            'products': products
        }
        
    except Exception as e:
        print(f"✗ Error processing {category_name}: {str(e)}")
        return {
            'name': category_name.replace('-', ' ').title(),
            'slug': category_name,
            'url': category_url,
            'products': []
        }

def main():
    print("="*60, flush=True)
    print("Trusser Category Image Downloader", flush=True)
    print("="*60, flush=True)
    print(f"Processing {len(categories)} categories...\n", flush=True)
    
    # Create base directory
    os.makedirs(ASSETS_CATEGORIES_DIR, exist_ok=True)
    
    # Process each category
    all_categories = {}
    
    for idx, (category_name, category_url) in enumerate(categories.items(), 1):
        print(f"\n[{idx}/{len(categories)}] Starting {category_name}...", flush=True)
        category_data = scrape_category_with_api(category_name, category_url)
        all_categories[category_name] = category_data
        time.sleep(1)  # Be nice to the server between categories
    
    # Save category data
    output_file = './src/data/categories.json'
    os.makedirs('./src/data', exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(all_categories, f, indent=2)
    
    # Print final summary
    print("\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    
    total_products = 0
    for category_name, category_data in all_categories.items():
        count = len(category_data['products'])
        total_products += count
        if count > 0:
            print(f"{category_name}: {count} products")
    
    print(f"\n✓ Total products across all categories: {total_products}")
    print(f"✓ Category data saved to {output_file}")
    print(f"✓ Images saved to {ASSETS_CATEGORIES_DIR}")

if __name__ == '__main__':
    main()
