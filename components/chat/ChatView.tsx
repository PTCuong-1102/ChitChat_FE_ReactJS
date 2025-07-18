import React, { useRef, useEffect, useState } from 'react';
import { Chat, Message, User } from '../../types';
import { PaperAirplaneIcon, PlusCircleIcon, SearchIcon, UserAvatarWithInitials } from '../icons/Icons';
import FileUpload from './FileUpload';
import FileAttachment from './FileAttachment';
import MessageMenu from './MessageMenu';
import MessageEditor from './MessageEditor';
import MessageSearch from './MessageSearch';
import { apiService } from '../../services/apiService';

interface ChatViewProps {
  chat: Chat;
  onSendMessage: (text: string, type: Message['type']) => void;
  currentUser: User;
  users: User[];
}

const ChatView: React.FC<ChatViewProps> = ({ chat, onSendMessage, currentUser, users }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<{[messageId: string]: any[]}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chat.messages]);

  // Load attachments for messages
  useEffect(() => {
    const loadAttachments = async () => {
      const messageIds = (chat.messages || []).map(msg => msg.id);
      const attachmentPromises = messageIds.map(async (messageId) => {
        try {
          const messageAttachments = await apiService.getMessageAttachments(messageId);
          return { messageId, attachments: messageAttachments };
        } catch (error) {
          console.error(`Failed to load attachments for message ${messageId}:`, error);
          return { messageId, attachments: [] };
        }
      });

      const results = await Promise.all(attachmentPromises);
      const attachmentMap: {[messageId: string]: any[]} = {};
      results.forEach(({ messageId, attachments: msgAttachments }) => {
        attachmentMap[messageId] = msgAttachments;
      });
      setAttachments(attachmentMap);
    };

    if (chat.messages && chat.messages.length > 0) {
      loadAttachments();
    }
  }, [chat.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleFileUploaded = (attachment: any) => {
    // Add attachment to the message
    const messageId = attachment.messageId;
    setAttachments(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), attachment]
    }));
  };

  const handleMessageSent = (messageId: string) => {
    // Send a file message to create the context
    onSendMessage(`📎 File uploaded`, 'text');
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await apiService.deleteAttachment(attachmentId);
      // Remove attachment from state
      setAttachments(prev => {
        const newAttachments = { ...prev };
        Object.keys(newAttachments).forEach(messageId => {
          newAttachments[messageId] = newAttachments[messageId].filter(
            att => att.id !== attachmentId
          );
        });
        return newAttachments;
      });
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const handleEditMessage = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    setIsEditing(true);
    try {
      await apiService.editMessage(messageId, newContent);
      // Update message in local state (if needed)
      // For now, we'll rely on the message refresh
      setEditingMessageId(null);
    } catch (error) {
      console.error('Failed to edit message:', error);
      // Handle error - could show toast notification
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleSearchResultSelect = (message: any) => {
    // Find the message in the current chat and scroll to it
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
    setShowSearch(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiService.deleteMessage(messageId);
      // Message will be removed from the chat via soft delete
      // The UI will update when messages are reloaded
    } catch (error) {
      console.error('Failed to delete message:', error);
      // Handle error - could show toast notification
    }
  };
  
  const getUserById = (id: string) => {
    // First check chat participants
    const participant = chat.participants?.find(p => p.id === id);
    if (participant) return participant;
    
    // Then check users array (fallback)
    return users.find(u => u.id === id);
  };
  
  const getUserAvatar = (user: User) => {
    return user.avatar || user.avatar_url;
  };
  
  const getUserName = (user: User) => {
    return user.name || user.full_name || user.username || user.user_name || 'User';
  };
  
  const renderMessageContent = (message: Message) => {
    switch(message.type) {
        case 'image':
            return <img src={message.text} alt="Shared content" className="max-w-xs rounded-lg cursor-pointer" onClick={() => window.open(message.text, '_blank')} />;
        case 'link':
            return <a href={message.text} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700 break-all">{message.text}</a>;
        case 'text':
        default:
            return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-pink-200 bg-white/70">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-800">{chat.name}</h2>
          <span className="text-sm text-gray-500">
            {chat.participants?.length || 0} participant{(chat.participants?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
          title="Search messages"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="h-80 border-b border-pink-200">
          <MessageSearch
            roomId={chat.id}
            onSelectMessage={handleSearchResultSelect}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {(chat.messages || []).map((msg, index) => {
          const sender = getUserById(msg.senderId);
          const isCurrentUser = msg.senderId === currentUser.id;
          const showAvatar = index === 0 || (chat.messages && chat.messages[index - 1] && chat.messages[index - 1].senderId !== msg.senderId);
          
          return (
            <div key={msg.id} data-message-id={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} group`}>
               <div className="w-10 h-10">
                 {showAvatar && sender && (
                   <UserAvatarWithInitials 
                fullName={getUserName(sender)}
                avatarUrl={getUserAvatar(sender)}
                size={40}
                className="rounded-full"
              />
                 )}
               </div>
               <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} flex-1`}>
                  {showAvatar && sender && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold">{getUserName(sender)}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                  )}
                  
                  {/* Message Content or Editor */}
                  {editingMessageId === msg.id ? (
                    <div className="max-w-md w-full">
                      <MessageEditor
                        messageId={msg.id}
                        initialContent={msg.text}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                        isLoading={isEditing}
                      />
                    </div>
                  ) : (
                    <div className={`relative px-4 py-2 rounded-2xl max-w-md ${isCurrentUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-pink-100 text-gray-800 rounded-bl-none'}`}>
                      <div className="message-content">
                        {renderMessageContent(msg)}
                        {(msg as any).editedAt && (
                          <span className="text-xs opacity-60 ml-2">(edited)</span>
                        )}
                      </div>
                      
                      {/* Message Menu */}
                      <div className="absolute -top-2 -right-8">
                        <MessageMenu
                          messageId={msg.id}
                          isCurrentUser={isCurrentUser}
                          onEdit={handleEditMessage}
                          onDelete={handleDeleteMessage}
                          onClose={() => {}}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Attachments */}
                  {attachments[msg.id] && attachments[msg.id].length > 0 && (
                    <div className="mt-2 space-y-2 max-w-md">
                      {attachments[msg.id].map((attachment) => (
                        <FileAttachment
                          key={attachment.id}
                          attachment={attachment}
                          showDelete={isCurrentUser}
                          onDelete={handleDeleteAttachment}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-6 py-4 bg-white/70 border-t border-pink-200">
        <form onSubmit={handleSend} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onUploadStart={() => setIsUploading(true)}
              onUploadEnd={() => setIsUploading(false)}
              onMessageSent={handleMessageSent}
              disabled={isUploading}
            />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${chat.name}`}
            className="w-full bg-pink-100 rounded-lg py-3 pl-12 pr-12 border-transparent focus:outline-none focus:ring-2 focus:ring-pink-400"
            disabled={isUploading}
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 disabled:text-gray-400" 
            disabled={!message.trim() || isUploading}
          >
            <PaperAirplaneIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;