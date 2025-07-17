import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Chat, Message, WebSocketMessage } from '../types';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';
import { errorHandler } from '../services/errorHandler';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  isWebSocketConnected: boolean;
  loadChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (roomId: string, content: string, messageType?: Message['type']) => Promise<void>;
  createRoom: (name: string, type: Chat['type'], participants: string[]) => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated, user: currentUser } = useAuth();
  
  const stompClientRef = useRef<Client | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    if (!token || !isAuthenticated || (stompClientRef.current && stompClientRef.current.connected)) {
      return;
    }

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          setIsWebSocketConnected(true);
          client.subscribe(`/user/${currentUser!.id}/queue/messages`, msg => handleWebSocketMessage(JSON.parse(msg.body)));
          chats.forEach(chat => subscribeToRoom(chat.id));
        },
        onStompError: frame => errorHandler.handleError(frame, 'WebSocket Stomp Error'),
        onWebSocketClose: () => setIsWebSocketConnected(false),
      });
      stompClientRef.current = client;
      client.activate();
    } catch (error) {
      errorHandler.handleError(error, 'WebSocket Connection');
    }
  };

  const handleWebSocketMessage = (wsMessage: WebSocketMessage) => {
    if (wsMessage.type === 'NEW_MESSAGE') {
      const newMessage = apiService.mapWebSocketMessageToMessage(wsMessage);
      setChats(prev =>
        prev.map(chat =>
          chat.id === newMessage.roomId
            ? { ...chat, messages: [...(chat.messages || []), newMessage], lastMessage: newMessage }
            : chat
        )
      );
      if (activeChat?.id === newMessage.roomId) {
        setActiveChat(prev => prev ? { ...prev, messages: [...(prev.messages || []), newMessage], lastMessage: newMessage } : null);
      }
    }
    // Handle other message types like typing indicators or presence updates
  };
  
  const subscribeToRoom = (roomId: string) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.subscribe(`/topic/room/${roomId}`, msg => handleWebSocketMessage(JSON.parse(msg.body)));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
      connectWebSocket();
    } else if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isAuthenticated]);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const loadedChats = await apiService.getRooms();
      setChats(loadedChats);
      if (loadedChats.length > 0 && !activeChat) {
        setActiveChat(loadedChats[0]);
      }
    } catch (error) {
      errorHandler.handleError(error, 'loadChats');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const messages = await apiService.getRoomMessages(roomId);
      setChats(prev =>
        prev.map(chat =>
          chat.id === roomId ? { ...chat, messages: messages.sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()) } : chat
        )
      );
    } catch (error) {
      errorHandler.handleError(error, 'loadMessages');
    }
  };

  const sendMessage = async (roomId: string, content: string, messageType: Message['type'] = 'text') => {
    if (!currentUser) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      roomId,
      text: content,
      timestamp: new Date(),
      type: messageType,
      isEdited: false,
      sender: currentUser,
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === roomId
          ? { ...chat, messages: [...chat.messages, optimisticMessage] }
          : chat
      )
    );
    if (activeChat?.id === roomId) {
        setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : null);
    }

    try {
      await apiService.sendMessage(roomId, { text: content, type: messageType });
    } catch (error) {
      errorHandler.handleError(error, 'sendMessage');
      // Revert optimistic update
      setChats(prev =>
        prev.map(chat =>
          chat.id === roomId
            ? { ...chat, messages: chat.messages.filter(m => m.id !== optimisticMessage.id) }
            : chat
        )
      );
    }
  };

  const createRoom = async (name: string, type: Chat['type'], participants: string[]) => {
    try {
      const newRoom = await apiService.createRoom({ name, type, participants });
      setChats(prev => [...prev, newRoom]);
      subscribeToRoom(newRoom.id);
    } catch (error) {
      errorHandler.handleError(error, 'createRoom');
    }
  };

  const handleSetActiveChat = (chat: Chat | null) => {
    setActiveChat(chat);
    if (chat && (!chat.messages || chat.messages.length === 0)) {
      loadMessages(chat.id);
    }
  };

  const sendTypingIndicator = (roomId: string, isTyping: boolean) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/typing/${roomId}`,
        body: JSON.stringify({ userId: currentUser?.id, isTyping }),
      });
    }
  };

  const value = {
    chats,
    activeChat,
    isLoading,
    isWebSocketConnected,
    loadChats,
    setActiveChat: handleSetActiveChat,
    sendMessage,
    createRoom,
    loadMessages,
    sendTypingIndicator,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
