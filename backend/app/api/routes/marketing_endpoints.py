from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user
from app.database.session import get_db
from app.models.database_models import EmailCampaign, SMSCampaign, PushCampaign, Affiliate, User
from app.schemas.request_response_models import (
    BaseResponse,
    EmailCampaignCreateRequest,
    EmailCampaignUpdateRequest,
    EmailCampaignResponse,
    EmailCampaignListResponse,
    SMSCampaignCreateRequest,
    SMSCampaignUpdateRequest,
    SMSCampaignResponse,
    SMSCampaignListResponse,
    PushCampaignCreateRequest,
    PushCampaignUpdateRequest,
    PushCampaignResponse,
    PushCampaignListResponse,
    CampaignLogResponse,
    CampaignLogListResponse,
    AffiliateProgramCreateRequest,
    AffiliateProgramUpdateRequest,
    AffiliateProgramResponse,
    AffiliateProgramListResponse,
    AffiliateCreateRequest,
    AffiliateUpdateRequest,
    AffiliateResponse,
    AffiliateListResponse,
    AffiliateLinkCreateRequest,
    AffiliateLinkResponse,
    AffiliateLinkListResponse,
    AffiliateEarningResponse,
    AffiliateEarningListResponse,
    AffiliateSummaryData,
    AffiliateSummaryResponse,
    MarketingDashboardData,
    MarketingDashboardResponse,
)
from app.services.marketing_service import (
    EmailCampaignService,
    SMSCampaignService,
    PushCampaignService,
    AffiliateProgramService,
    AffiliateService,
)

router = APIRouter(prefix="/api/v1/admin/marketing", tags=["Admin Marketing"])


# ─── Email Campaign Endpoints ──────────────────────────────────────


