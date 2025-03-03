from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from models.base import Base

class Patient(Base):
  __tablename__ = 'patients'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  email_address: Mapped[str]
  physician_id: Mapped[int] = mapped_column(ForeignKey('physicians.id'))
  physician: Mapped['Physician'] = relationship(back_populates='patients')


  def __repr__(self) -> str:
    return f'Patient(id={self.id!r}, email_address={self.email_address!r}, physician_id={self.physician_id})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}