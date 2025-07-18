import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Chat, Message } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useFriends } from './FriendsContext';

// WebSocket imports - temporarily commented for debugging
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  loadChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  sendMessage: (roomId: string, content: string, messageType?: 'text' | 'image' | 'link') => Promise<void>;
  createRoom: (name: string, type: 'dm' | 'group', participants: string[]) => Promise<void>;
  loadMessages: (roomId: string) => Promise<Message[]>;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;
}

interface ChatProviderProps {
  children: ReactNode;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated, user: currentUser } = useAuth();
  const { loadFriendRequests } = useFriends();
  
  // WebSocket state - temporarily disabled for debugging
  // const stompClientRef = useRef<Client | null>(null);
  // const [isConnected, setIsConnected] = useState(false);
  // const [subscribedRooms, setSubscribedRooms] = useState<Set<string>>(new Set());

  // Basic initialization without WebSocket
  useEffect(() => {
    if (isAuthenticated && token && currentUser) {
      console.log('📋 User authenticated, loading chats without WebSocket for now');
      loadChats();
    }
  }, [isAuthenticated, token, currentUser]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      console.log('📋 Loading chats from backend...');
      const rooms = await apiService.getRooms();
      console.log('📋 Loaded rooms:', rooms);
      
      // Filter out broken chats (chats with no participants or invalid data)
      const validChats = rooms.filter(chat => {
        const isValid = chat.id && chat.name && chat.participants && chat.participants.length > 0;
        if (!isValid) {
          console.warn('🚨 Filtering out broken chat:', chat);
        }
        return isValid;
      });
      
      console.log('📋 Valid chats after filtering:', validChats);
      setChats(validChats);
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
      // Set empty chats on error instead of keeping old data
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string): Promise<Message[]> => {
    try {
      const messages = await apiService.getRoomMessages(roomId);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === roomId ? { ...chat, messages } : chat
        )
      );
      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  };

  const sendMessage = async (roomId: string, content: string, messageType: 'text' | 'image' | 'link' = 'text') => {
    console.log('📝 Sending message:', { roomId, content, messageType });
    console.log('📋 Available chats:', chats.map(c => ({ id: c.id, name: c.name, isBotChat: c.isBotChat })));
    
    // Try to find the chat in current chats state
    let chat = chats.find(c => c.id === roomId);
    
    // If not found but we have activeChat with matching ID, use that
    if (!chat && activeChat && activeChat.id === roomId) {
      console.log('🔄 Using activeChat as fallback');
      chat = activeChat;
    }
    
    if (!chat) {
      console.error('❌ Chat not found for room:', roomId);
      console.error('📋 Available chat IDs:', chats.map(c => c.id));
      console.error('📋 Active chat ID:', activeChat?.id);
      return;
    }
    console.log('✅ Found chat:', { id: chat.id, name: chat.name, isBotChat: chat.isBotChat });

    // Create the user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'current-user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: messageType
    };

    // Create temporary optimistic update
    const tempUpdatedChat = {
      ...chat,
      messages: [...(chat.messages || []), userMessage]
    };

    // Update UI optimistically
    setChats(prevChats => 
      prevChats.map(c => c.id === roomId ? tempUpdatedChat : c)
    );

    if (activeChat && activeChat.id === roomId) {
      setActiveChat(tempUpdatedChat);
    }

    try {
      if (chat.isBotChat) {
        // Handle bot chats
        try {
          const bot = chat.participants?.find(p => p.isBot);
          if (!bot) {
            throw new Error('Bot not found in chat participants');
          }
          
          let aiResponse: string;
          
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bot.id);
          
          if (isValidUUID) {
            aiResponse = await apiService.generateBotResponse(bot.id, content);
          } else if (bot.id === 'user-gemini' && bot.provider === 'gemini') {
            aiResponse = await apiService.generateDefaultGeminiResponse(content);
          } else {
            aiResponse = `Hi! I'm ${bot.name || 'Gemini'}. To start chatting with me, please configure me first by clicking the "+" icon in the server list and setting up my API key and model. Once configured, I'll be able to respond to your messages!`;
          }
          
          // Add AI response after a delay
          setTimeout(() => {
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              senderId: bot.id,
              text: aiResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'text'
            };

            const chatWithBotResponse = {
              ...tempUpdatedChat,
              messages: [...(tempUpdatedChat.messages || []), botMessage]
            };

            setChats(prevChats => 
              prevChats.map(c => c.id === roomId ? chatWithBotResponse : c)
            );

            if (activeChat && activeChat.id === roomId) {
              setActiveChat(chatWithBotResponse);
            }
          }, 1000);
        } catch (botError) {
          console.error('❌ Bot response error:', botError);
          
          // Add error message
          const errorMessage: Message = {
            id: `msg-${Date.now()}-error`,
            senderId: 'system',
            text: 'Sorry, I encountered an error processing your message. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          };

          const chatWithErrorMessage = {
            ...tempUpdatedChat,
            messages: [...(tempUpdatedChat.messages || []), errorMessage]
          };

          setChats(prevChats => 
            prevChats.map(c => c.id === roomId ? chatWithErrorMessage : c)
          );

          if (activeChat && activeChat.id === roomId) {
            setActiveChat(chatWithErrorMessage);
          }
        }
      } else {
        // Handle regular chats - send to backend via HTTP only for now
        console.log('🚀 Sending message to backend via HTTP:', { roomId, content, messageType });
        
        // Send via HTTP API
        const backendMessage = await apiService.sendMessage(roomId, { text: content, type: messageType });
        console.log('✅ Message sent successfully to backend via HTTP:', backendMessage);
        
        // TODO: Add WebSocket broadcast here later
        
        // Reload messages from backend to ensure consistency
        console.log('🔄 Reloading messages from backend...');
        const freshMessages = await apiService.getRoomMessages(roomId);
        console.log('📨 Fresh messages loaded:', freshMessages.length);
        
        // Update chat with fresh messages from backend
        const updatedChatWithFreshMessages = {
          ...chat,
          messages: freshMessages
        };
        
        setChats(prevChats => 
          prevChats.map(c => c.id === roomId ? updatedChatWithFreshMessages : c)
        );

        if (activeChat && activeChat.id === roomId) {
          setActiveChat(updatedChatWithFreshMessages);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Revert optimistic update on error
      setChats(prevChats => 
        prevChats.map(c => c.id === roomId ? chat : c)
      );
      
      if (activeChat && activeChat.id === roomId) {
        setActiveChat(chat);
      }
      
      // Show error message to user
      alert('Failed to send message. Please try again.');
    }
  };

  const sendTypingIndicator = (roomId: string, isTyping: boolean) => {
    // TODO: Implement WebSocket typing indicator later
    console.log('⌨️ Typing indicator (disabled for now):', { roomId, isTyping });
  };

  const createRoom = async (name: string, type: 'dm' | 'group', participants: string[]) => {
    try {
      const newRoom = await apiService.createRoom({ name, type, participants });
      setChats(prevChats => [...prevChats, newRoom]);
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  };

  const handleSetActiveChat = (chat: Chat | null) => {
    setActiveChat(chat);
    if (chat) {
      // Load messages if not already loaded
      if (!chat.messages || chat.messages.length === 0) {
        loadMessages(chat.id);
      }
    }
  };

  const value = {
    chats,
    activeChat,
    isLoading,
    loadChats,
    setActiveChat: handleSetActiveChat,
    setChats,
    sendMessage,
    createRoom,
    loadMessages,
    sendTypingIndicator,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
