
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { FriendsProvider } from './contexts/FriendsContext';
import AuthPage from './components/auth/AuthPage';
import ChatInterface from './components/chat/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 font-sans">
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <ChatInterface />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ErrorBoundary>
          <FriendsProvider>
            <ErrorBoundary>
              <ChatProvider>
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </ChatProvider>
            </ErrorBoundary>
          </FriendsProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
