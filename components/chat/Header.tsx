
import React from 'react';
import { Chat } from '../../types';
import { UsersIcon, BellIcon, SearchIcon, GlobalSearchIcon, AtSymbolIcon } from '../icons/Icons';
import { useFriends } from '../../contexts/FriendsContext';

interface HeaderProps {
  activeChat: Chat | null;
  view: 'friends' | 'chat';
  onShowFriendRequests: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleManagementPanel: () => void;
  onShowGlobalSearch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeChat, view, onShowFriendRequests, searchQuery, onSearchChange, onToggleManagementPanel, onShowGlobalSearch }) => {
  const { friendRequestCount } = useFriends();
  
  let title = 'Friends';
  if (view === 'chat' && activeChat) {
    title = activeChat.name;
  }
  
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 bg-white shadow-sm px-6 border-b border-pink-200">
      <div className="flex items-center">
        {activeChat?.type === 'dm' && !activeChat.isBotChat && <AtSymbolIcon className="text-gray-500 mr-2" />}
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {activeChat && (
          <button onClick={onToggleManagementPanel} className="text-gray-500 hover:text-pink-500">
              <UsersIcon />
          </button>
        )}
        {onShowGlobalSearch && (
          <button 
            onClick={onShowGlobalSearch} 
            className="text-gray-500 hover:text-pink-500 transition-colors"
            title="Search all messages"
          >
            <GlobalSearchIcon className="w-5 h-5" />
          </button>
        )}
        <button onClick={onShowFriendRequests} className="relative text-gray-500 hover:text-pink-500">
          <BellIcon />
          {friendRequestCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {friendRequestCount > 9 ? '9+' : friendRequestCount}
            </span>
          )}
        </button>
        {view === 'friends' && (
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="bg-pink-100 rounded-md py-1.5 pl-8 pr-2 w-48 focus:outline-none focus:ring-2 focus:ring-pink-400" 
                />
                <SearchIcon className="h-5 w-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
