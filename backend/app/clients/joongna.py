import httpx, urllib.parse

class JoongnaAPI():
    async def get_autocomplete(self, keyword: str, keyword_count: int = 10):
        url = "https://search-api.joongna.com/v25/search/autocomplete/keyword"

        headers = {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'ko,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://web.joongna.com',
            'os-type': '2',
            'referer': 'https://web.joongna.com/',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        }
        data = {
            "keyword": keyword,
            "keywordCnt": keyword_count
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.json()

    async def search_items(self, query: str, build_id: str = "IbsrShCh_D7Jq0fPM02Yw"):
        encoded_query = urllib.parse.quote(query)
        url = f"https://web.joongna.com/_next/data/{build_id}/search/{encoded_query}.json"

        params = {
            'keywordSource': 'SUGGESTED_KEYWORD',
            'keyword': query
        }
        headers = {
            'accept': '*/*',
            'accept-language': 'ko,en;q=0.9',
            'referer': f'https://web.joongna.com/search/{encoded_query}',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'x-nextjs-data': '1'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()

    async def get_item_details(self, item_id: str, build_id: str = "IbsrShCh_D7Jq0fPM02Yw"):
        encoded_product_seq = urllib.parse.quote(item_id)
        url = f"https://web.joongna.com/_next/data/{build_id}/product/{encoded_product_seq}.json"

        params = {
            'productSeq': item_id
        }
        headers = {
            'accept': '*/*',
            'accept-language': 'ko,en;q=0.9',
            'referer': 'https://web.joongna.com/',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'x-nextjs-data': '1'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
