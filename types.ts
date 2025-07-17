// =================================================================
//                      API Response Interfaces
// =================================================================

// Matches the backend UserResponse DTO
export interface UserResponse {
  id: string;
  full_name?: string;
  user_name?: string;
  email: string;
  avatar_url?: string;
  status: boolean;
}

// Matches the backend MessageResponse DTO
export interface MessageResponse {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'LINK' | 'FILE';
  sentAt: string; // ISO 8601 string
  editedAt?: string; // ISO 8601 string
  sender?: UserResponse;
  isEdited?: boolean;
  roomName?: string;
}

// Matches the backend ChatRoomResponse DTO
export interface ChatRoomResponse {
  id: string;
  name: string;
  isGroup: boolean;
  creatorId?: string;
  avatarUrl?: string;
  description?: string;
  createdAt?: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
  participants: UserResponse[];
  lastMessage?: MessageResponse;
  participantCount?: number;
}

// =================================================================
//                      Frontend Model Interfaces
// =================================================================

export interface User {
  id: string;
  fullName?: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  isBot?: boolean;
  provider?: 'gemini' | 'openai' | 'mistral';
  socials?: {
    facebook?: string;
    linkedin?: string;
    zalo?: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  roomId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'link' | 'file';
  isEdited: boolean;
  editedAt?: Date;
  sender?: User;
}

export interface Chat {
  id: string;
  type: 'dm' | 'group' | 'bot';
  name: string;
  participants: User[];
  messages: Message[];
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount?: number;
  creatorId?: string;
  isBotChat?: boolean;
  roles?: { [userId: string]: 'admin' | 'member' };
}

// =================================================================
//                          API Payload Types
// =================================================================

export interface CreateRoomPayload {
  name: string;
  type: 'dm' | 'group' | 'bot';
  participants: string[];
}

export interface SendMessagePayload {
  text: string;
  type: 'text' | 'image' | 'link' | 'file';
}

export interface LoginPayload {
  usernameOrEmail: string;
  password?: string;
}

export interface RegisterPayload {
  fullName?: string;
  username?: string;
  email: string;
  password?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away';
}

// =================================================================
//                          Other Utility Types
// =================================================================

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';

export interface FriendRequest {
  id: string;
  requester: User;
  recipient: User;
  status: FriendRequestStatus;
  createdAt: string; // ISO 8601 string
}

export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'TYPING_INDICATOR' | 'USER_JOINED' | 'USER_LEFT' | 'ERROR';
  id?: string;
  senderId?: string;
  roomId?: string;
  text?: string;
  timestamp?: string;
  messageType?: string;
}
