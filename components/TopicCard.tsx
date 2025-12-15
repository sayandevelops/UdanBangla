
import React from 'react';
import { TopicDef } from '../types';
import { BookOpen, MapPin, Landmark, FlaskConical, Calculator, Gavel, Atom, Lock, Crown } from 'lucide-react';

interface TopicCardProps {
  topic: TopicDef;
  onSelect: (topic: TopicDef) => void;
  isLocked?: boolean;
}

const IconMap: Record<string, React.ElementType> = {
  'map-pin': MapPin,
  'landmark': Landmark,
  'book-open': BookOpen,
  'flask': FlaskConical,
  'calculator': Calculator,
  'gavel': Gavel,
  'atom': Atom
};

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect, isLocked = false }) => {
  const Icon = IconMap[topic.iconName] || BookOpen;

  return (
    <button
      onClick={() => onSelect(topic)}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl text-left border bg-white ${isLocked ? 'border-slate-200 opacity-90' : 'border-slate-200 hover:-translate-y-1'}`}
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={100} className={topic.color} />
      </div>
      
      {/* Premium Badge */}
      {topic.isPremium && (
        <div className="absolute top-4 right-4 z-20">
          {isLocked ? (
             <div className="bg-slate-100 p-2 rounded-full text-slate-500 shadow-sm">
                <Lock size={16} />
             </div>
          ) : (
             <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                <Crown size={12} /> PRO
             </div>
          )}
        </div>
      )}
      
      <div className="relative z-10">
        <div className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 ${isLocked ? 'bg-slate-100 grayscale' : topic.color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${isLocked ? 'text-slate-500' : topic.color}`} />
        </div>
        <h3 className={`mb-2 text-xl font-bold ${isLocked ? 'text-slate-600' : 'text-slate-800'}`}>{topic.title}</h3>
        <p className="text-sm text-slate-500">{topic.description}</p>
      </div>
      
      {isLocked && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
             <Lock size={14} /> Unlock Access
           </div>
        </div>
      )}
      
      {!isLocked && (
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-500 to-bengal-green transition-all duration-300 group-hover:w-full" />
      )}
    </button>
  );
};
