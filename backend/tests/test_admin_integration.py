def test_admins_get_empty(client,access_token):
  response = client.get('/admins/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == []

def test_admins_get_not_empty(client,populate_database,access_token):
  response = client.get('/admins/',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json != []

def test_admin_get_empty(client,access_token):
  response = client.get('/admins/1',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Admin does not exist'}

def test_admin_get_not_empty(client,populate_database,access_token):
  response = client.get('/admins/2',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Admin'

def test_admin_create_valid(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Admin2',
    'email_address': 'test_admin2@test.com',
  }
  response = client.post('/admins/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['first_name'] == 'Test'
  assert response.json['last_name'] == 'Admin2'

def test_admin_create_duplicate(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Admin',
    'email_address': 'test_admin@test.com',
  }
  response = client.post('/admins/', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Admin already exists'}

def test_admin_update_valid(client,populate_database,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Admin',
    'email_address': 'new@test.com',
  }
  response = client.put('/admins/2', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json['email_address'] == 'new@test.com'

def test_admin_update_invalid(client,access_token):
  data = {
    'first_name': 'Test',
    'last_name': 'Admin',
    'email_address': 'new@test.com',
  }
  response = client.put('/admins/1', json=data,headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Admin does not exist'}

def test_admin_delete_valid(client,populate_database,access_token):
  response = client.delete('/admins/2',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 200
  assert response.json == {'message': 'Admin deleted successfully'}

def test_admin_delete_invalid(client,access_token):
  response = client.delete('/admins/2',headers={'Authorization': 'Bearer '+access_token})
  assert response.status_code == 422
  assert response.json == {'error': 'Admin does not exist'}