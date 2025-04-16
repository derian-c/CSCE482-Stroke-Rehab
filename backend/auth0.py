import os
import requests
from dotenv import load_dotenv
from auth import AUTH0_DOMAIN
load_dotenv()

def delete_auth0_user(email):
  AUTH0_MANAGEMENT_ID = os.environ.get('AUTH0_MANAGEMENT_ID')
  AUTH0_MANAGEMENT_SECRET = os.environ.get('AUTH0_MANAGEMENT_SECRET')
  body= {
      'grant_type': 'client_credentials',
      'client_id': AUTH0_MANAGEMENT_ID,
      'client_secret': AUTH0_MANAGEMENT_SECRET,
      'audience': 'https://'+AUTH0_DOMAIN+'/api/v2/'
  }
  # Get management token to get current user's info
  management_token = requests.post('https://'+AUTH0_DOMAIN+'/oauth/token',
                                  data=body).json().get('access_token')
  # Returns a list of users with that email due to there being different providers
  auth0_users = requests.get('https://'+AUTH0_DOMAIN+'/api/v2/users-by-email',
                              headers={'Authorization': 'Bearer '+management_token},
                              params={'email': email}).json()
  for user in auth0_users:
    requests.delete('https://'+AUTH0_DOMAIN+'/api/v2/users/'+user['user_id'],
                              headers={'Authorization': 'Bearer '+management_token})

