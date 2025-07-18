import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: User;
}

interface FriendsContextType {
  friends: User[];
  friendRequests: FriendRequest[];
  friendRequestCount: number;
  isLoading: boolean;
  loadFriends: () => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  sendFriendRequest: (email: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<{ user: User; status: string }[]>;
  findUser: (query: string) => Promise<{ user: User; status: string } | null>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({ children }) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('FriendsContext: User authenticated, loading friends data');
      loadFriends().catch(error => {
        console.error('Error loading friends on init:', error);
      });
      loadFriendRequests().catch(error => {
        console.error('Error loading friend requests on init:', error);
      });
    }
  }, [isAuthenticated]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading friends...');
      const friendsData = await apiService.getFriends();
      console.log('📊 Raw friends data from API:', friendsData);
      console.log('📊 Friends data type:', typeof friendsData);
      console.log('📊 Friends data is array:', Array.isArray(friendsData));
      
      if (Array.isArray(friendsData)) {
        console.log('📊 Friends count:', friendsData.length);
        friendsData.forEach((friend, index) => {
          console.log(`👤 Friend ${index + 1}:`, {
            id: friend.id,
            full_name: friend.full_name,
            user_name: friend.user_name,
            email: friend.email,
            status: friend.status,
            avatar_url: friend.avatar_url
          });
        });
      }
      
      setFriends(friendsData);
      console.log('✅ Friends loaded successfully, count:', friendsData.length);
    } catch (error) {
      console.error('❌ Failed to load friends:', error);
      console.error('❌ Error details:', error.message);
      setFriends([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requestsData = await apiService.getFriendRequests();
      setFriendRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const sendFriendRequest = async (email: string) => {
    try {
      await apiService.sendFriendRequest(email);
      // Refresh data after sending request
      await loadFriendRequests();
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await apiService.acceptFriendRequest(requestId);
      // Remove from friend requests and refresh friends list
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      await loadFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await apiService.rejectFriendRequest(requestId);
      // Remove from friend requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await apiService.removeFriend(friendId);
      // Remove from friends list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
      throw error;
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const users: User[] = await apiService.searchUsers(query);
      // Map users to the expected structure with a default status (e.g., "unknown")
      return users.map(user => ({ user, status: "unknown" }));
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  };

  const findUser = async (query: string) => {
    try {
      return await apiService.findUser(query);
    } catch (error) {
      console.error('Failed to find user:', error);
      throw error;
    }
  };

  const value = {
    friends,
    friendRequests,
    friendRequestCount: friendRequests.length,
    isLoading,
    loadFriends,
    loadFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    findUser,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};