import pytest
import os
from dotenv import load_dotenv
from extensions import db
from app_setup import create_app
from models.patient import Patient
from models.physician import Physician
from models.admin import Admin
from models.chat import Chat
from models.chat_message import ChatMessage

@pytest.fixture(scope='module')
def app():
  app = create_app()

  with app.app_context():
    db.create_all()

  yield app

  with app.app_context():
    db.drop_all()

@pytest.fixture(scope='module')
def client(app):
  return app.test_client()

@pytest.fixture(scope='function')
def populate_database(app):
  with app.app_context():
    physician = Physician(first_name='Test',last_name='Physician',email_address='test@test.com')
    admin = Admin(first_name='Test',last_name='Admin',email_address='test@test.com')
    db.session.add(physician)
    db.session.add(admin)
    db.session.commit()
    patient = Patient(first_name='Test',last_name='Patient',email_address='test@test.com',physician_id=1)
    db.session.add(patient)
    chat = Chat(patient_id=1,physician_id=1)
    db.session.add(chat)
    db.session.commit()
    chat_message = ChatMessage(chat_id=1,sender=0,content='content')
    db.session.add(chat_message)
    db.session.commit()
  yield
  with app.app_context():
    db.session.query(ChatMessage).delete()
    db.session.query(Chat).delete()
    db.session.query(Patient).delete()
    db.session.query(Physician).delete()
    db.session.query(Admin).delete()
    db.session.execute(db.text('TRUNCATE TABLE patients,physicians,admins,chats,chat_messages RESTART IDENTITY;'))
    db.session.commit()
