def test_missing_auth_header(client):
  response = client.get('/api/private')
  assert response.status_code == 401
  assert response.json == {"code": "authorization_header_missing",
                           "description": "Authorization header is expected"}

def test_no_bearer(client,access_token):
  response = client.get('/api/private',headers={'Authorization': access_token})
  assert response.status_code == 401
  assert response.json == {"code": "invalid_header","description":
                            "Authorization header must start with"
                            " Bearer"}
  
def test_no_token(client):
  response = client.get('/api/private',headers={'Authorization': 'Bearer'})
  assert response.status_code == 401
  assert response.json == {"code": "invalid_header",
                        "description": "Token not found"}
  
def test_extra_header_parts(client):
  response = client.get('/api/private',headers={'Authorization': 'Bearer token extra'})
  assert response.status_code == 401
  assert response.json == {"code": "invalid_header",
                        "description":
                            "Authorization header must be"
                            " Bearer token"}

def test_missing_header(client,access_token):
  token_array = access_token.split('.')
  new_access_token = '.'+token_array[1]+'.'+token_array[2]
  response = client.get('/api/private',headers={'Authorization': 'Bearer '+new_access_token})
  assert response.status_code == 401
  assert response.json == {'code': 'invalid_token',
                           'description': 'Error decoding token headers. The token may be malformed or missing parts.'}
  
def test_missing_payload(client,access_token):
  token_array = access_token.split('.')
  new_access_token = token_array[0]+'..'+token_array[2]
  response = client.get('/api/private',headers={'Authorization': 'Bearer '+new_access_token})
  assert response.status_code == 401
  assert response.json == {"code": "invalid_header",
                                "description":
                                    "Unable to parse authentication"
                                    " token."}

def test_valid_headers(client,access_token):
  response = client.get('/api/private',headers={'Authorization': 'Bearer '+access_token})
  print(response.json)
  assert response.status_code == 200
  assert response.json == {'message': 'Hello from a private endpoint! You need to be authenticated to see this.'}