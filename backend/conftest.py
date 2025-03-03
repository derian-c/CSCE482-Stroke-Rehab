import pytest
import os
from dotenv import load_dotenv
from extensions import db
from app_setup import create_app
from models.patient import Patient
from models.physician import Physician

@pytest.fixture(scope='module')
def app():
  app = create_app()
  if not app.config['SQLALCHEMY_DATABASE_URI']:
    raise ValueError("The TEST_DATABASE_URL environment variable is not set.")

  with app.app_context():
    db.create_all()

  yield app

  with app.app_context():
    db.drop_all()

@pytest.fixture(scope='module')
def client(app):
  return app.test_client()

# @pytest.fixture(scope='module')
# def dtb(app):
#   with app.app_context():
#     db.init_app(app)
#     yield db

@pytest.fixture(scope='function')
def populate_database(app):
  with app.app_context():
    physician = Physician(name='Test Physician',email_address='test@test.com')
    db.session.add(physician)
    db.session.commit()
    patient = Patient(name='Test Patient',email_address='test@test.com',physician_id=1)
    db.session.add(patient)
    db.session.commit()
  yield
  with app.app_context():
    db.session.query(Patient).delete()
    db.session.query(Physician).delete()
    db.session.execute(db.text('TRUNCATE TABLE patients,physicians RESTART IDENTITY;'))
    db.session.commit()
