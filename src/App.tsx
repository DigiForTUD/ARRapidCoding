/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { CameraStream } from './components/CameraStream';
import { ArCanvas } from './components/ArCanvas';
import { DetectionHud } from './components/DetectionHud';
import { WildlifeControls } from './components/WildlifeControls';
import { LakePresetSelector } from './components/LakePresetSelector';
import { SpeciesFactSheet } from './components/SpeciesFactSheet';
import { WeatherSeasonControls } from './components/WeatherSeasonControls';
import { AnimalQuickCard } from './components/AnimalQuickCard';
import { HABITAT_PRESETS } from './data/lakePresets';
import {
  HabitatDetectionResult,
  HabitatPreset,
  DuckSpeciesId,
  Season,
  WeatherCondition,
  AnimalSpeciesTarget,
  DuckEntity,
  ForestAnimalEntity,
  ForestAnimalType,
} from './types';
import {
  playPochardCall,
  playMallardQuack,
  playMandarinCall,
  playTealCall,
  playTuftedDuckCall,
  playElkCall,
  playRoeDeerCall,
  playWaterSplash,
  playWaterPlop,
  playFoliageRustle,
  setSoundMuted,
} from './utils/audio';

export default function App() {
  // Initial habitat preset: Taiga Lake Shore (has both swimming ducks and shoreline forest wildlife!)
  const initialPreset = HABITAT_PRESETS[0];

  const [activePreset, setActivePreset] = useState<HabitatPreset | null>(initialPreset);
  const [detection, setDetection] = useState<HabitatDetectionResult | null>({
    hasLake: true,
    hasForest: true,
    confidence: 0.96,
    waterType: 'lake',
    forestType: 'pine_taiga',
    description: 'Boreal wilderness lake with swimming waterfowl and pine forest shoreline where elks and roe deer browse',
    waterRegion: initialPreset.defaultWaterRegion,
    recommendedSwimArea: initialPreset.defaultSwimArea,
    forestRegion: initialPreset.defaultForestRegion,
    recommendedForestGroundArea: initialPreset.defaultForestGroundArea,
    waterCalmness: 'gentle_ripples',
    lighting: 'bright_sun',
  });

  const [hasLake, setHasLake] = useState<boolean>(true);
  const [hasForest, setHasForest] = useState<boolean>(true);
  const [showForestWildlife, setShowForestWildlife] = useState<boolean>(true);

  // Environmental Controls (Season & Weather)
  const [season, setSeason] = useState<Season>('summer');
  const [weather, setWeather] = useState<WeatherCondition>('clear');

  // Waterfowl simulation state
  const [selectedSpecies, setSelectedSpecies] = useState<DuckSpeciesId | 'all'>('all');
  const [duckCount, setDuckCount] = useState<number>(3); // 3 ducks swimming together by default

  // Animal Interaction & Quick Inspection Card
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalSpeciesTarget | null>(null);
  const [infoModalInitial, setInfoModalInitial] = useState<{
    category: 'waterfowl' | 'forest';
    species: DuckSpeciesId | ForestAnimalType;
  }>({
    category: 'waterfowl',
    species: 'pochard',
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isScanningFrame, setIsScanningFrame] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Dialogs
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Sound mute toggle
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  }, []);

  // Frame analyzer callback from CameraStream
  const handleAnalyzeFrame = useCallback(async (base64Image: string) => {
    setIsScanningFrame(false);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/detect-lake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: HabitatDetectionResult = await response.json();
      setDetection(data);
      setHasLake(Boolean(data.hasLake && data.confidence >= 0.4));
      setHasForest(Boolean(data.hasForest && data.confidence >= 0.4));
    } catch (err) {
      console.warn('Habitat detection error, maintaining current state:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const triggerScan = useCallback(() => {
    setIsScanningFrame(true);
  }, []);

  // Preset selected
  const handleSelectPreset = useCallback((preset: HabitatPreset) => {
    setActivePreset(preset);
    setHasLake(preset.hasLake);
    setHasForest(preset.hasForest);
    setDetection({
      hasLake: preset.hasLake,
      hasForest: preset.hasForest,
      confidence: 0.95,
      waterType: preset.hasLake ? 'lake' : 'none',
      forestType: preset.hasForest ? 'pine_taiga' : 'none',
      description: preset.description,
      waterRegion: preset.defaultWaterRegion,
      recommendedSwimArea: preset.defaultSwimArea,
      forestRegion: preset.defaultForestRegion,
      recommendedForestGroundArea: preset.defaultForestGroundArea,
      waterCalmness: 'gentle_ripples',
      lighting: 'bright_sun',
    });
  }, []);

  // Live camera stream mode
  const handleSelectLiveCamera = useCallback(() => {
    setActivePreset(null);
    setHasLake(false);
    setHasForest(false);
    setDetection(null);
    setTimeout(() => {
      setIsScanningFrame(true);
    }, 1200);
  }, []);

  // Custom photo upload
  const handleCustomImageUpload = useCallback((dataUrl: string, name: string) => {
    const customPreset: HabitatPreset = {
      id: `custom-${Date.now()}`,
      name: name.replace(/\.[^/.]+$/, ''),
      subtitle: 'Uploaded custom scenery photograph',
      category: 'forest_lake',
      thumbnailUrl: dataUrl,
      image: dataUrl,
      defaultWaterRegion: { ymin: 440, xmin: 40, ymax: 950, xmax: 960 },
      defaultSwimArea: { ymin: 520, xmin: 100, ymax: 900, xmax: 900 },
      defaultForestRegion: { ymin: 120, xmin: 30, ymax: 500, xmax: 970 },
      defaultForestGroundArea: { ymin: 340, xmin: 80, ymax: 520, xmax: 920 },
      hasLake: true,
      hasForest: true,
      description: 'Custom photo for wildlife habitat simulation',
    };
    handleSelectPreset(customPreset);
    handleAnalyzeFrame(dataUrl);
  }, [handleAnalyzeFrame, handleSelectPreset]);

  // Action: Dive or Up-end ducks
  const handleTriggerDive = useCallback(() => {
    playWaterSplash(true);
    const canvas = document.getElementById('wildlife-ar-canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const event = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.72,
        bubbles: true,
      });
      canvas.dispatchEvent(event);
    }
  }, []);

  // Action: Toss breadcrumbs on water
  const handleTriggerFeed = useCallback(() => {
    playWaterPlop();
    const canvas = document.getElementById('wildlife-ar-canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const event = new MouseEvent('click', {
        clientX: rect.left + rect.width * (0.35 + Math.random() * 0.3),
        clientY: rect.top + rect.height * (0.62 + Math.random() * 0.18),
        bubbles: true,
      });
      canvas.dispatchEvent(event);
    }
  }, []);

  // Action: Duck vocalization call
  const handleTriggerDuckCall = useCallback(() => {
    if (selectedSpecies === 'pochard') playPochardCall('male_whistle');
    else if (selectedSpecies === 'mallard') playMallardQuack();
    else if (selectedSpecies === 'mandarin') playMandarinCall();
    else if (selectedSpecies === 'teal') playTealCall();
    else if (selectedSpecies === 'tufted') playTuftedDuckCall();
    else {
      // Mixed flock call
      const randomCall = [playMallardQuack, playPochardCall, playMandarinCall, playTealCall, playTuftedDuckCall];
      randomCall[Math.floor(Math.random() * randomCall.length)]();
    }
  }, [selectedSpecies]);

  // Action: Forest animal call / foliage rustle
  const handleTriggerForestCall = useCallback(() => {
    playFoliageRustle();
    if (Math.random() < 0.5) {
      playElkCall();
    } else {
      playRoeDeerCall();
    }
  }, []);

  // Animal Interaction: Click duck on canvas
  const handleDuckTapped = useCallback((duck: DuckEntity) => {
    const target: AnimalSpeciesTarget = {
      category: 'duck',
      speciesId: duck.species,
      name: duck.name,
    };
    setSelectedAnimal(target);
    setInfoModalInitial({
      category: 'waterfowl',
      species: duck.species,
    });
  }, []);

  // Animal Interaction: Click Elk or Roe Deer on canvas
  const handleAnimalTapped = useCallback((animal: ForestAnimalEntity) => {
    const target: AnimalSpeciesTarget = {
      category: 'forest',
      speciesId: animal.type,
      name: animal.name,
    };
    setSelectedAnimal(target);
    setInfoModalInitial({
      category: 'forest',
      species: animal.type,
    });
  }, []);

  return (
    <main
      id="wildlife-ar-safari-app"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none"
    >
      {/* 1. Camera Video Feed / Preset Background */}
      <CameraStream
        onCaptureFrame={handleAnalyzeFrame}
        activePreset={activePreset}
        isScanning={isScanningFrame}
        onClearPreset={handleSelectLiveCamera}
        onRequestPresetModal={() => setShowPresetModal(true)}
        season={season}
        weather={weather}
        forestRegion={detection?.forestRegion || activePreset?.defaultForestRegion || null}
      />

      {/* 2. Interactive AR Canvas: Renders 5 Duck Species in Lake & Elks/Roe Deer in Forest */}
      <ArCanvas
        waterRegion={detection?.waterRegion || activePreset?.defaultWaterRegion || null}
        swimArea={detection?.recommendedSwimArea || activePreset?.defaultSwimArea || null}
        forestRegion={detection?.forestRegion || activePreset?.defaultForestRegion || null}
        forestGroundArea={detection?.recommendedForestGroundArea || activePreset?.defaultForestGroundArea || null}
        hasLake={hasLake}
        hasForest={hasForest}
        selectedSpecies={selectedSpecies}
        duckCount={duckCount}
        showForestWildlife={showForestWildlife}
        season={season}
        weather={weather}
        onDuckTapped={handleDuckTapped}
        onAnimalTapped={handleAnimalTapped}
      />

      {/* 3. Top Weather & Season Environmental Bar */}
      <div className="absolute top-16 sm:top-20 inset-x-0 z-20 flex justify-center px-3 pointer-events-auto">
        <WeatherSeasonControls
          season={season}
          weather={weather}
          onSeasonChange={setSeason}
          onWeatherChange={setWeather}
        />
      </div>

      {/* 4. AR Head-Up Display: Status badges, habitat boundaries & scan controls */}
      <DetectionHud
        detection={detection}
        isAnalyzing={isAnalyzing}
        waterRegion={detection?.waterRegion || null}
        forestRegion={detection?.forestRegion || null}
        hasLake={hasLake}
        hasForest={hasForest}
        showForestWildlife={showForestWildlife}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerScan={triggerScan}
        onOpenPresets={() => setShowPresetModal(true)}
        onOpenInfo={() => setShowInfoModal(true)}
        onToggleForestWildlife={() => setShowForestWildlife((prev) => !prev)}
      />

      {/* 5. Tapped Animal Quick Fact Card (Floats directly above bottom dock) */}
      {selectedAnimal && (
        <div className="absolute bottom-36 sm:bottom-40 inset-x-0 z-30 flex justify-center px-3 pointer-events-auto">
          <AnimalQuickCard
            target={selectedAnimal}
            season={season}
            onOpenFullInfo={() => {
              setShowInfoModal(true);
            }}
            onDismiss={() => setSelectedAnimal(null)}
          />
        </div>
      )}

      {/* 6. Bottom AR Dock: 5 Duck Species Selector, Elks & Roe Deer, Diving, Feeding, Calling */}
      <WildlifeControls
        hasLake={hasLake}
        hasForest={hasForest}
        selectedSpecies={selectedSpecies}
        duckCount={duckCount}
        showForestWildlife={showForestWildlife}
        onSelectSpecies={setSelectedSpecies}
        onChangeDuckCount={setDuckCount}
        onToggleForestWildlife={() => setShowForestWildlife((prev) => !prev)}
        onDive={handleTriggerDive}
        onFeed={handleTriggerFeed}
        onDuckCall={handleTriggerDuckCall}
        onForestCall={handleTriggerForestCall}
      />

      {/* 7. Habitat Scenery Picker Modal (Lakes & Forests) */}
      <LakePresetSelector
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onSelectLiveCamera={handleSelectLiveCamera}
        onCustomImageUpload={handleCustomImageUpload}
      />

      {/* 8. Species Field Guide (5 Duck Species + Elks & Roe Deer) */}
      <SpeciesFactSheet
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        activeSeason={season}
        initialCategory={infoModalInitial.category}
        initialSpecies={infoModalInitial.species}
      />
    </main>
  );
}
