import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Check, Compass, Waves, TreePine } from 'lucide-react';
import { HABITAT_PRESETS } from '../data/lakePresets';
import { HabitatPreset } from '../types';

interface LakePresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: HabitatPreset | null;
  onSelectPreset: (preset: HabitatPreset) => void;
  onSelectLiveCamera: () => void;
  onCustomImageUpload: (dataUrl: string, name: string) => void;
}

export const LakePresetSelector: React.FC<LakePresetSelectorProps> = ({
  isOpen,
  onClose,
  activePreset,
  onSelectPreset,
  onSelectLiveCamera,
  onCustomImageUpload,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'lake' | 'forest'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCustomImageUpload(dataUrl, file.name);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredPresets = HABITAT_PRESETS.filter((p) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'lake') return p.hasLake;
    if (categoryFilter === 'forest') return p.hasForest;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              Choose Habitat Scenery
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience lakes for swimming duck species and forests for European Elks and Roe Deer
            </p>
          </div>
          <button
            id="btn-close-lake-presets"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: Live Camera or Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3">
          <button
            id="btn-select-live-camera-option"
            onClick={() => {
              onSelectLiveCamera();
              onClose();
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all text-left ${
              !activePreset
                ? 'bg-sky-600/20 border-sky-400 text-sky-200 ring-1 ring-sky-400/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">Live Camera Stream</p>
              <p className="text-[11px] text-slate-400">Scan lakes & forests in real time</p>
            </div>
          </button>

          <button
            id="btn-upload-lake-photo"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">Upload Photo</p>
              <p className="text-[11px] text-slate-400">Detect water & trees in your photo</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 pb-2">
          <button
            id="btn-filter-habitat-all"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
              categoryFilter === 'all'
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            All Habitats
          </button>
          <button
            id="btn-filter-habitat-lake"
            onClick={() => setCategoryFilter('lake')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              categoryFilter === 'lake'
                ? 'bg-sky-600/30 border-sky-400 text-sky-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Lakes (5 Ducks)</span>
          </button>
          <button
            id="btn-filter-habitat-forest"
            onClick={() => setCategoryFilter('forest')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              categoryFilter === 'forest'
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>Forests (Elk & Roe Deer)</span>
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPresets.map((preset) => {
              const isSelected = activePreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-400 ring-2 ring-sky-400/40'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="h-32 w-full relative">
                    <img
                      src={preset.thumbnailUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                    
                    {/* Habitat tags */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {preset.hasLake && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-400/40 text-[10px] text-sky-200 font-semibold flex items-center gap-1">
                          <Waves className="w-3 h-3" />
                          Lake
                        </span>
                      )}
                      {preset.hasForest && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-[10px] text-emerald-200 font-semibold flex items-center gap-1">
                          <TreePine className="w-3 h-3" />
                          Forest
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-sm font-bold text-white drop-shadow">
                        {preset.name}
                      </p>
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        {preset.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 mt-2 flex justify-end">
          <button
            id="btn-lake-modal-done"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
