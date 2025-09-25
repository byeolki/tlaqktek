from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.item import GetAutocompleteResponse, ItemSearchResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.services.search import search_service

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("/autocomplete", response_model=GetAutocompleteResponse)
async def get_autocomplete(
    query: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(10, ge=1, le=100)
):
    response = await search_service.get_autocomplete(query, limit)
    return response

@router.get("/search", response_model=ItemSearchResponse)
async def search_items(
    query: str = Query(..., min_length=1, max_length=100),
    platform: Optional[str] = Query("all", pattern="^(bunjang|joonggonara|all)$"),
    min_price: Optional[int] = Query(None, ge=0),
    max_price: Optional[int] = Query(None, ge=0),
    current_user: User = Depends(get_current_user)
):
    response = await search_service.search_items(query, platform, min_price, max_price)
    return response
