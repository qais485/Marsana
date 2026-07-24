"""Merge Fix all 12 and store_settings

Revision ID: 039936f2cd7f
Revises: 929ab98087da, g1h2i3j4k5l6
Create Date: 2026-07-17 11:10:57.443803
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '039936f2cd7f'
down_revision: Union[str, None] = ('929ab98087da', 'g1h2i3j4k5l6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
