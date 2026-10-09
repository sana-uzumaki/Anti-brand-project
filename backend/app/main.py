import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.brand_schema import (
    BrandProfileCreate,
    BrandProfileResponse,
    ScoringWeightsUpdate,
    ScanRunResponse
)
from app.services.detection.coordinator import coordinator
from app.services.detection.aggregator import DEFAULT_WEIGHTS

app = FastAPI(
    title="Digital Risk Protection Platform (DRP)",
    description="Social & App Store Impersonation Monitoring API with Look-alike detection",
    version="1.0.0"
)

# Enable CORS for the React/Bun dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for prototype (persists throughout session)
BRAND_PROFILES_DB: Dict[str, BrandProfileResponse] = {}
SCAN_HISTORY_DB: Dict[str, ScanRunResponse] = {}

# Seed default profile for immediate testing and presentation
DEFAULT_PROFILE = BrandProfileResponse(
    id="profile_binance_official",
    brand_name="Binance",
    trademark_terms=["Binance Chain", "BNB", "Trust Wallet"],
    official_logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Binance_logo.svg/320px-Binance_logo.svg.png",
    official_domains=["binance.com", "binance.us"],
    official_handles=["@binance", "@binancehelpdesk", "r/binance", "@binance_us"],
    official_app_ids=["com.binance.dev", "id1436799971", "com.binance.us"],
    official_publishers=["Binance Ltd.", "Binance", "BAM Trading Services Inc."],
    created_at="2026-10-09T08:00:00Z"
)
BRAND_PROFILES_DB[DEFAULT_PROFILE.id] = DEFAULT_PROFILE

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Digital Risk Protection API",
        "endpoints": ["/api/brand-profiles", "/api/scan/live", "/api/weights"]
    }

# --- Brand Profile Endpoints ---
@app.get("/api/brand-profiles", response_model=List[BrandProfileResponse])
def get_all_profiles():
    return list(BRAND_PROFILES_DB.values())

@app.post("/api/brand-profiles", response_model=BrandProfileResponse)
def create_brand_profile(profile: BrandProfileCreate):
    profile_id = f"profile_{uuid.uuid4().hex[:8]}"
    created = BrandProfileResponse(
        id=profile_id,
        created_at="2026-10-09T08:00:00Z",
        **profile.model_dump()
    )
    BRAND_PROFILES_DB[profile_id] = created
    return created

@app.get("/api/brand-profiles/{profile_id}", response_model=BrandProfileResponse)
def get_brand_profile(profile_id: str):
    if profile_id not in BRAND_PROFILES_DB:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    return BRAND_PROFILES_DB[profile_id]

# --- Surveillance & Scanning Endpoints ---
@app.post("/api/scan/live", response_model=ScanRunResponse)
async def run_live_scan(profile_id: str = Query(..., description="ID of brand profile to scan for")):
    if profile_id not in BRAND_PROFILES_DB:
        raise HTTPException(status_code=404, detail="Brand profile not found")
    
    profile = BRAND_PROFILES_DB[profile_id]
    scan_result = await coordinator.execute_surveillance_scan(profile, include_benchmarks=True)
    SCAN_HISTORY_DB[scan_result.scan_id] = scan_result
    return scan_result

# --- Dynamic Weights Configuration ---
@app.get("/api/weights")
def get_active_weights():
    return coordinator.active_weights

@app.post("/api/weights")
def update_active_weights(weights: ScoringWeightsUpdate):
    coordinator.update_weights(weights)
    return {"status": "weights_updated", "active_weights": coordinator.active_weights}
