def test_patients_get_empty(client,access_token):
  response = client.get('/patients/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == []

def test_patients_get_not_empty(client,populate_database,access_token):
  response = client.get('/patients/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json != []

def test_patient_get_empty(client,access_token):
  response = client.get('/patients/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}

def test_patient_get_not_empty(client,populate_database,access_token):
  response = client.get('/patients/3',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Patient'

def test_patient_create_valid(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient2',
    'email_address': 'test@test.com',
    'physician_id': 1
  }
  response = client.post('/patients/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Patient2'

def test_patient_create_duplicate(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient',
    'email_address': 'test_patient@test.com',
    'physician_id': 1
  }
  response = client.post('/patients/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Patient already exists'}

def test_patient_create_invalid_physician(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Patient2',
    'email_address': 'test@test.com',
    'physician_id': 2
  }
  response = client.post('/patients/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Physician does not exist'}

def test_patient_update_valid(client,populate_database,access_token):
  data = {
    'email_address': 'new@test.com',
  }
  response = client.put('/patients/3', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['email_address'] == 'new@test.com'

def test_patient_update_invalid(client,access_token):
  data = {
    'email_address': 'new@test.com'
  }
  response = client.put('/patients/1', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}

def test_patient_delete_valid(client,populate_database,access_token):
  response = client.delete('/patients/3',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == {'message': 'Patient deleted successfully'}

def test_patient_delete_invalid(client,access_token):
  response = client.delete('/patients/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Patient does not exist'}