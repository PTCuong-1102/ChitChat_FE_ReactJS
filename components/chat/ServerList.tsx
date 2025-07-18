
import React from 'react';
import { PlusIcon, getBotAvatar } from '../icons/Icons';
import { User } from '../../types';

interface ServerIconProps {
    imageUrl: string;
    name: string;
    isActive: boolean;
    onClick: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({ imageUrl, name, isActive, onClick }) => {
    return (
        <div className="relative group flex items-center">
            <div className={`absolute left-0 w-1 transition-all duration-200 ease-in-out bg-pink-500 rounded-r-full ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}`}></div>
            <img 
                src={imageUrl} 
                alt={name}
                onClick={onClick}
                className={`w-12 h-12 object-cover transition-all duration-200 ease-in-out cursor-pointer group-hover:rounded-2xl ${isActive ? 'rounded-2xl shadow-md' : 'rounded-full'}`}
            />
             <div className="absolute left-full ml-4 w-auto p-2 min-w-max text-xs font-bold text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {name}
            </div>
        </div>
    )
}

interface BotServerIconProps {
    bot: User;
    isActive: boolean;
    onClick: () => void;
}

const BotServerIcon: React.FC<BotServerIconProps> = ({ bot, isActive, onClick }) => {
    return (
        <div className="relative group flex items-center">
            <div className={`absolute left-0 w-1 transition-all duration-200 ease-in-out bg-pink-500 rounded-r-full ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}`}></div>
            <div 
                onClick={onClick}
                className={`w-12 h-12 transition-all duration-200 ease-in-out cursor-pointer group-hover:rounded-2xl ${isActive ? 'rounded-2xl shadow-md' : 'rounded-full'}`}
            >
                {getBotAvatar(bot.provider, 48, 'w-full h-full')}
            </div>
             <div className="absolute left-full ml-4 w-auto p-2 min-w-max text-xs font-bold text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {bot.name ?? ''}
            </div>
        </div>
    )
}

interface ServerListProps {
    bots: User[];
    activeServerId: string;
    onSelectServer: (id: string) => void;
    onAddBot: () => void;
}

const ServerList: React.FC<ServerListProps> = ({ bots, activeServerId, onSelectServer, onAddBot }) => {

  return (
    <div className="w-20 bg-pink-100 p-3 flex flex-col items-center space-y-4 flex-shrink-0">
      <ServerIcon 
        imageUrl="https://i.imgur.com/8c1zJ1s.png"
        name="Conversations" 
        isActive={activeServerId === 'home'} 
        onClick={() => onSelectServer('home')}
      />
      
      <div className="w-8 h-px bg-pink-300 my-2"></div>

      {bots.map(bot => (
        <BotServerIcon 
          key={bot.id} 
          bot={bot}
          isActive={activeServerId === bot.id}
          onClick={() => onSelectServer(bot.id)}
        />
      ))}
      
      <button className="relative group flex items-center" onClick={onAddBot}>
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white group-hover:rounded-2xl transition-all duration-200 ease-in-out">
            <PlusIcon className="h-6 w-6" />
          </div>
          <div className="absolute left-full ml-4 w-auto p-2 min-w-max text-xs font-bold text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Add a Bot
        </div>
      </button>
    </div>
  );
};

export default ServerList;
