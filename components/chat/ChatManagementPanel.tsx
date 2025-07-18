import React, { useState, useMemo } from 'react';
import { Chat, User } from '../../types';
import { CloseIcon, UserGroupIcon, PhotoIcon, DocumentIcon, LinkIcon, DotsHorizontalIcon, UserAvatarWithInitials } from '../icons/Icons';

interface ChatManagementPanelProps {
  chat: Chat;
  currentUser: User;
  users: User[];
  onClose: () => void;
  onGroupAction: (chatId: string, action: 'removeUser' | 'changeRole' | 'leave', payload: { userId?: string, newRole?: 'admin' | 'member' }) => void;
}

const ChatManagementPanel: React.FC<ChatManagementPanelProps> = ({ chat, currentUser, users, onClose, onGroupAction }) => {
  const [activeTab, setActiveTab] = useState('members');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  const isCurrentUserAdmin = chat.type === 'group' && chat.roles?.[currentUser.id] === 'admin';

  const { admins, members } = useMemo(() => {
    if (chat.type !== 'group') return { admins: [], members: [] };
    const adminIds = Object.keys(chat.roles || {}).filter(id => chat.roles?.[id] === 'admin');
    const memberIds = Object.keys(chat.roles || {}).filter(id => chat.roles?.[id] === 'member');
    
    const findUser = (id: string) => chat.participants?.find(p => p.id === id);

    return {
      admins: adminIds.map(findUser).filter((u): u is User => !!u),
      members: memberIds.map(findUser).filter((u): u is User => !!u),
    };
  }, [chat]);
  
  const sharedMedia = useMemo(() => (chat.messages || []).filter(m => m.type === 'image'), [chat.messages]);
  const sharedLinks = useMemo(() => (chat.messages || []).filter(m => m.type === 'link'), [chat.messages]);

  const toggleMenu = (userId: string) => {
    setOpenMenuUserId(openMenuUserId === userId ? null : userId);
  };
  
  const handleAction = (action: 'removeUser' | 'changeRole' | 'leave', userId: string, newRole?: 'admin' | 'member') => {
      onGroupAction(chat.id, action, { userId, newRole });
      setOpenMenuUserId(null);
  }

  const renderMembers = () => (
    <div className="p-4 space-y-4">
      {chat.type === 'group' ? (
        <>
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Admin - {admins.length}</h4>
            {admins.map(user => <MemberItem key={user.id} user={user} isAdmin={isCurrentUserAdmin} currentUserId={currentUser.id} onAction={handleAction} onMenuToggle={toggleMenu} openMenuId={openMenuUserId} />)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Members - {members.length}</h4>
            {members.map(user => <MemberItem key={user.id} user={user} isAdmin={isCurrentUserAdmin} currentUserId={currentUser.id} onAction={handleAction} onMenuToggle={toggleMenu} openMenuId={openMenuUserId} />)}
          </div>
        </>
      ) : (
        <div>
          <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Participants</h4>
          {(chat.participants || []).map(user => (
              <div key={user.id} className="flex items-center p-2">
                <UserAvatarWithInitials 
                    fullName={user.name || user.full_name || 'User'}
                    avatarUrl={user.avatar || user.avatar_url}
                    size={40}
                    className="rounded-full mr-3"
                />
                <span className="font-semibold">{user.name || user.full_name || 'User'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderMedia = () => (
    <div className="p-4 grid grid-cols-3 gap-2">
        {sharedMedia.map(msg => (
            <img key={msg.id} src={msg.text} alt="Shared media" className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80" onClick={() => window.open(msg.text, '_blank')} />
        ))}
        {sharedMedia.length === 0 && <p className="col-span-3 text-sm text-gray-500 text-center py-4">No media has been shared yet.</p>}
    </div>
  );
  
  const renderLinks = () => (
     <div className="p-4 space-y-2">
        {sharedLinks.map(msg => (
             <a key={msg.id} href={msg.text} target="_blank" rel="noopener noreferrer" className="block p-2 bg-pink-50 hover:bg-pink-100 rounded-md text-sm text-blue-600 truncate">
                {msg.text}
            </a>
        ))}
        {sharedLinks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No links have been shared yet.</p>}
    </div>
  );

  return (
    <aside className="absolute top-0 right-0 h-full w-80 bg-pink-50 border-l border-pink-200 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0 z-20">
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-pink-200">
        <h3 className="text-lg font-bold text-gray-800">Chat Info</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-pink-500">
                        <CloseIcon />
        </button>
      </div>

      <div className="flex-shrink-0 flex border-b border-pink-200">
        <TabButton icon={<UserGroupIcon />} label="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
        <TabButton icon={<PhotoIcon />} label="Media" isActive={activeTab === 'media'} onClick={() => setActiveTab('media')} />
        <TabButton icon={<LinkIcon />} label="Links" isActive={activeTab === 'links'} onClick={() => setActiveTab('links')} />
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'media' && renderMedia()}
        {activeTab === 'links' && renderLinks()}
      </div>
      
      {chat.type === 'group' && (
          <div className="p-4 border-t border-pink-200">
              <button 
                onClick={() => handleAction('leave', currentUser.id)}
                className="w-full text-left text-red-500 font-semibold p-2 rounded-md hover:bg-red-100"
              >
                  Leave Group
              </button>
          </div>
      )}
    </aside>
  );
};

const MemberItem = ({ user, isAdmin, currentUserId, onAction, onMenuToggle, openMenuId } : { user: User, isAdmin: boolean, currentUserId: string, onAction: any, onMenuToggle: (id: string) => void, openMenuId: string | null }) => {
    const isSelf = user.id === currentUserId;
    return (
        <div className="flex items-center justify-between p-2 hover:bg-pink-100 rounded-md">
            <div className="flex items-center">
                <UserAvatarWithInitials 
                    fullName={user.name || user.full_name || 'User'}
                    avatarUrl={user.avatar || user.avatar_url}
                    size={40}
                    className="rounded-full mr-3"
                />
                <span className="font-semibold">{user.name || user.full_name || 'User'}</span>
            </div>
            {!isSelf && isAdmin && (
                <div className="relative">
                    <button onClick={() => onMenuToggle(user.id)} className="p-1 text-gray-500 hover:text-pink-500">
                        <DotsHorizontalIcon />
                    </button>
                    {openMenuId === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-pink-100">
                            <button onClick={() => onAction('changeRole', user.id, 'admin')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">Make Admin</button>
                            <button onClick={() => onAction('removeUser', user.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-pink-50">Remove from Group</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const TabButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-2 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'text-pink-500 border-pink-500' : 'text-gray-500 border-transparent hover:bg-pink-100'}`}>
    <div className="h-6 w-6 mb-1">{icon}</div>
    <span>{label}</span>
  </button>
);


export default ChatManagementPanel;