import React, { useState, useEffect } from 'react';
import { ErrorNotification } from '../../services/errorHandler';
import { FileXmarkIcon, AlertIcon, InfoCircleIcon, CloseIcon } from '../icons/Icons';

interface NotificationProps {
  notification: ErrorNotification;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const { type, title, message, duration = 5000, actions } = notification;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for exit animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FileXmarkIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <InfoCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-500';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500';
      case 'info':
        return 'bg-blue-100 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  return (
    <div
      className={`relative w-full max-w-sm p-4 mb-4 overflow-hidden border-l-4 rounded-md shadow-lg transition-all duration-300 transform ${getBackgroundColor()} ${
        isExiting ? 'opacity-0 scale-95 -translate-x-full' : 'opacity-100 scale-100 translate-x-0'
      }`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3">
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <p className="mt-1 text-sm text-gray-700">{message}</p>
          {actions && actions.length > 0 && (
            <div className="mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    handleClose();
                  }}
                  className="px-2 py-1 mr-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pl-3 ml-auto">
          <button
            onClick={handleClose}
            className="-mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <span className="sr-only">Dismiss</span>
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification; 