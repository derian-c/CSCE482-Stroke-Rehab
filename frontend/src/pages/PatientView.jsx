import React, { useState } from "react";

const PatientView = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "Dr. Smith",
      subject: "Follow-up Appointment",
      date: "2025-02-15",
    },
    {
      id: 2,
      from: "Physical Therapy",
      subject: "Exercise Plan Update",
      date: "2025-02-14",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  // Sample progress data
  const exerciseProgress = 75;
  const milestones = [
    { id: 1, name: "Complete Initial Assessment", progress: 100 },
    { id: 2, name: "Weekly Exercise Goals", progress: 75 },
    { id: 3, name: "Physical Therapy Sessions", progress: 60 },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          from: "You",
          subject: "New Message",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Patient Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
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
          <p className="text-sm text-gray-600 mt-2">
            {exerciseProgress}% of weekly exercises completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Treatment Milestones
            </h2>
          </div>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-900">
                    {milestone.name}
                  </span>
                  <span className="text-sm text-gray-900">
                    {milestone.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
          <div className="divide-y">
            {messages.map((message) => (
              <div key={message.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    {message.from}
                  </span>
                  <span className="text-sm text-gray-500">{message.date}</span>
                </div>
                <p className="text-sm text-gray-600">{message.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="h-24 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900">
          <span className="text-2xl">📋</span>
          <span className="font-medium">Medical History</span>
        </button>
        <button className="h-24 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900">
          <span className="text-2xl">🏃</span>
          <span className="font-medium">Exercise Plans</span>
        </button>
        <button className="h-24 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900">
          <span className="text-2xl">🔬</span>
          <span className="font-medium">Test Results</span>
        </button>
        <button className="h-24 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2 text-gray-900">
          <span className="text-2xl">💊</span>
          <span className="font-medium">Prescriptions</span>
        </button>
      </div>
    </div>
  );
};

export default PatientView;
