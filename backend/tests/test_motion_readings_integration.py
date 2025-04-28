def test_get_motion_readings_empty(client, access_token):
    response = client.get('/motion_readings/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json == []

def test_get_motion_readings_not_empty(client, populate_database, access_token):
    response = client.get('/motion_readings/1', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json != []