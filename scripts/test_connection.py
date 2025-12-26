import requests
import sys

url = 'https://www.trusser.in/category/tote-bags'

print(f"Testing connection to: {url}", flush=True)
print("Sending request...", flush=True)

try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Response status: {response.status_code}", flush=True)
    print(f"Content length: {len(response.content)} bytes", flush=True)
    print(f"First 500 chars:\n{response.text[:500]}", flush=True)
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}", flush=True)
    sys.exit(1)
