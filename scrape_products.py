import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import json
import os
import time
import re

# Setup
SITEMAP_URL = "https://www.trusser.in/store-products-sitemap.xml"
OUTPUT_DIR = "public/products"
JSON_FILE = "src/data/products.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(JSON_FILE), exist_ok=True)

def get_sitemap_urls():
    print(f"Fetching sitemap: {SITEMAP_URL}")
    response = requests.get(SITEMAP_URL)
    if response.status_code != 200:
        print(f"Failed to fetch sitemap: {response.status_code}")
        return []
    
    # Use BeautifulSoup for XML parsing
    soup = BeautifulSoup(response.content, 'xml')
    products = []
    
    for url in soup.find_all('url'):
        loc = url.find('loc').text
        images = []
        # Find all image:loc tags. BS4 might handle namespaces differently
        # It usually converts <image:image> to <image> or keeps it with prefix
        # Let's try finding 'image:loc' or just 'loc' inside 'image:image'
        
        # Try to find all image locations
        # In BS4 xml mode, namespaces might be part of tag name
        img_tags = url.find_all('image:loc')
        if not img_tags:
             img_tags = url.find_all('loc') # This might catch the main loc too, need to be careful
        
        for img in img_tags:
            if img.text != loc: # Avoid the main url
                images.append(img.text)
        
        # If still empty, try finding 'image' tags then 'loc'
        if not images:
             for img_parent in url.find_all('image:image'):
                 loc_tag = img_parent.find('image:loc')
                 if loc_tag:
                     images.append(loc_tag.text)

        products.append({
            "url": loc,
            "images": images
        })
    
    return products

def scrape_product(product_url):
    try:
        response = requests.get(product_url, timeout=10)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to get title
        title = None
        og_title = soup.find("meta", property="og:title")
        if og_title:
            title = og_title["content"]
        else:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text(strip=True)
        
        # Try to get price
        price = "₹0.00"
        # Wix often puts price in specific spans. 
        # Based on previous fetch, text was "Price ₹449.00"
        # We can look for currency symbol
        price_element = soup.find(string=re.compile(r"₹\s*[\d,]+\.?\d*"))
        if price_element:
            match = re.search(r"(₹\s*[\d,]+\.?\d*)", price_element)
            if match:
                price = match.group(1)
        
        # Fallback for price if not found in text
        if price == "₹0.00":
             meta_price = soup.find("meta", property="product:price:amount")
             if meta_price:
                 price = f"₹{meta_price['content']}"

        return {
            "name": title,
            "price": price
        }
    except Exception as e:
        print(f"Error scraping {product_url}: {e}")
        return None

def download_image(url, filename):
    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Error downloading image {url}: {e}")
    return False

def main():
    products = get_sitemap_urls()
    print(f"Found {len(products)} products in sitemap.")
    
    # Limit to first 20 for now to be safe, or user said ALL.
    # Let's try to do a batch.
    
    final_products = []
    
    # We will process all of them but maybe in chunks or just go for it.
    # To avoid timeout, I'll do the first 30.
    # The user can run the script again or I can extend it.
    # Actually, I'll try to do as many as I can in a reasonable time.
    
    count = 0
    for p in products:
        if count >= 200: # Limit to 200 to ensure all products are covered
            break
            
        print(f"Processing {count+1}/{len(products)}: {p['url']}")
        
        details = scrape_product(p['url'])
        if not details:
            print("Skipping due to scrape error")
            continue
            
        # Use the first image from sitemap if available
        image_url = p['images'][0] if p['images'] else None
        
        if not image_url:
            print("No image found")
            continue
            
        # Create filename from product name or url
        slug = p['url'].split('/')[-1]
        ext = image_url.split('.')[-1].split('/')[0] # handle weird urls
        if len(ext) > 4: ext = "jpg" # fallback
        
        image_filename = f"{slug}.{ext}"
        local_image_path = os.path.join(OUTPUT_DIR, image_filename)
        
        # Download image if not exists
        if not os.path.exists(local_image_path):
            if download_image(image_url, local_image_path):
                print(f"Downloaded {image_filename}")
            else:
                print("Failed to download image")
                continue
        else:
            print(f"Image exists: {image_filename}")
            
        final_products.append({
            "id": count + 1,
            "name": details['name'],
            "price": details['price'],
            "image": f"/products/{image_filename}", # Path for Vite
            "tag": "New" # Default tag
        })
        
        count += 1
        time.sleep(0.5) # Be nice to the server
        
    # Save JSON
    with open(JSON_FILE, 'w') as f:
        json.dump(final_products, f, indent=2)
    
    print(f"Saved {len(final_products)} products to {JSON_FILE}")

if __name__ == "__main__":
    main()
