def test_get_devices_empty(client, access_token):
    response = client.get('/devices/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == []

def test_get_devices_not_empty(client, populate_database, access_token):
    response = client.get('/devices/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_device(client, populate_database, access_token):
    response = client.get('/devices/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1
    assert response.json['patient_id'] == 3

def test_get_device_empty(client, access_token):
    response = client.get('/devices/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json == {'error': 'Device does not exist'}

def test_create_device(client, access_token):
    response = client.post('/devices/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1 

def test_unassign_and_assign_device(client, populate_database, access_token):
    response = client.put('/devices/2/assign', headers={'Authorization': f'Bearer {access_token}'}, json={})
    assert response.status_code == 200
    assert response.json.get('patient_id') == None
    response = client.put('/devices/2/assign', headers={'Authorization': f'Bearer {access_token}'}, json={'patient_id': 3})
    assert response.status_code == 200
    assert response.json.get('patient_id') == 3

def test_assign_device_invalid_patient(client, populate_database, access_token):
    response = client.put('/devices/2/assign', headers={'Authorization': f'Bearer {access_token}'}, json={'patient_id': 1})
    assert response.status_code == 422
    assert response.json == {'error': 'Patient does not exist'}

def test_assign_device_already_assigned(client, populate_database, access_token):
    response = client.put('/devices/2/assign', headers={'Authorization': f'Bearer {access_token}'}, json={'patient_id': 3})
    assert response.status_code == 422
    assert response.json == {'error': 'Patient already has a device assigned'}

def test_delete_device(client, populate_database, access_token):
    response = client.delete('/devices/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == {'message': 'Device deleted successfully'}

def test_delete_device_not_found(client, access_token):
    response = client.delete('/devices/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json == {'error': 'Device does not exist'}

def test_get_device_for_patient(client, populate_database, access_token):
    response = client.get('/devices/patient/3', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1
    assert response.json['patient_id'] == 3

def test_get_device_for_patient_not_found(client, access_token):
    response = client.get('/devices/patient/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json == {'error': 'No device assigned to this patient'}

def test_get_unassigned_devices(client, populate_database, access_token):
    response = client.get('/devices/unassigned', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_unassigned_devices_empty(client, access_token):
    response = client.get('/devices/unassigned', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == []

