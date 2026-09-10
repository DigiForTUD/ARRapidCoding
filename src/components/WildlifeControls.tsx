import React from 'react';
import {
  Anchor,
  Utensils,
  Music,
  Users,
  TreePine,
  Layers,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { DuckSpeciesId } from '../types';
import { DUCK_SPECIES } from '../data/speciesData';

interface WildlifeControlsProps {
  hasLake: boolean;
  hasForest: boolean;
  selectedSpecies: DuckSpeciesId | 'all';
  duckCount: number;
  showForestWildlife: boolean;
  onSelectSpecies: (species: DuckSpeciesId | 'all') => void;
  onChangeDuckCount: (count: number) => void;
  onToggleForestWildlife: () => void;
  onDive: () => void;
  onFeed: () => void;
  onDuckCall: () => void;
  onForestCall: () => void;
}

export const WildlifeControls: React.FC<WildlifeControlsProps> = ({
  hasLake,
  hasForest,
  selectedSpecies,
  duckCount,
  showForestWildlife,
  onSelectSpecies,
  onChangeDuckCount,
  onToggleForestWildlife,
  onDive,
  onFeed,
  onDuckCall,
  onForestCall,
}) => {
  if (!hasLake && !hasForest) return null;

  const speciesList: { id: DuckSpeciesId | 'all'; label: string; badge: string; color: string }[] = [
    { id: 'all', label: 'All 5 Species', badge: 'Flock', color: 'border-amber-400/50 bg-amber-500/20 text-amber-200' },
    { id: 'pochard', label: 'Pochard', badge: 'Diving', color: 'border-rose-400/50 bg-rose-500/20 text-rose-200' },
    { id: 'mallard', label: 'Mallard', badge: 'Dabbling', color: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200' },
    { id: 'mandarin', label: 'Mandarin', badge: 'Perching', color: 'border-orange-400/50 bg-orange-500/20 text-orange-200' },
    { id: 'teal', label: 'Eurasian Teal', badge: 'Mini', color: 'border-teal-400/50 bg-teal-500/20 text-teal-200' },
    { id: 'tufted', label: 'Tufted Duck', badge: 'Tufted', color: 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200' },
  ];

  return (
    <div className="absolute bottom-3 inset-x-0 z-30 flex flex-col items-center gap-2 px-3 sm:px-4 pointer-events-auto max-w-2xl mx-auto">
      {/* 1. Species Selector Pill Row (when lake is present) */}
      {hasLake && (
        <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-xl scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 pr-1 shrink-0">
            Species:
          </span>
          {speciesList.map((sp) => {
            const isSelected = selectedSpecies === sp.id;
            return (
              <button
                key={sp.id}
                id={`btn-species-${sp.id}`}
                onClick={() => onSelectSpecies(sp.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${sp.color} shadow-sm ring-1 ring-white/30 scale-100`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{sp.label}</span>
                <span className="text-[9px] opacity-75 font-mono px-1 py-0.2 rounded bg-black/30">
                  {sp.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Action Dock */}
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-1.5 sm:gap-2 w-full justify-between overflow-x-auto">
        {/* Action: Dive / Up-End */}
        {hasLake && (
          <button
            id="btn-action-dive"
            onClick={onDive}
            className="flex-1 min-w-[56px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
            title="Trigger diving or up-ending dabble"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 group-hover:scale-105 transition-transform">
              <Anchor className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200">
              {selectedSpecies === 'mallard' ? 'Up-end' : 'Dive'}
            </span>
          </button>
        )}

        {/* Action: Feed */}
        {hasLake && (
          <button
            id="btn-action-feed"
            onClick={onFeed}
            className="flex-1 min-w-[56px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
            title="Toss breadcrumbs onto the lake"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:scale-105 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200">Feed</span>
          </button>
        )}

        {/* Action: Duck Call */}
        {hasLake && (
          <button
            id="btn-action-duck-call"
            onClick={onDuckCall}
            className="flex-1 min-w-[56px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
            title="Make species quack or whistle call"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 group-hover:scale-105 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-200">Call</span>
          </button>
        )}

        {/* Forest Wildlife Action: Elk & Roe Deer Call */}
        {hasForest && (
          <button
            id="btn-action-forest-call"
            onClick={onForestCall}
            className="flex-1 min-w-[62px] flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all text-white group"
            title="Call European Elk or rustle foliage for Roe Deer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600/25 text-emerald-300 flex items-center justify-center border border-emerald-400/40 group-hover:scale-105 transition-transform">
              <TreePine className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-emerald-200">Elk / Deer</span>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-white/15 mx-0.5" />

        {/* Flock Count toggle */}
        {hasLake && (
          <button
            id="btn-toggle-duck-count"
            onClick={() => onChangeDuckCount(duckCount === 1 ? 2 : duckCount === 2 ? 4 : duckCount === 4 ? 6 : 1)}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 text-xs font-medium transition-all shrink-0"
            title={`Flock size: currently ${duckCount} duck${duckCount > 1 ? 's' : ''}. Tap to cycle.`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>{duckCount}x</span>
          </button>
        )}
      </div>
    </div>
  );
};
