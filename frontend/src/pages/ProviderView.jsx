import React, { useState, useEffect } from 'react';

const ProviderView = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Jane Doe",
      dob: "1950-05-12",
      gender: "Female",
      phone: "(123) 456-7890",
      insurance: "Aetna",
      lastVisit: "2025-02-18",
      medicalHistory: [
        { condition: "Aphasia", diagnosedDate: "2024-10-17", status: "Active" },
        { condition: "Type 2 Diabetes", diagnosedDate: "2020-08-22", status: "Controlled" }
      ],
      medications: [
        { name: "Tylenol", dosage: "10mg", frequency: "Daily", startDate: "2018-03-20" }
      ],
      labResults: [
        { test: "Blood Pressure", result: "138/85", date: "2025-02-18", normalRange: "120/80" }
      ],
      billing: [
        { date: "2025-02-18", service: "Follow-up visit", amount: 150.00, status: "Pending" },
        { date: "2025-01-15", service: "Lab work", amount: 220.00, status: "Paid" },
        { date: "2024-11-05", service: "Office visit", amount: 150.00, status: "Paid" }
      ]
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('medicalHistory');

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('medicalHistory');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-xl font-bold">Provider Portal</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white shadow-md overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Patients</h2>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>
          <div className="divide-y">
            {patients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === patient.id 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-gray-500">
                  Last visit: {formatDate(patient.lastVisit)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedPatient ? (
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <div className="flex space-x-6 mt-2 text-gray-600">
                      <p>{selectedPatient.gender}, {calculateAge(selectedPatient.dob)} years</p>
                      <p>DOB: {formatDate(selectedPatient.dob)}</p>
                      <p>Phone: {selectedPatient.phone}</p>
                    </div>
                    <p className="mt-1 text-gray-600">
                      Insurance: {selectedPatient.insurance}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['medicalHistory', 'medications', 'labResults', 'billing'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`mr-8 py-4 px-1 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'medicalHistory' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical History</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPatient.medicalHistory.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.condition}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.diagnosedDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${item.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 
                                  item.status === 'Controlled' ? 'bg-green-100 text-green-800' : 
                                  'bg-blue-100 text-blue-800'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'medications' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Medications</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPatient.medications.map((med, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.frequency}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(med.startDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 flex justify-end">
                    </div>
                  </div>
                )}

                {activeTab === 'labResults' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Lab Results</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Range</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPatient.labResults.map((lab, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lab.test}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.result}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.normalRange}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lab.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 flex justify-end">
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPatient.billing.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.service}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                  item.status.includes('Pending') ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <p className="mt-2">Select a patient to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderView;