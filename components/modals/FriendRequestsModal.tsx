
import React, { useState, useEffect } from 'react';
import { CheckIcon, CloseIcon, UserAvatarWithInitials } from '../icons/Icons';
import { useFriends } from '../../contexts/FriendsContext';

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    full_name: string;
    user_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface FriendRequestsModalProps {
  onClose: () => void;
}

const FriendRequestItem: React.FC<{ 
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}> = ({ request, onAccept, onReject, isLoading }) => {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center">
        <UserAvatarWithInitials 
          fullName={request.sender.full_name || request.sender.user_name}
          avatarUrl={request.sender.avatar_url || undefined}
          size={40}
          className="rounded-full"
        />
        <div className="ml-3">
          <p className="font-semibold">{request.sender.full_name || request.sender.user_name}</p>
          <p className="text-sm text-gray-500">@{request.sender.user_name}</p>
          <p className="text-sm text-gray-500">wants to be your friend</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onAccept(request.id)}
          disabled={isLoading}
          className="p-2 rounded-full text-green-500 bg-green-100 hover:bg-green-200 disabled:opacity-50"
        >
          <CheckIcon />
        </button>
        <button 
          onClick={() => onReject(request.id)}
          disabled={isLoading}
          className="p-2 rounded-full text-red-500 bg-red-100 hover:bg-red-200 disabled:opacity-50"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({ onClose }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const { friendRequests, isLoading, acceptFriendRequest, rejectFriendRequest } = useFriends();

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(true);
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(true);
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-pink-200">
        <div className="p-4 border-b border-pink-200">
          <h2 className="text-xl font-bold text-pink-500">Friend Requests</h2>
          {friendRequests.length > 0 && (
            <p className="text-sm text-gray-500">{friendRequests.length} pending request(s)</p>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">No pending friend requests</p>
            </div>
          ) : (
            <div className="p-2 divide-y divide-pink-100">
              {friendRequests.map((request) => (
                <FriendRequestItem 
                  key={request.id} 
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-2">
          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-pink-500">Close</button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsModal;
