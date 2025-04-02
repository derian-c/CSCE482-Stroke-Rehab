from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
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
  pending: Mapped[bool]


  def __repr__(self) -> str:
    return f'User({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}