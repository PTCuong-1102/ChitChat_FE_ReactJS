
import React from 'react';
// @ts-ignore
import '../../regular-icon-font-free/lineicons.css';

// Icon props interface
interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
  onClick?: () => void;
  title?: string;
}

// Font icon component
interface FontIconProps extends IconProps {
  name: string;
}

const FontIcon: React.FC<FontIconProps> = ({ 
  name, 
  className = '', 
  size = 24, 
  color = 'currentColor', 
  onClick, 
  title 
}) => {
  const iconClass = `lni lni-${name}`;
  const style = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    color: color,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease'
  };

  return (
    <i 
      className={`${iconClass} ${className}`}
      style={style}
      onClick={onClick}
      title={title}
    />
  );
};

// SVG icon component
interface SVGIconProps extends IconProps {
  svgPath: string;
  viewBox?: string;
  fill?: string;
}

const SVGIcon: React.FC<SVGIconProps> = ({ 
  svgPath, 
  className = '', 
  size = 24, 
  color = 'currentColor', 
  viewBox = '0 0 24 24',
  fill = 'currentColor',
  onClick, 
  title 
}) => {
  const style = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease'
  };

  return (
    <svg 
      className={className}
      style={style}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <title>{title}</title>
      <path d={svgPath} fill={fill} />
    </svg>
  );
};

// Chat and Communication Icons
export const ChatIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="chat-bubble-2" {...props} />
);

export const MessageIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="message-2" {...props} />
);

export const MessageQuestionIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="message-2-question" {...props} />
);

export const MessageTextIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="message-3-text" {...props} />
);

export const PhoneIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="phone" {...props} />
);

export const VideoIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="camera-movie-1" {...props} />
);

// User and Profile Icons
export const UserIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="user-4" {...props} />
);

export const UserMultipleIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="user-multiple-4" {...props} />
);

export const UserAddIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="user-plus" {...props} />
);

// Navigation Icons
export const HomeIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="home-2" {...props} />
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="search-1" {...props} />
);

export const GlobalSearchIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="search-2" {...props} />
);

export const SearchTextIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="search-text" {...props} />
);

export const SearchPlusIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="search-plus" {...props} />
);

// Menu and Control Icons
export const MenuIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="menu-hamburger-1" {...props} />
);

export const MenuDotsIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="menu-meatballs-1" {...props} />
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="close" {...props} />
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="plus" {...props} />
);

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="plus-circle" {...props} />
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="minus" {...props} />
);

export const MinusCircleIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="minus-circle" {...props} />
);

// Action Icons
export const CheckIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="check" {...props} />
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="check-circle-1" {...props} />
);

export const CheckSquareIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="check-square-2" {...props} />
);

export const HeartIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="heart" {...props} />
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="file-pencil" {...props} />
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="trash-3" {...props} />
);

// Settings Icons
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="gear-1" {...props} />
);

export const GearsIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="gears-3" {...props} />
);

export const CogIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="gear-1" {...props} />
);

export const MicrophoneIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="microphone-1" {...props} />
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="exit" {...props} />
);

export const UserGroupIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="user-multiple-4" {...props} />
);

export const LinkIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="link-2-angular-right" {...props} />
);

export const DotsHorizontalIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="menu-meatballs-2" {...props} />
);

// File and Media Icons
export const AttachmentIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="file-plus-circle" {...props} />
);

export const FolderIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="folder-1" {...props} />
);

export const FileIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="file-multiple" {...props} />
);

export const DocumentIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="file-pencil" {...props} />
);

export const PhotoIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="photos" {...props} />
);

export const CameraIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="camera-1" {...props} />
);

export const GalleryIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="gallery" {...props} />
);

export const MusicIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="music" {...props} />
);

export const ArchiveIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="file-format-zip" {...props} />
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="download-1" {...props} />
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="upload-1" {...props} />
);

// Navigation Arrow Icons
export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="arrow-left" {...props} />
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="arrow-right" {...props} />
);

export const PaperAirplaneIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="arrow-right" {...props} />
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="user-multiple-4" {...props} />
);

export const AtSymbolIcon: React.FC<IconProps> = (props) => (
  <SVGIcon 
    svgPath="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.17 3.13-.49l-.63-1.82c-.78.25-1.61.31-2.5.31-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7c0 1.09-.27 2.13-.74 3.04-.47.9-1.17 1.61-2.04 2.04C14.13 18.73 13.09 19 12 19c-1.09 0-2.14-.17-3.13-.49l-.63-1.82C9.02 16.94 10.48 17 12 17c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5c0 .83.2 1.61.56 2.3.36.69.88 1.26 1.52 1.66.64.4 1.37.61 2.12.61.75 0 1.48-.21 2.12-.61.64-.4 1.16-.97 1.52-1.66.36-.69.56-1.47.56-2.3 0-.83-.2-1.61-.56-2.3-.36-.69-.88-1.26-1.52-1.66C13.48 7.39 12.75 7.18 12 7.18s-1.48.21-2.12.61c-.64.4-1.16.97-1.52 1.66-.36.69-.56 1.47-.56 2.3 0 .83.2 1.61.56 2.3.36.69.88 1.26 1.52 1.66.64.4 1.37.61 2.12.61.75 0 1.48-.21 2.12-.61.64-.4 1.16-.97 1.52-1.66.36-.69.56-1.47.56-2.3"
    {...props}
  />
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="arrow-upward" {...props} />
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="arrow-downward" {...props} />
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="chevron-down" {...props} />
);

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="chevron-up" {...props} />
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="chevron-left" {...props} />
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="chevron-right" {...props} />
);

// Notification Icons
export const BellIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="bell-1" {...props} />
);

// Status Icons
export const OnlineIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="check-circle-1" {...props} />
);

export const OfflineIcon: React.FC<IconProps> = (props) => (
  <FontIcon name="minus-circle" {...props} />
);

// Default Avatar Components
export const DefaultUserAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <div 
    className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    style={{ width: size, height: size }}
  >
    <UserIcon size={size * 0.6} color="white" />
  </div>
);

export const DefaultBotAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <div 
    className={`bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    style={{ width: size, height: size }}
  >
    <GearsIcon size={size * 0.6} color="white" />
  </div>
);

// Bot Types Avatars
export const GeminiAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <div 
    className={`bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    style={{ width: size, height: size }}
  >
    <span style={{ fontSize: size * 0.4 }}>G</span>
  </div>
);

export const OpenAIAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <div 
    className={`bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    style={{ width: size, height: size }}
  >
    <span style={{ fontSize: size * 0.4 }}>AI</span>
  </div>
);

export const MistralAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => (
  <div 
    className={`bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    style={{ width: size, height: size }}
  >
    <span style={{ fontSize: size * 0.4 }}>M</span>
  </div>
);

// User Avatar with Initials
export const UserAvatarWithInitials: React.FC<{ 
  fullName?: string;
  size?: number; 
  className?: string;
  avatarUrl?: string;
}> = ({ 
  fullName = 'User', 
  size = 40, 
  className = '',
  avatarUrl 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-600',
    'from-indigo-500 to-blue-600',
    'from-red-500 to-pink-600'
  ];

  const colorIndex = fullName.length % colors.length;
  const bgColor = colors[colorIndex];

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl}
        alt={fullName}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div 
      className={`bg-gradient-to-br ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.4 }}>
        {getInitials(fullName)}
      </span>
    </div>
  );
};

// Helper function to get bot avatar based on provider
export const getBotAvatar = (provider?: string, size: number = 40, className: string = '') => {
  switch (provider?.toLowerCase()) {
    case 'gemini':
      return <GeminiAvatar size={size} className={className} />;
    case 'openai':
      return <OpenAIAvatar size={size} className={className} />;
    case 'mistral':
      return <MistralAvatar size={size} className={className} />;
    default:
      return <DefaultBotAvatar size={size} className={className} />;
  }
};

// Export the font and SVG icon components for direct use
export { FontIcon, SVGIcon };