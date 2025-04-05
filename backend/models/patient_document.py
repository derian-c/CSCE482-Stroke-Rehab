from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Enum
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional
import enum
from models.base import Base

class DocumentType(enum.Enum):
    MEDICAL_HISTORY = "medical_history"
    EXERCISE_RECORD = "exercise_record"
    LAB_RESULT = "lab_result"

class PatientDocument(Base):
    __tablename__ = 'patient_documents'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    url: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[DocumentType] = mapped_column(Enum(DocumentType), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient_id = Column(Integer, ForeignKey('patients.id'))
    patient = relationship("Patient", back_populates="patient_documents")

    def __repr__(self) -> str:
        return f'PatientDocument({self.dict()})'

    def dict(self):
        document_dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        # Convert Enum to string for JSON serialization
        if 'type' in document_dict and isinstance(document_dict['type'], DocumentType):
            document_dict['type'] = document_dict['type'].value
        return document_dict