import { motion } from 'framer-motion';

export default function RoomCard({ room, isActive, onClick, membersCount }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(room)}
      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
        isActive 
          ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
          : 'bg-surface/50 border-white/5 hover:border-white/10 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${room.color} bg-opacity-20`}>
          <span className="text-xl">{room.icon}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-tertiary/70">{membersCount || 0}</span>
        </div>
      </div>
      
      <h3 className={`font-heading font-bold text-sm mb-1 ${isActive ? 'text-primary' : 'text-tertiary'}`}>
        {room.name}
      </h3>
      <p className="text-xs text-tertiary/50 line-clamp-2">
        {room.description}
      </p>
    </motion.div>
  );
}
