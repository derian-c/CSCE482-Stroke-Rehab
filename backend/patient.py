from base import Base
from physician import Physician
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

class Patient(base):
  __tablename__ = 'patients'

  id: Mapped[int] = mapped_column(primary_key=True)
  email_address: Mapped[str]
  physician: Mapped['Physician'] = relationship(back_populates='physicians')


  def __repr__(self) -> str:
    return f'Patient(id={self.id!r}, email_address={self.email_address!r})'


