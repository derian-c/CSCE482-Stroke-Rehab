import React, { useState, useEffect } from "react";
import { getPatients, createPatient } from "@/apis/patientService";
import PatientModel from "@/graphics/render";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Users,
  User,
  Calendar,
  MessageSquare,
  Send,
  Activity,
  FileText,
  Clock,
  LogOut,
  PanelRight,
  ChevronRight,
  BarChart,
  MessageCircle
} from "lucide-react";

const PhysicianView = () => {
  const { user, logout } = useAuth0();
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
      messages: [] // will be populated from API
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
      messages: [] // will be populated from API
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("model"); // Options: "model", "messages"

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowDetail(true);
    
    // On mobile, collapse sidebar when patient is selected
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      // create message object
      const newMessage = {
        senderId: user?.sub, 
        senderName: `Dr. ${user?.name || "Provider"}`,
        recipientId: selectedPatient.id,
        content: message,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // handling response example
      // const response = await sendMessageToPatient(newMessage);
      
      const updatedPatients = patients.map(patient => {
        if (patient.id === selectedPatient.id) {
          return {
            ...patient,
            messages: [...(patient.messages || []), newMessage]
          };
        }
        return patient;
      });
      
      setPatients(updatedPatients);
      setSelectedPatient({
        ...selectedPatient,
        messages: [...(selectedPatient.messages || []), newMessage]
      });
      
      // clear message input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      
    }
  };

  
  const fetchPatientMessages = async (patientId) => {
    // fetch message implementation here
    return [];
  };

  const getQualityColor = (quality) => {
    if (quality.toLowerCase().includes("good") || quality.toLowerCase().includes("strong") || quality.toLowerCase().includes("improved")) {
      return "text-green-600";
    } else if (quality.toLowerCase().includes("limited") || quality.toLowerCase().includes("restricted") || quality.toLowerCase().includes("needs")) {
      return "text-amber-600";
    } else {
      return "text-blue-600";
    }
  };

  // format date
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    async function loadPatients() {
      const response = await getPatients();
      if(response.ok){
        const _patients = await response.json();
        let patientsCopy = [...patients];
        
        for (let i = 0; i < Math.min(2, _patients.length); i++) {
          patientsCopy[i].id = _patients[i].id;
          patientsCopy[i].name = _patients[i].first_name + ' ' + _patients[i].last_name;
          
          // fetch patient messages
          try {
            const messages = await fetchPatientMessages(patientsCopy[i].id);
            patientsCopy[i].messages = messages;
          } catch (error) {
            console.error(`Error fetching messages for patient ${patientsCopy[i].id}:`, error);
            patientsCopy[i].messages = [];
          }
        }
        
        setPatients(patientsCopy);
      } else {
        console.error("Failed to fetch patients");
      }
      setIsLoading(false);
    }

    loadPatients();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Physician Dashboard</h1>
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
                {user?.name?.charAt(0) || "Dr"}
              </div>
            )}
            <span className="font-medium text-sm sm:text-base text-gray-700 mr-3">Dr. {user?.name || "Physician"}</span>
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
            <h2 className={`text-xl font-bold text-gray-900 flex items-center ${sidebarCollapsed ? 'hidden md:hidden' : 'flex'}`}>
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
          <div className={`divide-y overflow-y-auto ${sidebarCollapsed ? 'hidden md:block' : 'block'}`}>
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center ${
                  selectedPatient?.id === patient.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-gray-900"
                } ${sidebarCollapsed ? 'justify-center md:justify-center' : ''}`}
              >
                {sidebarCollapsed ? (
                  <User className="h-6 w-6" />
                ) : (
                  <>
                    <User className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{isLoading ? 'Loading...' : patient.name}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {patient.lastSession}
                      </div>
                    </div>
                    {patient.messages && patient.messages.some(msg => !msg.isRead && msg.senderId !== user?.sub) && (
                      <span className="w-2 h-2 bg-red-500 rounded-full ml-2 flex-shrink-0"></span>
                    )}
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {showDetail && selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600" />
                  {selectedPatient.name}
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                    Age: {selectedPatient.age}
                  </span>
                </h2>
                <p className="text-gray-600 flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  Last session: {selectedPatient.lastSession}
                </p>
                <div className="mt-4 border-t pt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab("model")}
                      className={`px-3 py-2 rounded-md flex items-center ${
                        activeTab === "model" 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Patient Model
                    </button>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={`px-3 py-2 rounded-md flex items-center ${
                        activeTab === "messages" 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {selectedPatient.messages && selectedPatient.messages.some(msg => !msg.isRead && msg.senderId !== user?.sub) && (
                        <span className="ml-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          {selectedPatient.messages.filter(msg => !msg.isRead && msg.senderId !== user?.sub).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content based on active tab */}
              {activeTab === "model" ? (
                <>
                  {/* Patient Model & Joint Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        Patient Model
                      </h3>
                      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                        <PatientModel />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                        Joint Analysis
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(selectedPatient.exerciseQuality).map(
                          ([joint, quality]) => (
                            <div key={joint} className="border-b pb-3">
                              <div className="font-medium text-gray-900 capitalize flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${getQualityColor(quality).replace('text-', 'bg-')}`}></span>
                                {joint}
                              </div>
                              <div className={`text-sm mt-1 ${getQualityColor(quality)}`}>{quality}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Messages View */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                      Message History
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                      {selectedPatient.messages && selectedPatient.messages.length > 0 ? (
                        <div className="space-y-4">
                          {selectedPatient.messages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.senderId === user?.sub ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.senderId === user?.sub
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-sm">
                                    {msg.senderId === user?.sub ? 'You' : msg.senderName || 'Patient'}
                                  </span>
                                </div>
                                <p className="mt-1">{msg.content}</p>
                                <div className={`text-xs mt-1 text-right ${
                                  msg.senderId === user?.sub ? 'text-blue-200' : 'text-gray-400'
                                }`}>
                                  {formatMessageDate(msg.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
                          <p>No messages yet</p>
                          <p className="text-sm text-gray-400 mt-1">Start the conversation with your patient</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                          text-gray-900 
                          placeholder-gray-500
                          bg-white
                          border-gray-300"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Users className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl">Select a patient to view details</p>
              <p className="mt-2 text-gray-400">Choose a patient from the sidebar to view their detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicianView;