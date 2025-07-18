import React, { useState, useEffect } from 'react';
import MessageSearch from '../chat/MessageSearch';
import { useChat } from '../../contexts/ChatContext';

interface GlobalSearchModalProps {
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const { setActiveChat, chats } = useChat();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSelectMessage = (message: any) => {
    // Find the chat that contains this message
    const chat = chats.find(c => c.id === message.roomId);
    if (chat) {
      setActiveChat(chat);
      // Close the modal
      handleClose();
      // Small delay to ensure chat view is loaded, then scroll to message
      setTimeout(() => {
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the message briefly
          messageElement.classList.add('bg-yellow-100');
          setTimeout(() => {
            messageElement.classList.remove('bg-yellow-100');
          }, 2000);
        }
      }, 100);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-150 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 max-h-[600px] mx-4 transition-all duration-150 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Search All Messages
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-hidden">
            <MessageSearch
              onSelectMessage={handleSelectMessage}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;