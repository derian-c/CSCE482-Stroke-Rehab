import React, { useState, useEffect, useRef, useMemo } from "react";
import { getPatients } from "@/apis/patientService";
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
import { useSocket } from '@/components/SocketProvider'
import { getMessages } from '@/apis/messagesService'
import { getMotionFiles } from "../apis/motionFileService";
import MotionReadingsTab from '@/components/MotionReadingsTab'
import MotionFilesTab from '@/components/MotionFilesTab'

const PhysicianView = ({userInfo}) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
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
      messages: [],
      jointReadings: {
        shoulder: {
          min: 10,
          max: 160,
          normal: { min: 0, max: 180 },
          lastUpdated: "2025-02-15T14:30:00",
          notes: "Showing improvement, continue current regimen"
        },
        elbow: {
          min: 15,
          max: 145,
          normal: { min: 0, max: 150 },
          lastUpdated: "2025-02-15T14:35:00",
          notes: "Limited extension, focus on stretching exercises"
        },
        wrist: {
          min: 5,
          max: 70,
          normal: { min: 0, max: 80 },
          lastUpdated: "2025-02-14T10:15:00",
          notes: "Flexibility improving with therapy"
        },
        knee: {
          min: 0,
          max: 130,
          normal: { min: 0, max: 135 },
          lastUpdated: "2025-02-15T14:40:00",
          notes: "Normal range of motion achieved"
        }
      },
      motionFiles: [
        {
          id: "m001",
          jointType: "shoulder",
          uploadDate: "2025-02-15T14:30:00",
          filename: "shoulder_motion_20250215.csv"
        },
        {
          id: "m002",
          jointType: "elbow",
          uploadDate: "2025-02-15T14:35:00",
          filename: "elbow_motion_20250215.csv"
        },
        {
          id: "m003",
          jointType: "wrist",
          uploadDate: "2025-02-14T10:15:00",
          filename: "wrist_motion_20250214.csv"
        },
        {
          id: "m004",
          jointType: "knee",
          uploadDate: "2025-02-15T14:40:00",
          filename: "knee_motion_20250215.csv"
        },
        {
          id: "m005",
          jointType: "shoulder",
          uploadDate: "2025-02-10T11:20:00",
          filename: "shoulder_motion_20250210.csv"
        }
      ]
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
      messages: [],
      jointReadings: {
        shoulder: {
          min: 30,
          max: 110,
          normal: { min: 0, max: 180 },
          lastUpdated: "2025-02-14T13:20:00",
          notes: "Restricted movement, continue gentle stretches"
        },
        elbow: {
          min: 10,
          max: 135,
          normal: { min: 0, max: 150 },
          lastUpdated: "2025-02-14T13:25:00",
          notes: "Good progress with assisted exercises"
        },
        wrist: {
          min: 15,
          max: 40,
          normal: { min: 0, max: 80 },
          lastUpdated: "2025-02-14T13:30:00",
          notes: "Limited range, needs focused attention"
        },
        knee: {
          min: 5,
          max: 125,
          normal: { min: 0, max: 135 },
          lastUpdated: "2025-02-14T13:35:00",
          notes: "Strong improvement after therapy"
        }
      },
      motionFiles: [
        {
          id: "m006",
          jointType: "shoulder",
          uploadDate: "2025-02-14T13:20:00",
          filename: "shoulder_motion_20250214.csv"
        },
        {
          id: "m007",
          jointType: "elbow",
          uploadDate: "2025-02-14T13:25:00",
          filename: "elbow_motion_20250214.csv"
        },
        {
          id: "m008",
          jointType: "wrist",
          uploadDate: "2025-02-14T13:30:00",
          filename: "wrist_motion_20250214.csv"
        },
        {
          id: "m009",
          jointType: "knee",
          uploadDate: "2025-02-14T13:35:00",
          filename: "knee_motion_20250214.csv"
        }
      ]
    },
  ]);

  // State to track which messages have been read - stored in localStorage
  const [readMessageIds, setReadMessageIds] = useState(() => {
    // Initialize from localStorage if available
    const savedReadIds = localStorage.getItem('physicianReadMessageIds');
    return savedReadIds ? JSON.parse(savedReadIds) : [];
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("model"); // Options: "model", "messages"
  const [jointTab, setJointTab] = useState("readings");
  const selectedPatientRef = useRef();
  const messagesEndRef = useRef(); // Reference for messages container for auto-scrolling

  const [patientMotionFiles, setPatientMotionFiles] = useState([]);
  const [selectedMotionFile, setSelectedMotionFile] = useState(null);

  const socket = useSocket()

  useEffect(() => {
    selectedPatientRef.current = selectedPatient
  }, [selectedPatient]);

  // Scroll to bottom of messages when new messages are added or when switching to messages tab
  useEffect(() => {
    if (activeTab === "messages" && selectedPatient) {
      scrollToBottom();
    }
  }, [selectedPatient?.messages, activeTab]);

  // Update localStorage whenever readMessageIds changes
  useEffect(() => {
    localStorage.setItem('physicianReadMessageIds', JSON.stringify(readMessageIds));
  }, [readMessageIds]);

  const scrollToBottom = () => {
    // Use setTimeout to ensure the DOM has updated before scrolling
    setTimeout(() => {
      if (messagesEndRef.current) {
        // Get the messages container
        const messageContainer = messagesEndRef.current.closest('.overflow-y-auto');
        if (messageContainer) {
          // Scroll the container instead of the entire page
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }
    }, 100);
  };

  const handlePatientClick = (patient) => {
    if (selectedPatient != null) {
      socket.emit('leave', { patient_id: selectedPatient.id, physician_id: userInfo.id })
    }
    setSelectedPatient(patient);
    socket.emit('join', { patient_id: patient.id, physician_id: userInfo.id })
    setShowDetail(true);

    // On mobile, collapse sidebar when patient is selected
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  // Handle tab switching - mark messages as read when messages tab is selected
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "messages" && selectedPatient) {
      // Mark all of the selected patient's messages as read
      const messageIds = selectedPatient.messages.map(msg => msg.id);
      setReadMessageIds(prevReadIds => {
        // Combine previous read IDs with all current message IDs
        const combinedIds = [...new Set([...prevReadIds, ...messageIds])];
        // Save to localStorage
        localStorage.setItem('physicianReadMessageIds', JSON.stringify(combinedIds));
        return combinedIds;
      });

      // Scroll to bottom
      scrollToBottom();
    }
  };

  useEffect(() => {
    function onMessageEvent(data) {
      const patient = selectedPatientRef.current
      setPatients(patients => {
        const updatedPatients = patients.map(p => {
          if (p.id == patient.id) {
            setSelectedPatient(() => { return { ...p, messages: [...(p.messages), data] } })
            return { ...p, messages: [...(p.messages), data] }
          }
          return p
        })
        return updatedPatients
      })

      // If the new message is not from the physician, don't automatically mark it as read
      // unless the messages tab is currently active
      if (data.sender != 1) {
        if (activeTab === "messages") {
          // If messages tab is active, mark the new message as read
          setReadMessageIds(prevReadIds => {
            const combinedIds = [...new Set([...prevReadIds, data.id])];
            localStorage.setItem('physicianReadMessageIds', JSON.stringify(combinedIds));
            return combinedIds;
          });
        }
        // If messages tab is not active, the message remains unread
      }
    }
    socket.on('message', onMessageEvent)
    return () => {
      socket.off('message', onMessageEvent)
    }
  }, [activeTab]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      // create message
      const newMessageObj = {
        patient_id: selectedPatient.id,
        physician_id: userInfo.id,
        content: message,
        sender: userInfo.id
      }
      socket.emit('message', newMessageObj)
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setMessage('')
  };

  // Handle Enter key press to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSendMessage();
    }
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

  // Helper functions for joint analysis
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getJointStatusColor = (readings) => {
    const range = readings.max - readings.min;
    const normalRange = readings.normal.max - readings.normal.min;
    const percentage = (range / normalRange) * 100;
    
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };


  const getJointTypeColor = (jointType) => {
    switch(jointType.toLowerCase()) {
      case 'shoulder': return 'bg-blue-600';
      case 'elbow': return 'bg-green-600';
      case 'wrist': return 'bg-purple-600';
      case 'knee': return 'bg-amber-600';
      default: return 'bg-gray-600';
    }
  };

  const handleViewFile = (file) => {
    console.log("Opening file:", file);
  };

  // Check for unread messages for a specific patient
  const getUnreadMessagesCount = (patient) => {
    if (!patient.messages) return 0;
    return patient.messages.filter(msg =>
      msg.sender != 1 && !readMessageIds.includes(msg.id)
    ).length;
  };

  useEffect(() => {
    async function loadPatients() {
      const token = await getAccessTokenSilently()
      const _patients = userInfo.patients
      let patientsCopy = [...patients];

      for (let i = 0; i < Math.min(2, _patients.length); i++) {
        patientsCopy[i].id = _patients[i].id;
        patientsCopy[i].name = _patients[i].first_name + ' ' + _patients[i].last_name;

        // fetch patient messages
        try {
          const response = await getMessages({ 'physician_id': userInfo.id, 'patient_id': patientsCopy[i].id }, token);
          const data = await response.json()
          patientsCopy[i].messages = data;

          // If this patient is already selected and messages tab is active, mark messages as read
          if (selectedPatient && selectedPatient.id === patientsCopy[i].id && activeTab === "messages") {
            const messageIds = data.map(msg => msg.id);
            setReadMessageIds(prevReadIds => {
              const combinedIds = [...new Set([...prevReadIds, ...messageIds])];
              localStorage.setItem('physicianReadMessageIds', JSON.stringify(combinedIds));
              return combinedIds;
            });
          }
        } catch (error) {
          console.error(`Error fetching messages for patient ${patientsCopy[i].id}:`, error);
          patientsCopy[i].messages = [];
        }
      }

      setPatients(patientsCopy);
      // } else {
      //   console.error("Failed to fetch patients");
      // }
      setIsLoading(false);
    }

    loadPatients();
  }, [activeTab, selectedPatient]);

  useEffect(() => {
    async function fetchPatientMotionFiles() {
      if (!selectedPatient) return;

      try {
        const token = await getAccessTokenSilently();
        const response = await getMotionFiles(selectedPatient.id, token);
        if (response.ok) {
          const files = await response.json();
          setPatientMotionFiles(files);
          // Optionally select the first file by default
          if (files.length > 0) {
            setSelectedMotionFile(files[0]);
          } else {
            setSelectedMotionFile(null);
          }
        } else {
          console.error("Failed to fetch motion files");
          setPatientMotionFiles([]);
          setSelectedMotionFile(null);
        }
      } catch (error) {
        console.error("Error fetching motion files:", error);
        setPatientMotionFiles([]);
        setSelectedMotionFile(null);
      }
    }

    fetchPatientMotionFiles();
  }, [selectedPatient]);

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
            {patients.map((patient) => {
              const unreadCount = getUnreadMessagesCount(patient);
              return (
                <button
                  key={patient.id}
                  onClick={() => handlePatientClick(patient)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center ${selectedPatient?.id === patient.id
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
                      {unreadCount > 0 && (
                        <span className="w-2 h-2 bg-red-500 rounded-full ml-2 flex-shrink-0"></span>
                      )}
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </>
                  )}
                </button>
              );
            })}
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
                      onClick={() => handleTabChange("model")}
                      className={`px-3 py-2 rounded-md flex items-center ${activeTab === "model"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Patient Model
                    </button>
                    <button
                      onClick={() => handleTabChange("messages")}
                      className={`px-3 py-2 rounded-md flex items-center ${activeTab === "messages"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {getUnreadMessagesCount(selectedPatient) > 0 && (
                        <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
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

                      {/* Motion File Selector */}
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <select
                          className="border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedMotionFile?.id || ""}
                          onChange={(e) => {
                            const fileId = e.target.value;
                            const file = patientMotionFiles.find(f => f.id.toString() === fileId);
                            setSelectedMotionFile(file || null);
                          }}
                        >
                          <option value="">Select motion file</option>
                          {patientMotionFiles.map(file => (
                            <option key={file.id} value={file.id}>
                              {file.name} ({file.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                        <PatientModel />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                        Joint Analysis
                      </h3>
                      
                      <div className="mb-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setJointTab("readings")}
                            className={`px-3 py-2 rounded-t-md flex items-center ${
                              jointTab === "readings" 
                                ? "bg-blue-50 text-blue-700 font-medium border-b-2 border-blue-600" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Motion Readings
                          </button>
                          <button
                            onClick={() => setJointTab("files")}
                            className={`px-3 py-2 rounded-t-md flex items-center ${
                              jointTab === "files" 
                                ? "bg-blue-50 text-blue-700 font-medium border-b-2 border-blue-600" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Motion Files
                          </button>
                        </div>
                      </div>
                      
                      {jointTab === "readings" && (
                        <MotionReadingsTab 
                          selectedPatient={selectedPatient}
                          formatDate={formatDate}
                          getJointStatusColor={getJointStatusColor}
                        />
                      )}
                      
                      {jointTab === "files" && (
                        <MotionFilesTab 
                          selectedPatient={selectedPatient}
                          formatDate={formatDate}
                          handleViewFile={handleViewFile}
                        />
                      )}
                            
                            {(!selectedPatient.motionFiles || selectedPatient.motionFiles.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                <p>No motion files available</p>
                              </div>
                            )}
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
                              className={`flex ${msg.sender == 1 ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.sender == 1
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-black'
                                  }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-sm">
                                    {msg.sender == 1 ? 'You' : 'Patient'}
                                  </span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                                <div className={`text-xs mt-1 text-right ${msg.sender == 1 ? 'text-blue-200' : 'text-gray-400'
                                  }`}>
                                  {formatMessageDate(msg.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Invisible div at the end for auto-scrolling */}
                          <div ref={messagesEndRef} />
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
                        onKeyDown={handleKeyDown}
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
    </div >
  );
};

export default PhysicianView;