@router.get("/email-campaigns", response_model=EmailCampaignListResponse)
async def get_email_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    items, total = service.get_all(page, limit)
    return EmailCampaignListResponse(
        success=True,
        message="Email campaigns retrieved",
        data=[EmailCampaignResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


@router.get("/email-campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def get_email_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    campaign = service.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return EmailCampaignResponse.model_validate(campaign)


@router.post("/email-campaigns", response_model=EmailCampaignResponse)
async def create_email_campaign(
    data: EmailCampaignCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    campaign = service.create(data.model_dump(), admin.id)
    return EmailCampaignResponse.model_validate(campaign)


@router.put("/email-campaigns/{campaign_id}", response_model=EmailCampaignResponse)
async def update_email_campaign(
    campaign_id: UUID,
    data: EmailCampaignUpdateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    campaign = service.update(campaign_id, data.model_dump(exclude_unset=True))
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return EmailCampaignResponse.model_validate(campaign)


@router.delete("/email-campaigns/{campaign_id}", response_model=BaseResponse)
async def delete_email_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    if not service.delete(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return BaseResponse(success=True, message="Campaign deleted")


@router.post("/email-campaigns/{campaign_id}/send", response_model=EmailCampaignResponse)
async def send_email_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    campaign = service.send(campaign_id)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be sent")
    return EmailCampaignResponse.model_validate(campaign)


@router.post("/email-campaigns/{campaign_id}/schedule", response_model=EmailCampaignResponse)
async def schedule_email_campaign(
    campaign_id: UUID,
    scheduled_at: datetime = Body(..., embed=True),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = EmailCampaignService(db)
    campaign = service.schedule(campaign_id, scheduled_at)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be scheduled")
    return EmailCampaignResponse.model_validate(campaign)


# ─── SMS Campaign Endpoints ────────────────────────────────────────


@router.get("/sms-campaigns", response_model=SMSCampaignListResponse)
async def get_sms_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    items, total = service.get_all(page, limit)
    return SMSCampaignListResponse(
        success=True,
        message="SMS campaigns retrieved",
        data=[SMSCampaignResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


@router.get("/sms-campaigns/{campaign_id}", response_model=SMSCampaignResponse)
async def get_sms_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    campaign = service.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return SMSCampaignResponse.model_validate(campaign)


@router.post("/sms-campaigns", response_model=SMSCampaignResponse)
async def create_sms_campaign(
    data: SMSCampaignCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    campaign = service.create(data.model_dump(), admin.id)
    return SMSCampaignResponse.model_validate(campaign)


@router.put("/sms-campaigns/{campaign_id}", response_model=SMSCampaignResponse)
async def update_sms_campaign(
    campaign_id: UUID,
    data: SMSCampaignUpdateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    campaign = service.update(campaign_id, data.model_dump(exclude_unset=True))
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return SMSCampaignResponse.model_validate(campaign)


@router.delete("/sms-campaigns/{campaign_id}", response_model=BaseResponse)
async def delete_sms_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    if not service.delete(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return BaseResponse(success=True, message="Campaign deleted")


@router.post("/sms-campaigns/{campaign_id}/send", response_model=SMSCampaignResponse)
async def send_sms_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    campaign = service.send(campaign_id)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be sent")
    return SMSCampaignResponse.model_validate(campaign)


@router.post("/sms-campaigns/{campaign_id}/schedule", response_model=SMSCampaignResponse)
async def schedule_sms_campaign(
    campaign_id: UUID,
    scheduled_at: datetime = Body(..., embed=True),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = SMSCampaignService(db)
    campaign = service.schedule(campaign_id, scheduled_at)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be scheduled")
    return SMSCampaignResponse.model_validate(campaign)


# ─── Push Campaign Endpoints ───────────────────────────────────────


@router.get("/push-campaigns", response_model=PushCampaignListResponse)
async def get_push_campaigns(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    items, total = service.get_all(page, limit)
    return PushCampaignListResponse(
        success=True,
        message="Push campaigns retrieved",
        data=[PushCampaignResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


@router.get("/push-campaigns/{campaign_id}", response_model=PushCampaignResponse)
async def get_push_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    campaign = service.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return PushCampaignResponse.model_validate(campaign)


@router.post("/push-campaigns", response_model=PushCampaignResponse)
async def create_push_campaign(
    data: PushCampaignCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    campaign = service.create(data.model_dump(), admin.id)
    return PushCampaignResponse.model_validate(campaign)


@router.put("/push-campaigns/{campaign_id}", response_model=PushCampaignResponse)
async def update_push_campaign(
    campaign_id: UUID,
    data: PushCampaignUpdateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    campaign = service.update(campaign_id, data.model_dump(exclude_unset=True))
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return PushCampaignResponse.model_validate(campaign)


@router.delete("/push-campaigns/{campaign_id}", response_model=BaseResponse)
async def delete_push_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    if not service.delete(campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return BaseResponse(success=True, message="Campaign deleted")


@router.post("/push-campaigns/{campaign_id}/send", response_model=PushCampaignResponse)
async def send_push_campaign(
    campaign_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    campaign = service.send(campaign_id)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be sent")
    return PushCampaignResponse.model_validate(campaign)


@router.post("/push-campaigns/{campaign_id}/schedule", response_model=PushCampaignResponse)
async def schedule_push_campaign(
    campaign_id: UUID,
    scheduled_at: datetime = Body(..., embed=True),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = PushCampaignService(db)
    campaign = service.schedule(campaign_id, scheduled_at)
    if not campaign:
        raise HTTPException(status_code=400, detail="Campaign cannot be scheduled")
    return PushCampaignResponse.model_validate(campaign)


# ─── Campaign Logs ─────────────────────────────────────────────────


@router.get("/campaign-logs", response_model=CampaignLogListResponse)
async def get_campaign_logs(
    campaign_id: Optional[UUID] = None,
    sms_campaign_id: Optional[UUID] = None,
    push_campaign_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    from ...repositories.marketing_repository import CampaignLogRepository
    repo = CampaignLogRepository(db)
    items, total = repo.get_by_campaign(campaign_id, sms_campaign_id, push_campaign_id, page, limit)
    return CampaignLogListResponse(
        success=True,
        message="Campaign logs retrieved",
        data=[CampaignLogResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


# ─── Affiliate Program Endpoints ───────────────────────────────────


@router.get("/affiliate-programs", response_model=AffiliateProgramListResponse)
async def get_affiliate_programs(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateProgramService(db)
    items = service.get_all()
    return AffiliateProgramListResponse(
        success=True,
        message="Affiliate programs retrieved",
        data=[AffiliateProgramResponse.model_validate(i) for i in items],
    )


@router.get("/affiliate-programs/{program_id}", response_model=AffiliateProgramResponse)
async def get_affiliate_program(
    program_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateProgramService(db)
    program = service.get_by_id(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return AffiliateProgramResponse.model_validate(program)


@router.post("/affiliate-programs", response_model=AffiliateProgramResponse)
async def create_affiliate_program(
    data: AffiliateProgramCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateProgramService(db)
    program = service.create(data.model_dump())
    return AffiliateProgramResponse.model_validate(program)


@router.put("/affiliate-programs/{program_id}", response_model=AffiliateProgramResponse)
async def update_affiliate_program(
    program_id: UUID,
    data: AffiliateProgramUpdateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateProgramService(db)
    program = service.update(program_id, data.model_dump(exclude_unset=True))
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return AffiliateProgramResponse.model_validate(program)


@router.delete("/affiliate-programs/{program_id}", response_model=BaseResponse)
async def delete_affiliate_program(
    program_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateProgramService(db)
    if not service.delete(program_id):
        raise HTTPException(status_code=404, detail="Program not found")
    return BaseResponse(success=True, message="Program deleted")


# ─── Affiliate Endpoints ───────────────────────────────────────────


@router.get("/affiliates", response_model=AffiliateListResponse)
async def get_affiliates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    items, total = service.get_all(page, limit, status)
    return AffiliateListResponse(
        success=True,
        message="Affiliates retrieved",
        data=[AffiliateResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


@router.get("/affiliates/summary", response_model=AffiliateSummaryResponse)
async def get_affiliate_summary(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    summary = service.get_summary()
    return AffiliateSummaryResponse(
        success=True,
        message="Affiliate summary retrieved",
        data=AffiliateSummaryData(**summary),
    )


@router.get("/affiliates/{affiliate_id}", response_model=AffiliateResponse)
async def get_affiliate(
    affiliate_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    affiliate = service.get_by_id(affiliate_id)
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return AffiliateResponse.model_validate(affiliate)


@router.post("/affiliates", response_model=AffiliateResponse)
async def create_affiliate(
    data: AffiliateCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    affiliate = service.create(data.model_dump())
    return AffiliateResponse.model_validate(affiliate)


@router.put("/affiliates/{affiliate_id}", response_model=AffiliateResponse)
async def update_affiliate(
    affiliate_id: UUID,
    data: AffiliateUpdateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    affiliate = service.update(affiliate_id, data.model_dump(exclude_unset=True))
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return AffiliateResponse.model_validate(affiliate)


@router.post("/affiliates/{affiliate_id}/approve", response_model=AffiliateResponse)
async def approve_affiliate(
    affiliate_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    affiliate = service.approve(affiliate_id)
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return AffiliateResponse.model_validate(affiliate)


@router.post("/affiliates/{affiliate_id}/reject", response_model=AffiliateResponse)
async def reject_affiliate(
    affiliate_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    affiliate = service.reject(affiliate_id)
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return AffiliateResponse.model_validate(affiliate)


# ─── Affiliate Links ───────────────────────────────────────────────


@router.get("/affiliates/{affiliate_id}/links", response_model=AffiliateLinkListResponse)
async def get_affiliate_links(
    affiliate_id: UUID,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    links = service.get_links(affiliate_id)
    return AffiliateLinkListResponse(
        success=True,
        message="Affiliate links retrieved",
        data=[AffiliateLinkResponse.model_validate(i) for i in links],
    )


@router.post("/affiliates/{affiliate_id}/links", response_model=AffiliateLinkResponse)
async def create_affiliate_link(
    affiliate_id: UUID,
    data: AffiliateLinkCreateRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    link = service.create_link(affiliate_id, data.model_dump())
    if not link:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return AffiliateLinkResponse.model_validate(link)


# ─── Affiliate Earnings ────────────────────────────────────────────


@router.get("/affiliates/{affiliate_id}/earnings", response_model=AffiliateEarningListResponse)
async def get_affiliate_earnings(
    affiliate_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    service = AffiliateService(db)
    items, total = service.get_earnings(affiliate_id, page, limit)
    return AffiliateEarningListResponse(
        success=True,
        message="Affiliate earnings retrieved",
        data=[AffiliateEarningResponse.model_validate(i) for i in items],
        pagination={"page": page, "limit": limit, "total": total, "pages": (total + limit - 1) // limit},
    )


# ─── Marketing Dashboard ───────────────────────────────────────────


@router.get("/dashboard", response_model=MarketingDashboardResponse)
async def get_marketing_dashboard(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    email_campaigns = db.query(func.count(EmailCampaign.id)).scalar()
    sms_campaigns = db.query(func.count(SMSCampaign.id)).scalar()
    push_campaigns = db.query(func.count(PushCampaign.id)).scalar()
    total_sent = (
        (db.query(func.sum(EmailCampaign.total_sent)).scalar() or 0)
        + (db.query(func.sum(SMSCampaign.total_sent)).scalar() or 0)
        + (db.query(func.sum(PushCampaign.total_sent)).scalar() or 0)
    )
    total_opened = (
        (db.query(func.sum(EmailCampaign.total_opened)).scalar() or 0)
        + (db.query(func.sum(PushCampaign.total_opened)).scalar() or 0)
    )
    total_clicked = (
        (db.query(func.sum(EmailCampaign.total_clicked)).scalar() or 0)
        + (db.query(func.sum(PushCampaign.total_clicked)).scalar() or 0)
    )
    active_affiliates = db.query(func.count(Affiliate.id)).filter(Affiliate.status == "approved").scalar()
    affiliate_earnings = db.query(func.sum(Affiliate.total_earnings)).scalar() or 0

    return MarketingDashboardResponse(
        success=True,
        message="Marketing dashboard retrieved",
        data=MarketingDashboardData(
            email_campaigns=email_campaigns,
            sms_campaigns=sms_campaigns,
            push_campaigns=push_campaigns,
            total_sent=total_sent,
            total_opened=total_opened,
            total_clicked=total_clicked,
            active_affiliates=active_affiliates,
            affiliate_earnings=float(affiliate_earnings),
        ),
    )
