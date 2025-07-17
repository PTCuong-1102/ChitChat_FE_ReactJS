import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorNotification, errorHandler } from '../../services/errorHandler';
import Notification from './Notification';

interface NotificationContextType {
  addNotification: (notification: Omit<ErrorNotification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Set the notification callback for the error handler
  useState(() => {
    errorHandler.setErrorNotificationCallback(addNotification);
  });

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id!)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 