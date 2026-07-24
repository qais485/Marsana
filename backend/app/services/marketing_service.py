import secrets
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.database_models import (
    EmailCampaign,
    SMSCampaign,
    PushCampaign,
    CampaignLog,
    AffiliateProgram,
    Affiliate,
    AffiliateLink,
    AffiliateClick,
    AffiliateEarning,
)
from ..repositories.marketing_repository import (
    EmailCampaignRepository,
    SMSCampaignRepository,
    PushCampaignRepository,
    CampaignLogRepository,
    AffiliateProgramRepository,
    AffiliateRepository,
    AffiliateLinkRepository,
    AffiliateClickRepository,
    AffiliateEarningRepository,
)


class EmailCampaignService:
    def __init__(self, db: Session):
        self.repo = EmailCampaignRepository(db)
        self.log_repo = CampaignLogRepository(db)
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20):
        return self.repo.get_all(page, limit)

    def get_by_id(self, campaign_id: UUID):
        return self.repo.get_by_id(campaign_id)

    def create(self, data: dict, created_by: UUID) -> EmailCampaign:
        campaign = EmailCampaign(**data, created_by=created_by)
        return self.repo.create(campaign)

    def update(self, campaign_id: UUID, data: dict) -> Optional[EmailCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(campaign, key, value)
        return self.repo.update(campaign)

    def delete(self, campaign_id: UUID) -> bool:
        return self.repo.delete(campaign_id)

    def send(self, campaign_id: UUID) -> Optional[EmailCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status not in ("draft", "scheduled"):
            return None
        campaign.status = "sent"
        campaign.sent_at = datetime.now(timezone.utc)
        campaign.total_sent = campaign.total_recipients
        return self.repo.update(campaign)

    def schedule(self, campaign_id: UUID, scheduled_at: datetime) -> Optional[EmailCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status != "draft":
            return None
        campaign.status = "scheduled"
        campaign.scheduled_at = scheduled_at
        return self.repo.update(campaign)

    def get_dashboard_stats(self):
        total_campaigns = self.db.query(EmailCampaign).count()
        total_sent = self.db.query(func.sum(EmailCampaign.total_sent)).scalar() or 0
        total_opened = self.db.query(func.sum(EmailCampaign.total_opened)).scalar() or 0
        total_clicked = self.db.query(func.sum(EmailCampaign.total_clicked)).scalar() or 0
        return {
            "total_campaigns": total_campaigns,
            "total_sent": total_sent,
            "total_opened": total_opened,
            "total_clicked": total_clicked,
        }


class SMSCampaignService:
    def __init__(self, db: Session):
        self.repo = SMSCampaignRepository(db)
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20):
        return self.repo.get_all(page, limit)

    def get_by_id(self, campaign_id: UUID):
        return self.repo.get_by_id(campaign_id)

    def create(self, data: dict, created_by: UUID) -> SMSCampaign:
        campaign = SMSCampaign(**data, created_by=created_by)
        return self.repo.create(campaign)

    def update(self, campaign_id: UUID, data: dict) -> Optional[SMSCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(campaign, key, value)
        return self.repo.update(campaign)

    def delete(self, campaign_id: UUID) -> bool:
        return self.repo.delete(campaign_id)

    def send(self, campaign_id: UUID) -> Optional[SMSCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status not in ("draft", "scheduled"):
            return None
        campaign.status = "sent"
        campaign.sent_at = datetime.now(timezone.utc)
        campaign.total_sent = campaign.total_recipients
        return self.repo.update(campaign)

    def schedule(self, campaign_id: UUID, scheduled_at: datetime) -> Optional[SMSCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status != "draft":
            return None
        campaign.status = "scheduled"
        campaign.scheduled_at = scheduled_at
        return self.repo.update(campaign)


class PushCampaignService:
    def __init__(self, db: Session):
        self.repo = PushCampaignRepository(db)
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20):
        return self.repo.get_all(page, limit)

    def get_by_id(self, campaign_id: UUID):
        return self.repo.get_by_id(campaign_id)

    def create(self, data: dict, created_by: UUID) -> PushCampaign:
        campaign = PushCampaign(**data, created_by=created_by)
        return self.repo.create(campaign)

    def update(self, campaign_id: UUID, data: dict) -> Optional[PushCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(campaign, key, value)
        return self.repo.update(campaign)

    def delete(self, campaign_id: UUID) -> bool:
        return self.repo.delete(campaign_id)

    def send(self, campaign_id: UUID) -> Optional[PushCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status not in ("draft", "scheduled"):
            return None
        campaign.status = "sent"
        campaign.sent_at = datetime.now(timezone.utc)
        campaign.total_sent = campaign.total_recipients
        return self.repo.update(campaign)

    def schedule(self, campaign_id: UUID, scheduled_at: datetime) -> Optional[PushCampaign]:
        campaign = self.repo.get_by_id(campaign_id)
        if not campaign or campaign.status != "draft":
            return None
        campaign.status = "scheduled"
        campaign.scheduled_at = scheduled_at
        return self.repo.update(campaign)


class AffiliateProgramService:
    def __init__(self, db: Session):
        self.repo = AffiliateProgramRepository(db)
        self.db = db

    def get_all(self):
        return self.repo.get_all()

    def get_by_id(self, program_id: UUID):
        return self.repo.get_by_id(program_id)

    def create(self, data: dict) -> AffiliateProgram:
        program = AffiliateProgram(**data)
        return self.repo.create(program)

    def update(self, program_id: UUID, data: dict) -> Optional[AffiliateProgram]:
        program = self.repo.get_by_id(program_id)
        if not program:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(program, key, value)
        return self.repo.update(program)

    def delete(self, program_id: UUID) -> bool:
        return self.repo.delete(program_id)


class AffiliateService:
    def __init__(self, db: Session):
        self.repo = AffiliateRepository(db)
        self.link_repo = AffiliateLinkRepository(db)
        self.click_repo = AffiliateClickRepository(db)
        self.earning_repo = AffiliateEarningRepository(db)
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20, status: Optional[str] = None):
        return self.repo.get_all(page, limit, status)

    def get_by_id(self, affiliate_id: UUID):
        return self.repo.get_by_id(affiliate_id)

    def get_by_user(self, user_id: UUID):
        return self.repo.get_by_user_id(user_id)

    def create(self, data: dict) -> Affiliate:
        affiliate_code = secrets.token_urlsafe(8)
        affiliate = Affiliate(**data, affiliate_code=affiliate_code)
        return self.repo.create(affiliate)

    def update(self, affiliate_id: UUID, data: dict) -> Optional[Affiliate]:
        affiliate = self.repo.get_by_id(affiliate_id)
        if not affiliate:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(affiliate, key, value)
        if data.get("status") == "approved" and not affiliate.approved_at:
            affiliate.approved_at = datetime.now(timezone.utc)
        return self.repo.update(affiliate)

    def approve(self, affiliate_id: UUID) -> Optional[Affiliate]:
        return self.update(affiliate_id, {"status": "approved"})

    def reject(self, affiliate_id: UUID) -> Optional[Affiliate]:
        return self.update(affiliate_id, {"status": "rejected"})

    def suspend(self, affiliate_id: UUID) -> Optional[Affiliate]:
        return self.update(affiliate_id, {"status": "suspended"})

    def get_summary(self):
        return self.repo.get_summary()

    def track_click(self, link_code: str, ip_address: str = None, user_agent: str = None, referrer: str = None):
        link = self.link_repo.get_by_code(link_code)
        if not link or not link.is_active:
            return None
        click = AffiliateClick(
            link_id=link.id,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer,
        )
        self.click_repo.create(click)
        self.link_repo.increment_clicks(link.id)
        return link

    def record_conversion(self, affiliate_id: UUID, order_id: UUID, amount: float):
        affiliate = self.repo.get_by_id(affiliate_id)
        if not affiliate or affiliate.status != "approved":
            return None
        program = affiliate.program
        if program.commission_type == "percentage":
            commission = float(amount) * float(program.commission_value) / 100
        elif program.commission_type == "fixed":
            commission = float(program.commission_value)
        else:
            commission = 0
        earning = AffiliateEarning(
            affiliate_id=affiliate_id,
            order_id=order_id,
            amount=float(amount),
            commission=commission,
        )
        self.earning_repo.create(earning)
        affiliate.total_earnings = float(affiliate.total_earnings) + commission
        affiliate.pending_balance = float(affiliate.pending_balance) + commission
        affiliate.total_conversions = affiliate.total_conversions + 1
        self.repo.update(affiliate)
        return earning

    def get_earnings(self, affiliate_id: UUID, page: int = 1, limit: int = 20):
        return self.earning_repo.get_by_affiliate(affiliate_id, page, limit)

    def get_links(self, affiliate_id: UUID):
        return self.link_repo.get_by_affiliate(affiliate_id)

    def create_link(self, affiliate_id: UUID, data: dict) -> Optional[AffiliateLink]:
        affiliate = self.repo.get_by_id(affiliate_id)
        if not affiliate:
            return None
        code = secrets.token_urlsafe(8)
        link = AffiliateLink(**data, affiliate_id=affiliate_id, code=code)
        return self.link_repo.create(link)
