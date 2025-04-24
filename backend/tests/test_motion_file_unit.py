from extensions import db
from models.motion_file import Motion_File

def test_device_create(populate_database,app):
  with app.app_context():
    motion_file = Motion_File(patient_id=3,name='test',url='test',type='test')
    db.session.add(motion_file)
    db.session.flush()
    assert motion_file.id == 1
    assert motion_file.dict() != {}
    db.session.rollback()

