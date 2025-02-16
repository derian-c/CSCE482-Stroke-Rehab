from base import Base
from typing import List
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship


class Physician(Base):
  __tablename__ = 'physicians'

  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str]
  email_address: Mapped[str]
  physician: Mapped[List['Patient']] = relationship(back_populates='patients')


  def __repr__(self) -> str:
    return f'Physician(id={self.id!r}, email_address={self.email_address!r})'


