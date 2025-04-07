from extensions import db
from models.admin import Admin

def test_admin_get(populate_database,app):
  with app.app_context():
    admin = db.session.get(Admin, 1)
    assert admin.first_name == 'Test'
    assert admin.last_name == 'Admin'

def test_admin_create(app):
  with app.app_context():
    admin = Admin(first_name='Test',last_name='Admin',email_address='test@test.com')
    db.session.add(admin)
    db.session.commit()
    assert admin.id == 1

def test_admin_update(populate_database,app):
  with app.app_context():
    admin = db.session.get(Admin, 1)
    admin.first_name = 'New'
    assert admin in db.session.dirty
    db.session.commit()
    assert not (admin in db.session.dirty)
    assert admin.first_name == 'New'
  
def test_admin_delete(populate_database,app):
  with app.app_context():
    admin = db.session.get(Admin, 1)
    db.session.delete(admin)
    db.session.commit()
    assert not (admin in db.session)
    assert db.session.get(Admin, 1) == None
