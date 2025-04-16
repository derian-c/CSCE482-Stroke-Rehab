import React, { useState, useEffect, useRef } from "react";
import { UNSAFE_getPatchRoutesOnNavigationFunction, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { getMessages } from '@/apis/messagesService';
import { useSocket } from '@/components/SocketProvider';
import AccessibilityMenu from '../components/AccessibilityMenu';
import MedicalRecords from '../components/MedicalRecords';
import Medications from '../components/Medications';
import NotificationToast from "../components/NotificationToast";
import ConfirmationDialog from "../components/ConfirmationDialog";

const PatientView = ({userInfo}) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(); // reference for auto-scrolling
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  
  // messages state
  const [messages, setMessages] = useState([]);
  
  // Notification and confirmation dialog states
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
  
  // sample
  const exerciseProgress = 75;
  const milestones = [
    { id: 1, name: "Complete Initial Assessment", progress: 100 },
    { id: 2, name: "Weekly Exercise Goals", progress: 75 },
    { id: 3, name: "Physical Therapy Sessions", progress: 60 },
  ];
  const socket = useSocket()

  // Auto-scroll to bottom when messages change or when tab switches to messages
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
        setNotification({
          type: 'error',
          message: `Failed to load messages: ${error.message}`
        });
      }
    };
    
    fetchMessages();
  }, [activeTab]);

  useEffect(() => {
    function onMessageEvent(data) {
      setMessages(messages => [...messages, data])
      
      // If the new message is not from the current user, don't automatically mark it as read
      if (data.sender != userInfo.id) {
        // We don't add it to readMessageIds here, so it will be counted as unread
        // and will trigger the notification dot
        
        // Show notification for new message if not in messages tab
        if (activeTab !== "messages") {
          setNotification({
            type: 'info',
            message: 'You have a new message from your physician'
          });
        }
      }
    }
    socket.on('message', onMessageEvent)
    socket.emit('join',{'patient_id':userInfo.id,'physician_id':userInfo.physician.id})

    return () => {
      socket.off('message', onMessageEvent)
    }
  }, [activeTab]);

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
      setNotification({
        type: 'error',
        message: `Failed to send message: ${error.message}`
      });
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

  // State to track which messages have been read - stored in localStorage
  const [readMessageIds, setReadMessageIds] = useState(() => {
    // Initialize from localStorage if available
    const savedReadIds = localStorage.getItem('readMessageIds');
    return savedReadIds ? JSON.parse(savedReadIds) : [];
  });
  
  // Check for unread messages (those not in readMessageIds array)
  const unreadMessages = messages.filter(msg => 
    msg.sender != userInfo.id && !readMessageIds.includes(msg.id)
  ).length;
  
  // Update localStorage whenever readMessageIds changes
  useEffect(() => {
    localStorage.setItem('readMessageIds', JSON.stringify(readMessageIds));
  }, [readMessageIds]);

  // record page navigation
  const navigateToPage = (page) => {
    navigate(`/${page}`);
  };

  const currentPatientId = userInfo.id;

  // Function to show a confirmation dialog - can be passed down to child components
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

  // Function to show a notification - can be passed down to child components
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const TabButton = ({ tab, icon, label, notification = false }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-center ${
        activeTab === tab 
          ? "bg-blue-600 text-white border-b-2 border-blue-400" 
          : "bg-gray-700 text-white hover:bg-gray-600"
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

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
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
          <div className="border-b border-gray-200 overflow-x-auto w-full bg-white-800">
            <nav className="flex w-full" role="tablist">
              <TabButton tab="dashboard" icon={Activity} label="Dashboard" />
              <TabButton 
                tab="messages" 
                icon={MessageSquare} 
                label="Messages" 
                notification={unreadMessages > 0}
              />
              <TabButton tab="records" icon={FileText} label="Medical Records" />
              <TabButton tab="medications" icon={Pill} label="Medications" />
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
                      className="h-24 bg-gray-700 rounded-lg hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 text-white"
                      aria-label={`Go to ${item.label}`}
                    >
                      {React.createElement(item.icon, { className: "h-6 w-6 text-blue-400", "aria-hidden": "true" })}
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
                        const isFromMe = msg.sender == userInfo.id;
                        
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

            {/* Medications Tab */}
            {activeTab === "medications" && (
              <div id="medications-panel" role="tabpanel" aria-labelledby="medications-tab">
                <Medications 
                  patientId={currentPatientId} 
                  showNotification={showNotification}
                  showConfirmation={showConfirmation}
                />
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