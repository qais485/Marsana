"""Add shipping tables and order shipping fields

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-07-15 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'shipping_zones',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('countries', sa.Text(), nullable=False),
        sa.Column('states', sa.Text(), nullable=True),
        sa.Column('postal_codes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'shipping_methods',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('carrier', sa.String(length=100), nullable=True),
        sa.Column('estimated_days_min', sa.Integer(), nullable=False),
        sa.Column('estimated_days_max', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_express', sa.Boolean(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'pickup_locations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address_line_1', sa.String(length=255), nullable=False),
        sa.Column('address_line_2', sa.String(length=255), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('postal_code', sa.String(length=20), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('working_hours', sa.Text(), nullable=True),
        sa.Column('instructions', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('latitude', sa.Numeric(10, 8), nullable=True),
        sa.Column('longitude', sa.Numeric(11, 8), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'shipping_rates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('zone_id', sa.UUID(), nullable=False),
        sa.Column('method_id', sa.UUID(), nullable=False),
        sa.Column('base_rate', sa.Numeric(10, 2), nullable=False),
        sa.Column('per_kg_rate', sa.Numeric(10, 2), nullable=True),
        sa.Column('free_shipping_threshold', sa.Numeric(10, 2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['zone_id'], ['shipping_zones.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['method_id'], ['shipping_methods.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_shipping_rates_zone_method', 'shipping_rates', ['zone_id', 'method_id'], unique=True)

    op.create_table(
        'delivery_tracking',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=False),
        sa.Column('tracking_number', sa.String(length=100), nullable=True),
        sa.Column('carrier', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('status_description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('estimated_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('shipped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('out_for_delivery_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_delivery_tracking_order_id'), 'delivery_tracking', ['order_id'], unique=False)
    op.create_index(op.f('ix_delivery_tracking_tracking_number'), 'delivery_tracking', ['tracking_number'], unique=False)

    op.create_table(
        'tracking_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tracking_id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('event_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['tracking_id'], ['delivery_tracking.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_tracking_events_tracking_id'), 'tracking_events', ['tracking_id'], unique=False)

    op.add_column('orders', sa.Column('shipping_method', sa.String(length=50), nullable=True))
    op.add_column('orders', sa.Column('delivery_type', sa.String(length=20), nullable=False, server_default='shipping'))
    op.add_column('orders', sa.Column('pickup_location_id', sa.UUID(), nullable=True))
    op.add_column('orders', sa.Column('estimated_delivery', sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key('fk_orders_pickup_location', 'orders', 'pickup_locations', ['pickup_location_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('fk_orders_pickup_location', 'orders', type_='foreignkey')
    op.drop_column('orders', 'estimated_delivery')
    op.drop_column('orders', 'pickup_location_id')
    op.drop_column('orders', 'delivery_type')
    op.drop_column('orders', 'shipping_method')
    op.drop_table('tracking_events')
    op.drop_table('delivery_tracking')
    op.drop_table('shipping_rates')
    op.drop_table('pickup_locations')
    op.drop_table('shipping_methods')
    op.drop_table('shipping_zones')
