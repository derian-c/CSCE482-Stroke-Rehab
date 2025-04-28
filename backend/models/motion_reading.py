from models.base import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship 

class MotionReading(Base):
  __tablename__ = 'motion_readings'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  motion_file_id: Mapped[int] = mapped_column(ForeignKey('motion_files.id'))
  min: Mapped[float]
  max: Mapped[float]

  motion_file: Mapped['Motion_File'] = relationship(back_populates='motion_readings')

  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
