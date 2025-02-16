from flask import Flask, jsonify

app = Flask(__name__)

#Here is an example API endpoint
#use this decorator to set endpoints to functions
@app.route('/api/data', methods=['Get'])
def get_data():
    sample_data = {'message': 'Hello from the backend!'}
    return jsonify(sample_data)

if __name__ == '__main__':
    # This runs on port 5000 by default
    app.run(debug=True, port=5001)

