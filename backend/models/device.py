from enum import unique
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from typing import Optional
from models.base import Base

class Device(Base):
  __tablename__ = 'devices'

  id: Mapped[int] = mapped_column(primary_key=True)
  # Add any device-specific fields here
  
  patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=True, unique=True)
  patient: Mapped['User'] = relationship(back_populates='device')
  
  def __repr__(self) -> str:
    return f'Device({self.dict()})'
  
  def dict(self):
    device_dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    # Add patient information if assigned
    if self.patient:
      device_dict['patient_id'] = self.patient.id
    else:
      device_dict['patient_id'] = None
    return device_dict
