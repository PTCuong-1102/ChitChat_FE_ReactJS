import React, { useState, useEffect, useRef } from 'react';

interface MessageEditorProps {
  messageId: string;
  initialContent: string;
  onSave: (messageId: string, newContent: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ 
  messageId, 
  initialContent, 
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus and select text when editor opens
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSave = () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError('Message cannot be empty');
      return;
    }
    
    if (trimmedContent === initialContent) {
      onCancel();
      return;
    }
    
    setError(null);
    onSave(messageId, trimmedContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full p-2 border rounded-lg resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-pink-400 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Edit your message..."
          disabled={isLoading}
          maxLength={1000}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/1000
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to cancel
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading || !content.trim() || content.trim() === initialContent}
            className="px-3 py-1 text-xs text-white bg-pink-500 rounded hover:bg-pink-600 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white mr-1"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;