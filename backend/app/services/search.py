from typing import List, Optional
from app.schemas.item import ItemDetail, ItemSearchResponse, GetAutocompleteResponse
from app.clients.bunjang import BunjangAPI
from app.clients.joongna import JoongnaAPI
from app.intelligence.pipelines import ExaonePipeline

class SearchService:
    def __init__(self):
        self.bunjang_api = BunjangAPI()
        self.joongna_api = JoongnaAPI()

        self.exaone_pipeline = ExaonePipeline()

    async def get_autocomplete(self, query: str, limit: int=10) -> GetAutocompleteResponse:
        joongna_response = await self.joongna_api.get_autocomplete(query)
        joongna_autocomplete = [keyword_data["keyword"] for keyword_data in joongna_response["data"]["autoCompleteItemList"]]

        bunjang_response = await self.bunjang_api.get_autocomplete(query)
        bunjang_autocomplete = [keyword_data["name"] for keyword_data in bunjang_response["keywords"]]

        autocomplete = joongna_autocomplete + bunjang_autocomplete
        autocomplete = list(set(autocomplete))

        return GetAutocompleteResponse(
            keywords=autocomplete[:limit],
            keyword_count=min(limit, len(autocomplete))
        )

    async def search_items(
        self,
        query: str,
        platform: str = "all",
        min_price: Optional[int] = None,
        max_price: Optional[int] = None
    ) -> ItemSearchResponse:
        items = []

        if platform == "all":
            bunjang_items = await self._search_bunjang(query, min_price, max_price)
            joongna_items = await self._search_joongna(query, min_price, max_price)
            items = bunjang_items + joongna_items
        elif platform == "bunjang":
            items = await self._search_bunjang(query, min_price, max_price)
        elif platform == "joongna":
            items = await self._search_joongna(query, min_price, max_price)

        return ItemSearchResponse(
            items=items,
            item_count=len(items),
            query=query,
            platform=platform
        )

    async def _get_item_tags(self, item_id: str, platform: str) -> List[str]:
        if platform == "joongna":
            response = await self.joongna_api.get_item_details(item_id)
            item_data = {
                "title": response['pageProps']["dehydratedState"]["queries"][1]["state"]["data"]["data"]["productTitle"],
                "description": response['pageProps']["dehydratedState"]["queries"][1]["state"]["data"]["data"]["productDescription"],
                "category": response['pageProps']["dehydratedState"]["queries"][1]["state"]["data"]["data"]["categoryName"],
                "item_tags": " / ".join(response['pageProps']["dehydratedState"]["queries"][1]["state"]["data"]["data"]["labels"])
            }
        elif platform == "bunjang":
            response = await self.bunjang_api.get_item_details(item_id)

            trade_method = response["data"]["product"]["trade"]
            item_tags = []
            if trade_method["freeShipping"]:
                item_tags += ["택배 거래", "무료배송"]
            elif "shippingSpecs" in trade_method:
                for method in trade_method["shippingSpecs"].keys():
                    if method == "CU_THRIFTY":
                        item_tags.append("CU 알뜰택배 거래")
                    elif method == "GS_HALF_PRICE":
                        item_tags.append("GS 반값 거래")
                    else:
                        item_tags.append("택배 거래")
            if trade_method["inPerson"]:
                item_tags.append("직거래")

            item_condition = {
                "NEW": "새상품",
                "LIKE_NEW": "사용감 없음",
                "LIGHTLY_USED": "사용감 적음",
                "HEAVILY_USED": "사용감 많음",
                "DAMAGED": "고장/파손 상품"
            }
            item_tags.append(item_condition[response["data"]["product"]["condition"]])

            item_data = {
                "title": response["data"]["product"]["name"],
                "description": response["data"]["product"]["description"],
                "category": response["data"]["product"]["category"]["name"],
                "item_tags": " / ".join(item_tags)
            }

        # return await self.exaone_pipeline.generate_tag(item_data)
        return item_data["item_tags"].split(" / ")

    async def _search_joongna(
        self,
        query: str,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None
    ) -> List[ItemDetail]:
        response = await self.joongna_api.search_items(query)
        items = response["pageProps"]["dehydratedState"]["queries"][2]["state"]["data"]["data"]["items"]

        filtered_items = []
        for item in items:
            if min_price and item['price'] < min_price:
                continue
            if max_price and item['price'] > max_price:
                continue

            item_data = {
                "item_id": str(item["seq"]),
                "platform": "joongna",
                "name": item["title"],
                "price": int(item["price"]),
                "thumbnail": item["url"],
                "tags": await self._get_item_tags(str(item["seq"]), "joongna")
            }
            filtered_items.append(item_data)
        return filtered_items


    async def _search_bunjang(
        self,
        query: str,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None
    ) -> List[ItemDetail]:
        response = await self.bunjang_api.search_items(query)
        items = response['list']

        filtered_items = []
        for item in items:
            if "ad" not in item or not item["ad"]:
                continue
            if min_price and item['price'] < min_price:
                continue
            if max_price and item['price'] > max_price:
                continue

            item_data = {
                "item_id": str(item["pid"]),
                "platform": "bunjang",
                "name": item["name"],
                "price": int(item["price"]),
                "thumbnail": item["product_image"],
                "tags": await self._get_item_tags(str(item["pid"]), "bunjang")
            }
            filtered_items.append(item_data)
        return filtered_items

search_service = SearchService()
