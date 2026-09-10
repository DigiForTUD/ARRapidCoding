import { Season, WeatherCondition } from '../types';

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  wobblePhase: number;
  wobbleSpeed: number;
  layer: 'foreground' | 'midground' | 'background';
}

export interface RainSplash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
}

export interface LensDroplet {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  trailLength: number;
  speed: number;
}

export interface BreathPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
}

export interface FloodDebris {
  x: number;
  y: number;
  vx: number;
  angle: number;
  rotSpeed: number;
  type: 'twig' | 'leaf' | 'bark';
  size: number;
}

export class WeatherSystem {
  private snowParticles: WeatherParticle[] = [];
  private rainParticles: WeatherParticle[] = [];
  private rainSplashes: RainSplash[] = [];
  private lensDroplets: LensDroplet[] = [];
  private emberParticles: WeatherParticle[] = [];
  private floodDebris: FloodDebris[] = [];
  private breathPuffs: BreathPuff[] = [];
  private lastTime = 0;

  constructor() {
    this.initSnowParticles(320);
    this.initRainParticles(420);
    this.initLensDroplets(26);
    this.initEmberParticles(220);
    this.initFloodDebris(30);
  }

  private initSnowParticles(count: number) {
    this.snowParticles = [];
    for (let i = 0; i < count; i++) {
      const isForeground = i < 24;
      const isBackground = i > count - 120;
      this.snowParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.45) * 0.00018,
        vy: isForeground ? 0.00025 + Math.random() * 0.0002 : 0.0004 + Math.random() * 0.00045,
        size: isForeground
          ? Math.random() * 7 + 8
          : isBackground
          ? Math.random() * 1.5 + 1
          : Math.random() * 3 + 2.5,
        alpha: isForeground ? 0.4 + Math.random() * 0.35 : 0.65 + Math.random() * 0.35,
        life: 1.0,
        maxLife: 1.0,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 2 + 1,
        layer: isForeground ? 'foreground' : isBackground ? 'background' : 'midground',
      });
    }
  }

  private initRainParticles(count: number) {
    this.rainParticles = [];
    for (let i = 0; i < count; i++) {
      const isForeground = i < 35;
      this.rainParticles.push({
        x: Math.random() * 1.2 - 0.1,
        y: Math.random(),
        vx: 0.0008 + Math.random() * 0.0004,
        vy: isForeground ? 0.0035 + Math.random() * 0.001 : 0.0022 + Math.random() * 0.0012,
        size: isForeground ? Math.random() * 20 + 26 : Math.random() * 14 + 12,
        alpha: isForeground ? 0.65 : 0.35 + Math.random() * 0.3,
        life: 1.0,
        maxLife: 1.0,
        wobblePhase: 0,
        wobbleSpeed: 0,
        layer: isForeground ? 'foreground' : 'midground',
      });
    }
  }

  private initLensDroplets(count: number) {
    this.lensDroplets = [];
    for (let i = 0; i < count; i++) {
      this.lensDroplets.push({
        x: 0.05 + Math.random() * 0.9,
        y: 0.05 + Math.random() * 0.88,
        radius: Math.random() * 4.5 + 3,
        alpha: Math.random() * 0.45 + 0.35,
        trailLength: Math.random() < 0.35 ? Math.random() * 25 + 10 : 0,
        speed: Math.random() < 0.35 ? 0.00003 + Math.random() * 0.00004 : 0,
      });
    }
  }

  private initEmberParticles(count: number) {
    this.emberParticles = [];
    for (let i = 0; i < count; i++) {
      const isAsh = i > count * 0.65; // ~35% ash flakes, 65% glowing fire sparks
      this.emberParticles.push({
        x: Math.random() * 1.1 - 0.05,
        y: Math.random() * 1.2 - 0.1,
        vx: 0.0003 + Math.random() * 0.0005, // Wind pushes right
        vy: isAsh ? 0.00015 + Math.random() * 0.0002 : -0.0006 - Math.random() * 0.0012, // Embers rise!
        size: isAsh ? Math.random() * 3 + 1.5 : Math.random() * 4 + 1.8,
        alpha: Math.random() * 0.7 + 0.3,
        life: Math.random(),
        maxLife: 1.0,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 3 + 1.5,
        layer: isAsh ? 'background' : Math.random() < 0.2 ? 'foreground' : 'midground',
      });
    }
  }

  private initFloodDebris(count: number) {
    this.floodDebris = [];
    const types: ('twig' | 'leaf' | 'bark')[] = ['twig', 'leaf', 'bark'];
    for (let i = 0; i < count; i++) {
      this.floodDebris.push({
        x: Math.random() * 1.2 - 0.1,
        y: 0.42 + Math.random() * 0.52,
        vx: 0.0004 + Math.random() * 0.0006, // Rushing water current
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        type: types[i % types.length],
        size: Math.random() * 12 + 8,
      });
    }
  }

  public addBreathPuff(x: number, y: number, isFacingLeft: boolean) {
    this.breathPuffs.push({
      x,
      y,
      vx: (isFacingLeft ? -1 : 1) * (0.00016 + Math.random() * 0.00012),
      vy: -0.00028 - Math.random() * 0.00016,
      radius: 4,
      maxRadius: 22 + Math.random() * 10,
      alpha: 0.72,
      life: 1.0,
    });
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeMs: number,
    season: Season,
    weather: WeatherCondition,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number },
    forestArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    const dt = this.lastTime === 0 ? 16 : Math.min(50, timeMs - this.lastTime);
    this.lastTime = timeMs;

    // 1. WINTER SEASON: Procedural Snow Landscape Cover
    // (Only if not in wildfire or flood scenario)
    if (season === 'winter' && weather !== 'wildfire' && weather !== 'flood') {
      this.renderWinterSnowCover(ctx, width, height, timeMs, waterArea);
    }

    // 2. SUMMER SEASON: Brilliant Sunny Sky & Radiant God Rays
    if (season === 'summer' && weather === 'clear') {
      this.renderSummerSun(ctx, width, height, timeMs, waterArea);
    }

    // 3. WEATHER PHENOMENA
    // A. Wildfire Scenario: Real trees in picture ignite with crowning torching fires
    if (weather === 'wildfire') {
      this.renderWildfire(ctx, width, height, dt, timeMs, waterArea, forestArea);
    }

    // B. Flood Scenario
    if (weather === 'flood') {
      this.renderFlood(ctx, width, height, dt, timeMs, waterArea);
    }

    // C. Snowy Weather
    if (
      weather === 'snow' ||
      (season === 'winter' && weather !== 'rain' && weather !== 'fog' && weather !== 'wildfire' && weather !== 'flood')
    ) {
      this.renderSnow(ctx, width, height, dt, timeMs);
    }

    // D. Rainy Weather
    if (weather === 'rain') {
      this.renderRain(ctx, width, height, dt, timeMs, waterArea);
    }

    // E. Mist & Fog
    if (weather === 'fog') {
      this.renderFog(ctx, width, height, timeMs, waterArea);
    }

    // 4. ANIMAL BREATH VAPOR PUFFS (Winter only)
    if (season === 'winter' && weather !== 'wildfire') {
      this.renderBreathPuffs(ctx, width, height, dt);
    }
  }

  // =========================================================================
  // 1. WILDFIRE: Real Trees Burning, Torching Crowns, Smoke & Water Reflections
  // =========================================================================
  private renderWildfire(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number },
    forestArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();
    const t = timeMs * 0.001;

    // Boundaries of real trees in the picture / stream
    const forest = forestArea || { ymin: 150, xmin: 40, ymax: 540, xmax: 960 };
    const fXMin = (forest.xmin / 1000) * width;
    const fXMax = (forest.xmax / 1000) * width;
    const fYMin = (forest.ymin / 1000) * height;
    const fYMax = (forest.ymax / 1000) * height;
    const forestSpan = fXMax - fXMin;

    // A. Heavy Pyro-Cumulus Smoke Layer across the Sky
    const skySmokeGrad = ctx.createLinearGradient(0, 0, 0, fYMax);
    skySmokeGrad.addColorStop(0, 'rgba(18, 14, 12, 0.92)');
    skySmokeGrad.addColorStop(0.35, 'rgba(48, 32, 22, 0.82)');
    skySmokeGrad.addColorStop(0.7, 'rgba(124, 45, 18, 0.55)');
    skySmokeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skySmokeGrad;
    ctx.fillRect(0, 0, width, fYMax * 1.1);

    // Billowing turbulent smoke clouds drifting from burning canopies
    for (let i = 0; i < 9; i++) {
      const sx = ((t * 0.025 + i * 0.22) % 1.3 - 0.15) * width;
      const sy = fYMin * 0.4 + (i % 4) * 35 + Math.sin(t * 1.8 + i) * 16;
      const srX = width * (0.24 + (i % 3) * 0.08);
      const srY = height * (0.10 + (i % 2) * 0.04);

      ctx.beginPath();
      ctx.ellipse(sx, sy, srX, srY, 0.08, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(28, 25, 23, 0.52)' : 'rgba(68, 64, 60, 0.45)';
      ctx.filter = 'blur(26px)';
      ctx.fill();
    }
    ctx.filter = 'none';

    // B. Intense Back-Glow Along Forest Ridge
    const ridgeGlow = ctx.createLinearGradient(0, fYMin - 60, 0, fYMax + 40);
    ridgeGlow.addColorStop(0, 'transparent');
    ridgeGlow.addColorStop(0.4, 'rgba(234, 88, 12, 0.65)');
    ridgeGlow.addColorStop(0.75, 'rgba(245, 158, 11, 0.78)');
    ridgeGlow.addColorStop(1, 'rgba(220, 38, 38, 0.25)');
    ctx.fillStyle = ridgeGlow;
    ctx.fillRect(fXMin, fYMin - 60, forestSpan, fYMax - fYMin + 100);

    // C. TORCHING REAL SEEN TREES (20 individual burning pine/spruce trees aligned to the real forest)
    const treeCount = 20;
    for (let i = 0; i < treeCount; i++) {
      // Deterministic spread across the actual forest boundaries
      const frac = i / (treeCount - 1);
      const jitterX = Math.sin(i * 3.7) * (forestSpan * 0.035);
      const treeX = fXMin + frac * forestSpan + jitterX;

      const jitterY = Math.cos(i * 2.9) * 20;
      const treeBaseY = fYMax - 10 + jitterY;

      // Tree height based on perspective and distance
      const treeH = (fYMax - fYMin) * (0.75 + Math.sin(i * 1.7) * 0.22);
      const treeTopY = treeBaseY - treeH;
      const treeW = treeH * (0.34 + Math.sin(i * 4.1) * 0.06);

      // 1. Charcoal Tree Skeleton (Trunk & Branches) glowing from heat
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(treeX, treeBaseY);
      ctx.lineTo(treeX, treeTopY + treeH * 0.1);
      ctx.strokeStyle = '#261208';
      ctx.lineWidth = Math.max(3, treeW * 0.12);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing heat core inside trunk
      ctx.beginPath();
      ctx.moveTo(treeX, treeBaseY);
      ctx.lineTo(treeX, treeTopY + treeH * 0.2);
      ctx.strokeStyle = 'rgba(255, 115, 0, 0.85)';
      ctx.lineWidth = Math.max(1.5, treeW * 0.05);
      ctx.stroke();

      // Incandescent branches spreading into canopy
      const branchTiers = 5;
      for (let b = 1; b <= branchTiers; b++) {
        const by = treeBaseY - (treeH * (b / (branchTiers + 0.5)));
        const bw = treeW * (1 - (b / (branchTiers + 1)) * 0.7);

        // Left branch
        ctx.beginPath();
        ctx.moveTo(treeX, by + 8);
        ctx.lineTo(treeX - bw, by - 4);
        ctx.strokeStyle = '#450A0A';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(treeX, by + 8);
        ctx.lineTo(treeX - bw * 0.7, by);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Right branch
        ctx.beginPath();
        ctx.moveTo(treeX, by + 8);
        ctx.lineTo(treeX + bw, by - 4);
        ctx.strokeStyle = '#450A0A';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(treeX, by + 8);
        ctx.lineTo(treeX + bw * 0.7, by);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Conical Torching Flames (Multi-tier canopy blaze)
      ctx.save();
      for (let tier = 0; tier < 4; tier++) {
        const tierY = treeBaseY - treeH * (tier * 0.24);
        const tierH = treeH * 0.38;
        const tierW = treeW * (1.1 - tier * 0.22);

        // Undulating flame tongues
        const flameWave1 = Math.sin(t * 14 + i * 2.3 + tier) * (tierW * 0.2);
        const flameWave2 = Math.cos(t * 18 + i * 3.1) * (tierW * 0.15);

        // Outer Flame (Crimson Red / Orange)
        ctx.beginPath();
        ctx.moveTo(treeX - tierW * 0.9, tierY);
        ctx.quadraticCurveTo(
          treeX - tierW * 0.6 + flameWave1,
          tierY - tierH * 0.6,
          treeX + flameWave2,
          tierY - tierH
        );
        ctx.quadraticCurveTo(
          treeX + tierW * 0.6 + flameWave1,
          tierY - tierH * 0.6,
          treeX + tierW * 0.9,
          tierY
        );
        ctx.closePath();

        const tierGrad = ctx.createLinearGradient(0, tierY, 0, tierY - tierH);
        tierGrad.addColorStop(0, 'rgba(220, 38, 38, 0.92)');
        tierGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.95)');
        tierGrad.addColorStop(0.75, 'rgba(251, 191, 36, 0.98)');
        tierGrad.addColorStop(1, 'rgba(254, 240, 138, 0.95)');
        ctx.fillStyle = tierGrad;
        ctx.shadowColor = '#EA580C';
        ctx.shadowBlur = 16;
        ctx.fill();

        // Inner Super-Hot Core (Yellow-White)
        ctx.beginPath();
        ctx.moveTo(treeX - tierW * 0.45, tierY - 4);
        ctx.quadraticCurveTo(
          treeX - tierW * 0.2 + flameWave1 * 0.5,
          tierY - tierH * 0.5,
          treeX,
          tierY - tierH * 0.85
        );
        ctx.quadraticCurveTo(
          treeX + tierW * 0.2 + flameWave2 * 0.5,
          tierY - tierH * 0.5,
          treeX + tierW * 0.45,
          tierY - 4
        );
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.shadowColor = '#FEF08A';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();

      // 3. Smoke Column Billowing from Crown Apex
      ctx.save();
      const smokeTopX = treeX + (t * 22 + i * 15) % 80;
      const smokeApexY = treeTopY - treeH * 0.4;
      ctx.beginPath();
      ctx.moveTo(treeX - 8, treeTopY);
      ctx.quadraticCurveTo(
        treeX + 15 + Math.sin(t * 3 + i) * 12,
        treeTopY - treeH * 0.2,
        smokeTopX,
        smokeApexY
      );
      ctx.quadraticCurveTo(
        treeX - 10 + Math.cos(t * 3 + i) * 10,
        treeTopY - treeH * 0.15,
        treeX + 8,
        treeTopY
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(41, 37, 36, 0.65)';
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.restore();

      // 4. Fiery Water Reflection under each burning tree
      if (waterArea) {
        const waterY = (waterArea.ymin / 1000) * height;
        const waterH = ((waterArea.ymax - waterArea.ymin) / 1000) * height;
        const reflLen = Math.min(waterH * 0.65, treeH * 0.8);

        ctx.save();
        const reflGrad = ctx.createLinearGradient(0, waterY, 0, waterY + reflLen);
        reflGrad.addColorStop(0, 'rgba(251, 146, 60, 0.65)');
        reflGrad.addColorStop(0.3, 'rgba(234, 88, 12, 0.5)');
        reflGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.25)');
        reflGrad.addColorStop(1, 'transparent');

        // Shimmering wavy vertical streak
        ctx.beginPath();
        const rw = treeW * 0.6;
        for (let ry = 0; ry <= reflLen; ry += 6) {
          const rxWave = Math.sin(ry * 0.15 + t * 8 + i) * (rw * 0.35);
          if (ry === 0) ctx.moveTo(treeX - rw * 0.5 + rxWave, waterY + ry);
          else ctx.lineTo(treeX - rw * 0.5 + rxWave, waterY + ry);
        }
        for (let ry = reflLen; ry >= 0; ry -= 6) {
          const rxWave = Math.sin(ry * 0.15 + t * 8 + i) * (rw * 0.35);
          ctx.lineTo(treeX + rw * 0.5 + rxWave, waterY + ry);
        }
        ctx.closePath();
        ctx.fillStyle = reflGrad;
        ctx.filter = 'blur(4px)';
        ctx.fill();
        ctx.restore();
      }
    }

    // D. Ground Surface Fire Line Licking along Forest Base
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fXMin, fYMax + 20);
    for (let x = fXMin; x <= fXMax; x += 18) {
      const flh = Math.sin((x / width) * 28 + t * 8) * 14 + Math.cos(x * 0.12 + t * 11) * 8;
      ctx.lineTo(x, fYMax - flh);
    }
    ctx.lineTo(fXMax, fYMax + 20);
    ctx.lineTo(fXMin, fYMax + 20);
    ctx.closePath();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();

    // E. Glowing Flying Embers, Sparks & Drifting Charcoal Ash
    const wind = Math.sin(t * 1.2) * 0.00035 + 0.0008; // Strong thermal wildfire wind rightward
    for (const p of this.emberParticles) {
      p.wobblePhase += (p.wobbleSpeed * dt) / 1000;
      const thermalSway = Math.sin(p.wobblePhase) * 0.00035;

      p.x += (p.vx + wind + thermalSway) * dt;
      p.y += p.vy * dt;

      // Respawn embers from the burning tree line
      if (p.y < -0.05 || p.x > 1.15 || p.y > 1.05) {
        p.x = Math.random() * 0.9 - 0.1;
        p.y = (forest.ymin / 1000) + Math.random() * ((forest.ymax - forest.ymin) / 1000);
        p.alpha = Math.random() * 0.8 + 0.2;
      }

      const px = p.x * width;
      const py = p.y * height;

      if (p.layer === 'background') {
        // Floating dark ash fleck
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(68, 64, 60, ${p.alpha * 0.7})`;
        ctx.fill();
      } else if (p.layer === 'foreground') {
        // Large burning spark near camera lens with radiant glow
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${p.alpha})`;
        ctx.shadowColor = '#EA580C';
        ctx.shadowBlur = 16;
        ctx.fill();

        // Incandescent trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - wind * 38000 * dt, py - p.vy * 8000 * dt);
        ctx.strokeStyle = `rgba(249, 115, 22, ${p.alpha * 0.65})`;
        ctx.lineWidth = p.size * 0.65;
        ctx.stroke();
      } else {
        // Midground glowing orange spark
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }

    // F. Optical Heat Haze Shimmer Lines over Burning Forest
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let h = 0; h < 6; h++) {
      const hy = fYMin + (h / 5) * (fYMax - fYMin);
      ctx.beginPath();
      for (let hx = fXMin; hx <= fXMax; hx += 20) {
        const offset = Math.sin(hx * 0.08 + t * 12 + h) * 4;
        if (hx === fXMin) ctx.moveTo(hx, hy + offset);
        else ctx.lineTo(hx, hy + offset);
      }
      ctx.stroke();
    }
    ctx.restore();

    // G. Fiery Atmospheric Vignette & Heat Tint
    const fireVignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.4,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.8
    );
    fireVignette.addColorStop(0, 'transparent');
    fireVignette.addColorStop(0.6, 'rgba(194, 65, 12, 0.24)');
    fireVignette.addColorStop(1, 'rgba(127, 29, 29, 0.55)');
    ctx.fillStyle = fireVignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // =========================================================================
  // 2. FLOOD: Surging Murky Torrent, Submerged Banks, Rapids & Floating Debris
  // =========================================================================
  private renderFlood(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();
    const t = timeMs * 0.001;

    // A. Dark Torrential Storm Sky & Downpour Haze
    const floodSky = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    floodSky.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    floodSky.addColorStop(0.5, 'rgba(30, 41, 59, 0.65)');
    floodSky.addColorStop(1, 'transparent');
    ctx.fillStyle = floodSky;
    ctx.fillRect(0, 0, width, height * 0.6);

    // B. Surging Floodwater Surface (Water level rises dramatically!)
    // In flood conditions, floodwaters inundate the landscape from height * 0.38 down to the bottom
    const floodTopY = height * 0.36;

    // Murky churning water body
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, floodTopY);

    // Rapid turbulent water crests
    for (let x = 0; x <= width; x += 15) {
      const wave =
        Math.sin((x / width) * 18 + t * 4.5) * 8 +
        Math.cos((x / width) * 36 - t * 6) * 5 +
        Math.sin(x * 0.08 + t * 8) * 3;
      ctx.lineTo(x, floodTopY + wave);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const floodWaterGrad = ctx.createLinearGradient(0, floodTopY, 0, height);
    floodWaterGrad.addColorStop(0, 'rgba(30, 41, 59, 0.78)');
    floodWaterGrad.addColorStop(0.3, 'rgba(51, 65, 85, 0.82)');
    floodWaterGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.88)');
    floodWaterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
    ctx.fillStyle = floodWaterGrad;
    ctx.fill();

    // C. Swift Rushing Horizontal Current Foam Streaks
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const streamY = floodTopY + 20 + i * ((height - floodTopY - 30) / 18);
      const speed = 0.35 + (i % 4) * 0.12;
      const offsetX = ((t * speed * width * 0.4 + i * 160) % (width * 1.5)) - width * 0.25;
      const streakLen = 60 + (i % 5) * 45;

      ctx.lineWidth = 1.8 + (i % 3) * 0.8;
      ctx.beginPath();
      ctx.moveTo(offsetX, streamY);
      ctx.bezierCurveTo(
        offsetX + streakLen * 0.35,
        streamY + Math.sin(t * 5 + i) * 6,
        offsetX + streakLen * 0.7,
        streamY - Math.cos(t * 4 + i) * 6,
        offsetX + streakLen,
        streamY
      );
      ctx.stroke();
    }
    ctx.restore();

    // D. White-Water Foam Crests and Swirling Vortex Eddies
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const eddyX = width * (0.15 + i * 0.11) + Math.sin(t * 2 + i) * 20;
      const eddyY = floodTopY + 45 + (i % 3) * 75 + Math.cos(t * 2.5 + i) * 12;
      const eddyRadius = 16 + (i % 3) * 8;

      ctx.beginPath();
      ctx.ellipse(eddyX, eddyY, eddyRadius, eddyRadius * 0.45, t * 2 + i, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.52)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();

    // E. Floating Flood Debris (Twigs, bark, leaves tumbling down the river torrent)
    ctx.save();
    for (const item of this.floodDebris) {
      item.x += item.vx * dt;
      item.angle += item.rotSpeed * dt;

      if (item.x > 1.15) {
        item.x = -0.15;
        item.y = 0.4 + Math.random() * 0.54;
      }

      const dx = item.x * width;
      const dy = item.y * height + Math.sin(t * 5 + item.x * 10) * 4;

      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(item.angle);

      if (item.type === 'twig') {
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-item.size, 0);
        ctx.lineTo(item.size * 0.8, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(item.size * 0.4, -item.size * 0.45);
        ctx.stroke();
      } else if (item.type === 'leaf') {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.ellipse(0, 0, item.size * 0.6, item.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Bark slab
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.roundRect(-item.size * 0.6, -item.size * 0.25, item.size * 1.2, item.size * 0.5, 3);
        ctx.fill();
      }

      // Small wake ripple behind debris
      ctx.beginPath();
      ctx.ellipse(item.size * 0.8, 0, item.size * 0.5, item.size * 0.2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // F. Driving Rain Streaks & Water Spray Mist
    this.renderRain(ctx, width, height, dt, timeMs, waterArea);

    // G. River Spray Mist over Rushing Water
    const sprayGrad = ctx.createLinearGradient(0, floodTopY - 20, 0, floodTopY + 80);
    sprayGrad.addColorStop(0, 'transparent');
    sprayGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.42)');
    sprayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sprayGrad;
    ctx.fillRect(0, floodTopY - 20, width, 100);

    ctx.restore();
  }

  // =========================================================================
  // 3. WINTER: Everything Covered with Snow
  // =========================================================================
  private renderWinterSnowCover(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();

    const lakeYMin = waterArea ? (waterArea.ymin / 1000) * height : height * 0.52;
    const lakeYMax = waterArea ? (waterArea.ymax / 1000) * height : height * 0.94;
    const lakeXMin = waterArea ? (waterArea.xmin / 1000) * width : width * 0.1;
    const lakeXMax = waterArea ? (waterArea.xmax / 1000) * width : width * 0.9;

    const horizonY = height * 0.38;
    const groundSnowY = Math.min(lakeYMin + 15, height * 0.55);

    ctx.beginPath();
    ctx.moveTo(0, groundSnowY);
    for (let x = 0; x <= width; x += width * 0.08) {
      const hillOffset = Math.sin((x / width) * 7 + 0.4) * 16 + Math.cos((x / width) * 12) * 8;
      ctx.lineTo(x, groundSnowY + hillOffset);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const snowBaseGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    snowBaseGrad.addColorStop(0, 'rgba(238, 244, 252, 0.42)');
    snowBaseGrad.addColorStop(0.3, 'rgba(248, 250, 252, 0.58)');
    snowBaseGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.68)');
    snowBaseGrad.addColorStop(1, 'rgba(226, 238, 250, 0.75)');
    ctx.fillStyle = snowBaseGrad;
    ctx.fill();

    if (waterArea) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        (lakeXMin + lakeXMax) * 0.5,
        (lakeYMin + lakeYMax) * 0.5,
        (lakeXMax - lakeXMin) * 0.48,
        (lakeYMax - lakeYMin) * 0.46,
        0,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 14;
      ctx.filter = 'blur(4px)';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.9)';
      ctx.lineWidth = 4;
      ctx.filter = 'none';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      for (let i = 0; i < 8; i++) {
        const sx = lakeXMin + (i / 7) * (lakeXMax - lakeXMin);
        const sy = lakeYMin + Math.sin(i * 1.7) * 12;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 35 + (i % 3) * 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Foreground Snow Drift at Bottom of Canvas
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height - 35);
    for (let x = 0; x <= width; x += width * 0.05) {
      const driftY = height - 25 + Math.sin((x / width) * 10) * 14 + Math.cos((x / width) * 16) * 6;
      ctx.lineTo(x, driftY);
    }
    ctx.lineTo(width, height);
    ctx.closePath();

    const bottomSnowGrad = ctx.createLinearGradient(0, height - 45, 0, height);
    bottomSnowGrad.addColorStop(0, 'rgba(241, 245, 249, 0.85)');
    bottomSnowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    bottomSnowGrad.addColorStop(1, 'rgba(226, 238, 250, 0.98)');
    ctx.fillStyle = bottomSnowGrad;
    ctx.shadowColor = 'rgba(186, 230, 253, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    // Corner Frost Vignette
    const frostVignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.45,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75
    );
    frostVignette.addColorStop(0, 'transparent');
    frostVignette.addColorStop(0.7, 'rgba(219, 234, 254, 0.12)');
    frostVignette.addColorStop(1, 'rgba(186, 230, 253, 0.38)');
    ctx.fillStyle = frostVignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // =========================================================================
  // 4. SUMMER: Brilliant Sunny Sky, Radiant God Rays & Shimmering Glints
  // =========================================================================
  private renderSummerSun(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();
    const sunX = width * 0.18;
    const sunY = height * 0.10;
    const pulse = Math.sin(timeMs * 0.0015) * 0.05 + 1.0;

    const warmSky = ctx.createLinearGradient(0, 0, width, height * 0.75);
    warmSky.addColorStop(0, 'rgba(254, 240, 138, 0.14)');
    warmSky.addColorStop(0.4, 'rgba(253, 230, 138, 0.06)');
    warmSky.addColorStop(1, 'transparent');
    ctx.fillStyle = warmSky;
    ctx.fillRect(0, 0, width, height);

    const rayAngle = 0.55;
    const numRays = 10;
    for (let i = 0; i < numRays; i++) {
      const rayPhase = timeMs * 0.0008 + i * 0.7;
      const rayAlpha = (Math.sin(rayPhase) * 0.5 + 0.5) * 0.12 + 0.04;
      const rayWidthStart = 8 + i * 4;
      const rayWidthEnd = 90 + i * 28;
      const beamLength = Math.max(width, height) * 1.3;

      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(rayAngle + (i - numRays / 2) * 0.08);

      const rayGrad = ctx.createLinearGradient(0, 0, 0, beamLength);
      rayGrad.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.5})`);
      rayGrad.addColorStop(0.3, `rgba(253, 224, 71, ${rayAlpha})`);
      rayGrad.addColorStop(0.8, `rgba(254, 243, 199, ${rayAlpha * 0.3})`);
      rayGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(-rayWidthStart * 0.5, 0);
      ctx.lineTo(rayWidthStart * 0.5, 0);
      ctx.lineTo(rayWidthEnd * 0.5, beamLength);
      ctx.lineTo(-rayWidthEnd * 0.5, beamLength);
      ctx.closePath();

      ctx.fillStyle = rayGrad;
      ctx.fill();
      ctx.restore();
    }

    const coronaGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 130 * pulse);
    coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    coronaGrad.addColorStop(0.15, 'rgba(254, 240, 138, 0.95)');
    coronaGrad.addColorStop(0.4, 'rgba(253, 224, 71, 0.55)');
    coronaGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.22)');
    coronaGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(sunX, sunY, 130 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sunX, sunY, 24 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FEF08A';
    ctx.shadowBlur = 35;
    ctx.fill();

    // Specular Water Sparkles
    const glintTime = timeMs * 0.0025;
    const lakeTop = waterArea ? (waterArea.ymin / 1000) * height : height * 0.52;
    const lakeBottom = waterArea ? (waterArea.ymax / 1000) * height : height * 0.92;
    const lakeLeft = waterArea ? (waterArea.xmin / 1000) * width : width * 0.1;
    const lakeRight = waterArea ? (waterArea.xmax / 1000) * width : width * 0.9;

    ctx.shadowColor = '#FEF08A';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 32; i++) {
      const gx = lakeLeft + ((Math.sin(i * 3.7 + glintTime * 0.3) * 0.5 + 0.5) * 0.8 + 0.1) * (lakeRight - lakeLeft);
      const gy = lakeTop + ((Math.cos(i * 2.3 + glintTime * 0.4) * 0.5 + 0.5) * 0.8 + 0.1) * (lakeBottom - lakeTop);
      const sparkleIntensity = Math.sin(glintTime * 2.0 + i * 1.9);

      if (sparkleIntensity > 0.15) {
        const starSize = 2 + sparkleIntensity * 3.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleIntensity * 0.9})`;

        ctx.beginPath();
        ctx.arc(gx, gy, starSize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(254, 240, 138, ${sparkleIntensity * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gx - starSize * 2, gy);
        ctx.lineTo(gx + starSize * 2, gy);
        ctx.moveTo(gx, gy - starSize * 2);
        ctx.lineTo(gx, gy + starSize * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // 5. SNOW: Dense Swirling Snowfall with Multi-Depth Parallax
  // =========================================================================
  private renderSnow(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    timeMs: number
  ) {
    ctx.save();
    const wind = Math.sin(timeMs * 0.0006) * 0.00035 + 0.00015;

    for (const p of this.snowParticles) {
      p.wobblePhase += (p.wobbleSpeed * dt) / 1000;
      const sway = Math.sin(p.wobblePhase) * 0.00025;
      p.x += (p.vx + wind + sway) * dt;
      p.y += p.vy * dt;

      if (p.y > 1.05 || p.x < -0.08 || p.x > 1.08) {
        p.y = -0.05;
        p.x = Math.random() * 1.1 - 0.05;
        p.alpha = p.layer === 'foreground' ? 0.45 : Math.random() * 0.65 + 0.35;
      }

      const px = p.x * width;
      const py = p.y * height;

      if (p.layer === 'foreground') {
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.55})`;
        ctx.shadowColor = 'rgba(219, 234, 254, 0.9)';
        ctx.shadowBlur = 10;
        ctx.fill();
      } else if (p.layer === 'midground') {
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowColor = 'rgba(224, 242, 254, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 248, 255, ${p.alpha * 0.6})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // 6. RAIN: Dense Rain Streaks, Water Splashes & Camera Lens Droplets
  // =========================================================================
  private renderRain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();
    const waterYMin = waterArea ? (waterArea.ymin / 1000) * height : height * 0.55;
    const waterYMax = waterArea ? (waterArea.ymax / 1000) * height : height * 0.95;

    ctx.strokeStyle = 'rgba(215, 235, 255, 0.58)';
    ctx.lineCap = 'round';

    for (const p of this.rainParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y * height > waterYMin && p.y * height < waterYMax && Math.random() < 0.04) {
        this.addRainSplash(p.x * width, p.y * height);
      }

      if (p.y > 1.05 || p.x > 1.15) {
        p.y = -0.06;
        p.x = Math.random() * 1.2 - 0.1;
      }

      const px = p.x * width;
      const py = p.y * height;
      const streakLen = p.size;
      const angleOffset = streakLen * 0.24;

      ctx.lineWidth = p.layer === 'foreground' ? 2.2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + angleOffset, py + streakLen);
      ctx.stroke();
    }

    this.renderRainSplashes(ctx, dt);
    this.renderLensDroplets(ctx, width, height, dt, timeMs);

    const rainHaze = ctx.createLinearGradient(0, height * 0.6, 0, height);
    rainHaze.addColorStop(0, 'transparent');
    rainHaze.addColorStop(0.5, 'rgba(203, 213, 225, 0.14)');
    rainHaze.addColorStop(1, 'rgba(148, 163, 184, 0.22)');
    ctx.fillStyle = rainHaze;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.restore();
  }

  private addRainSplash(x: number, y: number) {
    if (this.rainSplashes.length < 50) {
      this.rainSplashes.push({
        x,
        y,
        radius: 2,
        maxRadius: 10 + Math.random() * 8,
        alpha: 0.75,
        life: 1.0,
      });
    }
  }

  private renderRainSplashes(ctx: CanvasRenderingContext2D, dt: number) {
    for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
      const sp = this.rainSplashes[i];
      sp.radius += (sp.maxRadius - sp.radius) * 0.12;
      sp.life -= dt / 350;
      sp.alpha = Math.max(0, sp.life * 0.75);

      if (sp.life <= 0) {
        this.rainSplashes.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, sp.radius, sp.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(224, 242, 254, ${sp.alpha})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sp.x, sp.y - sp.radius * 0.6, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 249, 255, ${sp.alpha})`;
      ctx.fill();
    }
  }

  private renderLensDroplets(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    timeMs: number
  ) {
    ctx.save();
    for (const drop of this.lensDroplets) {
      if (drop.speed > 0) {
        drop.y += drop.speed * dt;
        if (drop.y > 0.95) {
          drop.y = 0.05 + Math.random() * 0.2;
          drop.x = 0.05 + Math.random() * 0.9;
        }
      }

      const dx = drop.x * width;
      const dy = drop.y * height;
      const r = drop.radius;

      if (drop.trailLength > 0) {
        ctx.beginPath();
        ctx.moveTo(dx, dy - drop.trailLength);
        ctx.lineTo(dx, dy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.alpha * 0.35})`;
        ctx.lineWidth = r * 0.6;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15, 23, 42, ${drop.alpha * 0.35})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 249, 255, ${drop.alpha * 0.55})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dx - r * 0.3, dy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${drop.alpha * 0.95})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // 7. MIST & FOG: Dense, Tangible Volumetric Lake & Forest Fog Banks
  // =========================================================================
  private renderFog(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeMs: number,
    waterArea?: { ymin: number; xmin: number; ymax: number; xmax: number }
  ) {
    ctx.save();
    const t = timeMs * 0.0002;

    const horizonFogY = height * 0.28;
    const fogHeight = height * 0.55;
    const fogGrad = ctx.createLinearGradient(0, horizonFogY, 0, horizonFogY + fogHeight);
    fogGrad.addColorStop(0, 'rgba(241, 245, 249, 0.2)');
    fogGrad.addColorStop(0.3, 'rgba(226, 232, 240, 0.65)');
    fogGrad.addColorStop(0.7, 'rgba(203, 213, 225, 0.72)');
    fogGrad.addColorStop(1, 'rgba(248, 250, 252, 0.15)');

    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, horizonFogY, width, fogHeight);

    const lakeY = waterArea ? (waterArea.ymin / 1000) * height : height * 0.52;
    const lakeH = waterArea ? ((waterArea.ymax - waterArea.ymin) / 1000) * height : height * 0.42;

    const waterMist = ctx.createLinearGradient(0, lakeY - 30, 0, lakeY + lakeH * 0.7);
    waterMist.addColorStop(0, 'transparent');
    waterMist.addColorStop(0.3, 'rgba(248, 250, 252, 0.48)');
    waterMist.addColorStop(0.7, 'rgba(226, 232, 240, 0.55)');
    waterMist.addColorStop(1, 'transparent');
    ctx.fillStyle = waterMist;
    ctx.fillRect(0, lakeY - 30, width, lakeH * 0.75);

    for (let i = 0; i < 8; i++) {
      const driftSpeed = 0.04 + (i % 3) * 0.02;
      const x = ((t * driftSpeed * 2.5 + i * 0.28) % 1.3 - 0.15) * width;
      const y = height * (0.32 + (i % 4) * 0.12) + Math.sin(t * 2 + i) * 16;
      const radiusX = width * (0.26 + (i % 3) * 0.08);
      const radiusY = height * (0.09 + (i % 2) * 0.04);

      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
      ctx.filter = 'blur(20px)';
      ctx.fill();
    }
    ctx.filter = 'none';

    ctx.fillStyle = 'rgba(226, 232, 240, 0.18)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // =========================================================================
  // 8. ANIMAL BREATH VAPOR PUFFS (Winter only)
  // =========================================================================
  private renderBreathPuffs(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number
  ) {
    if (this.breathPuffs.length === 0) return;

    ctx.save();
    for (let i = this.breathPuffs.length - 1; i >= 0; i--) {
      const puff = this.breathPuffs[i];
      puff.x += puff.vx * dt;
      puff.y += puff.vy * dt;
      puff.radius += (puff.maxRadius - puff.radius) * 0.045;
      puff.life -= dt / 1600;
      puff.alpha = Math.max(0, puff.life * 0.65);

      if (puff.life <= 0) {
        this.breathPuffs.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 248, 255, ${puff.alpha})`;
      ctx.filter = 'blur(4px)';
      ctx.fill();
    }
    ctx.filter = 'none';
    ctx.restore();
  }
}
