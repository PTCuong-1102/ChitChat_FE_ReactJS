import React, { useState, useCallback, useEffect } from 'react';
import ServerList from './ServerList';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatView from './ChatView';
import FriendsView from './FriendsView';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { AI_BOTS } from '../../constants';
import { Chat, User, Message } from '../../types';
import { apiService } from '../../services/apiService';
import CreateGroupModal from '../modals/CreateGroupModal';
import { UserProfileModal } from '../modals/UserProfileModal';
import FriendRequestsModal from '../modals/FriendRequestsModal';
import ConfigureAIBotModal from '../modals/ConfigureAIBotModal';
import GlobalSearchModal from '../modals/GlobalSearchModal';
import ChatManagementPanel from './ChatManagementPanel';
import { GeminiAvatar, OpenAIAvatar, MistralAvatar, DefaultBotAvatar, getBotAvatar } from '../icons/Icons';

type View = 'friends' | 'chat';
type Modal = 'createGroup' | 'userProfile' | 'friendRequests' | 'configureAIBot' | 'globalSearch' | 'friendProfile' | null;
type FriendshipStatus = 'friends' | 'request_sent' | 'not_friends';

const ChatInterface: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const { chats, activeChat, setActiveChat, sendMessage, createRoom, loadChats, setChats } = useChat();
  const [activeServerId, setActiveServerId] = useState<string>('home');
  const [view, setView] = useState<View>('friends');
  const [modal, setModal] = useState<Modal>(null);
  const [bots, setBots] = useState<User[]>(AI_BOTS);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isManagementPanelOpen, setManagementPanelOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  

  useEffect(() => {
    if (currentUser) {
      console.log('👤 Current user available:', currentUser.id);
      loadChats();
      // Add a small delay to ensure authentication is fully established
      setTimeout(() => {
        loadUserBots();
      }, 100);
    }
  }, [currentUser, loadChats]);

  const loadUserBots = async () => {
    try {
      console.log('🤖 Loading user bots from backend...');
      const response = await apiService.getUserBots();
      console.log('📋 Raw API response:', response);
      
      // The apiService already extracts data.bots, so response should be an array
      const userBots = response;
      console.log('📋 Extracted bots:', userBots);
      
      if (!Array.isArray(userBots)) {
        console.warn('⚠️ User bots is not an array:', userBots);
        return;
      }
      
      // Convert backend bots to frontend format
      const convertedBots = userBots.map(bot => {
        console.log('🔄 Converting bot:', bot);
        return {
          id: bot.id,
          name: bot.name || '',
          username: `${bot.name?.toLowerCase().replace(/\s+/g, '-') || 'bot'}-bot`,
          avatar: '',
          email: '',
          status: 'online',
          isBot: true,
          model: bot.integrations?.[0]?.model || 'default',
          provider: bot.integrations?.[0]?.integrationType || 'unknown',
          full_name: bot.name,
          user_name: `${bot.name?.toLowerCase().replace(/\s+/g, '-') || 'bot'}-bot`,
          avatar_url: ''
        };
      });
      
      console.log('🔄 Converted bots:', convertedBots);
      
      // Merge with default bots, keeping default bots and adding user bots
      setBots(prevBots => {
        console.log('📋 Previous bots:', prevBots);
        // Keep default bots (those with hardcoded IDs like 'user-gemini')
        const defaultBots = prevBots.filter(bot => !bot.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
        // Remove any user bots that might already be in the list to avoid duplicates
        const existingUserBots = prevBots.filter(bot => bot.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
        
        // Merge: default bots + loaded user bots (avoiding duplicates)
        const userBotIds = convertedBots.map(bot => bot.id);
        const filteredExistingUserBots = existingUserBots.filter(bot => !userBotIds.includes(bot.id));
        
        const newBots = [...defaultBots, ...filteredExistingUserBots, ...convertedBots];
        console.log('📋 New bots list:', newBots);
        return newBots;
      });
      
      console.log('✅ User bots loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load user bots:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
      setView('chat');
      setManagementPanelOpen(false);
    }
  };

  const handleSelectServer = async (serverId: string) => {
    setActiveServerId(serverId);
    setManagementPanelOpen(false);
    if (serverId === 'home') {
      // Don't change view when going to home if we already have an active chat
      if (!activeChat) {
        setView('friends');
      }
      setSearchQuery('');
    } else {
      // Find the bot based on serverId
      const bot = bots.find(b => b.id === serverId);
      if (bot) {
        // Check if a bot chat already exists
        let botChat = chats.find(c => c.isBotChat && c.name === bot.name);
        
        if (!botChat) {
          // Create a new bot chat room
          try {
            const newBotChat: Chat = {
              id: `bot-chat-${bot.id}`,
              type: 'dm',
              name: bot.name || '',
              participants: [currentUser!, bot],
              messages: [{
                id: `msg-${Date.now()}`,
                senderId: bot.id,
                text: `Hello! I'm ${bot.name}. How can I help you today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text'
              }],
              isBotChat: true,
              lastMessagePreview: `Hello! I'm ${bot.name}. How can I help you today?`
            };
            
            // Add the bot chat to the chats list and set as active
            setChats(prevChats => {
              console.log('🤖 Adding new bot chat:', newBotChat.id);
              return [...prevChats, newBotChat];
            });
            setActiveChat(newBotChat);
            setView('chat');
            
            // Note: We don't call createRoom for bot chats since they're virtual
            // The backend will handle bot responses when messages are sent
          } catch (error) {
            console.error('Failed to create bot chat:', error);
          }
        } else {
          setActiveChat(botChat);
          setView('chat');
        }
      }
    }
  };
  
  const handleShowFriends = () => {
      setActiveServerId('home');
      setActiveChat(null);
      setView('friends');
      setSearchQuery('');
      setManagementPanelOpen(false);
  }

  const handleSendMessage = useCallback((text: string, type: Message['type'] = 'text') => {
    if (!activeChat) return;
    sendMessage(activeChat.id, text, type);
  }, [activeChat, sendMessage]);

  const handleConfigureBot = async (botName: string, model: string, provider: string, apiKey: string) => {
    try {
      // Configure the bot in the backend
      const response = await apiService.configureBot(botName, model, provider, apiKey);
      
      // Create or update the AI bot in the frontend
      const aiBot: User = {
        id: response.botId, // Use the actual bot ID from the backend
        name: botName,
        username: `${botName.toLowerCase().replace(/\s+/g, '-')}-bot`,
        avatar: '',
        email: '',
        status: 'online',
        isBot: true,
        model,
        provider,
        full_name: botName,
        user_name: `${botName.toLowerCase().replace(/\s+/g, '-')}-bot`,
        avatar_url: ''
      };
      
      // Update the bots list
      setBots(prevBots => {
        // Check if this specific bot ID already exists (for updates)
        const existingBotIndex = prevBots.findIndex(bot => bot.id === response.botId);
        if (existingBotIndex !== -1) {
          // Update existing bot
          const updatedBots = [...prevBots];
          updatedBots[existingBotIndex] = aiBot;
          console.log('🔄 Updated existing bot:', aiBot);
          return updatedBots;
        } else {
          // Add new bot
          console.log('➕ Adding new bot:', aiBot);
          return [...prevBots, aiBot];
        }
      });
      
      // Store the API key for later use
      setApiKeys(prev => ({ ...prev, [provider]: apiKey }));
      
    } catch (error) {
      console.error('Failed to configure bot:', error);
      // You can add toast/notification here
    }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    // This functionality should be handled by the backend
  };

  
  const handleGroupAction = (chatId: string, action: 'removeUser' | 'changeRole' | 'leave', payload: { userId?: string, newRole?: 'admin' | 'member' }) => {
    // This functionality should be handled by the backend
  };

  const handleStartChat = async (friend: User) => {
    console.log('🚀 Starting chat with friend:', friend);
    
    try {
      // Find or create DM room with the friend
      const dmRoom = await apiService.findOrCreateDirectMessageRoom(friend.id);
      console.log('📝 DM room created/found:', dmRoom);
      
      // Map backend participants to frontend format
      const participants = dmRoom.participants?.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        user_name: p.user_name,
        email: p.email,
        avatar_url: p.avatar_url || '',
        status: p.status,
        // Add computed fields for compatibility
        name: p.full_name || p.user_name,
        username: p.user_name,
        avatar: p.avatar_url || '',
        activity: p.status ? 'online' : 'offline'
      })) || [];
      
      // Ensure we have both users in participants
      if (participants.length === 0 || !participants.find((p: User) => p.id === currentUser?.id)) {
        // Add current user if not in participants
        if (currentUser) {
          participants.push(currentUser);
        }
      }
      
      // Add friend if not in participants
      if (!participants.find((p: User) => p.id === friend.id)) {
        participants.push(friend);
      }
      
      // Convert backend response to frontend Chat format
      const chatRoom: Chat = {
        id: dmRoom.id,
        type: 'dm',
        name: friend.full_name || friend.user_name || 'Friend',
        participants: participants,
        messages: [], // Will be loaded when chat is selected
        avatar: friend.avatar_url || '',
        lastMessagePreview: '',
        isBotChat: false
      };
      
      // Add room to chats list if not already there
      const existingChat = chats.find(c => c.id === dmRoom.id);
      if (!existingChat) {
        setChats(prevChats => [...prevChats, chatRoom]);
      }
      
      // Set as active chat and switch to chat view
      setActiveChat(chatRoom);
      setView('chat');
      
      // Reload chats to get fresh data from backend
      console.log('🔄 Reloading chats after creating DM room...');
      loadChats();
      
      console.log('✅ Successfully started chat with friend');
    } catch (error) {
      console.error('❌ Failed to start chat with friend:', error);
      // You could show a toast notification here
    }
  };

  const handleViewProfile = (friend: User) => {
    console.log('👤 Viewing profile of friend:', friend);
    
    // Set the selected friend as the user to view in profile modal
    // We'll pass the friend data to the UserProfileModal
    setModal('friendProfile');
    // Store the friend data temporarily (we'll need to add this state)
    setSelectedFriend(friend);
  };
  

  return (
    <div className="h-screen w-screen flex text-gray-800">
      <ServerList 
        bots={bots}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
        onAddBot={() => setModal('configureAIBot')}
      />
      {activeServerId === 'home' && currentUser && (
        <Sidebar
          chats={chats.filter(c => !c.isBotChat)}
          onSelectChat={handleSelectChat}
          activeChatId={activeChat?.id || null}
          onShowFriends={handleShowFriends}
          openCreateGroupModal={() => setModal('createGroup')}
          currentUser={currentUser}
          onSignOut={logout}
          onOpenProfile={() => setModal('userProfile')}
        />
      )}
      <div className="flex flex-col flex-grow bg-white relative overflow-hidden">
        <Header 
            activeChat={activeChat} 
            view={view} 
            onShowFriendRequests={() => setModal('friendRequests')}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onToggleManagementPanel={() => setManagementPanelOpen(prev => !prev)}
            onShowGlobalSearch={() => setModal('globalSearch')}
        />
        <main className="flex-grow overflow-y-auto bg-white/70">
          {activeServerId === 'home' && (
            <>
              {view === 'friends' && currentUser && (
                <FriendsView 
                    searchQuery={searchQuery}
                    currentUser={currentUser}
                    onStartChat={handleStartChat}
                    onViewProfile={handleViewProfile}
                />
              )}
              {view === 'chat' && activeChat && currentUser && (
                <ChatView
                  chat={activeChat}
                  onSendMessage={handleSendMessage}
                  currentUser={currentUser}
                  users={[]}
                />
              )}
            </>
          )}
          {activeServerId !== 'home' && activeChat && currentUser && (
            <ChatView
              chat={activeChat}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              users={[]}
            />
          )}
        </main>
        {isManagementPanelOpen && activeChat && currentUser && (
            <ChatManagementPanel 
                chat={activeChat}
                currentUser={currentUser}
                users={[]}
                onClose={() => setManagementPanelOpen(false)}
                onGroupAction={handleGroupAction}
            />
        )}
      </div>
      {modal === 'createGroup' && <CreateGroupModal onClose={() => setModal(null)} users={[]} />}
      {modal === 'userProfile' && currentUser && (
        <UserProfileModal 
          onClose={() => setModal(null)} 
          user={currentUser} 
          onUpdateProfile={handleUpdateProfile}
          isReadOnly={false}
        />
      )}
      {modal === 'friendRequests' && <FriendRequestsModal onClose={() => setModal(null)} />}
      {modal === 'configureAIBot' && <ConfigureAIBotModal onClose={() => setModal(null)} onConfigure={handleConfigureBot} />}
      {modal === 'globalSearch' && <GlobalSearchModal onClose={() => setModal(null)} />}
      {modal === 'friendProfile' && selectedFriend && (
        <UserProfileModal 
          onClose={() => {
            setModal(null);
            setSelectedFriend(null);
          }} 
          user={selectedFriend} 
          onUpdateProfile={() => {}} // Friend profiles are read-only
          isReadOnly={true}
        />
      )}
    </div>
  );
};

export default ChatInterface;