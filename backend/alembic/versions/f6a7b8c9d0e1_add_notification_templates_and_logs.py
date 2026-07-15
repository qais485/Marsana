"""Add notification templates and logs tables

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-07-15 22:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, None] = '1c1235063c9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'notification_templates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('title_template', sa.String(length=255), nullable=False),
        sa.Column('message_template', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=False),
        sa.Column('channel', sa.String(length=20), nullable=False, server_default='all'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('send_email', sa.Boolean(), server_default='true'),
        sa.Column('send_push', sa.Boolean(), server_default='true'),
        sa.Column('send_in_app', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index(op.f('ix_notification_templates_slug'), 'notification_templates', ['slug'], unique=True)
    op.create_index(op.f('ix_notification_templates_notification_type'), 'notification_templates', ['notification_type'], unique=False)

    op.create_table(
        'notification_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('template_id', sa.UUID(), nullable=True),
        sa.Column('channel', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='sent'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('reference_type', sa.String(length=50), nullable=True),
        sa.Column('reference_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['template_id'], ['notification_templates.id'], ondelete='SET NULL'),
    )
    op.create_index(op.f('ix_notification_logs_user_id'), 'notification_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_notification_logs_channel'), 'notification_logs', ['channel'], unique=False)
    op.create_index(op.f('ix_notification_logs_status'), 'notification_logs', ['status'], unique=False)
    op.create_index(op.f('ix_notification_logs_created_at'), 'notification_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_table('notification_logs')
    op.drop_table('notification_templates')
