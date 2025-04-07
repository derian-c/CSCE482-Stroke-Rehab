import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  Send,
  ClipboardList,
  TrendingUp,
  FileText,
  Pill,
  CheckCircle,
  Calendar,
  Medal,
  User,
  LogOut,
  MessageCircle,
  PlusCircle,
  Clock
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { getMessages } from '@/apis/messagesService';
import { useSocket } from '@/components/SocketProvider';
import AccessibilityMenu from '../components/AccessibilityMenu';
import MedicalRecords from '../components/MedicalRecords';

const PatientView = ({userInfo}) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(); // reference for auto-scrolling
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  
  // messages state
  const [messages, setMessages] = useState([]);
  
  // medication states
  const [medications, setMedications] = useState([
    { id: 1, name: "Ibuprofen", dosage: "400mg", frequency: "Twice daily", logs: [{timestamp: "2025-03-28T14:30:00"}] },
    { id: 2, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", logs: [{timestamp: "2025-03-28T08:15:00"}] },
    { id: 3, name: "Vitamin D", dosage: "1000 IU", frequency: "Once daily", logs: [{timestamp: "2025-03-28T09:00:00"}] }
  ]);
  
  // new medication form state
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: ""
  });
  
  // sample
  const exerciseProgress = 75;
  const milestones = [
    { id: 1, name: "Complete Initial Assessment", progress: 100 },
    { id: 2, name: "Weekly Exercise Goals", progress: 75 },
    { id: 3, name: "Physical Therapy Sessions", progress: 60 },
  ];
  const socket = useSocket()

  // Auto-scroll to bottom when messages change or tab switches to messages
  useEffect(() => {
    if (activeTab === "messages") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // When tab changes away from records, reset selected document type
  useEffect(() => {
    if (activeTab !== "records") {
      setSelectedDocumentType(null);
    }
  }, [activeTab]);

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

  // Handle tab switching - ensure auto-scroll to bottom when messages tab is selected
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "messages") {
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // Mark all messages as read when messages tab is clicked
      const messageIds = messages.map(msg => msg.id);
      setReadMessageIds(prevReadIds => {
        // Combine previous read IDs with all current message IDs
        const combinedIds = [...new Set([...prevReadIds, ...messageIds])];
        // Save to localStorage
        localStorage.setItem('readMessageIds', JSON.stringify(combinedIds));
        return combinedIds;
      });
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // get messages here
        const token = await getAccessTokenSilently()
        const response = await getMessages({'patient_id':userInfo.id,'physician_id':userInfo.physician.id},token)
        const data = await response.json()
        if(response.ok){
          setMessages(data);
          
          // If messages tab is already active when messages load, mark them as read
          if (activeTab === "messages") {
            const messageIds = data.map(msg => msg.id);
            setReadMessageIds(prevReadIds => {
              // Combine previous read IDs with all current message IDs
              const combinedIds = [...new Set([...prevReadIds, ...messageIds])];
              // Save to localStorage
              localStorage.setItem('readMessageIds', JSON.stringify(combinedIds));
              return combinedIds;
            });
          }
        }else{
          throw new Error(data.error)
        }
        
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
  }, [activeTab]);

  useEffect(() => {
    function onMessageEvent(data) {
      setMessages(messages => [...messages, data])
      
      // If the new message is not from the current user, don't automatically mark it as read
      if (data.sender != 0) {
        // We don't add it to readMessageIds here, so it will be counted as unread
        // and will trigger the notification dot
      }
    }
    socket.on('message', onMessageEvent)
    socket.emit('join',{'patient_id':userInfo.id,'physician_id':userInfo.physician.id})

    return () => {
      socket.off('message', onMessageEvent)
    }
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // create message
      const newMessageObj = {
        'patient_id': userInfo.id,
        'physician_id': userInfo.physician.id,
        'content': newMessage,
        'sender': userInfo.id
      }
      socket.emit('message', newMessageObj)
      setNewMessage(""); 
      
    } catch (error) {
      console.error("Error sending message:", error);
      
    }
  };

  // enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSendMessage();
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // adding new med
  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) return;
    
    const newMed = {
      id: medications.length + 1,
      ...newMedication,
      logs: []
    };
    
    setMedications([...medications, newMed]);
    setNewMedication({ name: "", dosage: "", frequency: "" });
  };

  // medication intake log
  const handleLogMedication = (id) => {
    const updatedMedications = medications.map(med => {
      if (med.id === id) {
        return {
          ...med,
          logs: [...med.logs, { timestamp: new Date().toISOString() }]
        };
      }
      return med;
    });
    
    setMedications(updatedMedications);
  };

  // add new medication
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication({ ...newMedication, [name]: value });
  };

  const TabButton = ({ tab, icon, label, notification = false }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-center ${
        activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
      }`}
      aria-selected={activeTab === tab}
      aria-controls={`${tab}-panel`}
    >
      {React.createElement(icon, { className: "h-4 w-4 mr-1", "aria-hidden": "true" })}
      {label}
      {notification && (
        <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" aria-label="New notifications"></span>
      )}
    </button>
  );

  // State to track which messages have been read - stored in localStorage
  const [readMessageIds, setReadMessageIds] = useState(() => {
    // Initialize from localStorage if available
    const savedReadIds = localStorage.getItem('readMessageIds');
    return savedReadIds ? JSON.parse(savedReadIds) : [];
  });
  
  // Check for unread messages (those not in readMessageIds array)
  const unreadMessages = messages.filter(msg => 
    msg.sender != 0 && !readMessageIds.includes(msg.id)
  ).length;
  
  // Update localStorage whenever readMessageIds changes
  useEffect(() => {
    localStorage.setItem('readMessageIds', JSON.stringify(readMessageIds));
  }, [readMessageIds]);

  // record page navigation
  const navigateToPage = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <User className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-blue-600" aria-hidden="true" />
            Patient Dashboard
          </h1>
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
            <span className="font-medium text-sm sm:text-base text-gray-700 mr-3">{user?.name || "Patient"}</span>
            <button 
              onClick={() => logout({ returnTo: window.location.origin })}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div id="main-content" className="bg-white rounded-lg shadow-md w-full mb-6" role="main">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto w-full">
            <nav className="flex w-full" role="tablist">
              <TabButton tab="dashboard" icon={Activity} label="Dashboard" />
              <TabButton 
                tab="messages" 
                icon={MessageSquare} 
                label="Messages" 
                notification={unreadMessages > 0}
              />
              <TabButton tab="records" icon={FileText} label="Medical Records" />
              <TabButton tab="prescriptions" icon={Pill} label="Prescriptions" />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 w-full">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div id="dashboard-panel" role="tabpanel" aria-labelledby="dashboard-tab">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Exercise Progress
                      </h2>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4" role="progressbar" aria-valuenow={exerciseProgress} aria-valuemin="0" aria-valuemax="100">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${exerciseProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" aria-hidden="true" />
                      {exerciseProgress}% of weekly exercises completed
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center">
                      <Medal className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Treatment Milestones
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {milestones.map((milestone) => (
                        <div key={milestone.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-900 flex items-center">
                              <CheckCircle className={`h-3 w-3 mr-1 ${milestone.progress === 100 ? "text-green-500" : "text-blue-600"}`} aria-hidden="true" />
                              {milestone.name}
                            </span>
                            <span className="text-sm text-gray-900">
                              {milestone.progress}%
                            </span>
                          </div>
                          <div 
                            className="w-full bg-gray-200 rounded-full h-4" 
                            role="progressbar"
                            aria-valuenow={milestone.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <div
                              className={`${milestone.progress === 100 ? "bg-green-500" : "bg-blue-600"} h-4 rounded-full transition-all duration-300`}
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                  Quick Access
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: ClipboardList, label: "Medical History", onClick: () => { setActiveTab("records"); setSelectedDocumentType("medical_history"); } },
                    { icon: Activity, label: "Exercise Records", onClick: () => { setActiveTab("records"); setSelectedDocumentType("exercise_record"); } },
                    { icon: FileText, label: "Lab Results", onClick: () => { setActiveTab("records"); setSelectedDocumentType("lab_result"); } }
                  ].map((item, index) => (
                    <button 
                      key={index}
                      onClick={item.onClick}
                      className="h-24 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900"
                      aria-label={`Go to ${item.label}`}
                    >
                      {React.createElement(item.icon, { className: "h-6 w-6 text-blue-600", "aria-hidden": "true" })}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div id="messages-panel" role="tabpanel" aria-labelledby="messages-tab">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                  Messages with Your Care Team
                </h2>
                
                {/* Message History */}
                <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4" aria-live="polite">
                  {messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isFromMe = msg.sender == 0;
                        
                        return (
                          <div
                            key={index}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isFromMe
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-black'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-medium text-sm">
                                  {isFromMe ? 'You' : 'Physician'}
                                </span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                              <div className={`text-xs mt-1 text-right ${
                                isFromMe ? 'text-blue-200' : 'text-gray-400'
                              }`}>
                                {formatMessageDate(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Invisible div at the end for auto-scrolling */}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <MessageCircle className="h-12 w-12 text-gray-300 mb-2" aria-hidden="true" />
                      <p>No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">Send a message to your care team</p>
                    </div>
                  )}
                </div>
                
                {/* Compose Message */}
                <div className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                      text-gray-900 
                      placeholder-gray-500
                      bg-white
                      border-gray-300"
                    aria-label="Message text"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Medical Records Tab */}
            {activeTab === "records" && (
              <div id="records-panel" role="tabpanel" aria-labelledby="records-tab">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                  Medical Records
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-center">
                  <ClipboardList className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-blue-700">Your Medical Documents</h3>
                    <p className="text-sm text-blue-600">
                      All your medical records are securely stored and can be accessed here. 
                      Select a category to view, upload, or manage your documents.
                    </p>
                  </div>
                </div>
                
                {/* MedicalRecords component */}
                <MedicalRecords 
                  patientId={userInfo.id} 
                  initialSelectedType={selectedDocumentType} 
                />
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div id="prescriptions-panel" role="tabpanel" aria-labelledby="prescriptions-tab">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                  Prescriptions & Medications
                </h2>
                
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
                      <label htmlFor="med-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        id="med-frequency"
                        name="frequency"
                        value={newMedication.frequency}
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
                              {medication.dosage} · {medication.frequency}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleLogMedication(medication.id)}
                            className="mt-3 md:mt-0 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors flex items-center self-start"
                            aria-label={`Log intake for ${medication.name}`}
                          >
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                            Log Intake
                          </button>
                        </div>
                        
                        {/* Medication Logs */}
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Intake:</h5>
                          {medication.logs.length > 0 ? (
                            <div className="max-h-32 overflow-y-auto">
                              {medication.logs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="text-xs text-gray-600 py-1 flex items-center border-b border-gray-100 last:border-0">
                                  <Clock className="h-3 w-3 mr-1 text-blue-600" aria-hidden="true" />
                                  {formatMessageDate(log.timestamp)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">No logs yet</p>
                          )}
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
            )}
          </div>
        </div>
      </div>
      
      {/* Accessibility Menu */}
      <AccessibilityMenu />
    </div>
  );
};

export default PatientView;