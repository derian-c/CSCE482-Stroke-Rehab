import React, { useState, useEffect } from "react";
import { 
  Pill, 
  PlusCircle, 
  Clock, 
  Trash2, 
  AlertTriangle
} from "lucide-react";
import { 
  getPatientMedications, 
  createMedication, 
  logMedicationIntake, 
  deleteMedication 
} from "@/apis/medicationService";
import { useAuth0 } from "@auth0/auth0-react";

const Medications = ({ patientId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // new medication form state
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    instructions: ""
  });

  // Load medications on component mount
  useEffect(() => {
    fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await getPatientMedications(patientId, token);
      
      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch medications");
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication({ ...newMedication, [name]: value });
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!newMedication.name || !newMedication.dosage || !newMedication.instructions) return;
    
    try {
      const token = await getAccessTokenSilently();
      const medicationData = {
        patient_id: patientId,
        name: newMedication.name,
        dosage: newMedication.dosage,
        instructions: newMedication.instructions
      };
      
      const response = await createMedication(medicationData, token);
      
      if (response.ok) {
        const newMed = await response.json();
        setMedications([...medications, newMed]);
        setNewMedication({ name: "", dosage: "", instructions: "" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add medication");
      }
    } catch (error) {
      console.error("Error adding medication:", error);
      setError(error.message);
    }
  };

  const handleLogMedication = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await logMedicationIntake(id, token);
      
      if (response.ok) {
        const updatedMed = await response.json();
        setMedications(medications.map(med => 
          med.id === id ? updatedMed : med
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log medication intake");
      }
    } catch (error) {
      console.error("Error logging medication intake:", error);
      setError(error.message);
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await deleteMedication(id, token);
      
      if (response.ok) {
        setMedications(medications.filter(med => med.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete medication");
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      setError(error.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No record";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading medications...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <Pill className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
        Medications
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-medium text-red-700">Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
        <Pill className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-medium text-green-700">Medication Tracker</h3>
          <p className="text-sm text-green-600">
            Track your medications and log when you take them. You can also add new medications prescribed to you.
          </p>
        </div>
      </div>
      
      {/* Add New Medication Form */}
      <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <PlusCircle className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
          Add New Medication
        </h3>
        
        <form onSubmit={handleAddMedication} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="med-name" className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name
            </label>
            <input
              type="text"
              id="med-name"
              name="name"
              value={newMedication.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Ibuprofen"
              required
            />
          </div>
          
          <div>
            <label htmlFor="med-dosage" className="block text-sm font-medium text-gray-700 mb-1">
              Dosage
            </label>
            <input
              type="text"
              id="med-dosage"
              name="dosage"
              value={newMedication.dosage}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 400mg"
              required
            />
          </div>
          
          <div>
            <label htmlFor="med-instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <input
              type="text"
              id="med-instructions"
              name="instructions"
              value={newMedication.instructions}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Twice daily"
              required
            />
          </div>
          
          <div className="md:col-span-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Medication
            </button>
          </div>
        </form>
      </div>
      
      {/* Medications List */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center">
          <Pill className="h-4 w-4 mr-2 text-blue-600" aria-hidden="true" />
          Your Medications
        </h3>
        
        {medications.length > 0 ? (
          medications.map(medication => (
            <div key={medication.id} className="bg-white border border-gray-200 rounded-md p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Pill className="h-4 w-4 mr-1 text-blue-600" aria-hidden="true" />
                    {medication.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {medication.dosage} · {medication.instructions}
                  </p>
                </div>
                
                <div className="mt-3 md:mt-0 flex items-center space-x-2">
                  <button 
                    onClick={() => handleLogMedication(medication.id)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors flex items-center"
                    aria-label={`Log intake for ${medication.name}`}
                  >
                    <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                    Log Intake
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteMedication(medication.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center"
                    aria-label={`Delete ${medication.name}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Medication Last Taken Info */}
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Last Taken:</h5>
                <div className="text-xs text-gray-600 py-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-600" aria-hidden="true" />
                  {formatTimestamp(medication.last_taken)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Pill className="h-8 w-8 mx-auto text-gray-300 mb-2" aria-hidden="true" />
            <p>No medications added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;