import React from "react";
import { Activity } from "lucide-react";

const MotionReadingsTab = ({ selectedPatient, formatDate, getJointStatusColor }) => {
  return (
    <div className="space-y-4">
      {Object.entries(selectedPatient.jointReadings || {}).map(([joint, readings]) => (
        <div key={joint} className="border-b pb-3">
          <div className="font-medium text-gray-900 capitalize flex items-center justify-between">
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${getJointStatusColor(readings)}`}></span>
              {joint}
            </div>
            <span className="text-xs text-gray-500">
              Last updated: {formatDate(readings.lastUpdated)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-gray-50 p-2 rounded-md">
              <div className="text-xs text-gray-500">Min Angle</div>
              <div className="font-medium">{readings.min}°</div>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <div className="text-xs text-gray-500">Max Angle</div>
              <div className="font-medium">{readings.max}°</div>
            </div>
          </div>
        </div>
      ))}
      
      {(!selectedPatient.jointReadings || Object.keys(selectedPatient.jointReadings).length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p>No motion readings available</p>
        </div>
      )}
    </div>
  );
};

export default MotionReadingsTab;