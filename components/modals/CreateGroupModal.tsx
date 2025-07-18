
import React, { useState } from 'react';
import { User } from '../../types';
import { CloseIcon, SearchIcon, UserAvatarWithInitials } from '../icons/Icons';

interface CreateGroupModalProps {
  onClose: () => void;
  users: User[];
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, users }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  const toggleMember = (user: User) => {
    if (selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const filteredUsers = users.filter(u => 
    !u.isBot && u.id !== 'user-0' && u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create new group</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Group name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-pink-50 border border-pink-200 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
          <div className="relative">
            <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for members"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-pink-50 border border-pink-200 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="h-48 overflow-y-auto border border-pink-200 rounded-lg p-2 bg-pink-50 space-y-2">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => toggleMember(user)}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                selectedMembers.find(m => m.id === user.id) ? 'bg-pink-200' : 'hover:bg-pink-100'
              }`}
            >
              <UserAvatarWithInitials 
                fullName={user.name || user.full_name || 'User'}
                avatarUrl={user.avatar || user.avatar_url}
                size={32}
                className="rounded-full mr-3"
              />
              <span>{user.name || user.full_name || 'User'}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button className="px-4 py-2 rounded-lg text-white bg-pink-500 hover:bg-pink-600">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;