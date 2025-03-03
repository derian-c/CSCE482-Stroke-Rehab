import React from "react";
import { isAdmin } from "../apis/isAdmin";
import { getUsersRole } from "../apis/getUserRole";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetchProtectedData from "../utils/fetchFromApi";

function AdminView() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } =
    useAuth0();
  const [canEnter, setCanEnter] = useState(false);
  const navigate = useNavigate();
  const {data, err, loading} = useFetchProtectedData('/api/private');
  const [msg, setmsg] = useState("loading")
  const [activeTab, setActiveTab] = useState("invitations");
  const [inviteEmail, setInviteEmail] = useState("");
  const [staff, setStaff] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState({
    enableNotifications: true,
    darkMode: false,
    autoLogout: 30,
    dataRetentionDays: 90
  });

  // mock data
  useEffect(() => {
    setStaff([
      { id: 1, name: "Dr. Jane Doe", email: "jane.doe@gmail.com", role: "Physician", permissions: ["view_patients", "edit_records"] },
      { id: 2, name: "Dr. John Doe", email: "john.doe@gmail.com", role: "Physician", permissions: ["view_patients"] },
    ]);

    setActivityLog([
      { id: 1, user: "Dr. Jane Doe", action: "Viewed patient records", timestamp: "2025-03-03T09:23:12" },
      { id: 2, user: "Dr. John Doe", action: "Updated treatment plan", timestamp: "2025-03-02T14:45:30" },
    ]);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (isLoading) {
          return;
        }
        const roles = await getUsersRole(user, getAccessTokenSilently);
        const permission = await isAdmin(roles);
        if (permission) {
          setCanEnter(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking permissions", error);
        setCanEnter(false);
      }
    };

    checkAccess();
  }, [isLoading, user, getAccessTokenSilently, navigate]);

  useEffect(() => {
    const getMessage = async () => {
      try {
        if(loading) {
          return;
        }
        const message = data?.message;
        if (message) setmsg(message);
      }
      catch (error) {
        console.error("Error getting message", error);
      }
    }
    getMessage()
  }, [data, loading]);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  const handlePermissionToggle = (staffId, permission) => {
    setStaff(staff.map(member => {
      if (member.id === staffId) {
        const hasPermission = member.permissions.includes(permission);
        const updatedPermissions = hasPermission 
          ? member.permissions.filter(p => p !== permission)
          : [...member.permissions, permission];
        
        return { ...member, permissions: updatedPermissions };
      }
      return member;
    }));
  };

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      {/* Changed this container to be full width */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt="Profile" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
              />
            )}
            <span className="font-medium text-sm sm:text-base text-gray-700">{user?.name || "User"}</span>
          </div>
        </div>
        
        {/* Made the white container full width */}
        <div className="bg-white rounded-lg shadow-md w-full">
          {/* Made the tab navigation expand to fill width */}
          <div className="border-b border-gray-200 overflow-x-auto w-full">
            <nav className="flex w-full">
              <button
                onClick={() => setActiveTab("invitations")}
                className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 ${
                  activeTab === "invitations"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Email Invitations
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 ${
                  activeTab === "staff"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Staff Management
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 ${
                  activeTab === "activity"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Activity Log
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 ${
                  activeTab === "settings"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Page Settings
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 w-full">
            {activeTab === "invitations" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Invite Physicians</h2>
                <p className="text-gray-600 mb-6">
                  Send email invitations to physicians to join the platform.
                </p>
                
                <form onSubmit={handleInviteSubmit} className="w-full">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="physician@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="physician"
                    >
                      <option value="physician">Physician</option>
                      <option value="nurse">Nurse</option>
                      <option value="staff">Administrative Staff</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Include a personal message with your invitation..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Send Invitation
                  </button>
                </form>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
                <p className="text-gray-600 mb-6">
                  Manage staff accounts and permissions.
                </p>
                
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staff.map((member) => (
                        <tr key={member.id}>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{member.name}</div>
                          </td>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                            <div className="text-gray-500">{member.email}</div>
                          </td>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-3 py-4 sm:px-6 whitespace-normal text-sm text-gray-500">
                            <div className="flex flex-wrap gap-2">
                              {["view_patients", "edit_records", "admin_access"].map((permission) => (
                                <label key={permission} className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                    checked={member.permissions.includes(permission)}
                                    onChange={() => handlePermissionToggle(member.id, permission)}
                                  />
                                  <span className="ml-2 text-xs sm:text-sm">
                                    {permission.replace(/_/g, ' ')}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
                <p className="text-gray-600 mb-6">
                  View system activity and usage statistics.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 text-xl font-bold">248</div>
                    <div className="text-gray-500 text-sm">Active Users Today</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-xl font-bold">1,284</div>
                    <div className="text-gray-500 text-sm">Page Views (Last 7 Days)</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-purple-600 text-xl font-bold">12.3 min</div>
                    <div className="text-gray-500 text-sm">Avg. Session Duration</div>
                  </div>
                </div>
                
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activityLog.map((log) => (
                        <tr key={log.id}>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{log.user}</div>
                          </td>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                            <div className="text-gray-500">{log.action}</div>
                          </td>
                          <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Page Settings</h2>
                <p className="text-gray-600 mb-6">
                  Configure system settings and preferences.
                </p>
                
                <div className="w-full space-y-6">
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Notifications</h3>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.enableNotifications}
                          onChange={() => handleSettingChange("enableNotifications", !settings.enableNotifications)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${settings.enableNotifications ? "bg-blue-600" : "bg-gray-400"}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enableNotifications ? "transform translate-x-4" : ""}`}></div>
                      </div>
                      <div className="ml-3 text-gray-700">
                        Enable email notifications
                      </div>
                    </label>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Appearance</h3>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.darkMode}
                          onChange={() => handleSettingChange("darkMode", !settings.darkMode)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${settings.darkMode ? "bg-blue-600" : "bg-gray-400"}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.darkMode ? "transform translate-x-4" : ""}`}></div>
                      </div>
                      <div className="ml-3 text-gray-700">
                        Dark mode
                      </div>
                    </label>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Security</h3>
                    <div className="mb-4">
                      <label htmlFor="autoLogout" className="block text-sm font-medium text-gray-700 mb-1">
                        Auto logout after inactivity (minutes)
                      </label>
                      <select
                        id="autoLogout"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={settings.autoLogout}
                        onChange={(e) => handleSettingChange("autoLogout", parseInt(e.target.value))}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Data Management</h3>
                    <div className="mb-4">
                      <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-1">
                        Data retention period (days)
                      </label>
                      <select
                        id="dataRetention"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={settings.dataRetentionDays}
                        onChange={(e) => handleSettingChange("dataRetentionDays", parseInt(e.target.value))}
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">365 days</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminView;