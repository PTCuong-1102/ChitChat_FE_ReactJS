import { User, Chat, Message } from '../types';
import { getApiUrl } from './config';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(userData: {
    userName: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(getApiUrl('/auth/register'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        username: userData.userName,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    const result = await response.json();
    return { user: result.user, token: result.token };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ usernameOrEmail: credentials.email, password: credentials.password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    return { user, token };
  }

  async getProfile(): Promise<User> {
    const response = await fetch(getApiUrl('/auth/profile'), {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Get profile failed');
    }
    return response.json();
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    return Promise.resolve();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      // Try to get profile to verify if token is valid
      await this.getProfile();
      return true;
    } catch (error) {
      // If profile request fails, token is invalid
      localStorage.removeItem('token');
      return false;
    }
  }

  async getRooms(): Promise<Chat[]> {
    console.log('🔄 API: Calling getRooms endpoint...');
    
    const response = await fetch(getApiUrl('/chat/rooms'), {
        headers: this.getHeaders(),
    });
    
    console.log('📊 API: getRooms response status:', response.status);
    
    if (!response.ok) {
        console.error('❌ API: Get rooms failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error('Get rooms failed');
    }
    
    const backendRooms = await response.json();
    console.log('📊 API: Raw rooms data from backend:', backendRooms);
    
    // Map backend ChatRoomResponse[] to frontend Chat[]
    const mappedChats: Chat[] = backendRooms.map((room: any) => {
      // Map participants from backend UserResponse[] to frontend User[]
      const participants = (room.participants || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        user_name: p.user_name,
        email: p.email,
        avatar_url: p.avatar_url || '',
        status: p.status,
        // Add computed fields for frontend compatibility
        name: p.full_name || p.user_name || 'User',
        username: p.user_name || 'unknown',
        avatar: p.avatar_url || '',
        activity: p.status ? 'online' : 'offline'
      }));
      
      console.log(`📊 Room ${room.id} - Participants:`, participants);
      
      const mappedChat: Chat = {
        id: room.id,
        type: room.isGroup ? 'group' : 'dm',
        name: room.name || 'Unnamed Chat',
        participants: participants,
        messages: [], // Messages will be loaded separately
        avatar: room.avatarUrl || '',
        lastMessagePreview: room.lastMessage ? room.lastMessage.content : '',
        isBotChat: false, // Regular chats are not bot chats
        creatorId: room.creatorId,
        roles: {} // Will be populated for group chats if needed
      };
      
      return mappedChat;
    });
    
    console.log('📊 API: Mapped chats:', mappedChats);
    
    return mappedChats;
  }

  async generateAiResponse(prompt: string): Promise<string> {
    const response = await fetch(getApiUrl('/gemini/generate'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error('AI response generation failed');
    }
    const data = await response.json();
    return data.response;
  }

  async generateBotResponse(botId: string, prompt: string): Promise<string> {
    const response = await fetch(getApiUrl(`/gemini/bot/${botId}/response`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error('Bot response generation failed');
    }
    const data = await response.json();
    return data.response;
  }

  async generateDefaultGeminiResponse(prompt: string): Promise<string> {
    const response = await fetch(getApiUrl('/gemini/generate'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error('Default Gemini response generation failed');
    }
    const data = await response.json();
    return data.response;
  }

  async configureBot(botName: string, model: string, provider: string, apiKey: string): Promise<any> {
    const response = await fetch(getApiUrl('/gemini/configure'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ botName, model, provider, apiKey }),
    });
    if (!response.ok) {
      throw new Error('Configuring bot failed');
    }
    return response.json();
  }

  async getUserBots(): Promise<any[]> {
    const response = await fetch(getApiUrl('/gemini/bots'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user bots');
    }
    const data = await response.json();
    return data.bots || [];
  }

  async createRoom(roomData: { name: string; type: 'dm' | 'group'; participants: string[] }): Promise<Chat> {
    const response = await fetch(getApiUrl('/chat/rooms'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
            name: roomData.name,
            isGroup: roomData.type === 'group',
            participantIds: roomData.participants
        }),
    });
    if (!response.ok) {
        throw new Error('Create room failed');
    }
    return response.json();
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    console.log('🔄 API: Calling getRoomMessages for room:', roomId);
    
    const response = await fetch(getApiUrl(`/chat/rooms/${roomId}/messages`), {
        headers: this.getHeaders(),
    });
    
    console.log('📊 API: getRoomMessages response status:', response.status);
    
    if (!response.ok) {
        console.error('❌ API: Get room messages failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error('Get room messages failed');
    }
    
    const backendMessages = await response.json();
    console.log('📊 API: Raw messages data from backend:', backendMessages);
    
    // Handle paginated response or direct array
    const messagesArray = backendMessages.content || backendMessages;
    
    // Map backend MessageResponse[] to frontend Message[]
    const mappedMessages: Message[] = messagesArray.map((msg: any) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.content,
      timestamp: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: msg.messageType?.toLowerCase() || 'text'
    }));
    
    console.log('📊 API: Mapped messages:', mappedMessages);
    
    return mappedMessages;
  }

  async sendMessage(roomId: string, messageData: { text: string; type: 'text' | 'image' | 'link' }): Promise<Message> {
    console.log('🔄 API: Sending message to room:', roomId, messageData);
    
    const response = await fetch(getApiUrl(`/chat/rooms/${roomId}/messages`), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content: messageData.text, messageType: messageData.type.toUpperCase() }),
    });
    
    console.log('📊 API: sendMessage response status:', response.status);
    
    if (!response.ok) {
        console.error('❌ API: Send message failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error('Send message failed');
    }
    
    const backendMessage = await response.json();
    console.log('📊 API: Raw message response from backend:', backendMessage);
    
    // Map backend MessageResponse to frontend Message
    const mappedMessage: Message = {
      id: backendMessage.id,
      senderId: backendMessage.senderId,
      text: backendMessage.content,
      timestamp: new Date(backendMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: backendMessage.messageType?.toLowerCase() || 'text'
    };
    
    console.log('📊 API: Mapped message:', mappedMessage);
    
    return mappedMessage;
  }

  async getFriends(): Promise<User[]> {
    console.log('🔄 API: Calling getFriends endpoint...');
    console.log('🔄 API: Using URL:', getApiUrl('/friends'));
    console.log('🔄 API: Using headers:', this.getHeaders());
    
    const response = await fetch(getApiUrl('/friends'), {
        headers: this.getHeaders(),
    });
    
    console.log('📊 API: Response status:', response.status);
    console.log('📊 API: Response ok:', response.ok);
    
    if (!response.ok) {
        console.error('❌ API: Get friends failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error('Get friends failed');
    }
    
    const data = await response.json();
    console.log('📊 API: Raw response data:', data);
    console.log('📊 API: Response data type:', typeof data);
    console.log('📊 API: Response is array:', Array.isArray(data));
    
    return data;
  }

  async sendFriendRequest(friendEmail: string): Promise<void> {
    const response = await fetch(getApiUrl('/friends/requests'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email: friendEmail }),
    });
    if (!response.ok) {
        throw new Error('Send friend request failed');
    }
  }

  async getFriendRequests(): Promise<any[]> {
    const response = await fetch(getApiUrl('/friends/requests'), {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Get friend requests failed');
    }
    return response.json();
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/friends/requests/${requestId}/accept`), {
        method: 'PUT',
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Accept friend request failed');
    }
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/friends/requests/${requestId}/reject`), {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Reject friend request failed');
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/friends/${friendId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Remove friend failed');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(getApiUrl(`/users/search?q=${query}`), {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Search users failed');
    }
    return response.json();
  }

  async findUser(query: string): Promise<{ user: User; status: string } | null> {
    const response = await fetch(getApiUrl(`/users/find?q=${query}`), {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Find user failed');
    }
    return response.json();
  }

  async findOrCreateDirectMessageRoom(friendId: string): Promise<any> {
    console.log('🔄 API: Finding or creating DM room with friend:', friendId);
    
    const response = await fetch(getApiUrl(`/chat/rooms/dm/${friendId}`), {
      method: 'POST',
      headers: this.getHeaders(),
    });

    console.log('📊 API: DM room response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API: Find or create DM room failed with status:', response.status);
      const errorText = await response.text();
      console.error('❌ API: Error response:', errorText);
      throw new Error('Find or create DM room failed');
    }

    const data = await response.json();
    console.log('📊 API: DM room response data:', data);
    
    return data;
  }

  // File Upload/Download Methods
  async uploadFile(file: File, messageId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);

    const token = this.getToken();
    const response = await fetch(getApiUrl('/files/upload'), {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'File upload failed');
    }
    return response.json();
  }

  async downloadFile(fileName: string): Promise<Blob> {
    const response = await fetch(getApiUrl(`/files/download/${fileName}`), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }
    return response.blob();
  }

  async getMessageAttachments(messageId: string): Promise<any[]> {
    const response = await fetch(getApiUrl(`/files/message/${messageId}`), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Get message attachments failed');
    }
    return response.json();
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/files/attachment/${attachmentId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete attachment failed');
    }
  }

  // Message editing methods
  async editMessage(messageId: string, content: string, messageType: string = 'text'): Promise<Message> {
    const response = await fetch(getApiUrl(`/chat/messages/${messageId}`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content: content,
        messageType: messageType
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Edit message failed');
    }
    return response.json();
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/chat/messages/${messageId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete message failed');
    }
  }

  // Message search methods
  async searchMessagesInRoom(roomId: string, query: string, page: number = 0, size: number = 20): Promise<any> {
    const response = await fetch(getApiUrl(`/chat/rooms/${roomId}/messages/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Search messages failed');
    }
    return response.json();
  }

  async searchMessagesGlobal(query: string, page: number = 0, size: number = 20): Promise<any> {
    const response = await fetch(getApiUrl(`/chat/messages/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Global search failed');
    }
    return response.json();
  }
}

export const apiService = new ApiService();
