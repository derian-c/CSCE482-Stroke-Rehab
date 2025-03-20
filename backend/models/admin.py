from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from models.base import Base

class Admin(Base):
  __tablename__ = 'admins'

  id: Mapped[int] = mapped_column(primary_key=True)
  first_name: Mapped[str]
  last_name: Mapped[str]
  email_address: Mapped[str]


  def __repr__(self) -> str:
    return f'Admin({self.dict()})'
  
  def dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}