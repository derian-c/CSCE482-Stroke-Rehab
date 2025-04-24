from extensions import db
from models.medication import Medication

def test_medication_create(populate_database,app):
  with app.app_context():
    medication = Medication(patient_id=3,name='test',dosage='test',instructions='test')
    db.session.add(medication)
    db.session.flush()
    assert medication.id == 1
    assert medication.dict() != {}
    db.session.rollback()

