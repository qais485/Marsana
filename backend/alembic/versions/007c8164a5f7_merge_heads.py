"""merge heads

Revision ID: 007c8164a5f7
Revises: 5f5527e29051, d4e5f6a7b8c9
Create Date: 2026-07-15 09:39:28.677032
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '007c8164a5f7'
down_revision: Union[str, None] = ('5f5527e29051', 'd4e5f6a7b8c9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
