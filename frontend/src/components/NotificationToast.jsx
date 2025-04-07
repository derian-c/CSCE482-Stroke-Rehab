import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const NotificationToast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Allow time for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  // Define different styles based on notification type
  const getStyles = () => {
    const baseStyles = {
      container: "fixed top-4 right-4 z-50 shadow-lg rounded-md px-4 py-3 max-w-md transition-all duration-300 flex items-center",
      icon: "w-5 h-5 mr-3",
    };

    switch (type) {
      case 'success':
        return {
          container: `${baseStyles.container} bg-green-50 border-l-4 border-green-500 text-green-700`,
          icon: `${baseStyles.icon} text-green-500`
        };
      case 'error':
        return {
          container: `${baseStyles.container} bg-red-50 border-l-4 border-red-500 text-red-700`,
          icon: `${baseStyles.icon} text-red-500`
        };
      case 'warning':
        return {
          container: `${baseStyles.container} bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700`,
          icon: `${baseStyles.icon} text-yellow-500`
        };
      case 'info':
      default:
        return {
          container: `${baseStyles.container} bg-blue-50 border-l-4 border-blue-500 text-blue-700`,
          icon: `${baseStyles.icon} text-blue-500`
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`${styles.container} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      role="alert"
    >
      {type === 'success' ? (
        <CheckCircle className={styles.icon} />
      ) : (
        <AlertCircle className={styles.icon} />
      )}
      <div className="flex-1 pr-4">{message}</div>
      <button 
        onClick={handleClose} 
        className="p-1 hover:bg-opacity-20 hover:bg-gray-500 rounded-full transition-colors ml-auto"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;