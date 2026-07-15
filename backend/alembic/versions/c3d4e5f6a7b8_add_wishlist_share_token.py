"""Add wishlist share_token and variant_id columns

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-15 18:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('wishlist_items', sa.Column('variant_id', sa.UUID(), nullable=True))
    op.add_column('wishlist_items', sa.Column('share_token', sa.String(length=64), nullable=True))
    op.create_index('ix_wishlist_items_share_token', 'wishlist_items', ['share_token'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_wishlist_items_share_token', table_name='wishlist_items')
    op.drop_column('wishlist_items', 'share_token')
    op.drop_column('wishlist_items', 'variant_id')
