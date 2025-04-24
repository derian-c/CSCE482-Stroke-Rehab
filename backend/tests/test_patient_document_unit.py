from extensions import db
from models.patient_document import PatientDocument, DocumentType 

def test_device_create(populate_database,app):
  with app.app_context():
    doc = PatientDocument(patient_id=3,name='test',type=DocumentType.MEDICAL_HISTORY,url='test')
    db.session.add(doc)
    db.session.flush()
    assert doc.id == 1
    assert doc.dict() != {}
    db.session.rollback()

