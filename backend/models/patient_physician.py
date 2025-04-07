from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from models.base import Base

# Defines the patient-physician relationship
# Patients can only have one physician
# This could just be a table, but I made it a class to be consistent
class PatientPhysician(Base):
  __tablename__ = 'patient_physicians'

  patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'),primary_key=True,unique=True)
  physician_id: Mapped[int] = mapped_column(ForeignKey('users.id'),primary_key=True)


  def __repr__(self) -> str:
    return f'PatientPhysician({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}