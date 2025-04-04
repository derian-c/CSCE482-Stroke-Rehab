import React, { useState, useMemo } from "react";
import { Calendar, FileText } from "lucide-react";

const MotionFilesTab = ({ selectedPatient, formatDate, handleViewFile }) => {
  const [fileSort, setFileSort] = useState("newest");
  const [dateFilter, setDateFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const sortedMotionFiles = useMemo(() => {
    if (!selectedPatient?.motionFiles) return [];
    
    const files = [...selectedPatient.motionFiles];
    
    switch(fileSort) {
      case 'newest':
        return files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      case 'oldest':
        return files.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      default:
        return files;
    }
  }, [selectedPatient?.motionFiles, fileSort]);
  
  const displayedMotionFiles = useMemo(() => {
    if (!isFiltering || dateFilter.trim() === "") return sortedMotionFiles;
    
    return sortedMotionFiles.filter(file => {
      // extract just the date part from the file's timestamp (YYYY-MM-DD)
      const fileDate = file.uploadDate.split('T')[0];
      // compare with the user's filter input
      return fileDate === dateFilter;
    });
  }, [sortedMotionFiles, dateFilter, isFiltering]);

  // handle date filtering
  const handleFilterByDate = () => {
    if (dateFilter.trim() === "") {
      setIsFiltering(false);
      return;
    }
    setIsFiltering(true);
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
          <input
            type="text"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Search by date (YYYY-MM-DD)"
            className="flex-1 text-sm border rounded p-1"
          />
          <button
            onClick={() => handleFilterByDate()}
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
        {displayedMotionFiles.map((file, index) => (
          <div key={index} className="p-3 hover:bg-gray-50 flex items-center">
            <div className="flex-1 pr-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{formatDate(file.uploadDate)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {file.filename}
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
        ))}
        
        {(!displayedMotionFiles.length) && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No motion files available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotionFilesTab;