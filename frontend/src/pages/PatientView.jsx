import React, { useState, useEffect } from "react";
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
  MessageCircle
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const PatientView = () => {
  const { user, logout } = useAuth0();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newMessage, setNewMessage] = useState("");
  
  // messages state
  const [messages, setMessages] = useState([
    // put here
  ]);
  
  // sample
  const exerciseProgress = 75;
  const milestones = [
    { id: 1, name: "Complete Initial Assessment", progress: 100 },
    { id: 2, name: "Weekly Exercise Goals", progress: 75 },
    { id: 3, name: "Physical Therapy Sessions", progress: 60 },
  ];

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // get messages here
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // create message
      const newMessageObj = {
        id: messages.length + 1,
        senderId: user?.sub, 
        senderName: user?.name || "Patient",
        recipientId: "physician_id",
        recipientName: "Dr. Smith", 
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // example response format
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newMessageObj)
      // });
      
      setMessages(prevMessages => [...prevMessages, newMessageObj]);
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const TabButton = ({ tab, icon, label, notification = false }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-center ${
        activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {React.createElement(icon, { className: "h-4 w-4 mr-1" })}
      {label}
      {notification && (
        <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );

  // unread messages for notifs
  const unreadMessages = messages.filter(msg => 
    msg.senderId !== user?.sub && !msg.isRead
  ).length;

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <User className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-blue-600" />
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
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md w-full mb-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto w-full">
            <nav className="flex w-full">
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
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Exercise Progress
                      </h2>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${exerciseProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      {exerciseProgress}% of weekly exercises completed
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center">
                      <Medal className="h-5 w-5 mr-2 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Treatment Milestones
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {milestones.map((milestone) => (
                        <div key={milestone.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-900 flex items-center">
                              <CheckCircle className={`h-3 w-3 mr-1 ${milestone.progress === 100 ? "text-green-500" : "text-blue-600"}`} />
                              {milestone.name}
                            </span>
                            <span className="text-sm text-gray-900">
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
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
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Access
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: ClipboardList, label: "Medical History" },
                    { icon: Activity, label: "Exercise Plans" },
                    { icon: FileText, label: "Test Results" },
                    { icon: Pill, label: "Medications" }
                  ].map((item, index) => (
                    <button 
                      key={index}
                      className="h-24 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900"
                    >
                      {React.createElement(item.icon, { className: "h-6 w-6 text-blue-600" })}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Messages with Your Care Team
                </h2>
                
                {/* Message History */}
                <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                  {messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isFromMe = msg.senderId === user?.sub;
                        
                        // can add functionality to see if a message has been viewed/read here
                        
                        return (
                          <div
                            key={index}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isFromMe
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="font-medium text-sm">
                                  {isFromMe ? 'You' : msg.senderName}
                                </span>
                              </div>
                              <p className="mt-1">{msg.content}</p>
                              <div className={`text-xs mt-1 text-right ${
                                isFromMe ? 'text-blue-200' : 'text-gray-400'
                              }`}>
                                {formatMessageDate(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
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
            )}

            {/* Medical Records Tab */}
            {activeTab === "records" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Medical Records
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-center">
                  <ClipboardList className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-700">Your Records</h3>
                    <p className="text-sm text-blue-600">
                      All your medical records are securely stored and can be accessed here. You can view your history, test results, and more.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: ClipboardList, title: "Medical History", date: "Last updated: Feb 10, 2025" },
                    { icon: Activity, title: "Exercise Records", date: "Last updated: Feb 15, 2025" },
                    { icon: FileText, title: "Lab Results", date: "Last updated: Jan 25, 2025" },
                    { icon: Calendar, title: "Appointment History", date: "Last updated: Feb 18, 2025" }
                  ].map((record, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-2">
                        {React.createElement(record.icon, { className: "h-5 w-5 mr-2 text-blue-600" })}
                        <h3 className="font-medium text-gray-900">{record.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{record.date}</p>
                      <button className="mt-3 text-blue-600 text-sm flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        View details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-blue-600" />
                  Prescriptions & Medications
                </h2>
                
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
                  <Pill className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-700">Medication Reminder</h3>
                    <p className="text-sm text-green-600">
                      Remember to take your medications as prescribed. Contact your doctor if you have any questions about your prescriptions.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: "Ibuprofen", dosage: "400mg", frequency: "Twice daily", refill: "3 refills remaining" },
                    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", refill: "1 refill remaining" },
                    { name: "Vitamin D", dosage: "1000 IU", frequency: "Once daily", refill: "Auto-refill enabled" }
                  ].map((medication, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center">
                            <Pill className="h-4 w-4 mr-1 text-blue-600" />
                            {medication.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{medication.dosage} · {medication.frequency}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {medication.refill}
                        </span>
                      </div>
                      <div className="flex mt-3 space-x-3">
                        <button className="text-xs text-blue-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule Refill
                        </button>
                        <button className="text-xs text-blue-600 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientView;