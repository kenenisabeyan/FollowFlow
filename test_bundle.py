import urllib.request
import re

try:
    req = urllib.request.Request('https://follow-flow.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')
    js_files = re.findall(r'src="([^"]+\.js)"', html)
    print("Found JS files:", js_files)
    for js in js_files:
        url = 'https://follow-flow.vercel.app' + js
        data = urllib.request.urlopen(url, timeout=15).read().decode('utf-8', errors='ignore')
        matches = re.findall(r'https://[^"\'`\s]+render\.com[^"\'`\s]*', data)
        print(js, "matches:", set(matches))
except Exception as e:
    print("Error:", e)
