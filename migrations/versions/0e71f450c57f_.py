"""empty message

Revision ID: 0e71f450c57f
Revises: 
Create Date: 2019-02-09 16:48:47.946432

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0e71f450c57f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tweet',
    sa.Column('id', sa.String(length=240), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('text', sa.String(length=240), nullable=True),
    sa.Column('truncated', sa.Boolean(), nullable=True),
    sa.Column('user_id', sa.String(length=120), nullable=True),
    sa.Column('user_name', sa.String(length=120), nullable=True),
    sa.Column('user_screen_name', sa.String(length=120), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tweet_created_at'), 'tweet', ['created_at'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_tweet_created_at'), table_name='tweet')
    op.drop_table('tweet')
    # ### end Alembic commands ###
