from extensions import db
from models.physician import Physician

def test_physician_get(populate_database,app):
  with app.app_context():
    physician = db.session.get(Physician, 1)
    assert physician.name == 'Test Physician'

def test_physician_create(app):
  with app.app_context():
    physician = Physician(name='Test Physician',email_address='test@test.com')
    db.session.add(physician)
    db.session.commit()
    assert physician.id == 1

def test_physician_update(populate_database,app):
  with app.app_context():
    physician = db.session.get(Physician, 1)
    physician.name = 'New Name'
    assert physician in db.session.dirty
    db.session.commit()
    assert not (physician in db.session.dirty)
    assert physician.name == 'New Name'
  
def test_physician_delete(populate_database,app):
  with app.app_context():
    physician = db.session.get(Physician, 1)
    db.session.delete(physician)
    db.session.commit()
    assert not (physician in db.session)
    assert db.session.get(Physician, 1) == None
