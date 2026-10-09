from typing import Dict, Any, Optional

DEFAULT_WEIGHTS = {
    "desc": 0.25,        # 25% Description & Intent resemblance
    "pfp": 0.20,         # 20% Visual PFP/Logo clone match
    "name": 0.20,        # 20% Look-alike name engine (swaps, homoglyphs, spacing)
    "reports": 0.15,     # 15% Community complaints & 1-star scam reviews
    "publisher": 0.10,   # 10% Developer / Publisher mismatch
    "link": 0.10         # 10% Suspicious domain or redirect link
}

def determine_severity(final_score: float) -> str:
    """Categorizes threats into industry SOC severity tiers."""
    if final_score >= 75.0:
        return "CRITICAL"
    elif final_score >= 50.0:
        return "HIGH"
    elif final_score >= 30.0:
        return "MEDIUM"
    else:
        return "LOW"

def aggregate_threat_score(
    scores: Dict[str, float],
    custom_weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Computes transparent, weighted composite threat score (0-100)
    with full mathematical explainability for analysts and automated evaluators.
    """
    weights = custom_weights if custom_weights else DEFAULT_WEIGHTS.copy()
    
    # Normalize weights to ensure they sum to 1.0
    total_w = sum(weights.values()) or 1.0
    normalized_weights = {k: v / total_w for k, v in weights.items()}

    desc_score = scores.get("desc", 0.0)
    pfp_score = scores.get("pfp", 0.0)
    name_score = scores.get("name", 0.0)
    reports_score = scores.get("reports", 0.0)
    pub_score = scores.get("publisher", 0.0)
    link_score = scores.get("link", 0.0)

    composite = (
        (normalized_weights.get("desc", 0.25) * desc_score) +
        (normalized_weights.get("pfp", 0.20) * pfp_score) +
        (normalized_weights.get("name", 0.20) * name_score) +
        (normalized_weights.get("reports", 0.15) * reports_score) +
        (normalized_weights.get("publisher", 0.10) * pub_score) +
        (normalized_weights.get("link", 0.10) * link_score)
    )

    final_score = round(min(max(composite, 0.0), 100.0), 1)
    severity = determine_severity(final_score)

    return {
        "final_score": final_score,
        "severity": severity,
        "breakdown": {
            "name_score": round(name_score, 1),
            "pfp_score": round(pfp_score, 1),
            "desc_score": round(desc_score, 1),
            "reports_score": round(reports_score, 1),
            "publisher_score": round(pub_score, 1),
            "link_score": round(link_score, 1)
        },
        "weights_applied": {k: round(v, 3) for k, v in normalized_weights.items()},
        "formula": "Final = Σ (weight_i * score_i)"
    }
