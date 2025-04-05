import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  FileText, 
  ChevronLeft,
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Download
} from "lucide-react";
import { 
  getPatientDocumentsByType,
  createPatientDocument,
  deletePatientDocument
} from '@/services/patientDocumentService';

// Type configuration
const DOCUMENT_TYPES = {
  "medical-history": {
    apiType: "medical_history",
    title: "Medical History",
    description: "View and manage your medical history documents",
    icon: FileText
  },
  "exercise-records": {
    apiType: "exercise_record",
    title: "Exercise Records",
    description: "Track your physical therapy and exercise progress",
    icon: FileText
  },
  "lab-results": {
    apiType: "lab_result",
    title: "Lab Results", 
    description: "Access your laboratory test results",
    icon: FileText
  }
};

const DocumentDetailView = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently, user } = useAuth0();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Get document type configuration
  const documentConfig = DOCUMENT_TYPES[type];
  
  // Redirect if invalid document type
  useEffect(() => {
    if (!documentConfig) {
      navigate("/dashboard");
    }
  }, [type, navigate, documentConfig]);
  
  // Fetch documents on component mount
  useEffect(() => {
    if (documentConfig) {
      fetchDocuments();
    }
  }, [type]);
  
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
  
  // Fetch documents for this type
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAccessTokenSilently();
      // Use 1 as placeholder patient ID - should come from user object or context
      const patientId = 1;
      const response = await getPatientDocumentsByType(patientId, documentConfig.apiType, token);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${documentConfig.title}`);
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event) => {
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
      // This would upload to cloud storage in production
      const uploadUrl = await uploadFileToStorage(file);
      
      const token = await getAccessTokenSilently();
      // Use 1 as placeholder patient ID - should come from user object or context
      const patientId = 1;
      const documentData = {
        name: file.name,
        url: uploadUrl,
        type: documentConfig.apiType,
        patient_id: patientId
      };
      
      const response = await createPatientDocument(documentData, token);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create document record');
      }
      
      setSuccessMessage(`Successfully uploaded ${file.name}`);
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      // Reset the file input
      event.target.value = null;
    }
  };
  
  // Placeholder for file upload - replace with real implementation
  const uploadFileToStorage = async (file) => {
    // In a real implementation, this would upload to S3, Firebase, etc.
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
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document. Please try again.');
    }
  };
  
  // Open document in new tab
  const viewDocument = (url, documentName) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  if (!documentConfig) return null;
  
  const { title, description, icon: Icon } = documentConfig;

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/dashboard")}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back to dashboard"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" aria-hidden="true" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-blue-600" aria-hidden="true" />
              {title}
            </h1>
          </div>
          
          <div className="flex items-center">
            <label 
              htmlFor="upload-document"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                transition-colors cursor-pointer flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              Upload New Document
            </label>
            <input 
              type="file"
              id="upload-document"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploadingFile}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md w-full mb-6 p-6">
          {/* Status messages */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" aria-hidden="true" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">{description}</p>
          
          {/* Loading state */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : (
            <div>
              {documents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    You haven't uploaded any {title.toLowerCase()} documents yet.
                    Upload your first document to get started.
                  </p>
                  <label 
                    htmlFor="upload-document-empty"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                      transition-colors cursor-pointer flex items-center mx-auto w-fit"
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Upload Document
                  </label>
                  <input 
                    type="file"
                    id="upload-document-empty"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 mr-2 text-blue-600 mt-1 flex-shrink-0" aria-hidden="true" />
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1" title={doc.name}>
                              {doc.name}
                            </h3>
                            {doc.createdAt && (
                              <p className="text-xs text-gray-500">
                                Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => viewDocument(doc.url, doc.name)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          title="View document"
                        >
                          <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.name)}
                          className="flex items-center text-sm text-red-600 hover:text-red-800"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {documents.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Document Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Total documents:</span> {documents.length}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Last updated:</span>{" "}
                  {documents.length > 0 && documents[0].updatedAt
                    ? new Date(documents[0].updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Back to all records button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 
              transition-colors flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailView;