from flask import Flask, jsonify
from auth import requires_auth, AuthError

app = Flask(__name__)

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

#Here is an example API endpoint
#use this decorator to set endpoints to functions
@app.route('/api/data', methods=['Get'])
def get_data():
    sample_data = {'message': 'Hello from the backend!'}
    return jsonify(sample_data)

# This needs authentication
@app.route("/api/private")
@requires_auth
def private():
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return jsonify(message=response)


if __name__ == '__main__':
    # This runs on port 5000 by default
    app.run(debug=True,port=8000)

