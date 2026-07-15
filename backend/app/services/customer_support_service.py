import re
import secrets
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import ContactMessage, FAQItem, HelpArticle
from app.repositories.customer_support_repository import (
    ContactMessageRepository,
    FAQRepository,
    HelpArticleRepository,
)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


class CustomerSupportService:
    def __init__(self, db: Session):
        self.db = db
        self.contact_repo = ContactMessageRepository(db)
        self.faq_repo = FAQRepository(db)
        self.help_repo = HelpArticleRepository(db)

    def get_contact_messages(self, page: int = 1, limit: int = 20, status: Optional[str] = None) -> dict:
        messages, total = self.contact_repo.get_all(page, limit, status)
        return {
            "messages": [self._serialize_contact(m) for m in messages],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_contact_message(self, message_id: UUID) -> dict:
        message = self.contact_repo.get_by_id(message_id)
        if not message:
            raise ValueError("Contact message not found")
        if message.status == "new":
            message.status = "read"
            self.contact_repo.update(message)
        return self._serialize_contact(message)

    def create_contact_message(self, data: dict) -> dict:
        message = ContactMessage(
            name=data["name"],
            email=data["email"],
            subject=data["subject"],
            message=data["message"],
        )
        created = self.contact_repo.create(message)
        return self._serialize_contact(created)

    def update_contact_message(self, message_id: UUID, data: dict) -> dict:
        message = self.contact_repo.get_by_id(message_id)
        if not message:
            raise ValueError("Contact message not found")
        for key, value in data.items():
            if value is not None:
                setattr(message, key, value)
        if data.get("admin_reply") and message.status != "replied":
            message.status = "replied"
            message.replied_at = datetime.now(timezone.utc)
        updated = self.contact_repo.update(message)
        return self._serialize_contact(updated)

    def delete_contact_message(self, message_id: UUID) -> None:
        message = self.contact_repo.get_by_id(message_id)
        if not message:
            raise ValueError("Contact message not found")
        self.contact_repo.delete(message)

    def get_contact_stats(self) -> dict:
        return self.contact_repo.get_stats()

    def get_faq_items(self, page: int = 1, limit: int = 20, category: Optional[str] = None) -> dict:
        items, total = self.faq_repo.get_all(page, limit, category)
        return {
            "faqs": [self._serialize_faq(i) for i in items],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_active_faqs(self, category: Optional[str] = None) -> list[dict]:
        items = self.faq_repo.get_active(category)
        return [self._serialize_faq(i) for i in items]

    def get_faq_item(self, faq_id: UUID) -> dict:
        faq = self.faq_repo.get_by_id(faq_id)
        if not faq:
            raise ValueError("FAQ item not found")
        return self._serialize_faq(faq)

    def create_faq_item(self, data: dict) -> dict:
        faq = FAQItem(
            question=data["question"],
            answer=data["answer"],
            category=data.get("category", "general"),
            sort_order=data.get("sort_order", 0),
            is_active=data.get("is_active", True),
        )
        created = self.faq_repo.create(faq)
        return self._serialize_faq(created)

    def update_faq_item(self, faq_id: UUID, data: dict) -> dict:
        faq = self.faq_repo.get_by_id(faq_id)
        if not faq:
            raise ValueError("FAQ item not found")
        for key, value in data.items():
            if value is not None:
                setattr(faq, key, value)
        updated = self.faq_repo.update(faq)
        return self._serialize_faq(updated)

    def delete_faq_item(self, faq_id: UUID) -> None:
        faq = self.faq_repo.get_by_id(faq_id)
        if not faq:
            raise ValueError("FAQ item not found")
        self.faq_repo.delete(faq)

    def get_faq_categories(self) -> list[str]:
        return self.faq_repo.get_categories()

    def get_help_articles(self, page: int = 1, limit: int = 20, category: Optional[str] = None) -> dict:
        articles, total = self.help_repo.get_all(page, limit, category)
        return {
            "articles": [self._serialize_help(a) for a in articles],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit,
            },
        }

    def get_published_articles(self, category: Optional[str] = None) -> list[dict]:
        articles = self.help_repo.get_published(category)
        return [self._serialize_help(a) for a in articles]

    def get_help_article(self, article_id: UUID) -> dict:
        article = self.help_repo.get_by_id(article_id)
        if not article:
            raise ValueError("Help article not found")
        return self._serialize_help(article)

    def get_help_article_by_slug(self, slug: str) -> dict:
        article = self.help_repo.get_by_slug(slug)
        if not article:
            raise ValueError("Help article not found")
        self.help_repo.increment_view_count(article)
        return self._serialize_help(article)

    def create_help_article(self, data: dict) -> dict:
        slug = slugify(data["title"])
        existing = self.help_repo.get_by_slug(slug)
        if existing:
            slug = f"{slug}-{secrets.token_hex(4)}"
        article = HelpArticle(
            title=data["title"],
            slug=slug,
            content=data["content"],
            excerpt=data.get("excerpt"),
            category=data.get("category", "general"),
            is_published=data.get("is_published", True),
        )
        created = self.help_repo.create(article)
        return self._serialize_help(created)

    def update_help_article(self, article_id: UUID, data: dict) -> dict:
        article = self.help_repo.get_by_id(article_id)
        if not article:
            raise ValueError("Help article not found")
        if "title" in data and data["title"]:
            new_slug = slugify(data["title"])
            if new_slug != article.slug:
                existing = self.help_repo.get_by_slug(new_slug)
                if existing:
                    new_slug = f"{new_slug}-{int(datetime.now(timezone.utc).timestamp())}"
                article.slug = new_slug
        for key, value in data.items():
            if value is not None:
                setattr(article, key, value)
        updated = self.help_repo.update(article)
        return self._serialize_help(updated)

    def delete_help_article(self, article_id: UUID) -> None:
        article = self.help_repo.get_by_id(article_id)
        if not article:
            raise ValueError("Help article not found")
        self.help_repo.delete(article)

    def get_help_categories(self) -> list[str]:
        return self.help_repo.get_categories()

    def _serialize_contact(self, message: ContactMessage) -> dict:
        return {
            "id": str(message.id),
            "name": message.name,
            "email": message.email,
            "subject": message.subject,
            "message": message.message,
            "status": message.status,
            "admin_reply": message.admin_reply,
            "replied_at": message.replied_at.isoformat() if message.replied_at else None,
            "created_at": message.created_at.isoformat(),
            "updated_at": message.updated_at.isoformat(),
        }

    def _serialize_faq(self, faq: FAQItem) -> dict:
        return {
            "id": str(faq.id),
            "question": faq.question,
            "answer": faq.answer,
            "category": faq.category,
            "sort_order": faq.sort_order,
            "is_active": faq.is_active,
            "created_at": faq.created_at.isoformat(),
            "updated_at": faq.updated_at.isoformat(),
        }

    def _serialize_help(self, article: HelpArticle) -> dict:
        return {
            "id": str(article.id),
            "title": article.title,
            "slug": article.slug,
            "content": article.content,
            "excerpt": article.excerpt,
            "category": article.category,
            "is_published": article.is_published,
            "view_count": article.view_count or 0,
            "created_at": article.created_at.isoformat(),
            "updated_at": article.updated_at.isoformat(),
        }
