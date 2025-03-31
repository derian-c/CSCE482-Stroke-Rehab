import React, { useEffect, useState } from "react";
import { isAdmin } from "../apis/isAdmin";
import { getUsersRole } from "../apis/getUserRole";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getPhysicians, createPhysician, deletePhysicianByID } from '@/apis/physicianService'
import { getAdmins } from '@/apis/adminService'
import useFetchProtectedData from "../utils/fetchFromApi";

import {
  UserPlus,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Trash2,
  Bell,
  Moon,
  Shield,
  Database,
  Eye,
  Edit,
  Lock,
  Save,
  Activity,
} from "lucide-react";

function AdminView() {
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const [canEnter, setCanEnter] = useState(false);
  const navigate = useNavigate();
  const { data, loading } = useFetchProtectedData("/api/private");
  const [msg, setmsg] = useState("loading");
  const [activeTab, setActiveTab] = useState("invitations");

  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [physicians, setPhysicians] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isLoadingPhysicians, setIsLoadingPhysicians] = useState(true);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState({
    enableNotifications: true,
    darkMode: false,
    autoLogout: 30,
    dataRetentionDays: 90,
  });

  // check perms
  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (isLoading) return;
        const accessToken = await getAccessTokenSilently();
        const outPutRoles = getUsersRole(user, accessToken);
        setRoles(outPutRoles);
        const permission = isAdmin(outPutRoles);
        permission ? setCanEnter(true) : navigate("/");
      } catch (error) {
        console.error("Error checking permissions", error);
        setCanEnter(false);
      }
    };
    checkAccess();
  }, [isLoading, user, getAccessTokenSilently, navigate]);

  // get API meesage
  useEffect(() => {
    const getMessage = async () => {
      try {
        if (loading) return;
        const message = data?.message;
        if (message) setmsg(message);
      } catch (error) {
        console.error("Error getting message", error);
      }
    };
    getMessage();
  }, [data, loading]);

  // fetch physicians from API
  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        setIsLoadingPhysicians(true);
        const token = await getAccessTokenSilently();
        const response = await getPhysicians(token)

        if (!response.ok) throw new Error("Failed to fetch physicians");

        const physiciansData = await response.json();
        const formattedPhysicians = physiciansData.map((physician) => ({
          id: physician.id,
          name: `Dr. ${physician.first_name} ${physician.last_name}`,
          email: physician.email_address,
          first_name: physician.first_name,
          last_name: physician.last_name,
          role: "Physician",
          permissions: physician.permissions || ["view_patients"],
        }));

        setPhysicians(formattedPhysicians);
      } catch (error) {
        console.error("Error fetching physicians:", error);
        setError("Failed to load physicians data");
      } finally {
        setIsLoadingPhysicians(false);
      }
    };

    if (canEnter) fetchPhysicians();
  }, [canEnter, getAccessTokenSilently]);

  // fetch admins from API
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoadingAdmins(true);
        const token = await getAccessTokenSilently();
        const response = await getAdmins(token)

        if (!response.ok) throw new Error("Failed to fetch admins");

        const adminsData = await response.json();
        setAdmins(adminsData);
      } catch (error) {
        console.error("Error fetching admins:", error);
        setError("Failed to load admins data");
      } finally {
        setIsLoadingAdmins(false);
      }
    };

    if (canEnter) fetchAdmins();
  }, [canEnter, getAccessTokenSilently]);

  // mock activity log
  useEffect(() => {
    if (canEnter) {
      setActivityLog([
        {
          id: 1,
          user: "System",
          action: "Loaded physician directory",
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          user: user?.name || "Current User",
          action: "Admin login",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [canEnter, user]);

  // handle physician invitation submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const physicianData = {
        first_name: inviteFirstName,
        last_name: inviteLastName,
        email_address: inviteEmail,
      }
      const token = await getAccessTokenSilently()
      const response = await createPhysician(physicianData,token);

      const responseText = await response.text();

      if (responseText.trim()) {
        const newPhysician = JSON.parse(responseText);

        if (!response.ok) {
          throw new Error(newPhysician.error || "Failed to create physician");
        }

        setPhysicians([
          ...physicians,
          {
            id: newPhysician.id,
            name: `Dr. ${newPhysician.first_name} ${newPhysician.last_name}`,
            email: newPhysician.email_address,
            first_name: newPhysician.first_name,
            last_name: newPhysician.last_name,
            role: "Physician",
            permissions: ["view_patients"],
          },
        ]);

        // clear form
        setInviteFirstName("");
        setInviteLastName("");
        setInviteEmail("");

        // log activity
        const newActivityLog = {
          id: activityLog.length + 1,
          user: user?.name || "Admin",
          action: `Added physician ${newPhysician.first_name} ${newPhysician.last_name}`,
          timestamp: new Date().toISOString(),
        };

        setActivityLog([newActivityLog, ...activityLog]);
        alert(
          `Physician ${inviteFirstName} ${inviteLastName} added successfully`
        );
      } else {
        throw new Error("Server returned empty response");
      }
    } catch (error) {
      console.error("Error adding physician:", error);
      alert(`Failed to add physician: ${error.message}`);
    }
  };

  // delete physician from system
  const handleDeletePhysician = async (id) => {
    if (!window.confirm("Are you sure you want to delete this physician?"))
      return;

    try {
      const token = await getAccessTokenSilently()
      const response = await deletePhysicianByID(id,token)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete physician");
      }

      // remove from state
      const deletedPhysician = physicians.find(
        (physician) => physician.id === id
      );
      setPhysicians(physicians.filter((physician) => physician.id !== id));

      const newActivityLog = {
        id: activityLog.length + 1,
        user: user?.name || "Admin",
        action: `Deleted physician ${deletedPhysician.name}`,
        timestamp: new Date().toISOString(),
      };

      setActivityLog([newActivityLog, ...activityLog]);
      alert("Physician deleted successfully");
    } catch (error) {
      console.error("Error deleting physician:", error);
      alert(`Failed to delete physician: ${error.message}`);
    }
  };

  // permissions for physician
  const handlePermissionToggle = async (physicianId, permission) => {
    const physician = physicians.find((p) => p.id === physicianId);
    const hasPermission = physician.permissions.includes(permission);
    const updatedPermissions = hasPermission
      ? physician.permissions.filter((p) => p !== permission)
      : [...physician.permissions, permission];

    setPhysicians(
      physicians.map((p) =>
        p.id === physicianId ? { ...p, permissions: updatedPermissions } : p
      )
    );

    const newActivityLog = {
      id: activityLog.length + 1,
      user: user?.name || "Admin",
      action: `${
        hasPermission ? "Removed" : "Added"
      } ${permission} permission for ${physician.name}`,
      timestamp: new Date().toISOString(),
    };

    setActivityLog([newActivityLog, ...activityLog]);
  };

  const handleSettingChange = (setting, value) => {
    setSettings({ ...settings, [setting]: value });
  };

  // loading state
  if ((isLoadingPhysicians || isLoadingAdmins) && canEnter) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-xl flex items-center">
          <Activity className="animate-spin h-8 w-8 mr-2 text-blue-600" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600 flex items-center">
          <span className="mr-2">⚠️</span> {error}
        </div>
      </div>
    );
  }

  const TabButton = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-center ${
        activeTab === tab
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {React.createElement(icon, { className: "h-4 w-4 mr-1" })}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 mr-2 text-blue-600" />
            Admin Dashboard
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
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <span className="font-medium text-sm sm:text-base text-gray-700 mr-3">
              {user?.name || "User"}
            </span>
            <button
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md w-full">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto w-full">
            <nav className="flex w-full">
              <TabButton
                tab="invitations"
                icon={UserPlus}
                label="Add Physician"
              />
              <TabButton
                tab="staff"
                icon={Users}
                label="Physician Management"
              />
              <TabButton
                tab="activity"
                icon={ClipboardList}
                label="Activity Log"
              />
              <TabButton tab="settings" icon={Settings} label="Page Settings" />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 w-full">
            {/* Add Physician Tab */}
            {activeTab === "invitations" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                </h2>
                <p className="text-gray-600 mb-6">
                  Add a new physician to the system.
                </p>

                <form onSubmit={handleInviteSubmit} className="w-full">
                  <div className="mb-4">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="John"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
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
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      defaultValue="physician"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="physician">Physician</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Currently only physician role is supported
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Physician
                  </button>
                </form>
              </div>
            )}

            {/* Physician Management Tab */}
            {activeTab === "staff" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Physician Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage physicians and their permissions.
                </p>

                {physicians.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                    <Users className="h-12 w-12 mb-3 text-gray-400" />
                    <p>
                      No physicians found. Add physicians using the Add
                      Physician tab.
                    </p>
                  </div>
                ) : (
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
                          <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {physicians.map((physician) => (
                          <tr key={physician.id}>
                            <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {physician.name}
                              </div>
                            </td>
                            <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                              <div className="text-gray-500">
                                {physician.email}
                              </div>
                            </td>
                            <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {physician.role}
                              </span>
                            </td>
                            <td className="px-3 py-4 sm:px-6 whitespace-normal text-sm text-gray-500">
                              <div className="flex flex-wrap gap-2">
                                {[
                                  {
                                    key: "view_patients",
                                    icon: Eye,
                                    label: "view patients",
                                  },
                                  {
                                    key: "edit_records",
                                    icon: Edit,
                                    label: "edit records",
                                  },
                                  {
                                    key: "admin_access",
                                    icon: Lock,
                                    label: "admin access",
                                  },
                                ].map(({ key, icon, label }) => (
                                  <label
                                    key={key}
                                    className="inline-flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 text-blue-600"
                                      checked={physician.permissions.includes(
                                        key
                                      )}
                                      onChange={() =>
                                        handlePermissionToggle(
                                          physician.id,
                                          key
                                        )
                                      }
                                    />
                                    <span className="ml-2 text-xs sm:text-sm flex items-center">
                                      {React.createElement(icon, {
                                        className: "h-3 w-3 mr-1 text-gray-500",
                                      })}
                                      {label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  handleDeletePhysician(physician.id)
                                }
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === "activity" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                  Activity Log
                </h2>
                <p className="text-gray-600 mb-6">
                  View system activity and action history.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
                  {[
                    {
                      bg: "bg-blue-50",
                      icon: Users,
                      color: "text-blue-600",
                      count: physicians.length,
                      label: "Active Physicians",
                    },
                    {
                      bg: "bg-green-50",
                      icon: Shield,
                      color: "text-green-600",
                      count: admins.length,
                      label: "Active Admins",
                    },
                    {
                      bg: "bg-purple-50",
                      icon: Activity,
                      color: "text-purple-600",
                      count: activityLog.length,
                      label: "Recent Actions",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`${item.bg} p-4 rounded-lg flex items-center`}
                    >
                      {React.createElement(item.icon, {
                        className: `h-8 w-8 ${item.color} mr-3`,
                      })}
                      <div>
                        <div className={`${item.color} text-xl font-bold`}>
                          {item.count}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ))}
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
                            <div className="font-medium text-gray-900">
                              {log.user}
                            </div>
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

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Page Settings
                </h2>
                <p className="text-gray-600 mb-6">
                  Configure system settings and preferences.
                </p>

                <div className="w-full space-y-6">
                  {/* Settings sections with their respective icons */}
                  {[
                    {
                      title: "Notifications",
                      icon: Bell,
                      content: (
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={settings.enableNotifications}
                              onChange={() =>
                                handleSettingChange(
                                  "enableNotifications",
                                  !settings.enableNotifications
                                )
                              }
                            />
                            <div
                              className={`block w-10 h-6 rounded-full ${
                                settings.enableNotifications
                                  ? "bg-blue-600"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <div
                              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                settings.enableNotifications
                                  ? "transform translate-x-4"
                                  : ""
                              }`}
                            ></div>
                          </div>
                          <div className="ml-3 text-gray-700">
                            Enable email notifications
                          </div>
                        </label>
                      ),
                    },
                    {
                      title: "Appearance",
                      icon: Moon,
                      content: (
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={settings.darkMode}
                              onChange={() =>
                                handleSettingChange(
                                  "darkMode",
                                  !settings.darkMode
                                )
                              }
                            />
                            <div
                              className={`block w-10 h-6 rounded-full ${
                                settings.darkMode
                                  ? "bg-blue-600"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <div
                              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                settings.darkMode
                                  ? "transform translate-x-4"
                                  : ""
                              }`}
                            ></div>
                          </div>
                          <div className="ml-3 text-gray-700">Dark mode</div>
                        </label>
                      ),
                    },
                    {
                      title: "Security",
                      icon: Shield,
                      content: (
                        <div className="mb-4">
                          <label
                            htmlFor="autoLogout"
                            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                          >
                            <LogOut className="h-3 w-3 mr-1 text-gray-500" />
                            Auto logout after inactivity (minutes)
                          </label>
                          <select
                            id="autoLogout"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.autoLogout}
                            onChange={(e) =>
                              handleSettingChange(
                                "autoLogout",
                                parseInt(e.target.value)
                              )
                            }
                          >
                            {[15, 30, 60, 120].map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {minutes === 120
                                  ? "2 hours"
                                  : `${minutes} minutes`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ),
                    },
                    {
                      title: "Data Management",
                      icon: Database,
                      content: (
                        <div className="mb-4">
                          <label
                            htmlFor="dataRetention"
                            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                          >
                            <Database className="h-3 w-3 mr-1 text-gray-500" />
                            Data retention period (days)
                          </label>
                          <select
                            id="dataRetention"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.dataRetentionDays}
                            onChange={(e) =>
                              handleSettingChange(
                                "dataRetentionDays",
                                parseInt(e.target.value)
                              )
                            }
                          >
                            {[30, 60, 90, 180, 365].map((days) => (
                              <option key={days} value={days}>
                                {days} days
                              </option>
                            ))}
                          </select>
                        </div>
                      ),
                    },
                  ].map((section, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        {React.createElement(section.icon, {
                          className: "h-4 w-4 mr-2 text-blue-600",
                        })}
                        {section.title}
                      </h3>
                      {section.content}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
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
