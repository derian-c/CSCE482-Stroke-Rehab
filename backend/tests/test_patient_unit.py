from extensions import db
from models.patient import Patient
from models.physician import Physician

def test_patient_get(populate_database,app):
  with app.app_context():
    patient = db.session.get(Patient, 1)
    assert patient.first_name == 'Test'
    assert patient.last_name == 'Patient'

def test_patient_create(populate_database,app):
  with app.app_context():
    patient = Patient(first_name='Test',last_name='Patient2',email_address='test@test.com',physician_id=1)
    db.session.add(patient)
    db.session.commit()
    assert patient.id == 2

def test_patient_update(populate_database,app):
  with app.app_context():
    patient = db.session.get(Patient, 1)
    patient.first_name = 'New'
    assert patient in db.session.dirty
    db.session.commit()
    assert not (patient in db.session.dirty)
    assert patient.first_name == 'New'
  
def test_patient_delete(populate_database,app):
  with app.app_context():
    patient = db.session.get(Patient, 1)
    db.session.delete(patient)
    db.session.commit()
    assert not (patient in db.session)
    assert db.session.get(Patient, 1) == None
