from extensions import db
from models.user import User

def test_user_get(populate_database,app):
  with app.app_context():
    user = db.session.get(User, 1)
    assert user.first_name == 'Test'
    assert user.last_name == 'Physician'

def test_user_create(populate_database,app):
  with app.app_context():
    user = User(first_name='Test',last_name='User',email_address='test@test.com')
    db.session.add(user)
    db.session.commit()
    assert user.id == 4

def test_user_update(populate_database,app):
  with app.app_context():
    user = db.session.get(User, 1)
    user.first_name = 'New'
    assert user in db.session.dirty
    db.session.commit()
    assert not (user in db.session.dirty)
    assert user.first_name == 'New'
  
def test_physician_delete(populate_database,app):
  with app.app_context():
    user = db.session.get(User, 1)
    db.session.delete(user)
    db.session.commit()
    assert not (user in db.session)
    assert db.session.get(User, 1) == None
