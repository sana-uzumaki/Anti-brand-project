from typing import List, Dict, Any
import httpx

ITUNES_SEARCH_URL = "https://itunes.apple.com/search"

async def search_apple_app_store(brand_term: str, limit: int = 15) -> Dict[str, Any]:
    """
    Queries official Apple iTunes Search API for iOS / iPadOS applications.
    Handles network timeouts and errors gracefully.
    """
    params = {
        "term": brand_term,
        "entity": "software",
        "limit": limit
    }
    candidates: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(ITUNES_SEARCH_URL, params=params)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    candidates.append({
                        "platform": "Apple App Store",
                        "asset_type": "MOBILE_APP",
                        "name": item.get("trackName", ""),
                        "handle_or_id": item.get("bundleId", str(item.get("trackId", ""))),
                        "developer_or_publisher": item.get("artistName", item.get("sellerName", "")),
                        "icon_url": item.get("artworkUrl100", item.get("artworkUrl512", "")),
                        "external_url": item.get("trackViewUrl", ""),
                        "description": item.get("description", ""),
                        "rating": float(item.get("averageUserRating", 0.0) or 0.0),
                        "review_count": int(item.get("userRatingCount", 0) or 0),
                        "complaint_mentions": 0,
                        "sample_reviews": []
                    })
                return {
                    "source": "Apple App Store",
                    "status": "AVAILABLE",
                    "count": len(candidates),
                    "candidates": candidates
                }
    except Exception as e:
        return {
            "source": "Apple App Store",
            "status": "DEGRADED",
            "error": str(e),
            "count": 0,
            "candidates": []
        }

    return {
        "source": "Apple App Store",
        "status": "UNAVAILABLE",
        "count": 0,
        "candidates": []
    }
