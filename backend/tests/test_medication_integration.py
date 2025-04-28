def test_get_patient_medications(client, populate_database, access_token):
    response = client.get('/medications/patient/3', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_patient_medications_not_found(client, access_token):
    response = client.get('/medications/patient/999', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Patient does not exist'

def test_get_medication(client, populate_database, access_token):
    response = client.get('/medications/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1

def test_get_medication_not_found(client, access_token):
    response = client.get('/medications/2', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Medication does not exist'

def test_create_medication(client, populate_database, access_token):
    data = {
        'patient_id': 3,
        'name': 'Test Medication',
        'dosage': '50mg',
        'instructions': 'Take once daily'
    }
    response = client.post('/medications/', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'Test Medication'

def test_create_medication_missing_fields(client, access_token):
    data = {
        'patient_id': 3,
        'name': 'Test Medication'
    }
    response = client.post('/medications/', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Missing required fields'

def test_create_medication_patient_not_found(client, access_token):
    data = {
        'patient_id': 1,
        'name': 'Test Medication',
        'dosage': '50mg',
        'instructions': 'Take once daily'
    }
    response = client.post('/medications/', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Patient does not exist'

def test_update_medication(client, populate_database, access_token):
    data = {
        'name': 'Updated Medication',
        'dosage': '100mg'
    }
    response = client.put('/medications/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Medication'
    assert response.json['dosage'] == '100mg'

def test_update_medication_not_found(client, access_token):
    data = {
        'name': 'Updated Medication',
        'dosage': '100mg'
    }
    response = client.put('/medications/2', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Medication does not exist'

def test_log_medication(client, populate_database, access_token):
    response = client.post('/medications/1/log', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert 'last_taken' in response.json

def test_log_medication_not_found(client, access_token):
    response = client.post('/medications/999/log', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Medication does not exist'

def test_delete_medication(client, populate_database, access_token):
    response = client.delete('/medications/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['message'] == 'Medication deleted successfully'

def test_delete_medication_not_found(client, access_token):
    response = client.delete('/medications/2', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Medication does not exist'