from enum import unique
from sqlalchemy import Column, ForeignKey, Integer, DateTime
from sqlalchemy.orm import Mapped 
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional
from models.base import Base

class Motion_File(Base):
  __tablename__ = 'motion_files'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  url: Mapped[str] 
  type: Mapped[str]
  createdAt = Column(DateTime(timezone=True), server_default=func.now())
   
  patient_id = Column(Integer, ForeignKey('users.id'))
  patient = relationship("User", back_populates="motion_files")
  motion_readings: Mapped['MotionReading'] = relationship(cascade='all, delete', back_populates='motion_file')
  
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

