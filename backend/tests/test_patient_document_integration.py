from unittest.mock import patch

def test_get_all_patient_documents(client, populate_database, access_token):
    response = client.get('/patient_documents/', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) > 0

def test_get_patient_document_by_id(client, populate_database, access_token):
    response = client.get('/patient_documents/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['id'] == 1

def test_get_patient_document_by_id_not_found(client, access_token):
    response = client.get('/patient_documents/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'Patient document does not exist'

def test_create_patient_document_mh(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 'medical_history',
        'patient_id': 3
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'Test Document'

def test_create_patient_document_er(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 'exercise_record',
        'patient_id': 3
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'Test Document'
  
def test_create_patient_document_lr(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 'lab_result',
        'patient_id': 3
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 201
    assert response.json['name'] == 'Test Document'

def test_create_patient_document_invalid_type(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 'invalid_type',
        'patient_id': 3
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid document type: invalid_type. Must be one of: medical_history, exercise_record, lab_result'

def test_create_patient_document_invalid_type_of_type(client, populate_database, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 0,
        'patient_id': 3
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid document type'
    
def test_create_patient_document_missing_fields(client, access_token):
    data = {
        'name': 'Test Document',
        'type': 'medical_history'
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Missing required fields: url, name, type, and/or patient_id'

def test_create_patient_document_invalid_patient(client, access_token):
    data = {
        'url': 'https://example.com/document',
        'name': 'Test Document',
        'type': 'medical_history',
        'patient_id': 1
    }
    response = client.post('/patient_documents/create', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'No patient found with id: 1'

def test_update_patient_document(client, populate_database, access_token):
    data = {
        'name': 'Updated Document',
        'url': 'https://example.com/updated_document'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated Document'

def test_update_patient_document_mh(client, populate_database, access_token):
    data = {
        'type': 'medical_history'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['type'] == 'medical_history'

def test_update_patient_document_er(client, populate_database, access_token):
    data = {
        'type': 'exercise_record'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['type'] == 'exercise_record'

def test_update_patient_document_lr(client, populate_database, access_token):
    data = {
        'type': 'lab_result'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['type'] == 'lab_result'

def test_update_patient_document_invalid_type(client, populate_database, access_token):
    data = {
        'type': 'invalid_type'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid document type: invalid_type. Must be one of: medical_history, exercise_record, lab_result'

def test_update_patient_document_invalid_type_of_type(client, populate_database, access_token):
    data = {
        'type': 0
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid document type'

def test_update_patient_document_not_found(client, access_token):
    data = {
        'name': 'Updated Document'
    }
    response = client.put('/patient_documents/1', json=data, headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'Patient document does not exist'

def test_update_patient_document_no_data(client, populate_database, access_token):
    response = client.put('/patient_documents/1', headers={'Authorization': f'Bearer {access_token}'}, json={})
    assert response.status_code == 400
    assert response.json['error'] == 'No update data provided'

@patch('azure.storage.blob.BlobClient.delete_blob')
def test_delete_patient_document(mock_delete_blob, client, populate_database, access_token):
    response = client.delete('/patient_documents/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json['message'] == 'Patient document deleted successfully'

def test_delete_patient_document_not_found(client, access_token):
    response = client.delete('/patient_documents/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 404
    assert response.json['error'] == 'Patient document does not exist'

def test_get_patient_documents_for_patient(client, populate_database, access_token):
    response = client.get('/patient_documents/patient/3', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_patient_documents_for_patient_not_found(client, access_token):
    response = client.get('/patient_documents/patient/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == []

def test_get_patient_documents_by_type_mh(client, populate_database, access_token):
    response = client.get('/patient_documents/patient/3/type/medical_history', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_patient_documents_by_type_er(client, populate_database, access_token):
    response = client.get('/patient_documents/patient/3/type/exercise_record', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_patient_documents_by_type_lr(client, populate_database, access_token):
    response = client.get('/patient_documents/patient/3/type/lab_result', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_patient_documents_by_type_invalid_type(client, access_token):
    response = client.get('/patient_documents/patient/3/type/invalid_type', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert 'Invalid document type' in response.json['error']


def test_get_patient_documents_after_date(client, populate_database, access_token):
    response = client.get('/patient_documents/patient/3/after/2023-01-01', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_patient_documents_after_date_invalid_format(client, access_token):
    response = client.get('/patient_documents/patient/3/after/invalid-date', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 400
    assert response.json['error'] == 'Invalid date format. Please use YYYY-MM-DD'