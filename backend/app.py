from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

from auth import requires_auth, AuthError

# load_dotenv()

app = Flask(__name__)

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://StrokeRehab:Y$c;w]%40j-<Lhr\"mH7Je:gC@strokerehab.postgres.database.azure.com:5432/postgres"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

#Here is an example API endpoint
#use this decorator to set endpoints to functions
@app.route('/api/data', methods=['Get'])
def get_data():
    sample_data = {'message': 'Hello from the backend!'}
    return jsonify(sample_data)

@app.route('/api/protected', methods=['Get'])
@requires_auth
def get_protected_data():
    sample_data = {'message': 'This data is protected'}
    return jsonify(sample_data)
if __name__ == '__main__':
    # This runs on port 5000 by default
    app.run(host='0.0.0.0',port=8000, debug=True)

