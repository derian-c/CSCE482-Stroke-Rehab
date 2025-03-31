def test_physicians_get_empty(client,access_token):
  response = client.get('/physicians/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == []

def test_physicians_get_not_empty(client,populate_database,access_token):
  response = client.get('/physicians/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json != []

def test_physician_get_empty(client,access_token):
  response = client.get('/physicians/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Physician does not exist'}

def test_physician_get_not_empty(client,populate_database,access_token):
  response = client.get('/physicians/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Physician'

def test_physician_create_valid(client,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Physician',
    'email_address': 'test@test.com',
  }
  response = client.post('/physicians/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Physician'

def test_physician_create_duplicate(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Physician',
    'email_address': 'test@test.com',
  }
  response = client.post('/physicians/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Physician already exists'}

def test_physician_update_valid(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Physician',
    'email_address': 'new@test.com',
  }
  response = client.put('/physicians/1', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['email_address'] == 'new@test.com'

def test_physician_update_invalid(client,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Physician',
    'email_address': 'new@test.com',
  }
  response = client.put('/physicians/1', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Physician does not exist'}

def test_physician_delete_valid(client,populate_database,access_token):
  response = client.delete('/physicians/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == {'message': 'Physician deleted successfully'}

def test_physician_delete_invalid(client,access_token):
  response = client.delete('/physicians/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Physician does not exist'}