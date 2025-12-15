import React from 'react';
import { TopicDef } from '../types';
import { BookOpen, MapPin, Landmark, FlaskConical, Calculator, Gavel, Atom } from 'lucide-react';

interface TopicCardProps {
  topic: TopicDef;
  onSelect: (topic: TopicDef) => void;
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

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  const Icon = IconMap[topic.iconName] || BookOpen;

  return (
    <button
      onClick={() => onSelect(topic)}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left border border-slate-200 bg-white`}
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={100} className={topic.color} />
      </div>
      
      <div className="relative z-10">
        <div className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 ${topic.color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${topic.color}`} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-800">{topic.title}</h3>
        <p className="text-sm text-slate-500">{topic.description}</p>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-500 to-bengal-green transition-all duration-300 group-hover:w-full" />
    </button>
  );
};