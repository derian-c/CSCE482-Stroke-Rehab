import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models.patient import Patient
from models.physician import Physician
from models.admin import Admin
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.motion_file import Motion_File
load_dotenv()

engine = create_engine(os.environ.get('DATABASE_URL'))

# Add test physicians to database
with Session(engine) as session:
  for i in range(1,3):
    physician = Physician(first_name="Physician",last_name=str(i),email_address="physician"+str(i)+"@test.com")
    session.add(physician)
  session.commit()

# Add test admins to database
with Session(engine) as session:
  for i in range(1,3):
    admin = Admin(first_name="Admin",last_name=str(i),email_address="admin"+str(i)+"@test.com")
    session.add(admin)
  session.commit()

# Add test patients to database
with Session(engine) as session:
  for i in range(1, 11):
    patient = Patient(first_name="Patient",last_name=str(i),email_address="patient"+str(i)+"@test.com",physician_id=int((i-1)/5+1))
    session.add(patient)
  session.commit()

# Add test chats to database
with Session(engine) as session:
  for i in range(1,11):
    chat = Chat(patient_id=i,physician_id=int((i-1)/5+1))
    session.add(chat)
  session.commit()

# Add test motion files for test patients
with Session(engine) as session:
  url="https://capstorage2025.blob.core.windows.net/motion-files/recording_4.sto"
  for i in range(10):
    motion_file = Motion_File(patient_id=1, type="sto", name=f"Patient1Recording{i}", url=url)
    session.add(motion_file)
  for i in range(4):
    motion_file = Motion_File(patient_id=2, type="sto", name=f"Patient2Recording{i}", url=url)
    session.add(motion_file)
  for i in range(6):
    motion_file = Motion_File(patient_id=3, type="sto", name=f"Patient3Recording{i}", url=url)
    session.add(motion_file)
  session.commit()
