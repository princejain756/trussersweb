import requests
from bs4 import BeautifulSoup

url = 'https://www.trusser.in/category/tote-bags'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all img tags
    images = soup.find_all('img')
    print(f"Total images found: {len(images)}")
    print("\nFirst 10 images:")
    for i, img in enumerate(images[:10]):
        print(f"\n{i+1}. Tag: {img.name}")
        print(f"   Classes: {img.get('class', [])}")
        print(f"   Src: {img.get('src', 'N/A')}")
        print(f"   Data-src: {img.get('data-src', 'N/A')}")
        print(f"   Alt: {img.get('alt', 'N/A')}")
    
    # Check for product containers
    print("\n\n=== Looking for product containers ===")
    common_selectors = [
        '.product',
        'li.product',
        '.product-item',
        'article.product',
        '[class*="product"]'
    ]
    
    for selector in common_selectors:
        elements = soup.select(selector)
        if elements:
            print(f"\nFound {len(elements)} elements with selector: {selector}")
            if elements:
                print(f"First element classes: {elements[0].get('class', [])}")
    
    # Print page title and some structure info
    print(f"\n\n=== Page Info ===")
    print(f"Title: {soup.title.string if soup.title else 'N/A'}")
    
    # Look for specific patterns
    products = soup.select('[class*="product"]')
    print(f"\nElements with 'product' in class: {len(products)}")
    
except Exception as e:
    print(f"Error: {str(e)}")
