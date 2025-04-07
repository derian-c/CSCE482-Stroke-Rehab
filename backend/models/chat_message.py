from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from models.base import Base

class ChatMessage(Base):
  __tablename__ = 'chat_messages'

  id: Mapped[int] = mapped_column(primary_key=True)
  sender: Mapped[int] = mapped_column(ForeignKey('users.id'))
  chat_id: Mapped[int] = mapped_column(ForeignKey('chats.id'))
  content: Mapped[str]
  timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

  chat: Mapped['Chat'] = relationship(back_populates='chat_messages')


  def __repr__(self) -> str:
    return f'ChatMessage({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}