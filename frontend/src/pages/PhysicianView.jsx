import React, { useState, useEffect, useRef, useMemo } from "react";
import { getPatients, createPatientByPhysician, deletePatientByID } from "@/apis/patientService";
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
  MessageCircle,
  UserPlus,
  Trash2
} from "lucide-react";
import { useSocket } from '@/components/SocketProvider'
import { getMessages } from '@/apis/messagesService'
import { getMotionFiles } from "../apis/motionFileService";
import MotionReadingsTab from '@/components/MotionReadingsTab'
import MotionFilesTab from '@/components/MotionFilesTab'
import AccessibilityMenu from '@/components/AccessibilityMenu';
import AddPatient from '@/components/AddPatient';
import NotificationToast from "../components/NotificationToast";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { getSasToken } from '@/apis/sasTokenService'

const PhysicianView = ({userInfo}) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [patients, setPatients] = useState([]);
  const [motionReadings, setMotionReadings] = useState({});

  // State to track which messages have been read - stored in localStorage
  const [readMessageIds, setReadMessageIds] = useState(() => {
    // Initialize from localStorage if available
    const savedReadIds = localStorage.getItem('physicianReadMessageIds');
    return savedReadIds ? JSON.parse(savedReadIds) : [];
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientPresent, setPatientPresent] = useState(false)
  const [message, setMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("model"); // Options: "model", "messages"
  const [jointTab, setJointTab] = useState("readings");
  const selectedPatientRef = useRef();
  const messagesEndRef = useRef(); // Reference for messages container for auto-scrolling
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(
    document.body.classList.contains('theme-high-contrast')
  );

  const [selectedMotionFile, setSelectedMotionFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "warning",
    onConfirm: () => {}
  });

  const [sasToken, setSasToken] = useState(null)

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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const showConfirmation = (title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel", type = "warning") => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  };

  const handlePatientClick = (patient) => {
    if (selectedPatient != null) {
      socket.emit('leave', { patient_id: selectedPatient.id, physician_id: userInfo.id })
    }
    if(!patient.motionFiles)
      patient.motionFiles = [];
    socket.emit('join', { patient_id: patient.id, physician_id: userInfo.id })
    setSelectedPatient(patient);
    setPatientPresent(true);
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
    
    const checkHighContrastMode = () => {
      const isHighContrast = document.body.classList.contains('theme-high-contrast');
      setHighContrastMode(isHighContrast);
    };
    
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkHighContrastMode();
        }
      });
    });
    
    
    observer.observe(document.body, { attributes: true });
    
    
    checkHighContrastMode();
    
    
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    function onMessageEvent(data) {
      const patient = selectedPatientRef.current
      setPatients(patients => {
        const updatedPatients = patients.map(p => {
          if (p.id == patient.id) {
            setSelectedPatient(() => { return { ...patient, messages: [...(p.messages), data] } })
            return { ...patient, messages: [...(p.messages), data] }
          }
          return p
        })
        return updatedPatients
      })

      // If the new message is not from the physician, don't automatically mark it as read
      // unless the messages tab is currently active
      if (data.sender != userInfo.id) {
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

    function onNewMotionFileEvent(data) {
      setPatients(patients => {
        const updatedPatients = patients.map(p => {
          if (p.id == data.motion_file.patient_id) {
            return { ...p, motionFiles: [...(p.motionFiles || []), data.motion_file] }
          }
          return p
        })
        return updatedPatients
      })

      if (data.motion_readings && data.motion_readings.length > 0) {
        setMotionReadings(prevReadings => {
          const newReadingsMap = {};
          newReadingsMap[data.motion_file.id] = data.motion_readings;
          return {...prevReadings, ...newReadingsMap};
        });
      }

      showNotification(`New motion file uploaded: ${data.motion_file.name}`, "info");
      setSelectedPatient((oldPatient) => {
        return {
          ...oldPatient, 
          motionFiles: [...(oldPatient.motionFiles || []), data.motion_file]
        };
      });
    }
    
    socket.on('message', onMessageEvent)
    socket.on('new_file', onNewMotionFileEvent)
    return () => {
      socket.off('message', onMessageEvent)
      socket.off('new_file', onNewMotionFileEvent)
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

  // Handle adding a new patient
  const handleAddPatient = async (patientData) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await createPatientByPhysician(userInfo.id, patientData, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add patient");
      }
      
      const newPatient = await response.json();
      
      const simplePatient = {
        id: newPatient.id,
        first_name: newPatient.first_name,
        last_name: newPatient.last_name,
        messages: []
      };
      
      // Add to patients list
      userInfo.patients.push(simplePatient);
      setPatients(userInfo.patients);
      
      showNotification(`Patient ${newPatient.first_name} ${newPatient.last_name} added successfully`, "success");
      return newPatient;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  };

  // Handle deleting a patient
  const handleDeletePatient = async (patientId, patientName) => {
    // Show confirmation dialog
    showConfirmation(
      "Delete Patient",
      `Are you sure you want to delete ${patientName}? This action cannot be undone.`,
      async () => {
        try {
          const token = await getAccessTokenSilently();
          // Use the existing deletePatientByID function instead of deletePatientByPhysician
          const response = await deletePatientByID(patientId, token);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete patient");
          }
          
          // If the deleted patient is currently selected, clear the selection
          if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(null);
            setShowDetail(false);
          }
          
          // Remove the patient from the list
          userInfo.patients = userInfo.patients.filter(p => p.id !== patientId)
          setPatients(userInfo.patients);
          
          // Show success notification
          showNotification(`Patient ${patientName} deleted successfully`, "success");
        } catch (error) {
          console.error("Error deleting patient:", error);
          showNotification(`Failed to delete patient: ${error.message}`, "error");
        }
      },
      "Delete",
      "Cancel",
      "danger"
    );
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

  const handleViewFile = async (file) => {
    setSelectedMotionFile(file);
    
    const token = await getAccessTokenSilently();
    const sas_token = (await (await getSasToken('motion-files', token)).json()).token;
    setSasToken(sas_token);
    
    if (!motionReadings[file.id]) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/motion_readings/${file.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMotionReadings(prevReadings => ({
            ...prevReadings,
            [file.id]: data
          }));
        }
      } catch (error) {
        console.error("Error fetching motion readings:", error);
        showNotification("Failed to load motion readings", "error");
      }
    }
  };

  // Check for unread messages for a specific patient
  const getUnreadMessagesCount = (patient) => {
    if (!patient.messages) return 0;
    return patient.messages.filter(msg =>
      msg.sender != userInfo.id && !readMessageIds.includes(msg.id)
    ).length;
  };

  useEffect(() => {
    async function loadPatients() {
      if(patientPresent){
        return;
      }
      const token = await getAccessTokenSilently()
      for (let i = 0; i < userInfo.patients.length; i++) {
        
        // fetch patient messages
        try {
          const response = await getMessages({ 'physician_id': userInfo.id, 'patient_id': userInfo.patients[i].id }, token);
          const data = await response.json()
          userInfo.patients[i].messages = data;

          // If this patient is already selected and messages tab is active, mark messages as read
          if (selectedPatient && selectedPatient.id === userInfo.patients[i].id && activeTab === "messages") {
            const messageIds = data.map(msg => msg.id);
            setReadMessageIds(prevReadIds => {
              const combinedIds = [...new Set([...prevReadIds, ...messageIds])];
              localStorage.setItem('physicianReadMessageIds', JSON.stringify(combinedIds));
              return combinedIds;
            });
          }
        } catch (error) {
          console.error(`Error fetching messages for patient ${userInfo.patients[i].id}:`, error);
          userInfo.patients[i].messages = [];
        }
      }

      setPatients(userInfo.patients);
      setIsLoading(false);
    }

    loadPatients();
  }, [activeTab, selectedPatient, patientPresent]);

  useEffect(() => {
    async function fetchPatientMotionFiles() {
      if (!patientPresent) return;
      try {
        const token = await getAccessTokenSilently();
        const response = await getMotionFiles(selectedPatient.id, token);
        if (response.ok) {
          const files = await response.json();
          setSelectedPatient((oldPatient) => {
            return {...oldPatient, motionFiles: files};
          })
          setPatients((oldPatients) => {
            const updatedPatients = oldPatients.map((p) => {
              if (p.id === selectedPatient.id) {
                p = {...p, motionFiles: files};
                return p;
              }
              return p;
            });
            return updatedPatients;
          });
        } else {
          console.error("Failed to fetch motion files");
          setSelectedMotionFile(null);
        }
      } catch (error) {
        console.error("Error fetching motion files:", error);
        setSelectedMotionFile(null);
      }
    }

    fetchPatientMotionFiles();
  }, [patientPresent,selectedPatient?.id]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-hidden">
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />
      {/* Add Patient Popup */}
      <AddPatient 
        isOpen={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onAddPatient={handleAddPatient}
        showNotification={showNotification}
      />
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
            <span className="font-medium text-sm sm:text-base text-gray-700 mr-3">Dr. {userInfo.first_name + " " + userInfo.last_name || "Physician"}</span>
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
              <div key={patient.id}>
                  <button
                    onClick={() => handlePatientClick(patient)}
                    className={`w-full p-4 text-left hover:bg-gray-600 transition-colors flex items-center ${selectedPatient?.id === patient.id
                      ? "bg-gray-700 text-white"
                      : "bg-gray-800 text-white hover:text-white"
                      } ${sidebarCollapsed ? 'justify-center md:justify-center' : ''}`}
                  >
                    {sidebarCollapsed ? (
                      <User className="h-6 w-6 text-white" />
                    ) : (
                      <>
                        <User className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-medium truncate text-white">
                            {isLoading ? 'Loading...' : patient.first_name + " " + patient.last_name}
                          </div>
                          <div className="text-xs text-white flex items-center">
                            
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full ml-2 flex-shrink-0"></span>
                        )}
                        <ChevronRight className="h-4 w-4 ml-auto text-white" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            
            {/* Add Patient Button - Expanded Sidebar */}
            <div className={`p-3 border-t mt-auto ${sidebarCollapsed ? 'hidden md:hidden' : 'block'}`}>
              <button
                onClick={() => setShowAddPatient(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 flex items-center justify-center transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Patient
              </button>
            </div>
                    
            {/* Add Patient Button - Collapsed Sidebar */}
            <div className={`p-3 border-t mt-auto ${sidebarCollapsed ? 'block md:block' : 'hidden'}`}>
              <button
                onClick={() => setShowAddPatient(true)}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2"
                title="Add New Patient"
              >
                <UserPlus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {showDetail && selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="h-6 w-6 mr-2 text-blue-600" />
                    {selectedPatient.first_name + " " + selectedPatient.last_name}
                  </h2>
                  
                  {/* Delete patient button */}
                  <button
                    onClick={() => handleDeletePatient(selectedPatient.id, `${selectedPatient.first_name} ${selectedPatient.last_name}`)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete patient"
                    aria-label={`Delete ${selectedPatient.first_name} ${selectedPatient.last_name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTabChange("model")}
                      className={`px-3 py-2 rounded-md flex items-center ${activeTab === "model"
                        ? "bg-blue-600 text-white font-medium"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Patient Model
                    </button>
                    <button
                      onClick={() => handleTabChange("messages")}
                      className={`px-3 py-2 rounded-md flex items-center ${activeTab === "messages"
                        ? "bg-blue-600 text-white font-medium"
                        : "bg-gray-700 text-white hover:bg-gray-600"
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
                      
                      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                        {selectedMotionFile && sasToken ? <PatientModel file={selectedMotionFile} token={sasToken}/> : null}
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
                                ? "bg-blue-600 text-white font-medium border-b-2 border-blue-400" 
                                : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Motion Readings
                          </button>
                          <button
                            onClick={() => setJointTab("files")}
                            className={`px-3 py-2 rounded-t-md flex items-center ${
                              jointTab === "files" 
                                ? "bg-blue-600 text-white font-medium border-b-2 border-blue-400" 
                                : "bg-gray-700 text-white hover:bg-gray-600"
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
                          selectedMotionFile={selectedMotionFile}
                          motionReadings={selectedMotionFile && motionReadings[selectedMotionFile.id] ? motionReadings[selectedMotionFile.id] : []}
                          formatDate={formatDate}
                        />
                      )}
                      
                      {jointTab === "files" && (
                        <MotionFilesTab 
                          selectedPatient={selectedPatient}
                          formatDate={formatDate}
                          handleViewFile={handleViewFile}
                        />
                      )}
                      
                      {/* {(!selectedPatient.motionFiles || selectedPatient.motionFiles.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p>No motion files available</p>
                        </div>
                      )} */}
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
                              className={`flex ${msg.sender == userInfo.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.sender == userInfo.id
                                    ? 'bg-blue-600 text-white'
                                    : highContrastMode
                                      ? 'bg-black border border-white text-white' 
                                      : 'bg-white border border-gray-300 text-black'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-sm">
                                    {msg.sender == userInfo.id ? 'You' : 'Patient'}
                                  </span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                                <div className={`text-xs mt-1 text-right ${
                                  msg.sender == userInfo.id 
                                    ? 'text-blue-200' 
                                    : highContrastMode
                                      ? 'text-gray-300' 
                                      : 'text-gray-400'
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
              <p className="mt-2 text-gray-400">Choose a patient from the sidebar to view their information</p>
            </div>
          )}
        </div>
      </div>
      
      <AccessibilityMenu />
    </div>
  );
};

export default PhysicianView;
