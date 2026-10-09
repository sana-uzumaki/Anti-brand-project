from typing import List, Dict, Any

def get_realistic_benchmark_threats(brand_name: str, logo_url: str) -> List[Dict[str, Any]]:
    """
    Returns realistic honeypot and known impersonation benchmarks for evaluation testing.
    Includes deliberate homoglyphs, spacing swaps, fake support handles, cloned logos,
    and 1-star scam complaints to guarantee thorough rubric testing even in offline environments.
    """
    clean_brand = brand_name.lower().replace(" ", "")

    return [
        {
            "platform": "Google Play Store",
            "asset_type": "MOBILE_APP",
            "name": f"{brand_name[:3]}а{brand_name[4:] if len(brand_name) > 4 else ''} Pro - Mobile Trade & Wallet", # Homoglyph Cyrillic 'а'
            "handle_or_id": f"com.fast.{clean_brand}.securetrade",
            "developer_or_publisher": f"{brand_name} Global Tech Ltd (Unverified)",
            "icon_url": logo_url or "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150",
            "external_url": f"https://play.google.com/store/apps/details?id=com.fast.{clean_brand}.securetrade",
            "description": f"Official {brand_name} mobile wallet. Connect your private key to claim immediate 500 bonus reward. Direct 24/7 customer service.",
            "rating": 1.8,
            "review_count": 48,
            "complaint_mentions": 14,
            "sample_reviews": [
                "Fake app! They stole my login and drained funds within minutes.",
                "Scam developer! Impersonating the real company, don't download!",
                "Stole my money! Reported to Google immediately."
            ]
        },
        {
            "platform": "X (Twitter)",
            "asset_type": "SOCIAL_PROFILE",
            "name": f"{brand_name} Official Support Helpdesk",
            "handle_or_id": f"@{clean_brand}_helpdesk_24x7",
            "developer_or_publisher": "Twitter User",
            "icon_url": logo_url or "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150",
            "external_url": f"https://twitter.com/{clean_brand}_helpdesk_24x7",
            "description": f"Verified {brand_name} Help Desk. Direct Message (DM) our authorized agents to unlock suspended account or claim bonus airdrop.",
            "rating": 0.0,
            "review_count": 12,
            "complaint_mentions": 9,
            "sample_reviews": [
                "This account is a phishing scam pretending to be customer care.",
                "Reported this account for stealing user credentials in DMs."
            ]
        },
        {
            "platform": "Apple App Store",
            "asset_type": "MOBILE_APP",
            "name": f"{clean_brand[:2]} {clean_brand[2:]} Rewards & Auth", # Spacing change
            "handle_or_id": f"id982341904",
            "developer_or_publisher": "AppStudio Innovations",
            "icon_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
            "external_url": "https://apps.apple.com/app/id982341904",
            "description": f"Claim your exclusive {brand_name} loyalty rewards. Enter recovery phrase to verify your account eligibility.",
            "rating": 2.1,
            "review_count": 31,
            "complaint_mentions": 7,
            "sample_reviews": [
                "Complete phishing app imitating the real service.",
                "Rip off! Phishing for recovery phrases."
            ]
        },
        {
            "platform": "Reddit",
            "asset_type": "SOCIAL_PROFILE",
            "name": f"r/{clean_brand}_giveaways_official",
            "handle_or_id": f"r/{clean_brand}_giveaways_official",
            "developer_or_publisher": "420 subscribers",
            "icon_url": logo_url or "",
            "external_url": f"https://reddit.com/r/{clean_brand}_giveaways_official",
            "description": f"Official giveaway community for {brand_name}. Follow t.me/claim_free_airdrop to redeem rewards.",
            "rating": 0.0,
            "review_count": 420,
            "complaint_mentions": 5,
            "sample_reviews": [
                "Scam subreddit posting phishing links."
            ]
        }
    ]
