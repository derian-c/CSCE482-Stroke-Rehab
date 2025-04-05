from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from typing import Optional
from models.base import Base

class Patient(Base):
  __tablename__ = 'patients'

  id: Mapped[int] = mapped_column(primary_key=True)
  first_name: Mapped[str]
  last_name: Mapped[str]
  email_address: Mapped[str]
  physician_id: Mapped[int] = mapped_column(ForeignKey('physicians.id'))
  physician: Mapped['Physician'] = relationship("Physician",back_populates='patients')
  chat: Mapped['Chat'] = relationship(back_populates='patient',cascade='all, delete',uselist=False)

  device = relationship("Device",back_populates='patient', uselist=False)
  patient_documents = relationship("PatientDocument", back_populates="patient", cascade="all, delete-orphan")

  def __repr__(self) -> str:
    return f'Patient({self.dict()})'
  
  def dict(self):
    patient_dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    # Add device information if assigned
    if self.device:
      patient_dict['device_id'] = self.device.id
    else:
      patient_dict['device_id'] = None
    return patient_dict
