from typing import List, Dict, Any
import httpx

REDDIT_SUBREDDIT_SEARCH = "https://www.reddit.com/subreddits/search.json"

async def search_reddit_communities(brand_term: str, limit: int = 15) -> Dict[str, Any]:
    """
    Searches public Reddit API for subreddits and communities imitating or referencing brand.
    No auth required, handles rate limits gracefully.
    """
    params = {
        "q": brand_term,
        "limit": limit
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DRP-Shield/1.0"
    }
    candidates: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(REDDIT_SUBREDDIT_SEARCH, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                children = data.get("data", {}).get("children", [])
                for item in children:
                    sub_data = item.get("data", {})
                    name = sub_data.get("display_name_prefixed", f"r/{sub_data.get('display_name', '')}")
                    icon = sub_data.get("community_icon") or sub_data.get("icon_img") or ""
                    # Clean Reddit icon url formatting
                    if "?" in icon:
                        icon = icon.split("?")[0]
                    
                    desc = sub_data.get("public_description") or sub_data.get("title") or ""
                    subscribers = sub_data.get("subscribers", 0)

                    candidates.append({
                        "platform": "Reddit",
                        "asset_type": "SOCIAL_PROFILE",
                        "name": sub_data.get("title") or name,
                        "handle_or_id": name,
                        "developer_or_publisher": f"{subscribers} members",
                        "icon_url": icon,
                        "external_url": f"https://reddit.com/{name}",
                        "description": desc,
                        "rating": 0.0,
                        "review_count": subscribers,
                        "complaint_mentions": 0,
                        "sample_reviews": []
                    })

                return {
                    "source": "Reddit Public API",
                    "status": "AVAILABLE",
                    "count": len(candidates),
                    "candidates": candidates
                }
    except Exception as e:
        return {
            "source": "Reddit Public API",
            "status": "DEGRADED",
            "error": str(e),
            "count": 0,
            "candidates": []
        }

    return {
        "source": "Reddit Public API",
        "status": "UNAVAILABLE",
        "count": 0,
        "candidates": []
    }
