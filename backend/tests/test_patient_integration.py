def test_patients_get_empty(client):
  response = client.get('/patients/')
  assert response.status_code == 200
  assert response.json == []

def test_patients_get_not_empty(client,populate_database):
  response = client.get('/patients/')
  assert response.status_code == 200
  assert response.json != []

def test_patient_get_empty(client):
  response = client.get('/patients/1')
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}

def test_patient_get_not_empty(client,populate_database):
  response = client.get('/patients/1')
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Patient'

def test_patient_create_valid(client,populate_database):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient2',
    'email_address': 'test@test.com',
    'physician_first_name': 'Test',
    'physician_last_name': 'Physician'
  }
  response = client.post('/patients/', json=data)
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Patient2'

def test_patient_create_duplicate(client,populate_database):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient',
    'email_address': 'test@test.com',
    'physician_first_name': 'Test',
    'physician_last_name': 'Physician'
  }
  response = client.post('/patients/', json=data)
  assert response.status_code == 422
  assert response.json == {'error': 'Patient already exists'}

def test_patient_create_invalid_physician(client,populate_database):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient2',
    'email_address': 'test@test.com',
    'physician_first_name': 'Invalid',
    'physician_last_name': 'Physician'
  }
  response = client.post('/patients/', json=data)
  assert response.status_code == 422
  assert response.json == {'error': 'Physician does not exist'}

def test_patient_update_valid(client,populate_database):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient',
    'email_address': 'new@test.com',
    'physician_id': 1
  }
  response = client.put('/patients/1', json=data)
  assert response.status_code == 200
  assert response.json['email_address'] == 'new@test.com'

def test_patient_update_invalid(client):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient',
    'email_address': 'new@test.com',
    'physician_id': 1
  }
  response = client.put('/patients/1', json=data)
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}

def test_patient_delete_valid(client,populate_database):
  response = client.delete('/patients/1')
  assert response.status_code == 200
  assert response.json == {'message': 'Patient deleted successfully'}

def test_patient_delete_invalid(client):
  response = client.delete('/patients/1')
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}