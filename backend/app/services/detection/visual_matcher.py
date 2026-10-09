import io
from typing import Dict, Any, Optional
import httpx
from PIL import Image
import imagehash

# In-memory cache for downloaded image hashes to optimize scan latency
IMAGE_HASH_CACHE = {}

async def fetch_and_hash_image(image_url: str, timeout: float = 3.5) -> Optional[imagehash.ImageHash]:
    """
    Asynchronously downloads an image from URL and computes perceptual hash (pHash).
    Falls back gracefully if URL is unreachable or invalid.
    """
    if not image_url:
        return None
    
    if image_url in IMAGE_HASH_CACHE:
        return IMAGE_HASH_CACHE[image_url]

    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DRP-Scanner/1.0"}
            response = await client.get(image_url, headers=headers)
            if response.status_code == 200:
                img_bytes = io.BytesIO(response.content)
                img = Image.open(img_bytes).convert('RGB')
                # Compute perceptual hash (pHash) which is invariant to slight scaling/color grading
                h = imagehash.phash(img)
                IMAGE_HASH_CACHE[image_url] = h
                return h
    except Exception:
        # Gracefully handle unreachable image hosts or timeouts
        return None
    return None

def compare_hashes(hash1: Optional[imagehash.ImageHash], hash2: Optional[imagehash.ImageHash]) -> Dict[str, Any]:
    """
    Computes visual similarity score (0-100) between two perceptual hashes.
    Hamming distance 0 = identical image. Distance <= 10 = extremely high visual cloning.
    """
    if hash1 is None or hash2 is None:
        return {
            "score": 0.0,
            "status": "IMAGE_UNAVAILABLE",
            "similarity_pct": 0.0,
            "details": "Could not retrieve one or both images for visual comparison."
        }
    
    # 64-bit hash Hamming distance
    distance = hash1 - hash2
    
    # Map distance: 0 -> 100%, 10 -> 80%, 20 -> 50%, >= 32 -> 0%
    if distance == 0:
        score = 100.0
    elif distance <= 6:
        score = round(100.0 - (distance * 3.5), 1)
    elif distance <= 16:
        score = round(78.0 - ((distance - 6) * 4.0), 1)
    elif distance <= 28:
        score = round(38.0 - ((distance - 16) * 2.5), 1)
    else:
        score = 0.0

    score = max(0.0, min(100.0, score))
    
    details = f"Visual match distance: {distance}/64."
    if score >= 85:
        details += " Critical: Strong visual cloning / direct logo reproduction detected."
    elif score >= 60:
        details += " Warning: High visual resemblance or cropped brand badge detected."

    return {
        "score": score,
        "status": "ANALYZED",
        "hamming_distance": distance,
        "similarity_pct": score,
        "details": details
    }
