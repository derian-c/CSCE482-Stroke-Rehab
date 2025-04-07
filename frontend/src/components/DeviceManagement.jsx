import { useState, useEffect } from 'react';
import { Smartphone, User, Plus, Trash, RefreshCw, Unlink, Link } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { BACKEND_URL } from '@/constants.js';

// API service functions with auth token
const getDevices = async (token) => {
  return fetch(`${BACKEND_URL}/devices`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
};

const getPatients = async (token) => {
  return fetch(`${BACKEND_URL}/patients`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
};

const getUnassignedDevices = async (token) => {
  return fetch(`${BACKEND_URL}/devices/unassigned`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
};

const createDevice = async (token) => {
  return fetch(`${BACKEND_URL}/devices`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
};

const deleteDevice = async (token, deviceId) => {
  return fetch(`${BACKEND_URL}/devices/${deviceId}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
};

const assignDevice = async (token, deviceId, patientId) => {
  return fetch(`${BACKEND_URL}/devices/${deviceId}/assign`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ patient_id: patientId })
  });
};

export function DeviceManagement({ canEnter = true }) {
  const { getAccessTokenSilently } = useAuth0();
  const [devices, setDevices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [unassignedDevices, setUnassignedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');

  // Fetch all data needed for device management
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();

        // Fetch all data in parallel
        const [devicesResponse, patientsResponse, unassignedResponse] = await Promise.all([
          getDevices(token),
          getPatients(token),
          getUnassignedDevices(token)
        ]);

        // Check for errors in any of the responses
        if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
        if (!patientsResponse.ok) throw new Error("Failed to fetch patients");
        if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

        // Parse the JSON responses
        const [devicesData, patientsData, unassignedData] = await Promise.all([
          devicesResponse.json(),
          patientsResponse.json(),
          unassignedResponse.json()
        ]);

        // Format patients similar to physicians format
        const formattedPatients = patientsData.map((patient) => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          first_name: patient.first_name,
          last_name: patient.last_name
        }));

        setDevices(devicesData);
        setPatients(formattedPatients);
        setUnassignedDevices(unassignedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (canEnter) fetchData();
  }, [canEnter, getAccessTokenSilently]);

  // Create a new device
  const handleCreateDevice = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await createDevice(token);

      if (!response.ok) throw new Error("Failed to create device");

      // Refresh the device data
      const devicesResponse = await getDevices(token);
      const unassignedResponse = await getUnassignedDevices(token);

      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

      const devicesData = await devicesResponse.json();
      const unassignedData = await unassignedResponse.json();

      setDevices(devicesData);
      setUnassignedDevices(unassignedData);
      setError(null);
    } catch (err) {
      console.error('Error creating device:', err);
      setError('Failed to create device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a device
  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await deleteDevice(token, deviceId);

      if (!response.ok) throw new Error("Failed to delete device");

      // Refresh the device data
      const devicesResponse = await getDevices(token);
      const unassignedResponse = await getUnassignedDevices(token);

      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

      const devicesData = await devicesResponse.json();
      const unassignedData = await unassignedResponse.json();

      setDevices(devicesData);
      setUnassignedDevices(unassignedData);
      setError(null);
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Failed to delete device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Assign a device to a patient
  const handleAssignDevice = async () => {
    if (!selectedDevice || !selectedPatient) {
      setError('Please select both a device and a patient.');
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await assignDevice(token, selectedDevice, parseInt(selectedPatient));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign device");
      }

      // Reset selection and refresh data
      setSelectedDevice('');
      setSelectedPatient('');

      // Refresh the device data
      const devicesResponse = await getDevices(token);
      const unassignedResponse = await getUnassignedDevices(token);

      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

      const devicesData = await devicesResponse.json();
      const unassignedData = await unassignedResponse.json();

      setDevices(devicesData);
      setUnassignedDevices(unassignedData);
      setError(null);
    } catch (err) {
      console.error('Error assigning device:', err);
      setError(err.message || 'Failed to assign device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Unassign a device from a patient
  const handleUnassignDevice = async (deviceId) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await assignDevice(token, deviceId, null);

      if (!response.ok) throw new Error("Failed to unassign device");

      // Refresh the device data
      const devicesResponse = await getDevices(token);
      const unassignedResponse = await getUnassignedDevices(token);

      if (!devicesResponse.ok) throw new Error("Failed to fetch devices");
      if (!unassignedResponse.ok) throw new Error("Failed to fetch unassigned devices");

      const devicesData = await devicesResponse.json();
      const unassignedData = await unassignedResponse.json();

      setDevices(devicesData);
      setUnassignedDevices(unassignedData);
      setError(null);
    } catch (err) {
      console.error('Error unassigning device:', err);
      setError('Failed to unassign device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading devices...</span>
      </div>
    );
  }

  console.log(devices[0]);
  return (
    <div className="max-w-6xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device list */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
            Device Management
          </h2>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Manage your devices and assignments.
            </p>
            <button
              onClick={handleCreateDevice}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Device
            </button>
          </div>

          {loading && devices.length > 0 && (
            <div className="flex justify-center my-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No devices found. Create a new device to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {device.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.patient_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.patient_assignment ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1 text-blue-600" />
                            Patient #{device.patient_assignment.patient_id}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {device.patient_assignment ? (
                            <button
                              onClick={() => handleUnassignDevice(device.id)}
                              className="text-yellow-600 hover:text-yellow-900 flex items-center"
                              title="Unassign device"
                            >
                              <Unlink className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-gray-300 cursor-not-allowed">
                              <Unlink className="h-4 w-4" />
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete device"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignment form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Link className="h-5 w-5 mr-2 text-blue-600" />
            Assign Device to Patient
          </h2>
          <p className="text-gray-600 mb-6">
            Connect an unassigned device to a patient in the system.
          </p>

          <form className="w-full">
            <div className="mb-4">
              <label
                htmlFor="device"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Device
              </label>
              <select
                id="device"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select Device</option>
                {unassignedDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    Device ID: {device.id}
                  </option>
                ))}
              </select>
              {unassignedDevices.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No unassigned devices available. Create a new device first.
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="patient"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Patient
              </label>
              <select
                id="patient"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No patients available. Add patients to the system first.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAssignDevice}
              disabled={!selectedDevice || !selectedPatient || loading}
              className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${!selectedDevice || !selectedPatient || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Assign Device to Patient
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

