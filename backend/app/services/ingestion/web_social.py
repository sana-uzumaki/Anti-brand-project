import re
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup

DUCKDUCKGO_LITE_URL = "https://lite.duckduckgo.com/lite/"

async def dork_social_profiles(brand_term: str, target_social: str = "twitter.com", limit: int = 10) -> Dict[str, Any]:
    """
    Performs search dorking (e.g. site:twitter.com/{brand} or site:instagram.com)
    to discover real public social media profiles without needing paid API keys.
    """
    query = f"site:{target_social} {brand_term}"
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    candidates: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(DUCKDUCKGO_LITE_URL, data={"q": query}, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                links = soup.find_all("a", class_="result-link")
                snippets = soup.find_all("td", class_="result-snippet")

                for idx, a_tag in enumerate(links[:limit]):
                    href = a_tag.get("href", "")
                    title = a_tag.get_text(strip=True)
                    snippet = snippets[idx].get_text(strip=True) if idx < len(snippets) else ""

                    # Extract username from url
                    handle = href.replace(f"https://{target_social}/", "").split("/")[0].split("?")[0]
                    if not handle or handle in ["explore", "search", "home", "intent"]:
                        continue

                    platform_name = "X (Twitter)" if "twitter" in target_social else "Instagram"
                    candidates.append({
                        "platform": platform_name,
                        "asset_type": "SOCIAL_PROFILE",
                        "name": title,
                        "handle_or_id": f"@{handle}",
                        "developer_or_publisher": f"{platform_name} Account",
                        "icon_url": "", # Avatars extracted dynamically or fallback
                        "external_url": href,
                        "description": snippet,
                        "rating": 0.0,
                        "review_count": 0,
                        "complaint_mentions": 0,
                        "sample_reviews": []
                    })

                return {
                    "source": f"Social Dorker ({target_social})",
                    "status": "AVAILABLE",
                    "count": len(candidates),
                    "candidates": candidates
                }
    except Exception as e:
        return {
            "source": f"Social Dorker ({target_social})",
            "status": "DEGRADED",
            "error": str(e),
            "count": 0,
            "candidates": []
        }

    return {
        "source": f"Social Dorker ({target_social})",
        "status": "UNAVAILABLE",
        "count": 0,
        "candidates": []
    }
