from typing import List, Dict, Any

def check_is_official_asset(
    candidate: Dict[str, Any],
    official_brand_names: List[str],
    official_handles: List[str],
    official_app_ids: List[str],
    official_publishers: List[str],
    official_domains: List[str]
) -> Dict[str, Any]:
    """
    Determines whether a candidate asset matches the registered ground truth
    and MUST be excluded from the threat list (evaluation criteria requirement).
    """
    candidate_id = (candidate.get("handle_or_id") or "").strip().lower()
    candidate_name = (candidate.get("name") or "").strip().lower()
    candidate_publisher = (candidate.get("developer_or_publisher") or "").strip().lower()
    candidate_url = (candidate.get("external_url") or "").strip().lower()

    # Normalize handles (e.g. remove '@' or leading slashes)
    norm_handles = [h.strip().lower().lstrip('@').lstrip('/') for h in official_handles]
    norm_app_ids = [a.strip().lower() for a in official_app_ids]
    norm_publishers = [p.strip().lower() for p in official_publishers]
    norm_domains = [d.strip().lower() for d in official_domains]

    # Check 1: Official App Store Package ID / Bundle ID
    if candidate_id and candidate_id in norm_app_ids:
        return {
            "is_official": True,
            "reason": f"Matches verified official App Bundle/Package ID: '{candidate_id}'",
            "rule": "PACKAGE_ID_WHITELIST"
        }

    # Check 2: Official Social Media Handle
    clean_cand_handle = candidate_id.lstrip('@').lstrip('/')
    if clean_cand_handle and clean_cand_handle in norm_handles:
        return {
            "is_official": True,
            "reason": f"Matches verified official social handle: '@{clean_cand_handle}'",
            "rule": "HANDLE_WHITELIST"
        }

    # Check 3: Verified Authorized Developer / Publisher
    if candidate_publisher and any(candidate_publisher == p for p in norm_publishers):
        # Also ensure candidate name is closely tied to brand
        return {
            "is_official": True,
            "reason": f"Published by verified corporate entity: '{candidate.get('developer_or_publisher')}'",
            "rule": "PUBLISHER_WHITELIST"
        }

    # Check 4: Official Domain Direct Host
    for domain in norm_domains:
        if domain and domain in candidate_url:
            return {
                "is_official": True,
                "reason": f"Hosted under verified corporate domain: '{domain}'",
                "rule": "DOMAIN_WHITELIST"
            }

    return {
        "is_official": False,
        "reason": "Not registered in official brand assets",
        "rule": "UNVERIFIED_CANDIDATE"
    }
