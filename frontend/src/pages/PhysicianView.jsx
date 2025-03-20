import React, { useState, useEffect } from "react";
import { getPatients, createPatient } from "@/apis/patientService";
import PatientModel from "@/graphics/render";
const PhysicianView = () => {
  const [patients, setPatients] = useState([
    {
      id: 0,
      name: "",
      age: 76,
      lastSession: "2025-02-15",
      exerciseQuality: {
        shoulder: "Good range of motion, slight tension",
        elbow: "Limited extension",
        wrist: "Improved flexibility",
        knee: "Normal range of motion",
      },
    },
    {
      id: 1,
      name: "",
      age: 81,
      lastSession: "2025-02-14",
      exerciseQuality: {
        shoulder: "Restricted movement",
        elbow: "Good progress",
        wrist: "Needs attention",
        knee: "Strong improvement",
      },
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowDetail(true);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("");
      alert(`Message sent to ${selectedPatient.name}`);
    }
  };

  useEffect(() => {
    async function loadPatients() {
      const response = await getPatients()
      if(response.ok){
        const _patients = await response.json()
        for (let i = 0; i < 2; i++) {
          let patientsCopy = patients
          patientsCopy[i].id = _patients[i].id
          patientsCopy[i].name = _patients[i].first_name+' '+_patients[i].last_name
          setPatients(patientsCopy)
        }
      }else{
        console.error("Failed to fetch patients")
      }
      setIsLoading(false);
    }

    loadPatients();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Patients</h2>
        </div>
        <div className="divide-y">
          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedPatient?.id === patient.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <div className="font-medium">{isLoading? 'Loading...': patient.name}</div>
              <div className="text-sm text-gray-500">
                Last session: {patient.lastSession}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showDetail && selectedPatient ? (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPatient.name}
              </h2>
              <p className="text-gray-600">Age: {selectedPatient.age}</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Patient Model
                </h3>
                <div className="bg-gray-100 rounded-lg h-96">
                  <PatientModel />
                  <p className="text-gray-500">
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Joint Analysis
                </h3>
                <div className="space-y-4">
                  {Object.entries(selectedPatient.exerciseQuality).map(
                    ([joint, quality]) => (
                      <div key={joint} className="border-b pb-2">
                        <div className="font-medium text-gray-900 capitalize">
                          {joint}
                        </div>
                        <div className="text-sm text-gray-600">{quality}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Message Patient
              </h3>
              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                    text-gray-900 
                    placeholder-gray-500
                    bg-white
                    border-gray-300
                    font-medium"
                  style={{ fontSize: "16px" }}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a patient to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicianView;
