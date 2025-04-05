import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  FileText, 
  ClipboardList, 
  Activity, 
  Upload, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { 
  getPatientDocuments,
  getPatientDocumentsByType,
  createPatientDocument,
  deletePatientDocument
} from '@/apis/patientDocumentService';

// Mapping of document types to icons and display names
const DOCUMENT_TYPES = {
  medical_history: {
    icon: ClipboardList,
    title: "Medical History",
    description: "Past medical conditions, surgeries, and treatments"
  },
  exercise_record: {
    icon: Activity,
    title: "Exercise Records",
    description: "Physical therapy and exercise tracking documents"
  },
  lab_result: {
    icon: FileText,
    title: "Lab Results",
    description: "Test results and laboratory analyses"
  }
};

const MedicalRecords = ({ patientId, initialSelectedType = null }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedType, setSelectedType] = useState(initialSelectedType);
  const [documents, setDocuments] = useState({
    medical_history: [],
    exercise_record: [],
    lab_result: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch documents on component mount and when document type changes
  useEffect(() => {
    fetchAllDocuments();
  }, [patientId]);
  
  // Update selected type when initialSelectedType changes
  useEffect(() => {
    if (initialSelectedType) {
      setSelectedType(initialSelectedType);
    }
  }, [initialSelectedType]);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Fetch all document types
  const fetchAllDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAccessTokenSilently();
      
      // Fetch documents for each type in parallel
      const types = Object.keys(DOCUMENT_TYPES);
      const promises = types.map(type => 
        getPatientDocumentsByType(patientId, type, token)
          .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch ${type} documents`);
            return response.json();
          })
          .then(data => ({ type, data }))
      );
      
      const results = await Promise.all(promises);
      
      // Organize documents by type
      const newDocuments = { ...documents };
      results.forEach(({ type, data }) => {
        newDocuments[type] = data;
      });
      
      setDocuments(newDocuments);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file is PDF
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }

    setUploadingFile(true);
    setError(null);
    
    try {
      // uploading file to blob storage should go here
      const uploadUrl = await uploadFileToStorage(file);
      
      const token = await getAccessTokenSilently();
      const documentData = {
        name: file.name,
        url: uploadUrl,
        type: documentType,
        patient_id: patientId
      };
      
      const response = await createPatientDocument(documentData, token);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create document record');
      }
      
      setSuccessMessage(`Successfully uploaded ${file.name}`);
      fetchAllDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      // Reset the file input
      event.target.value = null;
    }
  };

  // Placeholder function for file upload 
  const uploadFileToStorage = async (file) => {
    // uploading file to blob storage logic should go here
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://storage.example.com/${Date.now()}-${file.name}`);
      }, 1000);
    });
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId, documentName) => {
    if (!window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      return;
    }
    
    try {
      const token = await getAccessTokenSilently();
      const response = await deletePatientDocument(documentId, token);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }
      
      setSuccessMessage(`Successfully deleted ${documentName}`);
      fetchAllDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document. Please try again.');
    }
  };

  // Open document in new tab
  const viewDocument = (url, documentName) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Document container component
  const DocumentContainer = ({ type, title, icon: Icon, description }) => {
    const isSelected = selectedType === type;
    const docs = documents[type] || [];
    
    return (
      <div 
        className={`bg-white border p-4 rounded-lg transition-all ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div 
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setSelectedType(isSelected ? null : type)}
        >
          <div className="flex items-start">
            <Icon className="h-5 w-5 mr-3 text-blue-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
              <p className="text-sm text-blue-600 mt-1">
                {docs.length} {docs.length === 1 ? 'document' : 'documents'}
              </p>
            </div>
          </div>
          
          {/* Upload button always visible */}
          <div className="ml-4 flex-shrink-0">
            <label 
              htmlFor={`upload-${type}`}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 
                transition-colors cursor-pointer flex items-center"
            >
              <Upload className="h-3 w-3 mr-1" aria-hidden="true" />
              Upload
            </label>
            <input 
              type="file"
              id={`upload-${type}`}
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, type)}
              className="hidden"
              disabled={uploadingFile}
            />
          </div>
        </div>

        {/* Document list (only visible when selected) */}
        {isSelected && (
          <div className="mt-4 space-y-3">
            {docs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" aria-hidden="true" />
                <p>No documents in this category</p>
                <p className="text-sm">Upload a document to get started</p>
              </div>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center overflow-hidden">
                    <FileText className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-gray-900 font-medium truncate max-w-[200px]">
                      {doc.name}
                    </span>
                    {doc.createdAt && (
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewDocument(doc.url, doc.name)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                      title="View document"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Status messages */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Document containers */}
          {Object.entries(DOCUMENT_TYPES).map(([type, info]) => (
            <DocumentContainer
              key={type}
              type={type}
              title={info.title}
              icon={info.icon}
              description={info.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;