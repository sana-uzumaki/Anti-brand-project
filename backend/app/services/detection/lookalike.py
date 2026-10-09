import unicodedata
import re
from typing import Dict, List, Any, Tuple
import jellyfish

# Cyrillic / Greek to Latin look-alike mapping for homoglyph attacks
HOMOGLYPH_MAP = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w',
    'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K',
    'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X',
    'а': 'a', '0': 'o', '1': 'l', '3': 'e', '5': 's', '8': 'b', '@': 'a', '$': 's'
}

# Scam and suspicious affixes commonly injected into brand names
SUSPICIOUS_AFFIXES = [
    "support", "help", "helpdesk", "desk", "care", "service", "services",
    "official", "real", "verified", "auth", "login", "portal",
    "giveaway", "reward", "rewards", "claim", "airdrop", "bonus", "promo",
    "wallet", "trade", "trading", "finance", "pay", "global", "security",
    "customer", "assist", "assistance", "hotline", "team"
]

# Common English benign words to prevent false positives when 1-char difference occurs
BENIGN_DICTIONARY = {
    "finance", "advance", "balance", "glance", "chance", "stance",
    "plane", "phone", "plant", "planet", "store", "market", "trade"
}

def normalize_homoglyphs(text: str) -> Tuple[str, List[str]]:
    """
    Normalizes characters with homoglyphs and returns both normalized string
    and list of detected suspicious swaps.
    """
    normalized = []
    swaps_detected = []
    for idx, char in enumerate(text):
        if char in HOMOGLYPH_MAP:
            latin_char = HOMOGLYPH_MAP[char]
            swaps_detected.append(f"Position {idx}: '{char}' ({unicodedata.name(char, 'Confusable')}) spoofed as '{latin_char}'")
            normalized.append(latin_char)
        else:
            normalized.append(char)
    return "".join(normalized), swaps_detected

def remove_spacing_and_delimiters(text: str) -> str:
    """Removes spaces, hyphens, dots, underscores."""
    return re.sub(r'[\s\-_.\+]+', '', text).lower()

def analyze_lookalike_name(target_brand: str, candidate_name: str) -> Dict[str, Any]:
    """
    Calculates lookalike detection score (0-100) and provides granular explanation:
    - Character swaps & transpositions (Damerau-Levenshtein)
    - Homoglyphs (Cyrillic/Greek/Numerals)
    - Spacing / Delimiter modifications
    - Affix / Keyword injection (e.g. brand_support, official_brand)
    - False positive suppression
    """
    target = target_brand.strip().lower()
    candidate_raw = candidate_name.strip()
    candidate_lower = candidate_raw.lower()

    # 1. Homoglyph Detection
    homo_norm_candidate, homoglyph_swaps = normalize_homoglyphs(candidate_lower)

    # 2. Spacing / Delimiter Normalization
    target_compact = remove_spacing_and_delimiters(target)
    candidate_compact = remove_spacing_and_delimiters(homo_norm_candidate)

    details = []
    lookalike_score = 0.0

    # Exact match on compact string (e.g., "b i n a n c e" -> "binance")
    if candidate_compact == target_compact:
        if candidate_lower != target:
            lookalike_score = 95.0
            details.append("Spacing/delimiter manipulation: matches brand name when spaces/symbols are stripped")
        else:
            lookalike_score = 100.0
            details.append("Exact name match")

    # If homoglyphs were used
    if homoglyph_swaps:
        lookalike_score = max(lookalike_score, 90.0)
        details.extend(homoglyph_swaps)

    # 3. Affix / Added Words Detection (e.g., "Binance Support", "Official Binance")
    affix_detected = []
    for affix in SUSPICIOUS_AFFIXES:
        pattern = rf"(^|[_\s\.-]){re.escape(target)}[_\s\.-]?{affix}([_\s\.-]|$)|(^|[_\s\.-]){affix}[_\s\.-]?{re.escape(target)}([_\s\.-]|$)"
        if re.search(pattern, homo_norm_candidate):
            affix_detected.append(affix)

    if affix_detected:
        bonus = min(len(affix_detected) * 25.0, 95.0)
        lookalike_score = max(lookalike_score, 75.0 + bonus * 0.2)
        details.append(f"Suspicious affix injection detected: {', '.join(affix_detected)}")

    # 4. Fuzzy Distance (Jaro-Winkler & Damerau-Levenshtein)
    jaro_sim = jellyfish.jaro_winkler_similarity(target, candidate_compact)
    lev_dist = jellyfish.damerau_levenshtein_distance(target, candidate_compact)

    if lev_dist == 1 and len(target) >= 4:
        # Check if candidate is a common dictionary word (prevent over-flagging)
        if candidate_compact in BENIGN_DICTIONARY:
            details.append(f"Single-char variation '{candidate_compact}' recognized as standard dictionary word (suppressed)")
            lookalike_score = min(lookalike_score, 30.0)
        else:
            lookalike_score = max(lookalike_score, 88.0)
            details.append(f"1-character swap / transposition detected (Damerau-Levenshtein distance = 1)")
    elif lev_dist == 2 and len(target) >= 6:
        lookalike_score = max(lookalike_score, 70.0)
        details.append(f"2-character variation detected (distance = 2)")
    elif jaro_sim >= 0.88 and target in candidate_compact:
        lookalike_score = max(lookalike_score, 80.0)
        details.append(f"High phonetic / structural similarity ({round(jaro_sim*100, 1)}%) containing brand stem")

    # Final normalization
    final_score = min(max(round(lookalike_score, 1), 0.0), 100.0)

    return {
        "score": final_score,
        "is_suspicious": final_score >= 50.0,
        "details": details,
        "normalized_candidate": homo_norm_candidate,
        "homoglyphs_found": len(homoglyph_swaps) > 0,
        "affixes_found": affix_detected
    }
