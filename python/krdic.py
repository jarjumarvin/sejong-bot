from bs4 import BeautifulSoup
import requests

from concurrent import futures


BASE_URL = "https://krdict.korean.go.kr/eng/dicSearch/search?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord={q}&blockCount={amount}"

url = BASE_URL.format(q="test", amount=5)
r = requests.get(url, verify=False)
print(r.status_code)