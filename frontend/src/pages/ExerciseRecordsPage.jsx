import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Upload, Trash2, Eye, ArrowLeft, PlusCircle, File } from "lucide-react";

const ExerciseRecordsPage = () => {
  const [exerciseRecords, setExerciseRecords] = useState([
    { id: 1, name: "Physical Therapy Plan - Feb 2025.pdf", date: "Feb 15, 2025", size: "1.8 MB" },
    { id: 2, name: "Home Exercise Program.pdf", date: "Feb 1, 2025", size: "2.3 MB" },
    { id: 3, name: "Exercise Progress Report - Jan 2025.pdf", date: "Jan 31, 2025", size: "1.1 MB" }
  ]);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) return;
    
    const newRecord = {
      id: exerciseRecords.length + 1,
      name: selectedFile.name,
      date: new Date().toLocaleDateString(),
      size: (selectedFile.size / (1024 * 1024)).toFixed(1) + " MB"
    };
    
    setExerciseRecords([...exerciseRecords, newRecord]);
    setSelectedFile(null);
    setUploadingFile(false);
  };
  
  const handleDelete = (id) => {
    setExerciseRecords(exerciseRecords.filter(record => record.id !== id));
  };
  
  const handleView = (record) => {
    setViewingFile(record);
  };
  
  const closeViewer = () => {
    setViewingFile(null);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-blue-600" />
            Exercise Records
          </h1>
          <Link 
            to="/patient" 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md w-full mb-6">
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                View and manage your exercise plans and records. You can upload new files, view existing ones, or delete records you no longer need.
              </p>
              
              {uploadingFile ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium text-blue-700 mb-2">Upload Exercise Record</h3>
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {selectedFile && (
                      <div className="text-sm text-gray-600">
                        Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        className={`px-4 py-2 rounded-md flex items-center ${
                          selectedFile 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </button>
                      <button
                        onClick={() => {
                          setUploadingFile(false);
                          setSelectedFile(null);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setUploadingFile(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mb-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload New Record
                </button>
              )}
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exerciseRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {record.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleView(record)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            aria-label={`View ${record.name}`}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label={`Delete ${record.name}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {exerciseRecords.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No records found. Upload your first exercise record.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {viewingFile.name}
              </h3>
              <button 
                onClick={closeViewer}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close viewer"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <div className="bg-white p-8 rounded-md shadow">
                <div className="text-center">
                  <File className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 mb-4">
                    This is a placeholder for the PDF viewer. In a real application, 
                    you would see the actual PDF document here.
                  </p>
                  <p className="text-gray-500 text-sm">
                    File: {viewingFile.name}<br/>
                    Date: {viewingFile.date}<br/>
                    Size: {viewingFile.size}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={closeViewer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseRecordsPage;