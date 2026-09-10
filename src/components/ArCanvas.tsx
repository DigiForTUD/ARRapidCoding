import React, { useEffect, useRef } from 'react';
import {
  DuckEntity,
  DuckSpeciesId,
  ForestAnimalEntity,
  ForestAnimalType,
  WaterRipple,
  Breadcrumb,
  NormalizedRect,
  Season,
  WeatherCondition,
} from '../types';
import { drawDuck, drawWaterRipples, drawBreadcrumbs } from '../utils/duckRenderer';
import { drawForestAnimal } from '../utils/forestAnimalRenderer';
import { WeatherSystem } from '../utils/weatherRenderer';
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
} from '../utils/audio';

interface ArCanvasProps {
  waterRegion: NormalizedRect | null;
  swimArea: NormalizedRect | null;
  forestRegion: NormalizedRect | null;
  forestGroundArea: NormalizedRect | null;
  hasLake: boolean;
  hasForest: boolean;
  selectedSpecies: DuckSpeciesId | 'all';
  duckCount: number;
  showForestWildlife: boolean;
  season?: Season;
  weather?: WeatherCondition;
  onDuckTapped?: (duck: DuckEntity) => void;
  onAnimalTapped?: (animal: ForestAnimalEntity) => void;
}

export const ArCanvas: React.FC<ArCanvasProps> = ({
  waterRegion,
  swimArea,
  forestRegion,
  forestGroundArea,
  hasLake,
  hasForest,
  selectedSpecies,
  duckCount,
  showForestWildlife,
  season = 'summer',
  weather = 'clear',
  onDuckTapped,
  onAnimalTapped,
}) => {
  const activeSeason: Season = season === 'winter' ? 'winter' : 'summer';
  const seasonRef = useRef<Season>(activeSeason);
  const weatherRef = useRef<WeatherCondition>(weather);

  useEffect(() => {
    seasonRef.current = activeSeason;
    weatherRef.current = weather;
  }, [activeSeason, weather]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ducksRef = useRef<DuckEntity[]>([]);
  const forestAnimalsRef = useRef<ForestAnimalEntity[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const breadcrumbsRef = useRef<Breadcrumb[]>([]);
  const weatherSystemRef = useRef<WeatherSystem>(new WeatherSystem());
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  // Play species-specific call
  const triggerSpeciesAudio = (species: DuckSpeciesId) => {
    switch (species) {
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
  };

  // Synchronize Duck entities
  useEffect(() => {
    const ducks = ducksRef.current;
    const targetCount = hasLake ? duckCount : 0;

    const defaultArea = swimArea || { ymin: 500, xmin: 150, ymax: 900, xmax: 850 };
    const minX = defaultArea.xmin / 1000;
    const maxX = defaultArea.xmax / 1000;
    const minY = defaultArea.ymin / 1000;
    const maxY = defaultArea.ymax / 1000;

    const allSpeciesList: DuckSpeciesId[] = ['pochard', 'mallard', 'mandarin', 'teal', 'tufted'];

    if (ducks.length < targetCount) {
      const toAdd = targetCount - ducks.length;
      for (let i = 0; i < toAdd; i++) {
        const idx = ducks.length;
        const assignedSpecies: DuckSpeciesId =
          selectedSpecies === 'all'
            ? allSpeciesList[idx % allSpeciesList.length]
            : selectedSpecies;

        const sx = minX + Math.random() * (maxX - minX);
        const sy = minY + Math.random() * (maxY - minY);

        ducks.push({
          id: `duck-${Date.now()}-${idx}`,
          species: assignedSpecies,
          gender: idx % 3 === 2 ? 'female' : 'male',
          name: `${assignedSpecies.toUpperCase()} #${idx + 1}`,
          x: sx,
          y: sy,
          targetX: minX + Math.random() * (maxX - minX),
          targetY: minY + Math.random() * (maxY - minY),
          vx: 0,
          vy: 0,
          angle: Math.random() * Math.PI * 2,
          scale: 0.85 + (sy - minY) * 0.4,
          behavior: 'swimming',
          behaviorTimer: 2500 + Math.random() * 4000,
          swimSpeed: assignedSpecies === 'teal' ? 0.00065 : 0.00045, // Teal is swift
          paddlePhase: Math.random() * Math.PI,
          bobPhase: Math.random() * Math.PI * 2,
          diveDepth: 0,
          featureAnimationPhase: 0,
        });

        if (idx === 0) {
          setTimeout(() => triggerSpeciesAudio(assignedSpecies), 500);
        }
      }
    } else if (ducks.length > targetCount) {
      ducks.splice(targetCount);
    }

    // Update species if user switched selection
    ducks.forEach((duck, idx) => {
      if (selectedSpecies !== 'all') {
        duck.species = selectedSpecies;
        duck.swimSpeed = selectedSpecies === 'teal' ? 0.00065 : 0.00045;
      } else {
        duck.species = allSpeciesList[idx % allSpeciesList.length];
        duck.swimSpeed = duck.species === 'teal' ? 0.00065 : 0.00045;
      }
    });
  }, [hasLake, duckCount, selectedSpecies, swimArea]);

  // Synchronize Forest Animals (Elks and Roe Deer)
  useEffect(() => {
    const animals = forestAnimalsRef.current;
    const shouldSpawn = hasForest && showForestWildlife;

    if (!shouldSpawn) {
      animals.length = 0;
      return;
    }

    const ground = forestGroundArea || { ymin: 360, xmin: 80, ymax: 560, xmax: 920 };
    const minX = ground.xmin / 1000;
    const maxX = ground.xmax / 1000;
    const minY = ground.ymin / 1000;
    const maxY = ground.ymax / 1000;

    // Desired forest roster: 1 Elk Bull, 1 Elk Cow/Calf, 2 Roe Deer (buck & doe)
    if (animals.length === 0) {
      // 1. European Elk Bull (with palmate antlers)
      animals.push({
        id: `elk-bull-${Date.now()}`,
        type: 'elk',
        name: 'Taiga Bull Elk',
        gender: 'male',
        x: minX + 0.15 * (maxX - minX),
        y: minY + 0.3 * (maxY - minY),
        targetX: minX + 0.3 * (maxX - minX),
        targetY: minY + 0.4 * (maxY - minY),
        angle: 0.2,
        scale: 1.05,
        behavior: 'browsing',
        behaviorTimer: 4500,
        walkPhase: 0,
        headTilt: 0,
        earFlick: 0,
        chewPhase: 0,
        moveSpeed: 0.00018,
      });

      // 2. European Roe Buck (with upright spiked antlers)
      animals.push({
        id: `roe-buck-${Date.now()}`,
        type: 'roe_deer',
        name: 'European Roe Buck',
        gender: 'male',
        x: minX + 0.65 * (maxX - minX),
        y: minY + 0.55 * (maxY - minY),
        targetX: minX + 0.75 * (maxX - minX),
        targetY: minY + 0.6 * (maxY - minY),
        angle: -0.8,
        scale: 0.95,
        behavior: 'grazing',
        behaviorTimer: 3500,
        walkPhase: 0,
        headTilt: 0.5,
        earFlick: 0,
        chewPhase: 0,
        moveSpeed: 0.00028,
      });

      // 3. European Roe Doe (graceful grazing doe)
      animals.push({
        id: `roe-doe-${Date.now()}`,
        type: 'roe_deer',
        name: 'Roe Doe',
        gender: 'female',
        x: minX + 0.85 * (maxX - minX),
        y: minY + 0.4 * (maxY - minY),
        targetX: minX + 0.7 * (maxX - minX),
        targetY: minY + 0.35 * (maxY - minY),
        angle: -2.2,
        scale: 0.88,
        behavior: 'alert',
        behaviorTimer: 2800,
        walkPhase: 0,
        headTilt: -0.1,
        earFlick: 0.2,
        chewPhase: 0,
        moveSpeed: 0.00025,
      });
    }
  }, [hasForest, showForestWildlife, forestGroundArea]);

  // Handle User Clicks / Taps
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // 1. Check if user tapped directly on a duck
    if (hasLake) {
      for (const duck of ducksRef.current) {
        const dist = Math.hypot(duck.x - clickX, duck.y - clickY);
        if (dist < 0.08) {
          // Trigger species-specific interaction
          triggerSpeciesAudio(duck.species);
          if (duck.species === 'mallard') {
            duck.behavior = 'up_ending'; // Signature up-ending dabble
            duck.behaviorTimer = 1800;
            playWaterSplash(false);
          } else if (duck.species === 'pochard' || duck.species === 'tufted') {
            duck.behavior = 'diving'; // Signature tip-up dive
            duck.behaviorTimer = 1000;
            playWaterSplash(true);
          } else {
            duck.behavior = 'dabbling';
            duck.behaviorTimer = 1500;
          }
          // Callback to display species info to the user
          onDuckTapped?.(duck);
          return;
        }
      }
    }

    // 2. Check if user tapped directly on an Elk or Roe Deer
    if (hasForest && showForestWildlife) {
      for (const animal of forestAnimalsRef.current) {
        const dist = Math.hypot(animal.x - clickX, animal.y - clickY);
        if (dist < 0.12) {
          playFoliageRustle();
          animal.behavior = 'alert';
          animal.behaviorTimer = 3000;
          animal.headTilt = -0.25;
          animal.earFlick = 1.0;
          if (animal.type === 'elk') {
            playElkCall();
          } else {
            playRoeDeerCall();
          }
          // Callback to display forest animal info to the user
          onAnimalTapped?.(animal);
          return;
        }
      }
    }

    // 3. Check if tapped in water zone -> drop breadcrumb for ducks
    const waterArea = swimArea || { ymin: 400, xmin: 50, ymax: 950, xmax: 950 };
    const isInWater =
      clickY >= (waterArea.ymin / 1000) * 0.9 &&
      clickY <= (waterArea.ymax / 1000) * 1.05 &&
      clickX >= (waterArea.xmin / 1000) * 0.85 &&
      clickX <= (waterArea.xmax / 1000) * 1.15;

    if (hasLake && isInWater) {
      playWaterPlop();
      breadcrumbsRef.current.push({
        id: `crumb-${Date.now()}`,
        x: clickX,
        y: clickY,
        createdAt: performance.now(),
        life: 1.0,
      });

      ripplesRef.current.push({
        id: `drop-${Date.now()}`,
        x: clickX,
        y: clickY,
        radius: 0.005,
        maxRadius: 0.045,
        alpha: 0.85,
        aspectRatio: 0.42,
        speed: 0.00035,
        color: 'rgba(255, 255, 255, 0.9)',
      });

      // Guide nearest duck to swim to breadcrumb
      if (ducksRef.current.length > 0) {
        let nearestDuck = ducksRef.current[0];
        let minDist = Infinity;
        for (const duck of ducksRef.current) {
          const d = Math.hypot(duck.x - clickX, duck.y - clickY);
          if (d < minDist) {
            minDist = d;
            nearestDuck = duck;
          }
        }
        nearestDuck.targetX = clickX;
        nearestDuck.targetY = clickY;
        nearestDuck.behavior = 'swimming';
      }
      return;
    }

    // 4. If tapped in forest zone -> guide Roe deer or Elk to step there
    const groundArea = forestGroundArea || { ymin: 300, xmin: 50, ymax: 600, xmax: 950 };
    const isInForest =
      clickY >= (groundArea.ymin / 1000) * 0.85 &&
      clickY <= (groundArea.ymax / 1000) * 1.15 &&
      clickX >= (groundArea.xmin / 1000) * 0.85 &&
      clickX <= (groundArea.xmax / 1000) * 1.15;

    if (hasForest && showForestWildlife && isInForest && forestAnimalsRef.current.length > 0) {
      playFoliageRustle();
      const deer = forestAnimalsRef.current[1] || forestAnimalsRef.current[0];
      deer.targetX = clickX;
      deer.targetY = clickY;
      deer.behavior = 'walking';
      deer.behaviorTimer = 4000;
    }
  };

  // Main 60fps Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const dt = Math.min(64, time - lastTimeRef.current);
      lastTimeRef.current = time;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. UPDATE & DRAW FOREST ANIMALS (Back layer) ---
      if (hasForest && showForestWildlife && forestAnimalsRef.current.length > 0) {
        const isFlood = weatherRef.current === 'flood';
        const isWildfire = weatherRef.current === 'wildfire';
        const ground = forestGroundArea || { ymin: 360, xmin: 80, ymax: 560, xmax: 920 };
        const gMinX = ground.xmin / 1000;
        const gMaxX = ground.xmax / 1000;
        const gMinY = ground.ymin / 1000;
        // During flood, animals retreat to high ground above rising waters
        const gMaxY = isFlood ? Math.min(ground.ymax / 1000, 0.42) : ground.ymax / 1000;

        for (const animal of forestAnimalsRef.current) {
          animal.behaviorTimer -= dt;
          animal.earFlick += dt * 0.004;

          // State Machine
          if (animal.behaviorTimer <= 0) {
            const roll = Math.random();
            // In wildfire, heightened alertness
            if (isWildfire && Math.random() < 0.65) {
              animal.behavior = 'alert';
              animal.behaviorTimer = 3000 + Math.random() * 3000;
            } else if (animal.type === 'elk') {
              if (roll < 0.45) {
                animal.behavior = 'browsing';
                animal.behaviorTimer = 4000 + Math.random() * 5000;
              } else if (roll < 0.75) {
                animal.behavior = 'walking';
                animal.behaviorTimer = 3500 + Math.random() * 4000;
                animal.targetX = gMinX + Math.random() * (gMaxX - gMinX);
                animal.targetY = gMinY + Math.random() * (gMaxY - gMinY);
              } else {
                animal.behavior = 'alert';
                animal.behaviorTimer = 2500 + Math.random() * 3000;
              }
            } else {
              // Roe deer
              if (roll < 0.5) {
                animal.behavior = 'grazing';
                animal.behaviorTimer = 3000 + Math.random() * 4000;
              } else if (roll < 0.8) {
                animal.behavior = 'walking';
                animal.behaviorTimer = 2800 + Math.random() * 3500;
                animal.targetX = gMinX + Math.random() * (gMaxX - gMinX);
                animal.targetY = gMinY + Math.random() * (gMaxY - gMinY);
              } else {
                animal.behavior = 'alert';
                animal.behaviorTimer = 2000 + Math.random() * 2500;
              }
            }
          }

          // Walking movement
          if (animal.behavior === 'walking') {
            const dx = animal.targetX - animal.x;
            const dy = animal.targetY - animal.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.015) {
              const desiredAngle = Math.atan2(dy, dx);
              animal.angle = desiredAngle;
              const step = animal.moveSpeed * dt;
              animal.x += Math.cos(animal.angle) * step;
              animal.y += Math.sin(animal.angle) * step;
              animal.walkPhase += dt * 0.006;
            } else {
              animal.behavior = animal.type === 'elk' ? 'browsing' : 'grazing';
              animal.behaviorTimer = 3000 + Math.random() * 4000;
            }
          }

          // Bound within forest zone
          animal.x = Math.max(gMinX, Math.min(gMaxX, animal.x));
          animal.y = Math.max(gMinY, Math.min(gMaxY, animal.y));
        }

        // Draw sorted by Y for perspective depth
        const sortedForest = [...forestAnimalsRef.current].sort((a, b) => a.y - b.y);
        for (const animal of sortedForest) {
          drawForestAnimal(ctx, animal, width, height, time, seasonRef.current, (puffX, puffY, isFacingLeft) => {
            weatherSystemRef.current.addBreathPuff(puffX, puffY, isFacingLeft);
          });
        }
      }

      // --- 2. UPDATE & DRAW LAKE WATERFOWL & RIPPLES ---
      if (hasLake) {
        const isFlood = weatherRef.current === 'flood';
        const area = swimArea || { ymin: 480, xmin: 100, ymax: 920, xmax: 900 };
        const minX = area.xmin / 1000;
        const maxX = area.xmax / 1000;
        // In flood, rising waters expand the swim zone higher up the bank
        const minY = isFlood ? Math.max(0.38, area.ymin / 1000 - 0.12) : area.ymin / 1000;
        const maxY = area.ymax / 1000;

        // Breadcrumbs decay
        const crumbs = breadcrumbsRef.current;
        for (let i = crumbs.length - 1; i >= 0; i--) {
          const b = crumbs[i];
          b.life -= dt * 0.00018;
          if (b.life <= 0) crumbs.splice(i, 1);
        }

        // Duck behavior & physics
        const ducks = ducksRef.current;
        for (const duck of ducks) {
          duck.behaviorTimer -= dt;

          // Eat breadcrumb
          for (let i = crumbs.length - 1; i >= 0; i--) {
            const b = crumbs[i];
            if (Math.hypot(duck.x - b.x, duck.y - b.y) < 0.038) {
              crumbs.splice(i, 1);
              duck.behavior = duck.species === 'mallard' ? 'up_ending' : 'dabbling';
              duck.behaviorTimer = 1800;
              playWaterPlop();
              break;
            }
          }

          // State Machine
          if (duck.behaviorTimer <= 0) {
            if (duck.behavior === 'diving') {
              duck.behavior = 'submerged';
              duck.behaviorTimer = 2200 + Math.random() * 2000;
              duck.targetX = minX + Math.random() * (maxX - minX);
              duck.targetY = minY + Math.random() * (maxY - minY);
            } else if (duck.behavior === 'submerged') {
              duck.behavior = 'resurfacing';
              duck.behaviorTimer = 700;
              playWaterSplash(false);
              ripplesRef.current.push({
                id: `resurface-${Date.now()}`,
                x: duck.x,
                y: duck.y,
                radius: 0.01,
                maxRadius: 0.065,
                alpha: 0.9,
                aspectRatio: 0.45,
                speed: 0.0004,
                color: 'rgba(255, 255, 255, 0.9)',
              });
            } else if (duck.behavior === 'resurfacing' || duck.behavior === 'dabbling' || duck.behavior === 'up_ending') {
              duck.behavior = 'swimming';
              duck.behaviorTimer = 3500 + Math.random() * 5000;
              duck.targetX = minX + Math.random() * (maxX - minX);
              duck.targetY = minY + Math.random() * (maxY - minY);
            } else {
              // Species-specific action probabilities!
              const roll = Math.random();
              if (duck.species === 'pochard' || duck.species === 'tufted') {
                // Diving ducks
                if (roll < 0.28) {
                  duck.behavior = 'diving';
                  duck.behaviorTimer = 900;
                  playWaterSplash(true);
                } else if (roll < 0.5) {
                  duck.behavior = 'dabbling';
                  duck.behaviorTimer = 1600;
                } else {
                  duck.behavior = 'swimming';
                  duck.behaviorTimer = 4000 + Math.random() * 5000;
                  duck.targetX = minX + Math.random() * (maxX - minX);
                  duck.targetY = minY + Math.random() * (maxY - minY);
                }
              } else if (duck.species === 'mallard') {
                // Dabbling Mallard
                if (roll < 0.32) {
                  duck.behavior = 'up_ending'; // Signature up-ending!
                  duck.behaviorTimer = 2200;
                  playWaterSplash(false);
                } else if (roll < 0.55) {
                  duck.behavior = 'dabbling';
                  duck.behaviorTimer = 1800;
                } else {
                  duck.behavior = 'swimming';
                  duck.behaviorTimer = 3500 + Math.random() * 5000;
                  duck.targetX = minX + Math.random() * (maxX - minX);
                  duck.targetY = minY + Math.random() * (maxY - minY);
                }
              } else {
                // Teal / Mandarin
                if (roll < 0.35) {
                  duck.behavior = 'dabbling';
                  duck.behaviorTimer = 1800;
                } else {
                  duck.behavior = 'swimming';
                  duck.behaviorTimer = 3000 + Math.random() * 5000;
                  duck.targetX = minX + Math.random() * (maxX - minX);
                  duck.targetY = minY + Math.random() * (maxY - minY);
                }
              }
            }
          }

          // Swimming Physics
          if (duck.behavior === 'swimming' || duck.behavior === 'submerged') {
            const dx = duck.targetX - duck.x;
            const dy = duck.targetY - duck.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.01) {
              const desiredAngle = Math.atan2(dy, dx);
              let diff = desiredAngle - duck.angle;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              duck.angle += diff * 0.065;

              const speed = (duck.behavior === 'submerged' ? duck.swimSpeed * 1.5 : duck.swimSpeed) * dt;
              duck.x += Math.cos(duck.angle) * speed;
              duck.y += Math.sin(duck.angle) * speed;
              if (isFlood) {
                // Surging flood current pushes ducks downriver
                duck.x += 0.00016 * dt;
              }
              duck.paddlePhase += dt * 0.008;

              // Perspective scale
              const depthFactor = (duck.y - minY) / Math.max(0.01, maxY - minY);
              duck.scale = 0.75 + Math.max(0, Math.min(1, depthFactor)) * 0.55;

              // Wake ripples
              if (duck.behavior === 'swimming' && Math.random() < 0.35) {
                ripplesRef.current.push({
                  id: `wake-${Date.now()}-${Math.random()}`,
                  x: duck.x - Math.cos(duck.angle) * 0.02,
                  y: duck.y - Math.sin(duck.angle) * 0.01,
                  radius: 0.006 * duck.scale,
                  maxRadius: 0.045 * duck.scale,
                  alpha: 0.65,
                  aspectRatio: 0.42,
                  speed: 0.00025,
                });
              }
            } else {
              duck.targetX = minX + Math.random() * (maxX - minX);
              duck.targetY = minY + Math.random() * (maxY - minY);
            }
          }

          duck.x = Math.max(minX, Math.min(maxX, duck.x));
          duck.y = Math.max(minY, Math.min(maxY, duck.y));
        }

        // Ripple dissipation
        const ripples = ripplesRef.current;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += r.speed * dt;
          r.alpha -= dt * 0.0006;
          if (r.alpha <= 0 || r.radius >= r.maxRadius) ripples.splice(i, 1);
        }

        // Draw breadcrumbs and water ripples
        drawBreadcrumbs(ctx, crumbs, width, height);
        drawWaterRipples(ctx, ripples, width, height);

        // Draw ducks sorted by Y
        const sortedDucks = [...ducks].sort((a, b) => a.y - b.y);
        for (const duck of sortedDucks) {
          drawDuck(ctx, duck, width, height, time);
        }
      }

      // --- 3. DYNAMIC WEATHER & SEASON ATMOSPHERE ---
      weatherSystemRef.current.render(
        ctx,
        width,
        height,
        time,
        seasonRef.current,
        weatherRef.current,
        swimArea || waterRegion || undefined,
        forestRegion || undefined
      );

      // --- 4. AR DISCOVERY FLOATING BADGES ---
      // Draw gentle interactive markers above visible animals indicating tap-for-info
      ctx.save();
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      // Ducks badges
      if (hasLake) {
        for (const duck of ducksRef.current) {
          if (duck.behavior === 'submerged') continue;
          const dx = duck.x * width;
          const dy = duck.y * height - 32 * duck.scale;

          const badgeText = `${duck.name}`;
          const textWidth = ctx.measureText(badgeText).width;
          const padX = 6;
          const padY = 3;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.beginPath();
          ctx.roundRect(
            dx - textWidth / 2 - padX,
            dy - 11 - padY,
            textWidth + padX * 2,
            16 + padY * 2,
            8
          );
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(badgeText, dx, dy);
        }
      }

      // Forest animal badges
      if (hasForest && showForestWildlife) {
        for (const animal of forestAnimalsRef.current) {
          const ax = animal.x * width;
          const heightOffset = animal.type === 'elk' ? 85 : 55;
          const ay = animal.y * height - heightOffset * (animal.scale || 1.0);

          const badgeText = `${animal.name}`;
          const textWidth = ctx.measureText(badgeText).width;
          const padX = 7;
          const padY = 3;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.beginPath();
          ctx.roundRect(
            ax - textWidth / 2 - padX,
            ay - 11 - padY,
            textWidth + padX * 2,
            16 + padY * 2,
            8
          );
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(badgeText, ax, ay);
        }
      }
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [hasLake, hasForest, showForestWildlife, swimArea, forestGroundArea]);

  return (
    <canvas
      id="wildlife-ar-canvas"
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="absolute inset-0 z-20 w-full h-full cursor-crosshair select-none touch-none"
    />
  );
};
