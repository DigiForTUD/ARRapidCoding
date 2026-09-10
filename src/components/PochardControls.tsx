import React from 'react';
import { Anchor, Utensils, Music, Users, Palette } from 'lucide-react';
import { PochardPlumage } from '../types';

interface PochardControlsProps {
  hasLake: boolean;
  duckCount: number;
  plumage: PochardPlumage;
  onDive: () => void;
  onFeed: () => void;
  onCall: () => void;
  onChangePlumage: (p: PochardPlumage) => void;
  onChangeDuckCount: (count: number) => void;
}

export const PochardControls: React.FC<PochardControlsProps> = ({
  hasLake,
  duckCount,
  plumage,
  onDive,
  onFeed,
  onCall,
  onChangePlumage,
  onChangeDuckCount,
}) => {
  if (!hasLake) return null;

  return (
    <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-1.5 sm:gap-2 max-w-xl w-full justify-between overflow-x-auto">
        {/* Quick Action: Dive */}
        <button
          id="btn-action-dive"
          onClick={onDive}
          className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
          title="Trigger authentic underwater tip-up dive"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 group-hover:scale-105 transition-transform">
            <Anchor className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-200">Dive</span>
        </button>

        {/* Quick Action: Feed */}
        <button
          id="btn-action-feed"
          onClick={onFeed}
          className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
          title="Toss breadcrumbs onto the lake"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:scale-105 transition-transform">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-200">Feed</span>
        </button>

        {/* Quick Action: Call / Quack */}
        <button
          id="btn-action-call"
          onClick={onCall}
          className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
          title="Make authentic Pochard whistle/croak call"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 group-hover:scale-105 transition-transform">
            <Music className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-200">Call</span>
        </button>

        <div className="w-px h-8 bg-white/15 mx-0.5" />

        {/* Plumage Variant Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            id="btn-plumage-male"
            onClick={() => onChangePlumage('common_male')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
              plumage === 'common_male'
                ? 'bg-rose-700/80 text-white shadow-sm border border-rose-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Male Common Pochard (Chestnut head, silver flanks)"
          >
            Male
          </button>
          <button
            id="btn-plumage-female"
            onClick={() => onChangePlumage('common_female')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
              plumage === 'common_female'
                ? 'bg-amber-800/80 text-white shadow-sm border border-amber-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Female Common Pochard (Mottled brown)"
          >
            Female
          </button>
          <button
            id="btn-plumage-red-crested"
            onClick={() => onChangePlumage('red_crested')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
              plumage === 'red_crested'
                ? 'bg-orange-600/80 text-white shadow-sm border border-orange-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Red-crested Pochard (Orange crest, red bill)"
          >
            Red-Crested
          </button>
        </div>

        {/* Flock Count toggle */}
        <button
          id="btn-toggle-duck-count"
          onClick={() => onChangeDuckCount(duckCount === 1 ? 2 : duckCount === 2 ? 3 : 1)}
          className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 text-xs font-medium transition-all"
          title={`Currently ${duckCount} duck${duckCount > 1 ? 's' : ''}. Tap to toggle flock size.`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>{duckCount}x</span>
        </button>
      </div>
    </div>
  );
};
