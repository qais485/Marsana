from typing import Optional
from uuid import UUID
from sqlalchemy import func, and_
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


class EmailCampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, campaign_id: UUID) -> Optional[EmailCampaign]:
        return self.db.query(EmailCampaign).filter(EmailCampaign.id == campaign_id).first()

    def get_all(self, page: int = 1, limit: int = 20):
        query = self.db.query(EmailCampaign)
        total = query.count()
        items = query.order_by(EmailCampaign.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, campaign: EmailCampaign) -> EmailCampaign:
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def update(self, campaign: EmailCampaign) -> EmailCampaign:
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def delete(self, campaign_id: UUID) -> bool:
        campaign = self.get_by_id(campaign_id)
        if not campaign:
            return False
        self.db.delete(campaign)
        self.db.commit()
        return True

    def get_scheduled(self) -> list[EmailCampaign]:
        return (
            self.db.query(EmailCampaign)
            .filter(
                EmailCampaign.status == "scheduled",
                EmailCampaign.scheduled_at <= func.now(),
            )
            .all()
        )


class SMSCampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, campaign_id: UUID) -> Optional[SMSCampaign]:
        return self.db.query(SMSCampaign).filter(SMSCampaign.id == campaign_id).first()

    def get_all(self, page: int = 1, limit: int = 20):
        query = self.db.query(SMSCampaign)
        total = query.count()
        items = query.order_by(SMSCampaign.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, campaign: SMSCampaign) -> SMSCampaign:
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def update(self, campaign: SMSCampaign) -> SMSCampaign:
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def delete(self, campaign_id: UUID) -> bool:
        campaign = self.get_by_id(campaign_id)
        if not campaign:
            return False
        self.db.delete(campaign)
        self.db.commit()
        return True

    def get_scheduled(self) -> list[SMSCampaign]:
        return (
            self.db.query(SMSCampaign)
            .filter(
                SMSCampaign.status == "scheduled",
                SMSCampaign.scheduled_at <= func.now(),
            )
            .all()
        )


class PushCampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, campaign_id: UUID) -> Optional[PushCampaign]:
        return self.db.query(PushCampaign).filter(PushCampaign.id == campaign_id).first()

    def get_all(self, page: int = 1, limit: int = 20):
        query = self.db.query(PushCampaign)
        total = query.count()
        items = query.order_by(PushCampaign.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, campaign: PushCampaign) -> PushCampaign:
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def update(self, campaign: PushCampaign) -> PushCampaign:
        self.db.commit()
        self.db.refresh(campaign)
        return campaign

    def delete(self, campaign_id: UUID) -> bool:
        campaign = self.get_by_id(campaign_id)
        if not campaign:
            return False
        self.db.delete(campaign)
        self.db.commit()
        return True

    def get_scheduled(self) -> list[PushCampaign]:
        return (
            self.db.query(PushCampaign)
            .filter(
                PushCampaign.status == "scheduled",
                PushCampaign.scheduled_at <= func.now(),
            )
            .all()
        )


class CampaignLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, log: CampaignLog) -> CampaignLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_campaign(
        self,
        campaign_id: Optional[UUID] = None,
        sms_campaign_id: Optional[UUID] = None,
        push_campaign_id: Optional[UUID] = None,
        page: int = 1,
        limit: int = 20,
    ):
        query = self.db.query(CampaignLog)
        if campaign_id:
            query = query.filter(CampaignLog.campaign_id == campaign_id)
        if sms_campaign_id:
            query = query.filter(CampaignLog.sms_campaign_id == sms_campaign_id)
        if push_campaign_id:
            query = query.filter(CampaignLog.push_campaign_id == push_campaign_id)
        total = query.count()
        items = query.order_by(CampaignLog.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total


class AffiliateProgramRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, program_id: UUID) -> Optional[AffiliateProgram]:
        return self.db.query(AffiliateProgram).filter(AffiliateProgram.id == program_id).first()

    def get_all(self):
        return self.db.query(AffiliateProgram).order_by(AffiliateProgram.created_at.desc()).all()

    def get_active(self) -> list[AffiliateProgram]:
        return self.db.query(AffiliateProgram).filter(AffiliateProgram.is_active == True).all()

    def create(self, program: AffiliateProgram) -> AffiliateProgram:
        self.db.add(program)
        self.db.commit()
        self.db.refresh(program)
        return program

    def update(self, program: AffiliateProgram) -> AffiliateProgram:
        self.db.commit()
        self.db.refresh(program)
        return program

    def delete(self, program_id: UUID) -> bool:
        program = self.get_by_id(program_id)
        if not program:
            return False
        self.db.delete(program)
        self.db.commit()
        return True


class AffiliateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, affiliate_id: UUID) -> Optional[Affiliate]:
        return self.db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()

    def get_by_user_id(self, user_id: UUID) -> Optional[Affiliate]:
        return self.db.query(Affiliate).filter(Affiliate.user_id == user_id).first()

    def get_by_code(self, code: str) -> Optional[Affiliate]:
        return self.db.query(Affiliate).filter(Affiliate.affiliate_code == code).first()

    def get_all(self, page: int = 1, limit: int = 20, status: Optional[str] = None):
        query = self.db.query(Affiliate)
        if status:
            query = query.filter(Affiliate.status == status)
        total = query.count()
        items = query.order_by(Affiliate.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def get_active(self) -> list[Affiliate]:
        return self.db.query(Affiliate).filter(Affiliate.status == "approved").all()

    def create(self, affiliate: Affiliate) -> Affiliate:
        self.db.add(affiliate)
        self.db.commit()
        self.db.refresh(affiliate)
        return affiliate

    def update(self, affiliate: Affiliate) -> Affiliate:
        self.db.commit()
        self.db.refresh(affiliate)
        return affiliate

    def get_summary(self) -> dict:
        total = self.db.query(func.count(Affiliate.id)).scalar()
        active = self.db.query(func.count(Affiliate.id)).filter(Affiliate.status == "approved").scalar()
        total_earnings = self.db.query(func.sum(Affiliate.total_earnings)).scalar() or 0
        pending = self.db.query(func.sum(Affiliate.pending_balance)).scalar() or 0
        total_referrals = self.db.query(func.sum(Affiliate.total_referrals)).scalar() or 0
        total_conversions = self.db.query(func.sum(Affiliate.total_conversions)).scalar() or 0
        conversion_rate = (total_conversions / total_referrals * 100) if total_referrals > 0 else 0
        return {
            "total_affiliates": total,
            "active_affiliates": active,
            "total_earnings": float(total_earnings),
            "pending_payouts": float(pending),
            "total_clicks": total_referrals,
            "total_conversions": total_conversions,
            "conversion_rate": round(conversion_rate, 2),
        }


class AffiliateLinkRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, link_id: UUID) -> Optional[AffiliateLink]:
        return self.db.query(AffiliateLink).filter(AffiliateLink.id == link_id).first()

    def get_by_code(self, code: str) -> Optional[AffiliateLink]:
        return self.db.query(AffiliateLink).filter(AffiliateLink.code == code).first()

    def get_by_affiliate(self, affiliate_id: UUID) -> list[AffiliateLink]:
        return self.db.query(AffiliateLink).filter(AffiliateLink.affiliate_id == affiliate_id).all()

    def create(self, link: AffiliateLink) -> AffiliateLink:
        self.db.add(link)
        self.db.commit()
        self.db.refresh(link)
        return link

    def update(self, link: AffiliateLink) -> AffiliateLink:
        self.db.commit()
        self.db.refresh(link)
        return link

    def increment_clicks(self, link_id: UUID) -> None:
        self.db.query(AffiliateLink).filter(AffiliateLink.id == link_id).update(
            {AffiliateLink.total_clicks: AffiliateLink.total_clicks + 1}
        )
        self.db.commit()

    def increment_conversions(self, link_id: UUID) -> None:
        self.db.query(AffiliateLink).filter(AffiliateLink.id == link_id).update(
            {AffiliateLink.total_conversions: AffiliateLink.total_conversions + 1}
        )
        self.db.commit()


class AffiliateClickRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, click: AffiliateClick) -> AffiliateClick:
        self.db.add(click)
        self.db.commit()
        self.db.refresh(click)
        return click


class AffiliateEarningRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, earning_id: UUID) -> Optional[AffiliateEarning]:
        return self.db.query(AffiliateEarning).filter(AffiliateEarning.id == earning_id).first()

    def get_by_affiliate(self, affiliate_id: UUID, page: int = 1, limit: int = 20):
        query = self.db.query(AffiliateEarning).filter(AffiliateEarning.affiliate_id == affiliate_id)
        total = query.count()
        items = query.order_by(AffiliateEarning.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return items, total

    def create(self, earning: AffiliateEarning) -> AffiliateEarning:
        self.db.add(earning)
        self.db.commit()
        self.db.refresh(earning)
        return earning

    def update(self, earning: AffiliateEarning) -> AffiliateEarning:
        self.db.commit()
        self.db.refresh(earning)
        return earning

    def get_pending_payouts(self, affiliate_id: UUID) -> list[AffiliateEarning]:
        return (
            self.db.query(AffiliateEarning)
            .filter(
                AffiliateEarning.affiliate_id == affiliate_id,
                AffiliateEarning.status == "pending",
            )
            .all()
        )
