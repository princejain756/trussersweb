import requests
from bs4 import BeautifulSoup
import os
import json
from urllib.parse import urljoin, urlparse
import time

# Categories to scrape
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

# Base directories
PUBLIC_PRODUCTS_DIR = './public/products'
ASSETS_CATEGORIES_DIR = './src/assets/products/categories'

def get_existing_images():
    """Get list of existing images in public/products"""
    existing = set()
    if os.path.exists(PUBLIC_PRODUCTS_DIR):
        for file in os.listdir(PUBLIC_PRODUCTS_DIR):
            if file.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                existing.add(file)
    return existing

def extract_image_filename(url):
    """Extract filename from URL"""
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    return filename

def scrape_category_products(category_name, category_url):
    """Scrape product images from a category page"""
    print(f"\nScraping {category_name}...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(category_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find product images - try multiple selectors
        product_images = []
        
        # Common WooCommerce selectors
        selectors = [
            'img.attachment-woocommerce_thumbnail',
            'img.wp-post-image',
            '.product img',
            '.product-image img',
            '.woocommerce-loop-product__link img',
            'img[data-src]',
            'img.lazy'
        ]
        
        for selector in selectors:
            images = soup.select(selector)
            for img in images:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src:
                    # Handle relative URLs
                    if not src.startswith('http'):
                        src = urljoin(category_url, src)
                    
                    # Get alt text for product name
                    alt = img.get('alt', '')
                    product_images.append({
                        'url': src,
                        'alt': alt,
                        'filename': extract_image_filename(src)
                    })
        
        # Remove duplicates
        seen = set()
        unique_images = []
        for img in product_images:
            if img['url'] not in seen:
                seen.add(img['url'])
                unique_images.append(img)
        
        print(f"Found {len(unique_images)} product images")
        return unique_images
        
    except Exception as e:
        print(f"Error scraping {category_name}: {str(e)}")
        return []

def download_image(url, filepath):
    """Download an image from URL to filepath"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")
        return False

def main():
    # Get existing images
    existing_images = get_existing_images()
    print(f"Found {len(existing_images)} existing images in public/products")
    
    # Create base category directory
    os.makedirs(ASSETS_CATEGORIES_DIR, exist_ok=True)
    
    # Category data for JSON
    category_data = {}
    
    # Process each category
    for category_name, category_url in categories.items():
        # Create category directory
        category_dir = os.path.join(ASSETS_CATEGORIES_DIR, category_name)
        os.makedirs(category_dir, exist_ok=True)
        
        # Scrape products
        products = scrape_category_products(category_name, category_url)
        
        category_products = []
        
        # Process images
        for product in products:
            filename = product['filename']
            
            # Check if image exists in public/products
            if filename in existing_images:
                print(f"  ✓ Using existing image: {filename}")
                # Create symlink or copy reference
                category_products.append({
                    'name': product['alt'],
                    'image': f'/products/{filename}',
                    'source': 'existing'
                })
            else:
                # Download to category folder
                filepath = os.path.join(category_dir, filename)
                if not os.path.exists(filepath):
                    print(f"  ↓ Downloading: {filename}")
                    if download_image(product['url'], filepath):
                        category_products.append({
                            'name': product['alt'],
                            'image': f'/assets/products/categories/{category_name}/{filename}',
                            'source': 'downloaded'
                        })
                        time.sleep(0.5)  # Be nice to the server
                else:
                    print(f"  ✓ Already downloaded: {filename}")
                    category_products.append({
                        'name': product['alt'],
                        'image': f'/assets/products/categories/{category_name}/{filename}',
                        'source': 'cached'
                    })
        
        category_data[category_name] = {
            'name': category_name.replace('-', ' ').title(),
            'slug': category_name,
            'url': category_url,
            'products': category_products
        }
        
        print(f"Processed {len(category_products)} products for {category_name}")
    
    # Save category data to JSON
    output_file = './src/data/categories.json'
    with open(output_file, 'w') as f:
        json.dump(category_data, f, indent=2)
    
    print(f"\n✓ Category data saved to {output_file}")
    print(f"✓ Total categories processed: {len(category_data)}")

if __name__ == '__main__':
    main()
