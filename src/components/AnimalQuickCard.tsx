import React from 'react';
import { Volume2, BookOpen, X, Sparkles, Sun, Snowflake } from 'lucide-react';
import { AnimalSpeciesTarget, Season } from '../types';
import { DUCK_SPECIES, FOREST_WILDLIFE_INFO } from '../data/speciesData';
import {
  playPochardCall,
  playMallardQuack,
  playMandarinCall,
  playTealCall,
  playTuftedDuckCall,
  playElkCall,
  playRoeDeerCall,
} from '../utils/audio';

interface AnimalQuickCardProps {
  target: AnimalSpeciesTarget | null;
  season: Season;
  onOpenFullInfo: () => void;
  onDismiss: () => void;
}

export const AnimalQuickCard: React.FC<AnimalQuickCardProps> = ({
  target,
  season,
  onOpenFullInfo,
  onDismiss,
}) => {
  if (!target) return null;

  const isDuck = target.category === 'duck';
  const duckInfo = isDuck ? DUCK_SPECIES[target.speciesId as keyof typeof DUCK_SPECIES] : null;
  const forestInfo = !isDuck ? FOREST_WILDLIFE_INFO[target.speciesId as keyof typeof FOREST_WILDLIFE_INFO] : null;

  const commonName = duckInfo ? duckInfo.commonName : forestInfo ? forestInfo.commonName : target.name;
  const scientificName = duckInfo ? duckInfo.scientificName : forestInfo ? forestInfo.scientificName : '';
  const subtitle = duckInfo ? duckInfo.category : forestInfo ? forestInfo.family : '';
  const seasonalNote = season === 'winter'
    ? (duckInfo?.winterTraits || forestInfo?.winterTraits || '')
    : (duckInfo?.summerTraits || forestInfo?.summerTraits || '');

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDuck) {
      switch (target.speciesId) {
        case 'pochard':
          playPochardCall('male_whistle');
          break;
        case 'mallard':
          playMallardQuack();
          break;
        case 'mandarin':
          playMandarinCall();
          break;
        case 'teal':
          playTealCall();
          break;
        case 'tufted':
          playTuftedDuckCall();
          break;
      }
    } else {
      if (target.speciesId === 'elk') {
        playElkCall();
      } else {
        playRoeDeerCall();
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl text-white max-w-sm w-full mx-auto flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isDuck ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                {isDuck ? 'Waterfowl' : 'Forest Wildlife'}
              </span>
              <span className="text-[10px] text-slate-400">{subtitle}</span>
            </div>
            <h4 className="text-sm font-bold text-white truncate mt-0.5">{commonName}</h4>
            <p className="text-[11px] italic text-sky-300/80 font-serif truncate">{scientificName}</p>
          </div>

          <button
            id="btn-dismiss-quick-card"
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seasonal quick tip */}
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 flex items-start gap-1.5">
          {season === 'winter' ? (
            <Snowflake className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <p className="line-clamp-2 leading-relaxed">
            <strong className={season === 'winter' ? 'text-sky-300' : 'text-amber-300'}>
              {season === 'winter' ? 'Winter Habit: ' : 'Summer Habit: '}
            </strong>
            {seasonalNote}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            id="btn-quick-play-audio"
            onClick={handlePlayAudio}
            className="flex-1 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-amber-300"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Play Call</span>
          </button>

          <button
            id="btn-quick-open-full-info"
            onClick={onOpenFullInfo}
            className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 border border-sky-400/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-white shadow-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Species Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};
