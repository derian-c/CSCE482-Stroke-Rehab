import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from models.user import User
from models.patient_physician import PatientPhysician
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.patient_document import PatientDocument
from models.motion_file import Motion_File
load_dotenv()

engine = create_engine(os.environ.get('DATABASE_URL'))

# Add test physicians to database
with Session(engine) as session:
  for i in range(1,3):
    physician = User(first_name="Physician",last_name=str(i),email_address="physician"+str(i)+"@test.com",is_physician=True)
    session.add(physician)
  session.commit()

# Add test admins to database
with Session(engine) as session:
  for i in range(1,3):
    admin = User(first_name="Admin",last_name=str(i),email_address="admin"+str(i)+"@test.com",is_admin=True)
    session.add(admin)
  session.commit()

# Add test patients to database
with Session(engine) as session:
  for i in range(1, 11):
    patient = User(first_name="Patient",last_name=str(i),email_address="patient"+str(i)+"@test.com",is_patient=True)
    session.add(patient)
    session.flush()
    patient_physician = PatientPhysician(patient_id=patient.id,physician_id=int((i-1)/5+1))
    session.add(patient_physician)
  session.commit()

# Add test chats to database
with Session(engine) as session:
  patient_physicians = session.scalars(select(PatientPhysician))
  for pp in patient_physicians:
    chat = Chat(patient_id=pp.patient_id,physician_id=pp.physician_id)
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
