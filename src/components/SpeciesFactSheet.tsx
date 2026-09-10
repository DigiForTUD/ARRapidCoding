import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  Eye,
  TreePine,
  Waves,
  Sun,
  Snowflake,
  Utensils,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { DUCK_SPECIES, FOREST_WILDLIFE_INFO } from '../data/speciesData';
import { DuckSpeciesId, ForestAnimalType, Season } from '../types';
import {
  playPochardCall,
  playMallardQuack,
  playMandarinCall,
  playTealCall,
  playTuftedDuckCall,
  playElkCall,
  playRoeDeerCall,
} from '../utils/audio';

interface SpeciesFactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'waterfowl' | 'forest';
  initialSpecies?: DuckSpeciesId | ForestAnimalType;
  activeSeason?: Season;
}

export const SpeciesFactSheet: React.FC<SpeciesFactSheetProps> = ({
  isOpen,
  onClose,
  initialCategory = 'waterfowl',
  initialSpecies = 'pochard',
  activeSeason = 'summer',
}) => {
  const [activeTab, setActiveTab] = useState<'waterfowl' | 'forest'>(initialCategory);
  const [selectedDuck, setSelectedDuck] = useState<DuckSpeciesId>('pochard');
  const [selectedForest, setSelectedForest] = useState<ForestAnimalType>('elk');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync state when opened with an active animal
  useEffect(() => {
    if (isOpen) {
      if (initialCategory === 'forest') {
        setActiveTab('forest');
        if (initialSpecies === 'elk' || initialSpecies === 'roe_deer') {
          setSelectedForest(initialSpecies);
        }
      } else {
        setActiveTab('waterfowl');
        if (
          initialSpecies === 'pochard' ||
          initialSpecies === 'mallard' ||
          initialSpecies === 'mandarin' ||
          initialSpecies === 'teal' ||
          initialSpecies === 'tufted'
        ) {
          setSelectedDuck(initialSpecies);
        }
      }
    }
  }, [isOpen, initialCategory, initialSpecies]);

  if (!isOpen) return null;

  const currentDuck = DUCK_SPECIES[selectedDuck];
  const currentForest = FOREST_WILDLIFE_INFO[selectedForest];

  const handlePlayDuckAudio = () => {
    setIsPlayingAudio(true);
    switch (selectedDuck) {
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
    setTimeout(() => setIsPlayingAudio(false), 800);
  };

  const handlePlayForestAudio = () => {
    setIsPlayingAudio(true);
    if (selectedForest === 'elk') {
      playElkCall();
    } else {
      playRoeDeerCall();
    }
    setTimeout(() => setIsPlayingAudio(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-semibold uppercase tracking-wider">
                AR Wildlife Field Guide
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-semibold">
                {activeSeason === 'winter' ? (
                  <>
                    <Snowflake className="w-3 h-3 text-sky-300" />
                    <span>Winter Season Active</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-300" />
                    <span>Summer Season Active</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">Species Information & Ecology</h2>
          </div>
          <button
            id="btn-close-species-factsheet"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Waterfowl vs Forest Wildlife */}
        <div className="flex items-center gap-2 pt-3 pb-2">
          <button
            id="btn-tab-waterfowl"
            onClick={() => setActiveTab('waterfowl')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'waterfowl'
                ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>5 Lake Duck Species</span>
          </button>
          <button
            id="btn-tab-forest"
            onClick={() => setActiveTab('forest')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'forest'
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span>Forest: Elk & Roe Deer</span>
          </button>
        </div>

        {/* Tab 1: Waterfowl Species */}
        {activeTab === 'waterfowl' && (
          <div className="overflow-y-auto pr-1 flex-1 space-y-3 pt-1 scrollbar-thin">
            {/* Horizontal Duck Species Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(Object.keys(DUCK_SPECIES) as DuckSpeciesId[]).map((spKey) => {
                const sp = DUCK_SPECIES[spKey];
                const isSelected = selectedDuck === spKey;
                return (
                  <button
                    key={spKey}
                    id={`btn-guide-species-${spKey}`}
                    onClick={() => setSelectedDuck(spKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-white/20 border-white text-white font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sp.commonName}
                  </button>
                );
              })}
            </div>

            {/* Active Duck Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {currentDuck.commonName}
                    <button
                      id="btn-play-duck-vocalization"
                      onClick={handlePlayDuckAudio}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] transition-all ${
                        isPlayingAudio
                          ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                          : 'bg-white/10 text-amber-300 border-white/10 hover:bg-white/20'
                      }`}
                      title="Play species vocalization"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>
                  </h3>
                  <p className="text-xs italic text-sky-300 font-serif">{currentDuck.scientificName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-400/40 text-sky-200 text-[10px] font-semibold">
                  {currentDuck.category}
                </span>
              </div>

              {/* Visual Plumage Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <span className="text-[11px] font-bold text-sky-300">Drake (Male) Plumage</span>
                  <p className="text-slate-300 text-[11px]">{currentDuck.maleColorSummary}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <span className="text-[11px] font-bold text-amber-300">Hen (Female) Plumage</span>
                  <p className="text-slate-300 text-[11px]">{currentDuck.femaleColorSummary}</p>
                </div>
              </div>

              {/* Distinguishing traits */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  Key Field Marks
                </p>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-sky-400">
                  {currentDuck.distinguishingFeatures.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>

              {/* Seasonal Adaptations (Summer vs Winter) */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Seasonal Behaviors & Adaptations
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> Summer
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{currentDuck.summerTraits}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                      <Snowflake className="w-3 h-3" /> Winter
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{currentDuck.winterTraits}</p>
                  </div>
                </div>
              </div>

              {/* Diet & Ecology */}
              <div className="flex flex-col sm:flex-row gap-2 text-[11px]">
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Diet:</strong>{' '}
                    <span className="text-slate-300">{currentDuck.diet}</span>
                  </div>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Status:</strong>{' '}
                    <span className="text-slate-300">{currentDuck.conservationStatus}</span>
                  </div>
                </div>
              </div>

              {/* Behavior & Animation */}
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1 text-xs">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Signature AR Animation
                </p>
                <p className="text-slate-300">{currentDuck.uniqueAnimation}</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  <strong>Swimming Style:</strong> {currentDuck.swimmingStyle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Forest Wildlife (Elk & Roe Deer) */}
        {activeTab === 'forest' && (
          <div className="overflow-y-auto pr-1 flex-1 space-y-3 pt-1 scrollbar-thin">
            {/* Horizontal Forest Selector */}
            <div className="flex items-center gap-1.5 pb-1">
              <button
                id="btn-guide-elk"
                onClick={() => setSelectedForest('elk')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedForest === 'elk'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                European Elk / Moose
              </button>
              <button
                id="btn-guide-roe-deer"
                onClick={() => setSelectedForest('roe_deer')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  selectedForest === 'roe_deer'
                    ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                European Roe Deer
              </button>
            </div>

            {/* Forest Animal Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {currentForest.commonName}
                    <button
                      id="btn-play-forest-vocalization"
                      onClick={handlePlayForestAudio}
                      className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse'
                          : 'bg-white/10 text-emerald-300 border-white/10 hover:bg-white/20'
                      }`}
                      title="Play forest call"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>
                  </h3>
                  <p className="text-xs italic text-emerald-300 font-serif">
                    {currentForest.scientificName}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-[10px] font-semibold">
                  {currentForest.family}
                </span>
              </div>

              {/* Distinguishing Features */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Key Field Marks
                </p>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-emerald-400">
                  {currentForest.distinguishingFeatures.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>

              {/* Seasonal Adaptations (Summer vs Winter Pelage) */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Seasonal Adaptations & Pelage
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> Summer
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{currentForest.summerTraits}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                      <Snowflake className="w-3 h-3" /> Winter
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{currentForest.winterTraits}</p>
                  </div>
                </div>
              </div>

              {/* Diet & Habitat */}
              <div className="flex flex-col sm:flex-row gap-2 text-[11px]">
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Diet:</strong>{' '}
                    <span className="text-slate-300">{currentForest.diet}</span>
                  </div>
                </div>
                <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Status:</strong>{' '}
                    <span className="text-slate-300">{currentForest.conservationStatus}</span>
                  </div>
                </div>
              </div>

              {/* Forest Behavior */}
              <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
                <strong className="text-emerald-300">Forest Behavior:</strong>{' '}
                {currentForest.behavior}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 mt-2 flex justify-end">
          <button
            id="btn-close-factsheet-bottom"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            Close Field Guide
          </button>
        </div>
      </div>
    </div>
  );
};
