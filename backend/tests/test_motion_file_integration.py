from unittest.mock import patch

def test_get_motion_files(client, populate_database, access_token):
    response = client.get('/motion_files/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_motion_files_empty(client, access_token):
    response = client.get('/motion_files/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == []

def test_get_motion_file(client, populate_database, access_token):
    response = client.get('/motion_files/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1

def test_get_motion_file_by_id_not_found(client, access_token):
    response = client.get('/motion_files/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json['error'] == 'Motion_File does not exist'

def test_create_motion_file(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/motion_file',
        'name': 'test_motion_file',
        'type': 'test_type',
        'email': 'test_patient@test.com'
    }
    response = client.post('/motion_files/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 2

def test_create_motion_file_missing_fields(client, access_token):
    response = client.post('/motion_files/create', json={}, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json == {'error': 'Missing required fields: url, file_name, type, and/or email'}

def test_create_motion_file_invalid_patient(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/motion_file',
        'name': 'test_motion_file',
        'type': 'test_type',
        'email': 'patient@patient.com'
    }
    response = client.post('/motion_files/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json == {'error': 'No patient found with email: patient@patient.com'}

def test_assign_motion_file(client, populate_database, access_token):
    data = {'patient_id': 3, 'url': 'https://example.com/new_motion_file', 'file_name': 'new_motion_file'}
    response = client.put('/motion_files/1/assign', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['patient_id'] == 3

def test_assign_motion_file_patient_not_found(client, populate_database, access_token):
    data = {'patient_id': 1}
    response = client.put('/motion_files/1/assign', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json == {'error': 'Patient does not exist'}

def test_assign_motion_file_missing_fields(client, populate_database, access_token):
    data = {}
    response = client.put('/motion_files/1/assign', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json == {'error': 'Missing required fields: patient_id'}

@patch('azure.storage.blob.BlobClient.delete_blob')
def test_delete_motion_file(mock_delete_blob, client, populate_database, access_token):
    response = client.delete('/motion_files/delete/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == {'message': 'Motion_File deleted successfully'}

def test_delete_motion_file_not_found(client, access_token):
    response = client.delete('/motion_files/delete/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 422
    assert response.json == {'error': 'Motion_File does not exist'}

def test_get_patient_motion_files(client, populate_database, access_token):
    response = client.get('/motion_files/patient/3', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_patient_motion_files_not_found(client, access_token):
    response = client.get('/motion_files/patient/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json == {'error': 'No motion_file assigned to this patient'}

def test_get_patient_motion_files_after_date(client, populate_database, access_token):
    response = client.get('/motion_files/patient/3/after/2025-01-01', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []

def test_get_patient_motion_files_after_date_invalid_format(client, access_token):
    response = client.get('/motion_files/patient/3/after/invalid-date', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json == {'error': 'Invalid date format. Please use YYYY-MM-DD'}

def test_get_patient_motion_files_after_date_not_found(client, access_token):
    response = client.get('/motion_files/patient/1/after/2025-01-01', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json == {'error': 'No motion_files found for patient 1 after 2025-01-01'}