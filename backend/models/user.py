from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from typing import List
from models.base import Base

class User(Base):
  __tablename__ = 'users'

  id: Mapped[int] = mapped_column(primary_key=True)
  first_name: Mapped[str]
  last_name: Mapped[str]
  email_address: Mapped[str] = mapped_column(unique=True)
  is_admin: Mapped[bool] = mapped_column(default=False)
  is_physician: Mapped[bool] = mapped_column(default=False)
  is_patient: Mapped[bool] = mapped_column(default=False)
  pending: Mapped[bool] = mapped_column(default=False)

  # User relations, some will be empty depending on the user's role
  patients: Mapped[List['User']] = relationship(
    secondary='patient_physicians', # Table name
    primaryjoin='User.id==PatientPhysician.physician_id',
    secondaryjoin='User.id==PatientPhysician.patient_id',
    back_populates='physician'
  )

  physician: Mapped['User'] = relationship(
    secondary='patient_physicians',
    primaryjoin='User.id==PatientPhysician.patient_id',
    secondaryjoin='User.id==PatientPhysician.physician_id',
    back_populates='patients',
    uselist=False
  )

  physician_chats: Mapped[List['Chat']] = relationship(primaryjoin='User.id==Chat.physician_id',cascade='all, delete')
  
  patient_chat: Mapped['Chat'] = relationship(primaryjoin='User.id==Chat.patient_id',cascade='all, delete')

  motion_files: Mapped[List['Motion_File']] = relationship(back_populates='patient', cascade='all, delete')

  device: Mapped['Device'] = relationship(back_populates='patient')

  patient_documents: Mapped[List['PatientDocument']] = relationship(back_populates='patient')

  medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")



  def __repr__(self) -> str:
    return f'User({self.dict()})'
  
  def dict(self):
    user_dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    # To prevent recursively calling the dict function forever
    if self.physician:
      physician_dict = {c.name: getattr(self.physician, c.name) for c in self.physician.__table__.columns}
    else:
      physician_dict = {}
    user_dict['physician'] = physician_dict
    if self.patients:
      patient_dicts = [{c.name: getattr(patient, c.name) for c in patient.__table__.columns} for patient in self.patients]
    else:
      patient_dicts = []
    user_dict['patients'] = patient_dicts
    return user_dict