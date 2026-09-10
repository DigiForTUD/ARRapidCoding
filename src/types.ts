export interface NormalizedRect {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export type DuckSpeciesId = 'pochard' | 'mallard' | 'mandarin' | 'teal' | 'tufted';

export type Season = 'summer' | 'winter';

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'fog' | 'wildfire' | 'flood';

export interface AnimalSpeciesTarget {
  category: 'duck' | 'forest';
  speciesId: DuckSpeciesId | ForestAnimalType;
  name: string;
  gender?: 'male' | 'female';
}

export interface DuckSpeciesInfo {
  id: DuckSpeciesId;
  commonName: string;
  scientificName: string;
  category: 'Diving Duck' | 'Dabbling Duck' | 'Perching Duck';
  distinguishingFeatures: string[];
  swimmingStyle: string;
  uniqueAnimation: string;
  quackAudio: 'pochard_whistle' | 'mallard_quack' | 'mandarin_cluck' | 'teal_piping' | 'tufted_chirp';
  maleColorSummary: string;
  femaleColorSummary: string;
  summerTraits: string;
  winterTraits: string;
  diet: string;
  habitatInfo: string;
  conservationStatus: string;
}

export type DuckBehavior =
  | 'swimming'
  | 'paddling'
  | 'diving'
  | 'submerged'
  | 'resurfacing'
  | 'dabbling'
  | 'up_ending'
  | 'eating'
  | 'displaying';

export interface DuckEntity {
  id: string;
  species: DuckSpeciesId;
  gender: 'male' | 'female';
  name: string;
  x: number; // 0..1 normalized
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  angle: number; // radians
  scale: number;
  behavior: DuckBehavior;
  behaviorTimer: number;
  swimSpeed: number;
  paddlePhase: number;
  bobPhase: number;
  diveDepth: number; // 0 (surface) to 1 (submerged)
  featureAnimationPhase: number; // For Tufted crest or Mandarin sails
}

export type ForestAnimalType = 'elk' | 'roe_deer';

export type ForestAnimalBehavior =
  | 'grazing'
  | 'browsing'
  | 'walking'
  | 'alert'
  | 'chewing';

export interface ForestAnimalEntity {
  id: string;
  type: ForestAnimalType;
  name: string;
  gender: 'male' | 'female';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
  scale: number;
  behavior: ForestAnimalBehavior;
  behaviorTimer: number;
  walkPhase: number;
  headTilt: number;
  earFlick: number;
  chewPhase: number;
  moveSpeed: number;
}

export interface HabitatDetectionResult {
  hasLake: boolean;
  hasForest: boolean;
  confidence: number;
  waterType: string;
  forestType: string;
  description: string;
  waterRegion: NormalizedRect;
  recommendedSwimArea: NormalizedRect;
  forestRegion: NormalizedRect;
  recommendedForestGroundArea: NormalizedRect;
  waterCalmness: 'calm' | 'gentle_ripples' | 'choppy';
  lighting: string;
}

// For backwards compatibility
export type LakeDetectionResult = HabitatDetectionResult;
export type PochardPlumage = 'common_male' | 'common_female' | 'red_crested';
export type PochardEntity = DuckEntity;

export interface WaterRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  aspectRatio: number;
  speed: number;
  color?: string;
}

export interface Breadcrumb {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  life: number;
}

export interface HabitatPreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'lake' | 'forest' | 'forest_lake';
  thumbnailUrl: string;
  image: string;
  winterImage?: string;
  defaultWaterRegion: NormalizedRect;
  defaultSwimArea: NormalizedRect;
  defaultForestRegion: NormalizedRect;
  defaultForestGroundArea: NormalizedRect;
  hasLake: boolean;
  hasForest: boolean;
  description: string;
}

export type LakePreset = HabitatPreset;
