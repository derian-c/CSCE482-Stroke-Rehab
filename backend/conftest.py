import pytest
import os
import requests
from dotenv import load_dotenv
from extensions import db
from app_setup import create_app
from models.patient import Patient
from models.physician import Physician
from models.admin import Admin
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device

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
    patient = Patient(first_name='Test',last_name='Patient',email_address='test@test.com',physician_id=1)
    db.session.add(patient)
    chat = Chat(patient_id=1,physician_id=1)
    db.session.add(chat)
    chat_message = ChatMessage(chat_id=1,sender=0,content='content')
    db.session.add(chat_message)
    db.session.commit()
  yield
  with app.app_context():
    db.session.query(Device).delete()
    db.session.query(ChatMessage).delete()
    db.session.query(Chat).delete()
    db.session.query(Patient).delete()
    db.session.query(Physician).delete()
    db.session.query(Admin).delete()
    db.session.execute(db.text('TRUNCATE TABLE patients,physicians,admins,chats,chat_messages,devices RESTART IDENTITY;'))
    db.session.commit()

@pytest.fixture(scope='session')
def access_token():
  load_dotenv()
  AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
  API_AUDIENCE = os.environ.get('API_AUDIENCE')
  AUTH0_CLIENT_ID = os.environ.get('AUTH0_CLIENT_ID')
  EMAIL = os.environ.get('TEST_USER_EMAIL')
  PASSWORD = os.environ.get('TEST_USER_PASSWORD')
  data = {
    'grant_type': 'password',
    'username': EMAIL,
    'password': PASSWORD,
    'client_id': AUTH0_CLIENT_ID,
    'audience': API_AUDIENCE
  }
  return requests.post('https://'+AUTH0_DOMAIN+'/oauth/token',data=data).json().get('access_token')
