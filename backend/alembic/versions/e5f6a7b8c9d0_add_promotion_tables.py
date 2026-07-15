"""Add promotion tables: coupons, auto_discounts, loyalty_points, referral

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-15 20:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = '007c8164a5f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'coupons',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_type', sa.String(length=20), nullable=False, server_default='percentage'),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('min_order_amount', sa.Numeric(precision=10, scale=2), server_default='0'),
        sa.Column('max_uses', sa.Integer(), nullable=True),
        sa.Column('used_count', sa.Integer(), server_default='0'),
        sa.Column('per_user_limit', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code'),
    )
    op.create_index(op.f('ix_coupons_code'), 'coupons', ['code'], unique=True)

    op.create_table(
        'auto_discounts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_type', sa.String(length=20), nullable=False, server_default='percentage'),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('min_order_amount', sa.Numeric(precision=10, scale=2), server_default='0'),
        sa.Column('min_quantity', sa.Integer(), server_default='1'),
        sa.Column('target_type', sa.String(length=50), nullable=False, server_default='all'),
        sa.Column('target_product_ids', sa.Text(), nullable=True),
        sa.Column('target_category_ids', sa.Text(), nullable=True),
        sa.Column('buy_x_get_y_buy_qty', sa.Integer(), nullable=True),
        sa.Column('buy_x_get_y_get_qty', sa.Integer(), nullable=True),
        sa.Column('buy_x_get_y_discount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('priority', sa.Integer(), server_default='0'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'loyalty_points',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('points_balance', sa.Integer(), server_default='0'),
        sa.Column('lifetime_earned', sa.Integer(), server_default='0'),
        sa.Column('lifetime_redeemed', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )

    op.create_table(
        'loyalty_point_transactions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=True),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_loyalty_point_transactions_user_id'), 'loyalty_point_transactions', ['user_id'], unique=False)

    op.create_table(
        'referral_codes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('usage_count', sa.Integer(), server_default='0'),
        sa.Column('max_uses', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_referral_codes_code'), 'referral_codes', ['code'], unique=True)

    op.create_table(
        'referral_rewards',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('referrer_id', sa.UUID(), nullable=False),
        sa.Column('referred_id', sa.UUID(), nullable=True),
        sa.Column('referral_code', sa.String(length=20), nullable=False),
        sa.Column('reward_type', sa.String(length=20), nullable=False, server_default='points'),
        sa.Column('reward_value', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['referred_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['referrer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_referral_rewards_referrer_id'), 'referral_rewards', ['referrer_id'], unique=False)


def downgrade() -> None:
    op.drop_table('referral_rewards')
    op.drop_table('referral_codes')
    op.drop_table('loyalty_point_transactions')
    op.drop_table('loyalty_points')
    op.drop_table('auto_discounts')
    op.drop_table('coupons')
