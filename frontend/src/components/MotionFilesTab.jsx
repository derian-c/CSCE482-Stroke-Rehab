import React, { useState, useMemo } from "react";
import { Calendar, FileText, Search } from "lucide-react";

const MotionFilesTab = ({ selectedPatient, formatDate, handleViewFile }) => {
  const [fileSort, setFileSort] = useState("newest");
  const [dateFilter, setDateFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const sortedMotionFiles = useMemo(() => {
    if (!selectedPatient?.motionFiles) return [];
    
    const files = [...selectedPatient.motionFiles];
    
    switch(fileSort) {
      case 'newest':
        return files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return files.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return files;
    }
  }, [selectedPatient?.motionFiles, fileSort]);
  
  const displayedMotionFiles = useMemo(() => {
    if (!isFiltering || dateFilter.trim() === "") return sortedMotionFiles;
    
    return sortedMotionFiles.filter(file => {
      // Convert file date to MM/DD/YYYY format for comparison
      const fileDate = new Date(file.createdAt);
      if (isNaN(fileDate)) return false;
      
      const month = String(fileDate.getMonth() + 1).padStart(2, '0');
      const day = String(fileDate.getDate()).padStart(2, '0');
      const year = fileDate.getFullYear();
      const formattedFileDate = `${month}/${day}/${year}`;
      
      // Compare with user's filter input
      return formattedFileDate === dateFilter;
    });
  }, [sortedMotionFiles, dateFilter, isFiltering]);

  // Handle date filtering
  const handleFilterByDate = () => {
    if (dateFilter.trim() === "") {
      setIsFiltering(false);
      return;
    }
    setIsFiltering(true);
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilterByDate();
    }
  };

  // Format validation for MM/DD/YYYY
  const handleDateInputChange = (e) => {
    let value = e.target.value;
    
    // Allow backspace and deletion
    if (value.length < dateFilter.length) {
      setDateFilter(value);
      return;
    }
    
    // Format as user types (MM/DD/YYYY)
    if (value.length === 2 || value.length === 5) {
      if (!value.endsWith('/')) {
        value = value + '/';
      }
    }
    
    // Only allow numbers and forward slashes
    if (/^[0-9/]*$/.test(value) && value.length <= 10) {
      setDateFilter(value);
    }
  };

  return (
    <div>
      <div className="space-y-3 mb-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 font-medium">
            {selectedPatient.motionFiles ? selectedPatient.motionFiles.length : 0} Files
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select 
              value={fileSort}
              onChange={(e) => setFileSort(e.target.value)}
              className="text-sm border rounded p-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={dateFilter}
              onChange={handleDateInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Filter by date (MM/DD/YYYY)"
              className="w-full pl-8 pr-2 py-1 text-sm border rounded"
            />
          </div>
          <button
            onClick={handleFilterByDate}
            className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Filter
          </button>
          {dateFilter && (
            <button
              onClick={() => {
                setDateFilter("");
                setIsFiltering(false);
              }}
              className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-64 border rounded-md divide-y">
        {displayedMotionFiles.length > 0 ? (
          displayedMotionFiles.map((file, index) => (
            <div key={index} className="p-3 hover:bg-gray-50 flex items-center">
              <div className="flex-1 pr-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{formatDate(file.createdAt)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {file.name}
                </div>
              </div>
              <div className="flex-shrink-0 w-16 text-right">
                <button 
                  onClick={() => handleViewFile(file)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1 rounded-md"
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>{isFiltering ? "No files match your filter" : "No motion files available"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotionFilesTab;