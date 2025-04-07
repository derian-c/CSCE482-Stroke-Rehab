from sqlalchemy import ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from datetime import datetime
from typing import Optional
from models.base import Base

class Medication(Base):
    __tablename__ = 'medications'

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    name: Mapped[str] = mapped_column(String(100))
    dosage: Mapped[str] = mapped_column(String(50))
    instructions: Mapped[str] = mapped_column(String(200))
    last_taken: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    
    patient = relationship("User", back_populates="medications")
    
    def __repr__(self) -> str:
        return f'Medication({self.dict()})'
    
    def dict(self):
        result = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        \
        if self.last_taken:
            result['last_taken'] = self.last_taken.isoformat()
        return result