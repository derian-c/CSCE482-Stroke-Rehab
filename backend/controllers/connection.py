from extensions import socket, db
from flask import g, request
from models.user import User
from auth import requires_auth, AUTH0_DOMAIN
import os
import requests

@socket.on('connect')
@requires_auth(allowed_roles=[])
def on_connect():
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
  # This endpoint gets the user's info using their id from the 'sub' key in their access token payload
  auth0_user = requests.get('https://'+AUTH0_DOMAIN+'/api/v2/users/'+g.token_payload['sub'],
                                headers={'Authorization': 'Bearer '+management_token}).json()
  
  user = db.session.scalars(db.select(User).filter_by(email_address=auth0_user.get('email'))).first()
  if not user:
    if g.current_user_roles: # When a user that already has roles signs in, create them in the database
      email_address = auth0_user.get('email')
      first_name = auth0_user.get('given_name')
      last_name = auth0_user.get('family_name')
      if not first_name or not last_name:
        first_name = auth0_user.get('nickname')
        last_name = ''
      is_admin = False
      is_patient = False
      is_physician = False
      for role in g.current_user_roles:
        is_admin = is_admin or role == 'Admin'
        is_patient = is_patient or role == 'Patient'
        is_physician = is_physician or role == 'Physician'
      user = User(email_address=email_address,first_name=first_name,last_name=last_name,is_admin=is_admin,is_patient=is_patient,is_physician=is_physician)
      db.session.add(user)
      db.session.flush()
      if user.last_name == '':
        user.last_name = str(user.id)
        db.session.add(user)
      db.session.commit()
      socket.emit('user_info', user.dict(), to=request.sid)
    else: # User signing in for the first time without being in the database
      socket.emit('wait', {'message': 'Wait to be added to the system.'}, to=request.sid)
  else:
    if user.pending: # Update user's roles in auth0
      roles = []
      if user.is_admin:
        roles.append(os.environ.get('AUTH0_ADMIN_ROLE_ID'))
      if user.is_physician:
        roles.append(os.environ.get('AUTH0_PHYSICIAN_ROLE_ID'))
      if user.is_patient:
        roles.append(os.environ.get('AUTH0_PATIENT_ROLE_ID'))
      
      for role in roles:
        # Update user's role in Auth0
        requests.post('https://'+AUTH0_DOMAIN+'/api/v2/roles/'+role+'/users',
                      headers={'Authorization': 'Bearer '+management_token},
                      json={'users': [auth0_user['user_id']]})
      user.pending = False
      db.session.add(user)
      db.session.commit()
      socket.emit('relogin', {'message': 'Please login again to update your credentials.'}, to=request.sid)
    else: # Possibly update their roles on Auth0 if they're using a new authentication provider
      user_roles = []
      if user.is_admin:
        user_roles.append('Admin')
      if user.is_physician:
        user_roles.append('Physician')
      if user.is_patient:
        user_roles.append('Patient')
      # User roles have to be updated on Auth0
      if not g.current_user_roles or set(user_roles) != set(g.current_user_roles):
        roles = []
        for role in user_roles:
          if role == 'Admin' and (not g.current_user_roles or role not in g.current_user_roles):
            roles.append(os.environ.get('AUTH0_ADMIN_ROLE_ID'))
          elif role == 'Physician' and (not g.current_user_roles or role not in g.current_user_roles):
            roles.append(os.environ.get('AUTH0_PHYSICIAN_ROLE_ID'))
          elif role == 'Patient' and (not g.current_user_roles or role not in g.current_user_roles):
            roles.append(os.environ.get('AUTH0_PATIENT_ROLE_ID'))
        for role in roles:
          # Update user's role in Auth0
          requests.post('https://'+AUTH0_DOMAIN+'/api/v2/roles/'+role+'/users',
                        headers={'Authorization': 'Bearer '+management_token},
                        json={'users': [auth0_user['user_id']]})
        socket.emit('relogin', {'message': 'Please login again to update your credentials.'}, to=request.sid)
      else:
        socket.emit('user_info', user.dict(), to=request.sid)


      
