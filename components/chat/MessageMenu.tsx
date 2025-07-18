import React, { useState, useRef, useEffect } from 'react';

interface MessageMenuProps {
  messageId: string;
  isCurrentUser: boolean;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onClose: () => void;
}

const MessageMenu: React.FC<MessageMenuProps> = ({ 
  messageId, 
  isCurrentUser, 
  onEdit, 
  onDelete, 
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setConfirmDelete(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleEdit = () => {
    onEdit(messageId);
    setIsOpen(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(messageId);
      setIsOpen(false);
      setConfirmDelete(false);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
        title="Message options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Edit Option (only for current user) */}
            {isCurrentUser && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit message
              </button>
            )}

            {/* Delete Option */}
            {!confirmDelete ? (
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete message
              </button>
            ) : (
              <div className="px-4 py-2">
                <p className="text-sm text-gray-700 mb-2">Are you sure?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Copy Option */}
            <button
              onClick={async () => {
                try {
                  // Get message content from the DOM or pass it as a prop
                  const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
                  const messageText = messageElement?.textContent || '';
                  
                  if (messageText) {
                    await navigator.clipboard.writeText(messageText);
                  }
                } catch (error) {
                  console.error('Failed to copy message:', error);
                  // Fallback: try to copy to clipboard using older method
                  const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
                  const messageText = messageElement?.textContent || '';
                  const textArea = document.createElement('textarea');
                  textArea.value = messageText || '';
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                }
                setIsOpen(false);
                onClose();
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageMenu;