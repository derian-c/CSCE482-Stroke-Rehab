from extensions import db
from models.chat import Chat

def test_chat_get(populate_database,app):
  with app.app_context():
    chat = db.session.get(Chat, 1)
    assert chat.physician_id == 1
    assert chat.patient_id == 3

def test_chat_create(populate_database,app):
  with app.app_context():
    chat = Chat(patient_id=1,physician_id=1)
    db.session.add(chat)
    db.session.commit()
    assert chat.id == 2
  
def test_chat_delete(populate_database,app):
  with app.app_context():
    chat = db.session.get(Chat, 1)
    db.session.delete(chat)
    db.session.commit()
    assert not (chat in db.session)
    assert db.session.get(Chat, 1) == None