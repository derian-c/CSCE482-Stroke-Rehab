from flask import Blueprint, jsonify, request
from extensions import db
from models.patient_document import PatientDocument, DocumentType
from models.user import User
from auth import requires_auth
from datetime import datetime

patient_documents = Blueprint('patient_documents', __name__, url_prefix='/patient_documents')

# Get all patient documents
@patient_documents.route('/', methods=['GET'])
@requires_auth
def get_patient_documents():
    documents = db.session.execute(db.select(PatientDocument)).scalars()
    return jsonify([document.dict() for document in documents])

# Get patient document by id
@patient_documents.route('/<int:id>', methods=['GET'])
@requires_auth
def get_patient_document(id):
    document = db.session.get(PatientDocument, id)
    if document:
        return jsonify(document.dict())
    return jsonify({'error': 'Patient document does not exist'}), 404

# Create a new patient document
@patient_documents.route('/create', methods=['POST'])
@requires_auth
def create_patient_document():
    request_data = request.get_json()

    if not request_data or 'type' not in request_data or 'url' not in request_data or 'name' not in request_data or 'patient_id' not in request_data:
        return jsonify({'error': 'Missing required fields: url, name, type, and/or patient_id'}), 400

    # Validate document type
    try:
        doc_type = request_data['type'].lower()
        if doc_type == 'medical_history':
            document_type = DocumentType.MEDICAL_HISTORY
        elif doc_type == 'exercise_record':
            document_type = DocumentType.EXERCISE_RECORD
        elif doc_type == 'lab_result':
            document_type = DocumentType.LAB_RESULT
        else:
            return jsonify({'error': f'Invalid document type: {doc_type}. Must be one of: medical_history, exercise_record, lab_result'}), 400
    except (KeyError, ValueError):
        return jsonify({'error': 'Invalid document type'}), 400

    # Validate patient exists
    patient = db.session.get(User, request_data['patient_id'])
    if not patient or not patient.is_patient:
        return jsonify({'error': f'No patient found with id: {request_data["patient_id"]}'}), 404

    # Create document
    document = PatientDocument(
        url=request_data['url'],
        name=request_data['name'],
        patient_id=patient.id,
        type=document_type
    )
    db.session.add(document)
    db.session.commit()

    return jsonify(document.dict()), 201

# Update a patient document
@patient_documents.route('/<int:id>', methods=['PUT'])
@requires_auth
def update_patient_document(id):
    document = db.session.get(PatientDocument, id)
    if not document:
        return jsonify({'error': 'Patient document does not exist'}), 404

    request_data = request.get_json()
    if not request_data:
        return jsonify({'error': 'No update data provided'}), 400

    # Update fields if provided
    if 'name' in request_data:
        document.name = request_data['name']
    
    if 'url' in request_data:
        document.url = request_data['url']
    
    if 'type' in request_data:
        try:
            doc_type = request_data['type'].lower()
            if doc_type == 'medical_history':
                document.type = DocumentType.MEDICAL_HISTORY
            elif doc_type == 'exercise_record':
                document.type = DocumentType.EXERCISE_RECORD
            elif doc_type == 'lab_result':
                document.type = DocumentType.LAB_RESULT
            else:
                return jsonify({'error': f'Invalid document type: {doc_type}. Must be one of: medical_history, exercise_record, lab_result'}), 400
        except (KeyError, ValueError):
            return jsonify({'error': 'Invalid document type'}), 400

    db.session.commit()
    return jsonify(document.dict())

# Delete patient document
@patient_documents.route('/<int:id>', methods=['DELETE'])
@requires_auth
def delete_patient_document(id):
    document = db.session.get(PatientDocument, id)
    if not document:
        return jsonify({'error': 'Patient document does not exist'}), 404

    db.session.delete(document)
    db.session.commit()
    return jsonify({'message': 'Patient document deleted successfully'})

# Get all documents for a patient
@patient_documents.route('/patient/<int:patient_id>', methods=['GET'])
@requires_auth
def get_patient_documents_for_patient(patient_id):
    documents = db.session.query(PatientDocument).filter_by(patient_id=patient_id).all()
    if documents:
        return jsonify([document.dict() for document in documents])
    return jsonify([]), 200  # Return empty array instead of error when no documents found

# Get patient documents by type
@patient_documents.route('/patient/<int:patient_id>/type/<string:doc_type>', methods=['GET'])
@requires_auth
def get_patient_documents_by_type(patient_id, doc_type):
    try:
        # Convert string type to enum
        if doc_type.lower() == 'medical_history':
            document_type = DocumentType.MEDICAL_HISTORY
        elif doc_type.lower() == 'exercise_record':
            document_type = DocumentType.EXERCISE_RECORD
        elif doc_type.lower() == 'lab_result':
            document_type = DocumentType.LAB_RESULT
        else:
            return jsonify({'error': f'Invalid document type: {doc_type}. Must be one of: medical_history, exercise_record, lab_result'}), 400
        
        documents = db.session.query(PatientDocument).filter_by(
            patient_id=patient_id, 
            type=document_type
        ).all()
        
        return jsonify([document.dict() for document in documents]), 200
    except Exception as e:
        return jsonify({'error': f'Error retrieving documents: {str(e)}'}), 500

# Get patient documents after a specific date
@patient_documents.route('/patient/<int:patient_id>/after/<string:date>', methods=['GET'])
@requires_auth
def get_patient_documents_after_date(patient_id, date):
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d')
        documents = db.session.query(PatientDocument).filter(
            PatientDocument.patient_id == patient_id, 
            PatientDocument.createdAt >= target_date
        ).all()
        
        return jsonify([document.dict() for document in documents]), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Please use YYYY-MM-DD'}), 400
    except Exception as e:
        return jsonify({'error': f'Error retrieving documents: {str(e)}'}), 500
