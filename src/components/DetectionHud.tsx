import React from 'react';
import {
  Waves,
  TreePine,
  Scan,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { HabitatDetectionResult, NormalizedRect } from '../types';

interface DetectionHudProps {
  detection: HabitatDetectionResult | null;
  isAnalyzing: boolean;
  waterRegion: NormalizedRect | null;
  forestRegion: NormalizedRect | null;
  hasLake: boolean;
  hasForest: boolean;
  showForestWildlife: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerScan: () => void;
  onOpenPresets: () => void;
  onOpenInfo: () => void;
  onToggleForestWildlife: () => void;
}

export const DetectionHud: React.FC<DetectionHudProps> = ({
  detection,
  isAnalyzing,
  waterRegion,
  forestRegion,
  hasLake,
  hasForest,
  showForestWildlife,
  isMuted,
  onToggleMute,
  onTriggerScan,
  onOpenPresets,
  onOpenInfo,
  onToggleForestWildlife,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      {/* --- Top Bar: Brand, Status Badge & Quick Actions --- */}
      <div className="flex items-start justify-between gap-2.5 pointer-events-auto">
        {/* Brand & AR Status */}
        <div className="flex flex-col gap-1.5 max-w-[72%]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-md flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    hasLake || hasForest ? 'bg-emerald-400' : isAnalyzing ? 'bg-amber-400' : 'bg-sky-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    hasLake || hasForest ? 'bg-emerald-500' : isAnalyzing ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                />
              </span>
              <span className="text-xs font-semibold tracking-wide text-white">
                Wild AR Safari
              </span>
            </div>

            {hasLake && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[11px] font-medium">
                <Waves className="w-3.5 h-3.5 text-sky-300" />
                Lake Active
              </span>
            )}

            {hasForest && (
              <button
                id="btn-toggle-forest-habitat"
                onClick={onToggleForestWildlife}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  showForestWildlife
                    ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/5 border-white/15 text-slate-400 hover:text-white'
                }`}
                title="Toggle Elks and Roe Deer in forest"
              >
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showForestWildlife ? 'Forest: Elk & Roe Deer' : 'Forest Wildlife Off'}</span>
              </button>
            )}
          </div>

          {/* Detection summary banner */}
          {(hasLake || hasForest) && detection && (
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white/90 text-xs shadow-lg animate-in fade-in duration-300">
              <p className="font-medium text-sky-200 line-clamp-1">
                {detection.description || 'Habitat surface detected'}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-300 flex-wrap">
                {hasLake && (
                  <span className="capitalize">
                    Water: <strong className="text-white">{detection.waterType || 'Lake'}</strong>
                  </span>
                )}
                {hasLake && hasForest && <span>•</span>}
                {hasForest && (
                  <span className="capitalize">
                    Forest: <strong className="text-emerald-300">{detection.forestType?.replace(/_/g, ' ') || 'Woodland'}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {!hasLake && !hasForest && !isAnalyzing && (
            <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white/90 text-xs shadow-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Point camera at a lake, pond, or forest clearing</span>
            </div>
          )}
        </div>

        {/* Action icons right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md border border-white/15 text-white/90 shadow-md transition-all active:scale-95"
            title={isMuted ? 'Unmute wildlife calls' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Habitat scenery presets */}
          <button
            id="btn-open-lake-presets"
            onClick={onOpenPresets}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md border border-white/15 text-white/90 shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-medium"
            title="Choose demo habitats (lakes & forests)"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Habitats</span>
          </button>

          {/* Species Field Guide / Fact Sheet */}
          <button
            id="btn-open-species-info"
            onClick={onOpenInfo}
            className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md border border-white/15 text-white/90 shadow-md transition-all active:scale-95"
            title="Field Guide: Ducks & Forest Wildlife"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

      {/* --- Center Scanning Overlay --- */}
      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-44 border-2 border-sky-400/50 rounded-3xl overflow-hidden bg-sky-950/30 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-4 shadow-2xl">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent animate-bounce" />
            <Scan className="w-8 h-8 text-sky-300 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-white tracking-wide">
              Analyzing Habitat
            </p>
            <p className="text-[11px] text-sky-200/80 mt-0.5">
              Detecting lakes for ducks and forests for elks/deer...
            </p>
          </div>
        </div>
      )}

      {/* Water boundary glowing perimeter */}
      {hasLake && waterRegion && (
        <div
          className="absolute border-2 border-dashed border-cyan-400/35 rounded-3xl pointer-events-none transition-all duration-700"
          style={{
            top: `${waterRegion.ymin / 10}%`,
            left: `${waterRegion.xmin / 10}%`,
            width: `${(waterRegion.xmax - waterRegion.xmin) / 10}%`,
            height: `${(waterRegion.ymax - waterRegion.ymin) / 10}%`,
          }}
        >
          <div className="absolute top-2 left-3 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-sm border border-cyan-400/30 text-[10px] text-cyan-200 uppercase tracking-wider font-mono">
            Lake Surface
          </div>
        </div>
      )}

      {/* Forest boundary glowing perimeter */}
      {hasForest && forestRegion && (
        <div
          className="absolute border-2 border-dashed border-emerald-400/30 rounded-3xl pointer-events-none transition-all duration-700"
          style={{
            top: `${forestRegion.ymin / 10}%`,
            left: `${forestRegion.xmin / 10}%`,
            width: `${(forestRegion.xmax - forestRegion.xmin) / 10}%`,
            height: `${(forestRegion.ymax - forestRegion.ymin) / 10}%`,
          }}
        >
          <div className="absolute top-2 right-3 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-sm border border-emerald-400/30 text-[10px] text-emerald-200 uppercase tracking-wider font-mono">
            Forest Tree Line
          </div>
        </div>
      )}

      {/* --- Bottom Hint & Primary Scan Trigger --- */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto pb-28 sm:pb-32">
        {/* Interaction prompt */}
        {(hasLake || (hasForest && showForestWildlife)) && (
          <div className="bg-black/65 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white/90 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {hasLake && hasForest && showForestWildlife
                ? 'Tap water to feed ducks • Tap forest to alert Elk & Roe Deer'
                : hasLake
                ? 'Tap water to toss breadcrumbs for ducks • Tap ducks to interact'
                : 'Tap forest ground to alert Elks & Roe Deer'}
            </span>
          </div>
        )}

        {/* Scan / Re-scan button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-trigger-habitat-scan"
            onClick={onTriggerScan}
            disabled={isAnalyzing}
            className={`px-5 py-2.5 rounded-full backdrop-blur-md font-medium text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-800 text-slate-400 border border-white/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:opacity-90 text-white border border-white/20 active:scale-95 shadow-sky-600/30'
            }`}
          >
            <Scan className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Scanning Environment...' : 'Scan Environment'}</span>
          </button>

          {!hasLake && !hasForest && (
            <button
              id="btn-quick-demo-habitat"
              onClick={onOpenPresets}
              className="px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-sky-300 hover:text-sky-200 text-xs sm:text-sm font-medium border border-sky-400/30 transition-all shadow-md active:scale-95"
            >
              Choose Preset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
