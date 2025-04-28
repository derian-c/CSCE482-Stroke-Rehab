def test_get_chat_messages_not_empty(client,populate_database,access_token):
  response = client.get('/chat_messages/3/1',headers={'Authorization': f'Bearer {access_token}'})
  assert response.status_code == 200
  assert response.json != []