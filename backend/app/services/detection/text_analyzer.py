import re
from typing import Dict, Any, List

SCAM_INTENT_PATTERNS = [
    (r"\b(official\s+support|customer\s+support|helpdesk|support\s+desk|customer\s+service)\b", 40, "Claims official support / helpdesk status"),
    (r"\b(dm\s+for|send\s+dm|inbox\s+us|direct\s+message\s+to\s+resolve)\b", 35, "Solicits direct messages for resolution"),
    (r"\b(airdrop|giveaway|claim\s+reward|claim\s+bonus|free\s+crypto|free\s+tokens|prize)\b", 45, "Offers airdrop, giveaway, or free claims"),
    (r"\b(wallet\s+connect|seed\s+phrase|private\s+key|recovery\s+phrase|validate\s+wallet)\b", 55, "Urges wallet connection or key verification"),
    (r"\b(account\s+suspended|security\s+alert|urgent\s+action|unauthorized\s+login)\b", 30, "Creates artificial panic/urgency"),
    (r"\b(t\.me/|telegram\.me/|whatsapp\.com|wa\.me/|bit\.ly/|tinyurl\.com/)\b", 25, "Contains high-risk redirect or messaging links")
]

def analyze_description_and_intent(brand_name: str, text: str) -> Dict[str, Any]:
    """
    Analyzes profile bio or app description for brand impersonation intent,
    suspicious keywords, and deceptive phrasing.
    """
    if not text:
        return {
            "score": 0.0,
            "matched_patterns": [],
            "mentions_brand": False,
            "details": "No description or bio provided."
        }

    text_lower = text.lower()
    brand_lower = brand_name.lower()
    mentions_brand = brand_lower in text_lower

    accumulated_score = 0.0
    matched_flags: List[str] = []

    if mentions_brand:
        accumulated_score += 20.0
        matched_flags.append(f"Explicitly references brand name '{brand_name}'")

    for pattern, weight, reason in SCAM_INTENT_PATTERNS:
        if re.search(pattern, text_lower):
            accumulated_score += weight
            matched_flags.append(reason)

    # Cap score at 100
    final_score = min(round(accumulated_score, 1), 100.0)

    return {
        "score": final_score,
        "matched_patterns": matched_flags,
        "mentions_brand": mentions_brand,
        "details": "; ".join(matched_flags) if matched_flags else "Standard or benign description text."
    }
