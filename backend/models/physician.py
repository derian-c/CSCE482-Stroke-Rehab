from sqlalchemy import ForeignKey
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from models.base import Base

class Physician(Base):
  __tablename__ = 'physicians'

  id: Mapped[int] = mapped_column(primary_key=True)
  first_name: Mapped[str]
  last_name: Mapped[str]
  email_address: Mapped[str]
  patients: Mapped[List['Patient']] = relationship(back_populates='physician',cascade='all, delete')
  chat: Mapped['Chat'] = relationship(back_populates='physician',cascade='all, delete',uselist=False)


  def __repr__(self) -> str:
    return f'Physician({self.dict()})'

  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
