from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import ForeignKey
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

class Base(DeclarativeBase):
  pass

class Patient(Base):
  __tablename__ = 'patients'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  email_address: Mapped[str]
  physician_id: Mapped[int] = mapped_column(ForeignKey('physicians.id'))
  physician: Mapped['Physician'] = relationship(back_populates='patients')


  def __repr__(self) -> str:
    return f'Patient(id={self.id!r}, email_address={self.email_address!r})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Physician(Base):
  __tablename__ = 'physicians'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  email_address: Mapped[str]
  patients: Mapped[List['Patient']] = relationship(back_populates='physician')


  def __repr__(self) -> str:
    return f'Physician(id={self.id!r}, email_address={self.email_address!r})'

  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
