import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from models.user import User
from models.chat import Chat
from models.chat_message import ChatMessage
from models.device import Device
from models.patient_physician import PatientPhysician
from models.motion_file import Motion_File
load_dotenv()

engine = create_engine(os.environ.get('DATABASE_URL'))

with Session(engine) as session:
  session.query(ChatMessage).delete()
  session.query(Chat).delete()
  session.query(Device).delete()
  session.query(PatientPhysician).delete()
  session.query(Motion_File).delete()
  session.query(User).delete()
  session.execute(text('TRUNCATE TABLE users,chats,chat_messages,devices,patient_physicians,motion_files RESTART IDENTITY;'))
  session.commit()