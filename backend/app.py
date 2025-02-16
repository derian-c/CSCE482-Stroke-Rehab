import os
import sqlalchemy
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from flask import Flask, jsonify
from classes import Base, Patient, Physician

# Create engine to communicate with db and create tables
load_dotenv()
db_url = os.environ.get('DATABASE_URL_LOCAL')
engine = sqlalchemy.create_engine(db_url, echo=True)
Base.metadata.create_all(engine)

app = Flask(__name__)

@app.route('/api/patients/<int:id>', methods=['GET'])
def get_patient(id):
  with Session(engine) as session:
    patient = session.get(Patient, id)
  return jsonify(patient)

@app.route('/api/patients', methods=['POST'])
def create_patient():
  name = request.form.get('name')
  email_address = request.form.get('email_address')
  patient = Patient(name=name,email_address=email_address)
  with Session(engine) as session:
    session.add(patient)
    session.flush()
    session.commit()
  return jsonify(patient.dict())


@app.route('/api/physicians/<int:id>', methods=['GET'])
def get_physician(id):
  with Session(engine) as session:
    physician = session.get(Physician, id)
  return jsonify(physician.dict())

if __name__ == '__main__':
    app.run(debug=True,port=8000)

