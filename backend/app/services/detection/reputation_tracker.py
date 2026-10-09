import re
from typing import Dict, Any, List

SUSPICIOUS_REVIEWS_KEYWORDS = [
    (r"\b(fake|scam|scammer|fraud|stole|robbed|rip off|ripoff)\b", 30),
    (r"\b(impersonator|not official|stole my money|lost funds|phishing)\b", 40),
    (r"\b(don't download|dont download|malware|virus|trojan)\b", 35),
    (r"\b(reported|reported to police|fake app|fake account)\b", 30)
]

def analyze_reputation_and_complaints(
    rating: float = 0.0,
    review_count: int = 0,
    complaint_mentions: int = 0,
    sample_reviews: List[str] = None
) -> Dict[str, Any]:
    """
    Computes reputation and complaint signal score (0-100).
    Surfaces 1-star scam complaints, community fraud tags, and review sentiment.
    """
    if sample_reviews is None:
        sample_reviews = []

    complaint_score = 0.0
    detected_complaints: List[str] = []

    # 1. Direct community complaint count
    if complaint_mentions > 0:
        complaint_score += min(complaint_mentions * 15.0, 60.0)
        detected_complaints.append(f"{complaint_mentions} public scam/fraud reports tracked")

    # 2. Check text of sample reviews or public comments
    for text in sample_reviews:
        text_lower = text.lower()
        for pattern, weight in SUSPICIOUS_REVIEWS_KEYWORDS:
            if re.search(pattern, text_lower):
                complaint_score += weight
                detected_complaints.append(f"Complaint flag: '{text[:80]}...'")
                break

    # 3. Low rating anomaly with high download/mentions
    if 0 < rating <= 2.2 and review_count >= 5:
        complaint_score += 25.0
        detected_complaints.append(f"Severe negative rating cluster: {rating}★ ({review_count} reviews)")

    final_score = min(max(round(complaint_score, 1), 0.0), 100.0)

    return {
        "score": final_score,
        "complaint_count": complaint_mentions + len(detected_complaints),
        "complaints_detected": detected_complaints,
        "details": "; ".join(detected_complaints) if detected_complaints else "No public community complaints recorded."
    }
