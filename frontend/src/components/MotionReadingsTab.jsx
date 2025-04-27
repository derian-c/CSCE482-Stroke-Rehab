import React, { useState, useEffect } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

const MotionReadingsTab = ({ selectedPatient, selectedMotionFile, formatDate }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [motionReadings, setMotionReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!selectedMotionFile) return;
    
    const fetchMotionReadings = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/motion_readings/${selectedMotionFile.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch motion readings");
        }

        const data = await response.json();
        setMotionReadings(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching motion readings:", err);
        setError("Failed to load motion readings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMotionReadings();
  }, [selectedMotionFile, getAccessTokenSilently]);

  
  const groupedReadings = React.useMemo(() => {
    const groups = {};
    
    motionReadings.forEach(reading => {
      // extract joint name from reading name (e.g., "pelvis_tilt" becomes "pelvis")
      const jointName = reading.name.split('_')[0];
      
      if (!groups[jointName]) {
        groups[jointName] = [];
      }
      groups[jointName].push(reading);
    });
    
    return groups;
  }, [motionReadings]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading readings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedMotionFile) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p>Please select a motion file to view readings</p>
      </div>
    );
  }

  if (motionReadings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p>No motion readings available for this file</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium">File:</span> {selectedMotionFile.name}
        <div className="text-xs text-gray-500">
          <span className="font-medium">Created:</span> {formatDate(selectedMotionFile.createdAt)}
        </div>
      </div>
      
      {Object.entries(groupedReadings).map(([jointName, readings]) => (
        <div key={jointName} className="border border-gray-200 rounded-md overflow-hidden">
          <div 
            onClick={() => toggleGroup(jointName)}
            className="bg-gray-50 px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100"
          >
            <h4 className="font-medium text-gray-900 capitalize">{jointName}</h4>
            {expandedGroups[jointName] ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          {expandedGroups[jointName] && (
            <div className="divide-y divide-gray-100">
              {readings.map(reading => (
                <div key={reading.id} className="px-3 py-2 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 capitalize">
                      {reading.name.split('_').slice(1).join(' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-xs bg-blue-50 p-1 rounded">
                      <span className="text-gray-600">Min:</span>{" "}
                      <span className="font-medium text-gray-900">{reading.min.toFixed(2)}°</span>
                    </div>
                    <div className="text-xs bg-blue-50 p-1 rounded">
                      <span className="text-gray-600">Max:</span>{" "}
                      <span className="font-medium text-gray-900">{reading.max.toFixed(2)}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MotionReadingsTab;