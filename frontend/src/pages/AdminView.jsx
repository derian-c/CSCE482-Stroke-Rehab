import React, { useEffect, useState } from "react";
import { isAdmin } from "../apis/isAdmin";
import { getUsersRole } from "../apis/getUserRole";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { getPhysicians, createPhysician, deletePhysicianByID } from '../apis/physicianService'
import { getAdmins } from '../apis/adminService'
import useFetchProtectedData from "../utils/fetchFromApi";
import { DeviceManagement } from "../components/DeviceManagement";
import AccessibilityMenu from '../components/AccessibilityMenu';
import NotificationToast from "../components/NotificationToast";
import ConfirmationDialog from "../components/ConfirmationDialog";

import {
  UserPlus,
  Users,
  LogOut,
  Trash2,
  Activity,
  MonitorSmartphone,
} from "lucide-react";


function AdminView({userInfo}) {
  const { user, getAccessTokenSilently, isLoading, logout } = useAuth0();

  const navigate = useNavigate();
  const { data, loading } = useFetchProtectedData("/api/private");
  const [msg, setmsg] = useState("loading");
  const [activeTab, setActiveTab] = useState("invitations");

  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [physicians, setPhysicians] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoadingPhysicians, setIsLoadingPhysicians] = useState(true);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    physicianId: null,
    physicianName: ""
  });

  // Handle logout functionality
  const handleLogout = () => {
    const returnUrl = window.location.origin;
    
    // Log out using Auth0 and redirect to the appropriate home page
    logout({ returnTo: returnUrl });
  };

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
        }));

        setPhysicians(formattedPhysicians);
      } catch (error) {
        console.error("Error fetching physicians:", error);
        setError("Failed to load physicians data");
      } finally {
        setIsLoadingPhysicians(false);
      }
    };
    fetchPhysicians()
  }, [getAccessTokenSilently]);

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
    fetchAdmins()
  }, [getAccessTokenSilently]);

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
      const response = await createPhysician(physicianData, token);

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
          },
        ]);

        // clear form
        setInviteFirstName("");
        setInviteLastName("");
        setInviteEmail("");

        setNotification({
          type: 'success',
          message: `Physician ${inviteFirstName} ${inviteLastName} added successfully`
        });
      } else {
        throw new Error("Server returned empty response");
      }
    } catch (error) {
      console.error("Error adding physician:", error);
      setNotification({
        type: 'error',
        message: `Failed to add physician: ${error.message}`
      });
    }
  };

  // delete physician from system
  const handleDeletePhysician = async (id) => {
    try {
      const token = await getAccessTokenSilently()
      const response = await deletePhysicianByID(id, token)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete physician");
      }

      // remove from state
      const deletedPhysician = physicians.find(
        (physician) => physician.id === id
      );
      setPhysicians(physicians.filter((physician) => physician.id !== id));

      setNotification({
        type: 'success',
        message: `Physician ${deletedPhysician.name} deleted successfully`
      });
    } catch (error) {
      console.error("Error deleting physician:", error);
      setNotification({
        type: 'error',
        message: `Failed to delete physician: ${error.message}`
      });
    }
  };

  // Show the delete confirmation dialog
  const showDeleteConfirmation = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      physicianId: id,
      physicianName: name
    });
  };

  // loading state
  if ((isLoadingPhysicians || isLoadingAdmins)) {
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
      className={`px-3 py-3 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap flex-1 flex items-center justify-center ${activeTab === tab
        ? "bg-blue-600 text-white border-b-2 border-blue-400"
        : "bg-gray-700 text-white hover:bg-gray-600"
        }`}
    >
      {React.createElement(icon, { className: "h-4 w-4 mr-1" })}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-100 overflow-auto">
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
        onConfirm={() => handleDeletePhysician(confirmDialog.physicianId)}
        title="Delete Physician"
        message={`Are you sure you want to delete ${confirmDialog.physicianName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
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
              onClick={handleLogout}
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
                tab="deviceManagement"
                icon={MonitorSmartphone}
                label="Device Management"
              />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 w-full">
            {/* Add Physician Tab */}
            {activeTab === "invitations" && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                  Add Physician
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
                      placeholder="e.g. John"
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
                      placeholder="e.g. Doe"
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
                      placeholder="e.g. physician@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
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
                  Manage physicians in the system.
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
                            <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  showDeleteConfirmation(physician.id, physician.name)
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

            {/* Device Management Tab */}
            {activeTab === "deviceManagement" && (
              <DeviceManagement />
            )}
          </div>
        </div>
      </div>
      <AccessibilityMenu />
    </div>
  );
}

export default AdminView;