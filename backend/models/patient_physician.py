from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from models.base import Base

# Defines the patient-physician relationship
# Patients can only have one physician
class PatientPhysician(Base):
  __tablename__ = 'patient_physicians'

  patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'),unique=True)
  physician_id: Mapped[int] = mapped_column(ForeignKey('users.id'))


  def __repr__(self) -> str:
    return f'PatientPhysician({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}