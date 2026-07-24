from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.database_models import StoreSetting


class StoreSettingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_key(self, key: str) -> Optional[StoreSetting]:
        return self.db.query(StoreSetting).filter(StoreSetting.key == key).first()

    def get_by_category(self, category: str) -> list[StoreSetting]:
        return (
            self.db.query(StoreSetting)
            .filter(StoreSetting.category == category)
            .order_by(StoreSetting.key)
            .all()
        )

    def get_all(self) -> list[StoreSetting]:
        return self.db.query(StoreSetting).order_by(StoreSetting.category, StoreSetting.key).all()

    def get_all_grouped(self) -> dict[str, list[StoreSetting]]:
        settings = self.get_all()
        grouped = {}
        for setting in settings:
            if setting.category not in grouped:
                grouped[setting.category] = []
            grouped[setting.category].append(setting)
        return grouped

    def create(self, data: dict) -> StoreSetting:
        setting = StoreSetting(**data)
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update(self, setting: StoreSetting, data: dict) -> StoreSetting:
        for key, value in data.items():
            if value is not None:
                setattr(setting, key, value)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def delete(self, setting: StoreSetting) -> None:
        self.db.delete(setting)
        self.db.commit()

    def get_or_create(self, key: str, category: str, default_value=None, description=None) -> StoreSetting:
        setting = self.get_by_key(key)
        if not setting:
            setting = self.create({
                "key": key,
                "category": category,
                "value": default_value,
                "description": description,
            })
        return setting

    def bulk_update(self, settings_data: list[dict]) -> list[StoreSetting]:
        updated = []
        for item in settings_data:
            setting = self.get_by_key(item["key"])
            if setting:
                setting = self.update(setting, {"value": item["value"]})
            else:
                setting = self.create(item)
            updated.append(setting)
        return updated
