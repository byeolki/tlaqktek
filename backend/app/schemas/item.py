from pydantic import BaseModel
from typing import List

class GetAutocompleteResponse(BaseModel):
    keywords: List[str]
    keyword_count: int

class ItemDetail(BaseModel):
    item_id: str
    platform: str
    name: str
    price: int
    thumbnail: str
    tags: List[str]

class ItemSearchResponse(BaseModel):
    items: List[ItemDetail]
    item_count: int
    query: str
    platform: str
