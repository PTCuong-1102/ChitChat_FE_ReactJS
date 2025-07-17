import {
  User,
  Message,
  Chat,
  UserResponse,
  MessageResponse,
  ChatRoomResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  CreateRoomPayload,
  SendMessagePayload,
  FriendRequest,
} from '../types';
import { getApiUrl, API_CONFIG } from './config';
import { errorHandler } from './errorHandler';

// =================================================================
//                      Error Classes
// =================================================================

export class ApiError extends Error {
  public status: number;
  public errorData: any;

  constructor(message: string, status: number, errorData?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorData = errorData;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public validationErrors: Record<string, string>;

  constructor(validationErrors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

// =================================================================
//                      ApiService Singleton
// =================================================================

class ApiService {
  private static instance: ApiService;
  private retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  private retryDelay = API_CONFIG.RETRY_DELAY;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // =================================================================
  //                      Request Handling
  // =================================================================

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(errorData.message || 'API request failed', response.status, errorData);
    }
    
    // Handle empty response body
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null as T;
    }
    
    return response.json();
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retries: number = this.retryAttempts
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        if (error.status === 422) {
          throw new ValidationError(error.errorData.validationErrors || {});
        }
        throw error;
      }
      
      if ((error as Error).name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }

      if (retries > 0 && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`);
        await this.delay(this.retryDelay);
        return this.makeRequest<T>(url, options, retries - 1);
      }

      throw new NetworkError((error as Error).message || 'Network request failed');
    }
  }
  
  private shouldRetry(error: unknown): boolean {
    if (error instanceof ApiError) {
      return error.status >= 500;
    }
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // =================================================================
  //                      Authentication Methods
  // =================================================================
  
  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest<{ token: string; user: UserResponse }>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
      { method: 'POST', body: JSON.stringify(payload) }
    );
    
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, response.token);
    const user = this.mapUserResponseToUser(response.user);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    
    return { user, token: response.token };
  }
  
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    const response = await this.makeRequest<{ token: string; user: UserResponse }>(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
      { method: 'POST', body: JSON.stringify(payload) }
    );
    
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, response.token);
    const user = this.mapUserResponseToUser(response.user);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    
    return { user, token: response.token };
  }
  
  async getProfile(): Promise<User> {
    const response = await this.makeRequest<UserResponse>(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.PROFILE));
    return this.mapUserResponseToUser(response);
  }
  
  async logout(): Promise<void> {
    try {
      await this.makeRequest<void>(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed but proceeding with local cleanup:', error);
    } finally {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
    }
  }
  
  // =================================================================
  //                      Chat Methods
  // =================================================================
  
  async getRooms(): Promise<Chat[]> {
    const response = await this.makeRequest<ChatRoomResponse[]>(getApiUrl(API_CONFIG.ENDPOINTS.CHAT.ROOMS));
    return response.map(this.mapChatRoomResponseToChat);
  }
  
  async getRoomMessages(roomId: string): Promise<Message[]> {
    const response = await this.makeRequest<MessageResponse[]>(getApiUrl(API_CONFIG.ENDPOINTS.CHAT.MESSAGES(roomId)));
    return response.map(this.mapMessageResponseToMessage);
  }
  
  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<Message> {
    const response = await this.makeRequest<MessageResponse>(
      getApiUrl(API_CONFIG.ENDPOINTS.CHAT.SEND_MESSAGE(roomId)),
      { method: 'POST', body: JSON.stringify(payload) }
    );
    return this.mapMessageResponseToMessage(response);
  }
  
  async createRoom(payload: CreateRoomPayload): Promise<Chat> {
    const response = await this.makeRequest<ChatRoomResponse>(
      getApiUrl(API_CONFIG.ENDPOINTS.CHAT.ROOMS),
      { method: 'POST', body: JSON.stringify(payload) }
    );
    return this.mapChatRoomResponseToChat(response);
  }

  async findOrCreateDirectMessageRoom(friendId: string): Promise<Chat> {
    const response = await this.makeRequest<ChatRoomResponse>(
      getApiUrl(API_CONFIG.ENDPOINTS.CHAT.DM_ROOM(friendId)), 
      { method: 'POST' }
    );
    return this.mapChatRoomResponseToChat(response);
  }
  
  // =================================================================
  //                      Friends Methods
  // =================================================================

  async getFriends(): Promise<User[]> {
    const response = await this.makeRequest<UserResponse[]>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.LIST));
    return response.map(this.mapUserResponseToUser);
  }

  async sendFriendRequest(email: string): Promise<void> {
    await this.makeRequest<void>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.SEND_REQUEST), {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    // Note: Assuming backend returns a structure that matches FriendRequest
    return this.makeRequest<FriendRequest[]>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REQUESTS));
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await this.makeRequest<void>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.ACCEPT_REQUEST(requestId)), { method: 'PUT' });
  }
  
  async rejectFriendRequest(requestId: string): Promise<void> {
    await this.makeRequest<void>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REJECT_REQUEST(requestId)), { method: 'DELETE' });
  }

  async removeFriend(friendId: string): Promise<void> {
    await this.makeRequest<void>(getApiUrl(API_CONFIG.ENDPOINTS.FRIENDS.REMOVE(friendId)), { method: 'DELETE' });
  }
  
  // =================================================================
  //                      User Methods
  // =================================================================
  
  async searchUsers(query: string): Promise<User[]> {
    const response = await this.makeRequest<UserResponse[]>(
      getApiUrl(`${API_CONFIG.ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}`)
    );
    return response.map(this.mapUserResponseToUser);
  }

  // =================================================================
  //                      File Methods
  // =================================================================

  async uploadFile(file: File, messageId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);

    const token = this.getToken();
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FILES.UPLOAD), {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || 'File upload failed', response.status);
    }
    return response.json();
  }

  async getMessageAttachments(messageId: string): Promise<any[]> {
    return this.makeRequest<any[]>(
      getApiUrl(API_CONFIG.ENDPOINTS.FILES.ATTACHMENTS(messageId))
    );
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.makeRequest<void>(
      getApiUrl(API_CONFIG.ENDPOINTS.FILES.DELETE_ATTACHMENT(attachmentId)),
      { method: 'DELETE' }
    );
  }

  // =================================================================
  //                      Message Methods
  // =================================================================

  async editMessage(messageId: string, newContent: string): Promise<void> {
    await this.makeRequest<void>(
      getApiUrl(`/messages/${messageId}`),
      {
        method: 'PUT',
        body: JSON.stringify({ content: newContent }),
      }
    );
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.makeRequest<void>(
      getApiUrl(`/messages/${messageId}`),
      { method: 'DELETE' }
    );
  }
  
  // =================================================================
  //                      AI/Bot Methods
  // =================================================================
  
  async generateDefaultGeminiResponse(prompt: string): Promise<string> {
    const response = await this.makeRequest<{ response: string }>(
      getApiUrl(API_CONFIG.ENDPOINTS.GEMINI.GENERATE),
      { method: 'POST', body: JSON.stringify({ prompt }) }
    );
    return response.response;
  }
  
  async generateBotResponse(botId: string, prompt: string): Promise<string> {
    const response = await this.makeRequest<{ response: string }>(
      getApiUrl(API_CONFIG.ENDPOINTS.GEMINI.BOT_RESPONSE(botId)),
      { method: 'POST', body: JSON.stringify({ prompt }) }
    );
    return response.response;
  }
  
  // =================================================================
  //                      Data Mapping Methods
  // =================================================================
  
  private mapUserResponseToUser = (res: UserResponse): User => ({
    id: res.id,
    fullName: res.full_name,
    username: res.user_name,
    email: res.email,
    avatarUrl: res.avatar_url,
    status: res.status ? 'online' : 'offline',
  });

  private mapMessageResponseToMessage = (res: MessageResponse): Message => ({
    id: res.id,
    senderId: res.senderId,
    roomId: res.roomId,
    text: res.content,
    timestamp: new Date(res.sentAt),
    type: res.messageType.toLowerCase() as Message['type'],
    isEdited: !!res.isEdited,
    editedAt: res.editedAt ? new Date(res.editedAt) : undefined,
    sender: res.sender ? this.mapUserResponseToUser(res.sender) : undefined,
  });

  private mapChatRoomResponseToChat = (res: ChatRoomResponse): Chat => ({
    id: res.id,
    type: res.isGroup ? 'group' : 'dm',
    name: res.name,
    participants: res.participants.map(this.mapUserResponseToUser),
    messages: [], // To be loaded separately
    avatarUrl: res.avatarUrl,
    creatorId: res.creatorId,
    lastMessage: res.lastMessage ? this.mapMessageResponseToMessage(res.lastMessage) : undefined,
  });

  public mapWebSocketMessageToMessage = (wsMessage: any): Message => {
    return {
      id: wsMessage.id,
      senderId: wsMessage.senderId,
      roomId: wsMessage.roomId,
      text: wsMessage.text,
      timestamp: new Date(wsMessage.timestamp),
      type: wsMessage.messageType.toLowerCase() as Message['type'],
      isEdited: false,
    };
  };
}

// =================================================================
//                      Export Singleton Instance
// =================================================================

export const apiService = ApiService.getInstance();
export default apiService;
