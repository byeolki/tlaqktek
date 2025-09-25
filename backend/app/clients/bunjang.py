import httpx, urllib.parse

class BunjangAPI():
    async def get_autocomplete(self, query: str, suggestion_type: str = "product", version: int = 2):
        url = "https://api.bunjang.co.kr/api/1/search/suggests_keyword.json"
        encoded_query = urllib.parse.quote(query)

        params = {
            'v': version,
            'type': suggestion_type,
            'q': encoded_query
        }
        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ko,en;q=0.9',
            'origin': 'https://m.bunjang.co.kr',
            'referer': 'https://m.bunjang.co.kr/',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()

    async def search_items(self, query: str, page: int = 0, limit: int = 100):
        url = "https://api.bunjang.co.kr/api/1/find_v2.json"

        params = {
            'q': query,
            'order': 'score',
            'page': page,
            'n': limit,
            'stat_device': 'w',
            'stat_category_required': '1',
            'req_ref': 'search',
            'version': '5'
        }
        headers = {
            'accept': 'application/json',
            'accept-language': 'ko,en;q=0.9',
            'origin': 'https://m.bunjang.co.kr',
            'referer': 'https://m.bunjang.co.kr/',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()

    async def get_item_details(self, item_id: str, viewer_uid: int = -1):
        url = f"https://api.bunjang.co.kr/api/pms/v3/products-detail/{item_id}"

        params = {
            'viewerUid': viewer_uid
        }
        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ko,en;q=0.9',
            'origin': 'https://m.bunjang.co.kr',
            'referer': 'https://m.bunjang.co.kr/',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'x-bun-auth-token': ''
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
