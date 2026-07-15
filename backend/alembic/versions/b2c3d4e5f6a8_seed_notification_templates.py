"""Seed default notification templates

Revision ID: b2c3d4e5f6a8
Revises: a1b2c3d4e5f7
Create Date: 2026-07-16 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a8'
down_revision: Union[str, None] = 'a1b2c3d4e5f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    templates_table = sa.table('notification_templates',
        sa.Column('id', sa.UUID()),
        sa.Column('name', sa.String(255)),
        sa.Column('slug', sa.String(100)),
        sa.Column('subject', sa.String(255)),
        sa.Column('title_template', sa.String(255)),
        sa.Column('message_template', sa.Text()),
        sa.Column('notification_type', sa.String(50)),
        sa.Column('channel', sa.String(20)),
        sa.Column('is_active', sa.Boolean()),
        sa.Column('send_email', sa.Boolean()),
        sa.Column('send_push', sa.Boolean()),
        sa.Column('send_in_app', sa.Boolean()),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )

    import uuid
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    templates = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Order Placed',
            'slug': 'order_placed',
            'subject': 'Order Confirmation - {{order_number}}',
            'title_template': 'Order Confirmed',
            'message_template': 'Your order {{order_number}} has been placed successfully. Total: ${{total_amount}}.',
            'notification_type': 'order',
            'channel': 'all',
            'is_active': True,
            'send_email': True,
            'send_push': True,
            'send_in_app': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Order Cancelled',
            'slug': 'order_cancelled',
            'subject': 'Order Cancelled - {{order_number}}',
            'title_template': 'Order Cancelled',
            'message_template': 'Your order {{order_number}} has been cancelled. Reason: {{reason}}.',
            'notification_type': 'order',
            'channel': 'all',
            'is_active': True,
            'send_email': True,
            'send_push': True,
            'send_in_app': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Order Shipped',
            'slug': 'order_shipped',
            'subject': 'Order Shipped - {{order_number}}',
            'title_template': 'Order Shipped',
            'message_template': 'Your order {{order_number}} has been shipped. Track your delivery for updates.',
            'notification_type': 'order',
            'channel': 'all',
            'is_active': True,
            'send_email': True,
            'send_push': True,
            'send_in_app': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Order Delivered',
            'slug': 'order_delivered',
            'subject': 'Order Delivered - {{order_number}}',
            'title_template': 'Order Delivered',
            'message_template': 'Your order {{order_number}} has been delivered successfully.',
            'notification_type': 'order',
            'channel': 'all',
            'is_active': True,
            'send_email': True,
            'send_push': True,
            'send_in_app': True,
            'created_at': now,
            'updated_at': now,
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Refund Issued',
            'slug': 'refund_issued',
            'subject': 'Refund Processed - {{order_number}}',
            'title_template': 'Refund Processed',
            'message_template': 'A refund of ${{refund_amount}} has been issued for order {{order_number}}.',
            'notification_type': 'order',
            'channel': 'all',
            'is_active': True,
            'send_email': True,
            'send_push': True,
            'send_in_app': True,
            'created_at': now,
            'updated_at': now,
        },
    ]

    op.execute(templates_table.insert().values(templates))


def downgrade() -> None:
    op.execute("DELETE FROM notification_templates WHERE slug IN ('order_placed', 'order_cancelled', 'order_shipped', 'order_delivered', 'refund_issued')")
