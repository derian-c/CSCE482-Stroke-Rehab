import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import {
  Users,
  User,
  Calendar,
  Phone,
  Shield,
  FileText,
  Clock,
  LogOut,
  PanelRight,
  ChevronRight,
  Activity,
  Pill,
  Beaker,
  CreditCard,
  Search,
  HeartPulse,
  ClipboardList
} from "lucide-react";

const ProviderView = () => {
  const { user, logout } = useAuth0();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('medicalHistory');
    
    // On mobile, collapse sidebar when patient is selected
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
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

  // Tab button component to reduce repetition
  const TabButton = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`mr-6 py-4 px-1 font-medium text-sm flex items-center whitespace-nowrap ${
        activeTab === tab
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {React.createElement(icon, { className: "h-4 w-4 mr-2" })}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <HeartPulse className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Provider Dashboard</h1>
          </div>
          <div className="flex items-center">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt="Profile" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
              />
            ) : (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 sm:mr-3">
                {user?.name?.charAt(0) || "P"}
              </div>
            )}
            <span className="font-medium text-sm sm:text-base text-gray-700 mr-3"> {user?.name || "Provider"}</span>
            <button 
              onClick={() => logout({ returnTo: window.location.origin })}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-64px)]">
        {/* Sidebar */}
        <div className={`bg-white shadow-md flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-0 md:w-16' : 'w-64'} overflow-hidden`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className={`text-lg font-bold text-gray-900 flex items-center ${sidebarCollapsed ? 'hidden md:hidden' : 'flex'}`}>
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Patients
            </h2>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <PanelRight className={`h-5 w-5 ${sidebarCollapsed ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className={`px-4 py-3 ${sidebarCollapsed ? 'hidden md:hidden' : 'block'}`}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className={`divide-y overflow-y-auto ${sidebarCollapsed ? 'hidden md:block' : 'block'}`}>
            {patients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center ${
                  selectedPatient?.id === patient.id
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:text-gray-900 border-l-4 border-transparent"
                } ${sidebarCollapsed ? 'justify-center md:justify-center' : ''}`}
              >
                {sidebarCollapsed ? (
                  <User className="h-6 w-6" />
                ) : (
                  <>
                    <User className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{patient.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(patient.lastVisit)}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedPatient ? (
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <User className="h-6 w-6 mr-2 text-blue-600" />
                      {selectedPatient.name}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:space-x-6 mt-2 text-gray-600">
                      <p className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        {selectedPatient.gender}, {calculateAge(selectedPatient.dob)} years
                      </p>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        DOB: {formatDate(selectedPatient.dob)}
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {selectedPatient.phone}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-600 flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-gray-500" />
                      Insurance: {selectedPatient.insurance}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Last visit: {formatDate(selectedPatient.lastVisit)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex">
                  <TabButton tab="medicalHistory" icon={ClipboardList} label="Medical History" />
                  <TabButton tab="medications" icon={Pill} label="Medications" />
                  <TabButton tab="labResults" icon={Beaker} label="Lab Results" />
                  <TabButton tab="billing" icon={CreditCard} label="Billing" />
                </nav>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'medicalHistory' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                      Medical History
                    </h3>
                    <div className="overflow-x-auto">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                <HeartPulse className="h-4 w-4 mr-2 text-blue-600" />
                                {item.condition}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(item.diagnosedDate)}
                              </td>
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
                  </div>
                )}

                {activeTab === 'medications' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-blue-600" />
                      Current Medications
                    </h3>
                    <div className="overflow-x-auto">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                <Pill className="h-4 w-4 mr-2 text-blue-600" />
                                {med.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.frequency}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(med.startDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'labResults' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Beaker className="h-5 w-5 mr-2 text-blue-600" />
                      Lab Results
                    </h3>
                    <div className="overflow-x-auto">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-blue-600" />
                                {lab.test}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.result}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.normalRange}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(lab.date)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      Billing Information
                    </h3>
                    <div className="overflow-x-auto">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(item.date)}
                              </td>
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
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <User className="w-16 h-16 mx-auto text-gray-400" />
                <p className="mt-2 text-xl">Select a patient to view details</p>
                <p className="mt-2 text-gray-400">Choose a patient from the sidebar to view their medical information</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderView;