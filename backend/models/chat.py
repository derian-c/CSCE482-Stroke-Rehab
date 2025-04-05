from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from typing import List
from models.base import Base

class Chat(Base):
  __tablename__ = 'chats'

  id: Mapped[int] = mapped_column(primary_key=True)
  physician_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
  patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'),unique=True)
  
  chat_messages: Mapped[List['ChatMessage']] = relationship(back_populates='chat',cascade='all, delete')


  def __repr__(self) -> str:
    return f'Chat({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}