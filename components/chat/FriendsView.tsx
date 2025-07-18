import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useFriends } from '../../contexts/FriendsContext';
import { ChatIcon, UserIcon, UserAvatarWithInitials } from '../icons/Icons';

type FriendshipStatus = 'friends' | 'request_sent' | 'not_friends';

interface FriendsViewProps {
  searchQuery: string;
  currentUser: User;
  onStartChat: (friend: User) => void;
  onViewProfile: (friend: User) => void;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
    searchQuery, currentUser, onStartChat, onViewProfile 
}) => {
  const [activeTab, setActiveTab] = useState('online');
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [addFriendSearchResult, setAddFriendSearchResult] = useState<{ user: User; status: string } | 'not_found' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { friends, findUser, sendFriendRequest } = useFriends();

  const filteredBySearch = friends.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const onlineUsers = filteredBySearch.filter(u => u.status);
  const allUsers = filteredBySearch;

  const usersToDisplay = activeTab === 'online' ? onlineUsers : allUsers;

  const handleSearchFriend = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setAddFriendSearchResult(null);
      return;
    }

    try {
      setIsSearching(true);
      const result = await findUser(searchTerm.trim());
      if (result) {
        setAddFriendSearchResult(result);
      } else {
        setAddFriendSearchResult('not_found');
      }
    } catch (error) {
      console.error('Failed to search for friend:', error);
      setAddFriendSearchResult('not_found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (email: string) => {
    try {
      await sendFriendRequest(email);
      // Update the search result to show request sent
      if (addFriendSearchResult && addFriendSearchResult !== 'not_found') {
        setAddFriendSearchResult({
          ...addFriendSearchResult,
          status: 'request_sent'
        });
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="flex border-b border-pink-200 mb-4">
        <TabButton isActive={activeTab === 'online'} onClick={() => setActiveTab('online')}>
          Online
        </TabButton>
        <TabButton isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All
        </TabButton>
         <TabButton isActive={activeTab === 'add'} onClick={() => setActiveTab('add')}>
          Add Friend
        </TabButton>
      </div>

      {activeTab === 'add' ? (
        <AddFriendView 
            query={addFriendQuery}
            setQuery={setAddFriendQuery}
            searchResult={addFriendSearchResult}
            onSearch={handleSearchFriend}
            onAddFriend={handleAddFriend}
            currentUser={currentUser}
            isSearching={isSearching}
            setAddFriendSearchResult={setAddFriendSearchResult}
        />
      ) : (
        <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">{activeTab} — {usersToDisplay.length}</h3>
            <div className="space-y-2">
                {usersToDisplay.map(user => (
                  <UserRow 
                    key={user.id} 
                    user={user} 
                    onStartChat={onStartChat}
                    onViewProfile={onViewProfile}
                  />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
interface AddFriendViewProps {
    query: string;
    setQuery: (query: string) => void;
    searchResult: { user: User; status: string } | 'not_found' | null;
    onSearch: (searchTerm: string) => void;
    onAddFriend: (email: string) => void;
    currentUser: User;
    isSearching: boolean;
    setAddFriendSearchResult: (value: { user: User; status: string } | 'not_found' | null) => void;
}
const AddFriendView: React.FC<AddFriendViewProps> = ({ query, setQuery, searchResult, onSearch, onAddFriend, currentUser, isSearching, setAddFriendSearchResult }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold uppercase text-gray-700 mb-2">Add Friend</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the exact username or email address to find a user.</p>
            <form onSubmit={handleSubmit} className="flex items-center bg-pink-100 p-2 rounded-lg gap-2">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => {
                        setQuery(e.target.value);
                        // Clear search result when user modifies the query
                        if (searchResult) {
                            setAddFriendSearchResult(null);
                        }
                    }} 
                    placeholder="username or email@example.com"
                    className="flex-grow bg-transparent focus:outline-none placeholder-gray-500 p-2"
                    disabled={isSearching}
                />
                <button 
                    type="submit" 
                    className="bg-pink-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:bg-gray-400 flex items-center gap-2" 
                    disabled={!query.trim() || isSearching}
                >
                    {isSearching ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Searching...
                        </>
                    ) : (
                        'Search User'
                    )}
                </button>
            </form>
            <div className="mt-6">
                {searchResult === 'not_found' && (
                     <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-bold">User Not Found</p>
                        <p>No user found with that username or email address. Please check the spelling and try again.</p>
                    </div>
                )}
                {searchResult && searchResult !== 'not_found' && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">User Found:</p>
                        <div className="p-4 border border-pink-200 rounded-lg bg-pink-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <UserAvatarWithInitials 
                                        fullName={searchResult.user.full_name || searchResult.user.user_name || 'User'}
                                        avatarUrl={searchResult.user.avatar_url}
                                        size={48}
                                        className="rounded-full"
                                    />
                                    <div className="ml-4">
                                        <p className="font-bold text-lg">{searchResult.user.full_name || searchResult.user.user_name}</p>
                                        <p className="text-sm text-gray-500">@{searchResult.user.user_name || 'unknown'}</p>
                                        <p className="text-sm text-gray-500">{searchResult.user.email}</p>
                                    </div>
                                </div>
                                <AddFriendButton 
                                    targetUser={searchResult.user} 
                                    currentUser={currentUser} 
                                    status={searchResult.status as FriendshipStatus}
                                    onAddFriend={(email) => onAddFriend(email)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const AddFriendButton: React.FC<{targetUser: User, currentUser: User, status: FriendshipStatus | string, onAddFriend: (email: string) => void}> = ({ targetUser, currentUser, status, onAddFriend }) => {
    if (targetUser.id === currentUser.id) return null;
    
    const baseClasses = "px-4 py-2 rounded-md font-semibold transition-colors";
    
    switch (status) {
        case 'friends':
            return <button disabled className={`${baseClasses} bg-gray-300 text-gray-600 cursor-not-allowed`}>Already Friends</button>;
        case 'request_sent':
            return <button disabled className={`${baseClasses} bg-gray-300 text-gray-600 cursor-not-allowed`}>Request Sent</button>;
        case 'request_received':
            return <button disabled className={`${baseClasses} bg-blue-300 text-blue-700 cursor-not-allowed`}>Sent You a Request</button>;
        case 'not_friends':
        default:
            return <button onClick={() => onAddFriend(targetUser.email)} className={`${baseClasses} bg-pink-500 text-white hover:bg-pink-600`}>Send Friend Request</button>;
    }
};


const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-lg ${isActive ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
  >
    {children}
  </button>
);

const UserRow: React.FC<{ user: User; onStartChat: (friend: User) => void; onViewProfile: (friend: User) => void }> = ({ user, onStartChat, onViewProfile }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-100">
      <div className="flex items-center">
        <div className="relative">
          <UserAvatarWithInitials 
            fullName={user.full_name || user.user_name || 'User'}
            avatarUrl={user.avatar_url}
            size={40}
            className="rounded-full"
          />
          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white ${user.status ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        </div>
        <div className="ml-4">
          <p className="font-bold">{user.full_name || user.user_name}</p>
          <p className="text-sm text-gray-600">@{user.user_name || 'unknown'}</p>
        </div>
      </div>
      <div className="flex space-x-2">
          <button onClick={() => onStartChat(user)} className="p-2 rounded-full bg-pink-200 text-gray-700 hover:bg-pink-300 transition-colors" title="Start Chat">
              <ChatIcon className="h-5 w-5" />
          </button>
           <button onClick={() => onViewProfile(user)} className="p-2 rounded-full bg-pink-200 text-gray-700 hover:bg-pink-300 transition-colors" title="View Profile">
              <UserIcon className="h-5 w-5" />
          </button>
      </div>
    </div>
  );
};


export default FriendsView;