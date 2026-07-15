from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.database_models import ContactMessage, FAQItem, HelpArticle


def utcnow():
    return datetime.now(timezone.utc)


class ContactMessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20, status: Optional[str] = None) -> tuple[list, int]:
        query = self.db.query(ContactMessage)
        if status:
            query = query.filter(ContactMessage.status == status)
        total = query.count()
        items = (
            query.order_by(ContactMessage.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, message_id: UUID) -> Optional[ContactMessage]:
        return self.db.query(ContactMessage).filter(ContactMessage.id == message_id).first()

    def create(self, message: ContactMessage) -> ContactMessage:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def update(self, message: ContactMessage) -> ContactMessage:
        self.db.commit()
        self.db.refresh(message)
        return message

    def delete(self, message: ContactMessage) -> None:
        self.db.delete(message)
        self.db.commit()

    def get_stats(self) -> dict:
        total = self.db.query(func.count(ContactMessage.id)).scalar()
        new_count = self.db.query(func.count(ContactMessage.id)).filter(ContactMessage.status == "new").scalar()
        read_count = self.db.query(func.count(ContactMessage.id)).filter(ContactMessage.status == "read").scalar()
        replied_count = self.db.query(func.count(ContactMessage.id)).filter(ContactMessage.status == "replied").scalar()
        archived_count = self.db.query(func.count(ContactMessage.id)).filter(ContactMessage.status == "archived").scalar()
        return {
            "total": total,
            "new": new_count,
            "read": read_count,
            "replied": replied_count,
            "archived": archived_count,
        }


class FAQRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20, category: Optional[str] = None) -> tuple[list, int]:
        query = self.db.query(FAQItem)
        if category:
            query = query.filter(FAQItem.category == category)
        total = query.count()
        items = (
            query.order_by(FAQItem.sort_order, FAQItem.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_active(self, category: Optional[str] = None) -> list[FAQItem]:
        query = self.db.query(FAQItem).filter(FAQItem.is_active)
        if category:
            query = query.filter(FAQItem.category == category)
        return query.order_by(FAQItem.sort_order).all()

    def get_by_id(self, faq_id: UUID) -> Optional[FAQItem]:
        return self.db.query(FAQItem).filter(FAQItem.id == faq_id).first()

    def create(self, faq: FAQItem) -> FAQItem:
        self.db.add(faq)
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def update(self, faq: FAQItem) -> FAQItem:
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def delete(self, faq: FAQItem) -> None:
        self.db.delete(faq)
        self.db.commit()

    def get_categories(self) -> list[str]:
        result = (
            self.db.query(FAQItem.category)
            .filter(FAQItem.is_active)
            .distinct()
            .order_by(FAQItem.category)
            .all()
        )
        return [r[0] for r in result]


class HelpArticleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, page: int = 1, limit: int = 20, category: Optional[str] = None) -> tuple[list, int]:
        query = self.db.query(HelpArticle)
        if category:
            query = query.filter(HelpArticle.category == category)
        total = query.count()
        items = (
            query.order_by(HelpArticle.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        return items, total

    def get_published(self, category: Optional[str] = None) -> list[HelpArticle]:
        query = self.db.query(HelpArticle).filter(HelpArticle.is_published)
        if category:
            query = query.filter(HelpArticle.category == category)
        return query.order_by(HelpArticle.created_at.desc()).all()

    def get_by_id(self, article_id: UUID) -> Optional[HelpArticle]:
        return self.db.query(HelpArticle).filter(HelpArticle.id == article_id).first()

    def get_by_slug(self, slug: str) -> Optional[HelpArticle]:
        return self.db.query(HelpArticle).filter(HelpArticle.slug == slug).first()

    def create(self, article: HelpArticle) -> HelpArticle:
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def update(self, article: HelpArticle) -> HelpArticle:
        self.db.commit()
        self.db.refresh(article)
        return article

    def delete(self, article: HelpArticle) -> None:
        self.db.delete(article)
        self.db.commit()

    def increment_view_count(self, article: HelpArticle) -> None:
        article.view_count = (article.view_count or 0) + 1
        self.db.commit()

    def get_categories(self) -> list[str]:
        result = (
            self.db.query(HelpArticle.category)
            .filter(HelpArticle.is_published)
            .distinct()
            .order_by(HelpArticle.category)
            .all()
        )
        return [r[0] for r in result]
