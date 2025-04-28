import pytest
import os
import requests
from dotenv import load_dotenv
from extensions import db
from app_setup import create_app
from models.user import User
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.patient_physician import PatientPhysician
from models.motion_file import Motion_File
from models.patient_document import PatientDocument, DocumentType
from models.medication import Medication
from models.motion_reading import MotionReading

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
    # Physician had id=1, Admin has id=2, Patient has id=3
    physician = User(first_name='Test',last_name='Physician',email_address='test_physician@test.com',is_physician=True)
    admin = User(first_name='Test',last_name='Admin',email_address='test_admin@test.com',is_admin=True)
    db.session.add(physician)
    db.session.add(admin)
    patient = User(first_name='Test',last_name='Patient',email_address='test_patient@test.com',is_patient=True)
    db.session.add(patient)
    db.session.commit()
    chat = Chat(patient_id=3,physician_id=1)
    db.session.add(chat)
    db.session.commit()
    chat_message = ChatMessage(chat_id=1,sender=1,content='content')
    db.session.add(chat_message)
    device1 = Device(patient_id=3)
    db.session.add(device1)
    device2 = Device()
    db.session.add(device2)
    medication = Medication(name='Test Medication', dosage='50mg', instructions='Once a day', patient_id=3)
    db.session.add(medication)
    motion_file = Motion_File(patient_id=3, url='testurl', name='testname', type='testtype')
    db.session.add(motion_file)
    db.session.commit()
    motion_reading = MotionReading(motion_file_id=1, name='testreading', min=0.0, max=1.0)
    db.session.add(motion_reading)
    patient_document = PatientDocument(patient_id=3, url='testurl', name='testname', type=DocumentType.MEDICAL_HISTORY)
    db.session.add(patient_document)
    db.session.commit()
  yield
  with app.app_context():
    db.session.query(MotionReading).delete()
    db.session.query(Motion_File).delete()
    db.session.query(PatientDocument).delete()
    db.session.query(Medication).delete()
    db.session.query(Device).delete()
    db.session.query(ChatMessage).delete()
    db.session.query(Chat).delete()
    db.session.query(PatientPhysician).delete()
    db.session.query(User).delete()
    db.session.execute(db.text('TRUNCATE TABLE users,chats,chat_messages,devices,patient_physicians,motion_files,patient_documents,medications,motion_readings RESTART IDENTITY;'))
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
