from extensions import db
from models.chat_message import ChatMessage

def test_chat_message_get(populate_database,app):
  with app.app_context():
    chat_message = db.session.get(ChatMessage, 1)
    assert chat_message.content == 'content'

def test_chat_message_create(populate_database,app):
  with app.app_context():
    chat_message = ChatMessage(chat_id=1,sender=0,content='content')
    db.session.add(chat_message)
    db.session.commit()
    assert chat_message.id == 2

def test_chat_message_update(populate_database,app):
  with app.app_context():
    chat_message = db.session.get(ChatMessage, 1)
    chat_message.content = 'new content'
    assert chat_message in db.session.dirty
    db.session.commit()
    assert not (chat_message in db.session.dirty)
    assert chat_message.content == 'new content'
  
def test_chat_message_delete(populate_database,app):
  with app.app_context():
    chat_message = db.session.get(ChatMessage, 1)
    db.session.delete(chat_message)
    db.session.commit()
    assert not (chat_message in db.session)
    assert db.session.get(ChatMessage, 1) == None