export interface User {
  id: string;
  full_name?: string; // Maps to backend full_name
  user_name?: string; // Maps to backend user_name
  avatar_url?: string; // Maps to backend avatar_url
  email: string;
  status: boolean | string; // Backend uses boolean, frontend may use string
  // Frontend-only properties for compatibility
  name?: string; // Computed from full_name
  username?: string; // Computed from user_name
  avatar?: string; // Computed from avatar_url
  activity?: string;
  isBot?: boolean;
  model?: string;
  provider?: string;
  dob?: string;
  socials?: {
    facebook?: string;
    linkedin?: string;
    zalo?: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'link';
  editedAt?: string;
}

export interface Chat {
  id: string;
  type: 'dm' | 'group';
  name: string;
  participants: User[];
  messages: Message[];
  avatar?: string;
  lastMessagePreview?: string;
  isBotChat?: boolean;
  creatorId?: string;
  roles?: { [key: string]: 'admin' | 'member' };
}
