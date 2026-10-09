from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any

class BrandProfileCreate(BaseModel):
    brand_name: str = Field(..., description="Official Company / Brand Name", example="Binance")
    trademark_terms: List[str] = Field(default=[], description="Key trademark or subsidiary terms")
    official_logo_url: Optional[str] = Field(default="", description="URL of official high-res logo")
    official_domains: List[str] = Field(default=[], description="Authorized corporate domains", example=["binance.com"])
    official_handles: List[str] = Field(default=[], description="Whitelisted social media handles", example=["@binance", "@binance_help"])
    official_app_ids: List[str] = Field(default=[], description="Authorized iOS Bundle IDs & Google Package IDs", example=["com.binance.dev", "id1436799971"])
    official_publishers: List[str] = Field(default=[], description="Authorized app store developer/publisher names", example=["Binance Ltd.", "Binance"])

class BrandProfileResponse(BrandProfileCreate):
    id: str
    created_at: str

class ScoringWeightsUpdate(BaseModel):
    desc: float = Field(default=0.25, ge=0.0, le=1.0)
    pfp: float = Field(default=0.20, ge=0.0, le=1.0)
    name: float = Field(default=0.20, ge=0.0, le=1.0)
    reports: float = Field(default=0.15, ge=0.0, le=1.0)
    publisher: float = Field(default=0.10, ge=0.0, le=1.0)
    link: float = Field(default=0.10, ge=0.0, le=1.0)

class ThreatScoreBreakdown(BaseModel):
    name_score: float
    pfp_score: float
    desc_score: float
    reports_score: float
    publisher_score: float
    link_score: float

class DetectedThreatItem(BaseModel):
    id: str
    platform: str
    asset_type: str
    name: str
    handle_or_id: str
    developer_or_publisher: str
    icon_url: str
    external_url: str
    description: str
    is_official_asset: bool
    exclusion_reason: Optional[str] = None
    final_score: float
    severity: str
    breakdown: ThreatScoreBreakdown
    lookalike_details: Dict[str, Any]
    complaint_details: Dict[str, Any]
    weights_applied: Dict[str, float]
    status: str = "FLAGGED" # FLAGGED, UNDER_REVIEW, TAKEDOWN_REQUESTED, WHITELISTED

class ScanRunResponse(BaseModel):
    scan_id: str
    brand_name: str
    timestamp: str
    total_scanned: int
    threats_detected: int
    official_excluded: int
    source_statuses: List[Dict[str, Any]]
    results: List[DetectedThreatItem]
