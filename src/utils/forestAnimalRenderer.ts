import { ForestAnimalEntity, Season } from '../types';

/**
 * Renders Forest Wildlife with photographic realism:
 * - European Elk / Moose (Alces alces): massive muscular withers, Roman nose, pendulous throat bell, palmate antlers
 * - European Roe Deer (Capreolus capreolus): delicate graceful frame, foxy reddish pelage, white caudal disc, pearled 3-point antlers
 * Supports seasonal coat adaptation and realistic cold-weather breath condensation.
 */
export function drawForestAnimal(
  ctx: CanvasRenderingContext2D,
  animal: ForestAnimalEntity,
  width: number,
  height: number,
  timeMs: number,
  season: Season = 'summer',
  onBreathPuff?: (x: number, y: number, isFacingLeft: boolean) => void
) {
  const ax = animal.x * width;
  const ay = animal.y * height;

  if (animal.type === 'elk') {
    drawRealisticEuropeanElk(ctx, animal, ax, ay, width, height, timeMs, season, onBreathPuff);
  } else {
    drawRealisticRoeDeer(ctx, animal, ax, ay, width, height, timeMs, season, onBreathPuff);
  }
}

/**
 * 1. European Elk / Moose (Alces alces) - Photorealistic Wildlife Rendering
 */
function drawRealisticEuropeanElk(
  ctx: CanvasRenderingContext2D,
  animal: ForestAnimalEntity,
  ax: number,
  ay: number,
  width: number,
  height: number,
  timeMs: number,
  season: Season,
  onBreathPuff?: (x: number, y: number, isFacingLeft: boolean) => void
) {
  const scale = (animal.scale || 1.0) * Math.min(width, height) * 0.285;
  const isFacingLeft = Math.cos(animal.angle) < 0;

  ctx.save();
  ctx.translate(ax, ay);
  ctx.scale(isFacingLeft ? -1 : 1, 1);

  // Natural walking gait / breathing subtle weight shift
  const walkBob = Math.abs(Math.sin(animal.walkPhase * 2)) * scale * 0.032;
  const headTilt = animal.headTilt + (animal.behavior === 'browsing' ? 0.38 : 0);

  // Cold weather breath vapor condensation from nostrils
  if (
    season === 'winter' &&
    onBreathPuff &&
    Math.floor((timeMs + (animal.id.charCodeAt(0) * 350)) / 3200) !==
      Math.floor((timeMs - 16 + (animal.id.charCodeAt(0) * 350)) / 3200)
  ) {
    const muzzleOffset = isFacingLeft ? -scale * 0.36 : scale * 0.36;
    onBreathPuff(ax + muzzleOffset, ay - scale * 0.33, isFacingLeft);
  }

  // 1. Realistic Soft Contact Shadow on Forest Floor
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, scale * 0.44, scale * 0.54, scale * 0.13, 0, 0, Math.PI * 2);
  ctx.fillStyle = season === 'winter' ? 'rgba(15, 23, 42, 0.42)' : 'rgba(28, 25, 23, 0.45)';
  ctx.filter = 'blur(4.5px)';
  ctx.fill();
  ctx.restore();

  // 2. Realistic Long Stilted Legs with Greyish-Tan "Stockings"
  drawRealisticElkLegs(ctx, scale, animal.walkPhase, animal.behavior === 'walking', season);

  // 3. Heavy Muscular Torso & High Shoulder Hump (Withers)
  ctx.save();
  ctx.translate(0, -walkBob);

  // Anatomical Torso Contour
  ctx.beginPath();
  // Rump sloping forward
  ctx.moveTo(-scale * 0.4, 0.06 * scale);
  ctx.bezierCurveTo(-scale * 0.44, -scale * 0.16, -scale * 0.26, -scale * 0.25, -scale * 0.06, -scale * 0.27);
  // High muscular shoulder hump (withers)
  ctx.bezierCurveTo(scale * 0.06, -scale * 0.35, scale * 0.17, -scale * 0.39, scale * 0.24, -scale * 0.33);
  // Deep massive brisket/chest
  ctx.bezierCurveTo(scale * 0.32, -scale * 0.14, scale * 0.3, scale * 0.12, scale * 0.15, scale * 0.16);
  // Tucked belly line
  ctx.bezierCurveTo(-scale * 0.04, scale * 0.14, -scale * 0.26, scale * 0.15, -scale * 0.4, 0.06 * scale);
  ctx.closePath();

  // Multi-toned grizzled guard-hair coat gradient
  const coatGrad = ctx.createLinearGradient(-scale * 0.4, -scale * 0.36, scale * 0.3, scale * 0.16);
  if (season === 'winter') {
    // Dense winter coat: slate-black with grizzled grey tips
    coatGrad.addColorStop(0, '#18181B');
    coatGrad.addColorStop(0.35, '#27272A');
    coatGrad.addColorStop(0.7, '#1C1917');
    coatGrad.addColorStop(1.0, '#09090B');
  } else {
    // Summer coat: deep chocolate umber
    coatGrad.addColorStop(0, '#1C1917');
    coatGrad.addColorStop(0.4, '#292524');
    coatGrad.addColorStop(0.8, '#332924');
    coatGrad.addColorStop(1.0, '#1C1917');
  }
  ctx.fillStyle = coatGrad;
  ctx.fill();

  // Volumetric muscle contours along shoulder scapula and rib cage
  ctx.save();
  ctx.clip();
  const muscleGrad = ctx.createRadialGradient(scale * 0.12, -scale * 0.15, scale * 0.05, scale * 0.12, -scale * 0.15, scale * 0.25);
  muscleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  muscleGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = muscleGrad;
  ctx.fillRect(-scale * 0.45, -scale * 0.4, scale * 0.8, scale * 0.6);

  // Micro coarse hair texture along dorsal ridge
  ctx.strokeStyle = season === 'winter' ? 'rgba(214, 211, 209, 0.15)' : 'rgba(168, 162, 158, 0.12)';
  ctx.lineWidth = 0.8;
  for (let hx = -scale * 0.35; hx < scale * 0.22; hx += 4) {
    ctx.beginPath();
    ctx.moveTo(hx, -scale * 0.28);
    ctx.lineTo(hx + 2, -scale * 0.33);
    ctx.stroke();
  }
  ctx.restore();

  // Winter frost dusting on shoulder hump
  if (season === 'winter') {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(scale * 0.04, -scale * 0.34);
    ctx.quadraticCurveTo(scale * 0.15, -scale * 0.38, scale * 0.23, -scale * 0.32);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 2.8;
    ctx.filter = 'blur(1.2px)';
    ctx.stroke();
    ctx.restore();
  }

  // Short vestigial tail
  ctx.beginPath();
  ctx.moveTo(-scale * 0.4, 0.04 * scale);
  ctx.lineTo(-scale * 0.46, 0.09 * scale);
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 4. Heavy Neck, Prehensile Roman Nose, Bell Dewlap & Palmate Antlers
  drawRealisticElkHead(ctx, scale, headTilt, animal.earFlick, timeMs, animal.gender === 'male', season);

  ctx.restore();
  ctx.restore();
}

/**
 * Realistic long stilted legs with authentic pale "stockings" (greyish-tan lower limbs)
 */
function drawRealisticElkLegs(
  ctx: CanvasRenderingContext2D,
  scale: number,
  phase: number,
  isWalking: boolean,
  season: Season
) {
  const stockingColor = season === 'winter' ? '#94A3B8' : '#78716C';
  const thighColor = season === 'winter' ? '#18181B' : '#1C1917';
  const hoofColor = '#09090B';

  const stride1 = isWalking ? Math.sin(phase) * scale * 0.13 : 0;
  const stride2 = isWalking ? Math.sin(phase + Math.PI) * scale * 0.13 : 0;

  // Back legs
  drawSingleElkLeg(ctx, -scale * 0.28, scale * 0.08, stride1, scale * 0.36, thighColor, stockingColor, hoofColor);
  drawSingleElkLeg(ctx, -scale * 0.21, scale * 0.06, -stride1 * 0.8, scale * 0.36, thighColor, stockingColor, hoofColor, true);

  // Front legs
  drawSingleElkLeg(ctx, scale * 0.16, scale * 0.1, stride2, scale * 0.35, thighColor, stockingColor, hoofColor);
  drawSingleElkLeg(ctx, scale * 0.23, scale * 0.08, -stride2 * 0.8, scale * 0.35, thighColor, stockingColor, hoofColor, true);
}

function drawSingleElkLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  stride: number,
  len: number,
  thighColor: string,
  stockingColor: string,
  hoofColor: string,
  isFar = false
) {
  ctx.save();
  if (isFar) ctx.globalAlpha = 0.82;

  // Thigh (dark body color)
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + stride * 0.4, y + len * 0.45); // Knee joint
  ctx.strokeStyle = thighColor;
  ctx.lineWidth = 6.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Lower Cannon Bone / Stocking (characteristic pale greyish-tan)
  ctx.beginPath();
  ctx.moveTo(x + stride * 0.4, y + len * 0.45);
  ctx.lineTo(x + stride, y + len); // Fetlock & hoof
  ctx.strokeStyle = stockingColor;
  ctx.lineWidth = 4.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Cloven black hoof
  ctx.fillStyle = hoofColor;
  ctx.beginPath();
  ctx.ellipse(x + stride + 1, y + len, 4.2, 2.8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Photorealistic European Elk Head:
 * - Elongated convex "Roman nose" profile with bulbous overhanging upper lip
 * - Dark moist rhinarium (naked nose pad) and flared nostril slit
 * - Long hairy throat dewlap ("bell") hanging under the chin
 * - Large alert ears with white inner hair tufts
 * - Massive shovel / palmate antlers with ivory-tipped tines
 */
function drawRealisticElkHead(
  ctx: CanvasRenderingContext2D,
  scale: number,
  headTilt: number,
  earFlick: number,
  timeMs: number,
  isBull: boolean,
  season: Season
) {
  ctx.save();
  const neckBaseX = scale * 0.21;
  const neckBaseY = -scale * 0.22;
  ctx.translate(neckBaseX, neckBaseY);
  ctx.rotate(headTilt);

  // 1. Heavy muscular neck
  ctx.beginPath();
  ctx.moveTo(-scale * 0.04, -scale * 0.08);
  ctx.lineTo(scale * 0.17, -scale * 0.19);
  ctx.lineTo(scale * 0.21, -scale * 0.04);
  ctx.lineTo(scale * 0.07, scale * 0.16);
  ctx.closePath();
  ctx.fillStyle = season === 'winter' ? '#18181B' : '#292524';
  ctx.fill();

  // 2. Throat Bell (Dewlap): Long flap of hairy skin dangling beneath the chin
  ctx.beginPath();
  ctx.moveTo(scale * 0.15, -scale * 0.02);
  ctx.bezierCurveTo(scale * 0.16, scale * 0.09, scale * 0.13, scale * 0.15, scale * 0.15, scale * 0.21);
  ctx.strokeStyle = '#09090B';
  ctx.lineWidth = 4.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Individual hair strands on the bell
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(scale * 0.15, scale * 0.15);
  ctx.lineTo(scale * 0.17, scale * 0.23);
  ctx.stroke();

  // 3. Head & Convex "Roman Nose" Muzzle
  const headX = scale * 0.19;
  const headY = -scale * 0.19;

  ctx.beginPath();
  ctx.moveTo(headX - scale * 0.05, headY - scale * 0.06);
  // Convex frontal ridge sloping down to heavy bulbous prehensile upper lip
  ctx.bezierCurveTo(headX + scale * 0.08, headY - scale * 0.06, headX + scale * 0.14, headY - scale * 0.04, headX + scale * 0.17, -scale * 0.02);
  // Overhanging upper lip
  ctx.bezierCurveTo(headX + scale * 0.18, headY + scale * 0.04, headX + scale * 0.15, headY + scale * 0.07, headX + scale * 0.11, headY + scale * 0.06);
  // Lower jaw and chin
  ctx.lineTo(headX, headY + scale * 0.05);
  ctx.closePath();
  ctx.fillStyle = season === 'winter' ? '#18181B' : '#1C1917';
  ctx.fill();

  // Moist dark rhinarium & nostril
  ctx.beginPath();
  ctx.ellipse(headX + scale * 0.15, headY + scale * 0.012, 3.2, 2.2, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  // Nostril opening slit
  ctx.beginPath();
  ctx.arc(headX + scale * 0.145, headY + scale * 0.01, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Photorealistic liquid dark eye
  const eyeX = headX + scale * 0.03;
  const eyeY = headY - scale * 0.022;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 3.4, 0, Math.PI * 2);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  // White sky catchlight
  ctx.beginPath();
  ctx.arc(eyeX + 0.8, eyeY - 0.8, 1.1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // 4. Large Alert Elk Ears with White Inner Lining
  const earTwitch = Math.sin(earFlick * 8) * 0.18;
  ctx.save();
  ctx.translate(headX - scale * 0.03, headY - scale * 0.05);
  ctx.rotate(-0.48 + earTwitch);

  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.065, scale * 0.038, scale * 0.085, 0, 0, Math.PI * 2);
  ctx.fillStyle = season === 'winter' ? '#27272A' : '#44403C';
  ctx.fill();

  // Inner hair tuft
  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.065, scale * 0.019, scale * 0.062, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E7E5E4';
  ctx.fill();
  ctx.restore();

  // 5. Massive Shovel / Palmate Antlers (Bull Elk)
  if (isBull) {
    drawRealisticPalmateAntlers(ctx, scale, headX - scale * 0.02, headY - scale * 0.08);
  }

  ctx.restore();
}

/**
 * Authentic Palmate / Shovel Antlers of the European Elk (Bull)
 */
function drawRealisticPalmateAntlers(ctx: CanvasRenderingContext2D, scale: number, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Pearled burr / coronet at skull base
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 0.04, scale * 0.016, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#44403C';
  ctx.fill();

  // Broad flattened shovel palm with ivory-tipped tines
  const antlerGrad = ctx.createLinearGradient(-scale * 0.12, -scale * 0.38, scale * 0.18, 0);
  antlerGrad.addColorStop(0, '#FAFAF9'); // Pale ivory tips
  antlerGrad.addColorStop(0.45, '#E7E5E4'); // Polished bone
  antlerGrad.addColorStop(0.8, '#A8A29E'); // Greyish bone core
  antlerGrad.addColorStop(1.0, '#57534E'); // Dark pearled base

  ctx.fillStyle = antlerGrad;
  ctx.strokeStyle = '#44403C';
  ctx.lineWidth = 1.8;

  // Shovel palm contour with protruding tines
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-scale * 0.06, -scale * 0.1);
  ctx.lineTo(-scale * 0.15, -scale * 0.16); // Tine 1 (anterior)
  ctx.lineTo(-scale * 0.11, -scale * 0.19);
  ctx.lineTo(-scale * 0.18, -scale * 0.28); // Tine 2
  ctx.lineTo(-scale * 0.1, -scale * 0.27);
  ctx.lineTo(-scale * 0.14, -scale * 0.38); // High terminal tine
  ctx.lineTo(-scale * 0.05, -scale * 0.33);
  ctx.lineTo(-scale * 0.02, -scale * 0.4); // Apex tine
  ctx.lineTo(scale * 0.05, -scale * 0.31);
  ctx.lineTo(scale * 0.07, -scale * 0.22);
  ctx.lineTo(scale * 0.03, -scale * 0.14);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  // Forward brow tine
  ctx.beginPath();
  ctx.moveTo(-scale * 0.02, -scale * 0.04);
  ctx.lineTo(scale * 0.09, -scale * 0.13); // Sharp forward tine
  ctx.lineTo(scale * 0.05, -scale * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * 2. European Roe Deer (Capreolus capreolus) - Photorealistic Wildlife Rendering
 */
function drawRealisticRoeDeer(
  ctx: CanvasRenderingContext2D,
  animal: ForestAnimalEntity,
  ax: number,
  ay: number,
  width: number,
  height: number,
  timeMs: number,
  season: Season,
  onBreathPuff?: (x: number, y: number, isFacingLeft: boolean) => void
) {
  const scale = (animal.scale || 1.0) * Math.min(width, height) * 0.185;
  const isFacingLeft = Math.cos(animal.angle) < 0;

  ctx.save();
  ctx.translate(ax, ay);
  ctx.scale(isFacingLeft ? -1 : 1, 1);

  const walkBob = Math.abs(Math.sin(animal.walkPhase * 2)) * scale * 0.026;
  const isAlert = animal.behavior === 'alert';
  const isGrazing = animal.behavior === 'grazing';
  const headTilt = animal.headTilt + (isGrazing ? 0.78 : isAlert ? -0.22 : 0);

  // Cold weather breath vapor condensation
  if (
    season === 'winter' &&
    onBreathPuff &&
    Math.floor((timeMs + (animal.id.charCodeAt(0) * 280)) / 2800) !==
      Math.floor((timeMs - 16 + (animal.id.charCodeAt(0) * 280)) / 2800)
  ) {
    const muzzleOffset = isFacingLeft ? -scale * 0.33 : scale * 0.33;
    onBreathPuff(ax + muzzleOffset, ay - scale * 0.25, isFacingLeft);
  }

  // 1. Soft Ground Contact Shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, scale * 0.42, scale * 0.4, scale * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = season === 'winter' ? 'rgba(15, 23, 42, 0.38)' : 'rgba(28, 25, 23, 0.4)';
  ctx.filter = 'blur(3.5px)';
  ctx.fill();
  ctx.restore();

  // 2. Slender Graceful Cervid Legs
  drawRealisticRoeDeerLegs(ctx, scale, animal.walkPhase, animal.behavior === 'walking', season);

  // 3. Graceful Torso & Foxy Reddish Pelage (Summer) vs Slate-Grey (Winter)
  ctx.save();
  ctx.translate(0, -walkBob);

  ctx.beginPath();
  ctx.moveTo(-scale * 0.32, 0.02 * scale);
  ctx.bezierCurveTo(-scale * 0.34, -scale * 0.15, -scale * 0.19, -scale * 0.22, 0, -scale * 0.2);
  ctx.bezierCurveTo(scale * 0.13, -scale * 0.2, scale * 0.19, -scale * 0.15, scale * 0.23, -scale * 0.08);
  ctx.bezierCurveTo(scale * 0.23, scale * 0.05, scale * 0.13, scale * 0.1, 0, scale * 0.1);
  ctx.bezierCurveTo(-scale * 0.16, scale * 0.1, -scale * 0.26, scale * 0.08, -scale * 0.32, 0.02 * scale);
  ctx.closePath();

  const coatGrad = ctx.createLinearGradient(-scale * 0.32, -scale * 0.2, scale * 0.23, scale * 0.1);
  if (season === 'winter') {
    // Dense slate/grey-brown winter pelage with fine buff undertones
    coatGrad.addColorStop(0, '#475569');
    coatGrad.addColorStop(0.5, '#64748B');
    coatGrad.addColorStop(1.0, '#334155');
  } else {
    // Summer: Rich, glowing foxy reddish-chestnut pelage
    coatGrad.addColorStop(0, '#9A3412');
    coatGrad.addColorStop(0.45, '#C2410C');
    coatGrad.addColorStop(0.8, '#EA580C');
    coatGrad.addColorStop(1.0, '#7C2D12');
  }
  ctx.fillStyle = coatGrad;
  ctx.fill();

  // 4. Pure White Kidney-Shaped Caudal Disc (Rump Patch)
  ctx.beginPath();
  ctx.ellipse(-scale * 0.31, 0.01 * scale, scale * 0.065, scale * 0.075, 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // 5. Slender Neck, Alert Head, Dark Eyes, White Chin & 3-Pointed Antlers
  drawRealisticRoeDeerHead(ctx, scale, headTilt, animal.earFlick, isAlert, animal.gender === 'male', season);

  ctx.restore();
  ctx.restore();
}

/**
 * Slender legs with dainty cloven black hooves
 */
function drawRealisticRoeDeerLegs(
  ctx: CanvasRenderingContext2D,
  scale: number,
  phase: number,
  isWalking: boolean,
  season: Season
) {
  const legColor = season === 'winter' ? '#64748B' : '#C2410C';
  const shadowLegColor = season === 'winter' ? '#475569' : '#9A3412';
  const hoofColor = '#09090B';

  const stride1 = isWalking ? Math.sin(phase) * scale * 0.11 : 0;
  const stride2 = isWalking ? Math.sin(phase + Math.PI) * scale * 0.11 : 0;

  // Back legs
  drawSingleRoeLeg(ctx, -scale * 0.22, scale * 0.06, stride1, scale * 0.36, legColor, hoofColor);
  drawSingleRoeLeg(ctx, -scale * 0.17, scale * 0.04, -stride1 * 0.7, scale * 0.36, shadowLegColor, hoofColor, true);

  // Front legs
  drawSingleRoeLeg(ctx, scale * 0.14, scale * 0.05, stride2, scale * 0.36, legColor, hoofColor);
  drawSingleRoeLeg(ctx, scale * 0.19, scale * 0.03, -stride2 * 0.7, scale * 0.36, shadowLegColor, hoofColor, true);
}

function drawSingleRoeLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  stride: number,
  len: number,
  color: string,
  hoofColor: string,
  isFar = false
) {
  ctx.save();
  if (isFar) ctx.globalAlpha = 0.85;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + stride * 0.3, y + len * 0.48); // Dainty knee
  ctx.lineTo(x + stride, y + len); // Hoof
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Delicate black cloven hoof
  ctx.fillStyle = hoofColor;
  ctx.beginPath();
  ctx.ellipse(x + stride + 0.5, y + len, 3, 2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Photorealistic Roe Deer Head:
 * - Slender arched neck
 * - Pure white chin patch and white muzzle patch with black mustache marks
 * - Large expressive dark liquid eye with tear duct
 * - Large oval mobile ears with white inner hair tufts
 * - Rugged 3-pointed antlers (Roe Buck) with pearled burr and ivory tips
 */
function drawRealisticRoeDeerHead(
  ctx: CanvasRenderingContext2D,
  scale: number,
  headTilt: number,
  earFlick: number,
  isAlert: boolean,
  isBuck: boolean,
  season: Season
) {
  ctx.save();
  const neckBaseX = scale * 0.19;
  const neckBaseY = -scale * 0.14;
  ctx.translate(neckBaseX, neckBaseY);
  ctx.rotate(headTilt);

  // 1. Slender arched neck
  ctx.beginPath();
  ctx.moveTo(-scale * 0.03, -scale * 0.04);
  ctx.lineTo(scale * 0.11, -scale * 0.23);
  ctx.lineTo(scale * 0.17, -scale * 0.16);
  ctx.lineTo(scale * 0.06, scale * 0.06);
  ctx.closePath();
  ctx.fillStyle = season === 'winter' ? '#64748B' : '#C2410C';
  ctx.fill();

  // 2. Delicate Head
  const headX = scale * 0.15;
  const headY = -scale * 0.25;

  ctx.beginPath();
  ctx.moveTo(headX - scale * 0.04, headY - scale * 0.04);
  ctx.lineTo(headX + scale * 0.13, headY);
  ctx.lineTo(headX + scale * 0.1, headY + scale * 0.05);
  ctx.lineTo(headX, headY + scale * 0.04);
  ctx.closePath();
  ctx.fillStyle = season === 'winter' ? '#475569' : '#9A3412';
  ctx.fill();

  // Pure white chin patch and muzzle band
  ctx.beginPath();
  ctx.ellipse(headX + scale * 0.09, headY + scale * 0.04, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Moist black nose
  ctx.beginPath();
  ctx.ellipse(headX + scale * 0.12, headY + scale * 0.018, 2.6, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  // Black "mustache" spots beside nostrils
  ctx.fillStyle = '#000000';
  ctx.fillRect(headX + scale * 0.105, headY + scale * 0.025, 1.5, 1.5);

  // Large expressive dark eye with tear duct
  const eyeX = headX + scale * 0.035;
  const eyeY = headY - scale * 0.016;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#09090B';
  ctx.fill();

  // Sky catchlight reflection
  ctx.beginPath();
  ctx.arc(eyeX + 0.9, eyeY - 0.9, 1.1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // 3. Large Alert Mobile Ears with White Inner Tuft
  const earTwitch = isAlert ? 0 : Math.sin(earFlick * 10) * 0.22;
  ctx.save();
  ctx.translate(headX - scale * 0.02, headY - scale * 0.05);
  ctx.rotate(-0.42 + earTwitch);

  // Outer ear
  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.052, scale * 0.042, scale * 0.082, 0, 0, Math.PI * 2);
  ctx.fillStyle = season === 'winter' ? '#475569' : '#9A3412';
  ctx.fill();

  // Inner white hair lining
  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.052, scale * 0.022, scale * 0.062, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF3C7';
  ctx.fill();
  ctx.restore();

  // 4. Rugged 3-Pointed Antlers (Roe Buck)
  if (isBuck) {
    drawRealisticRoeBuckAntlers(ctx, scale, headX, headY - scale * 0.04);
  }

  ctx.restore();
}

/**
 * Distinctive upright 3-pointed antlers of the Roe Buck with pearled burr
 */
function drawRealisticRoeBuckAntlers(ctx: CanvasRenderingContext2D, scale: number, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Pearled coronet / burr at base
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 0.032, scale * 0.014, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#57534E';
  ctx.fill();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  // Main upright beam
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(scale * 0.02, -scale * 0.1);

  // Brow tine forward
  ctx.moveTo(scale * 0.01, -scale * 0.04);
  ctx.lineTo(scale * 0.055, -scale * 0.075);

  // Top anterior tine
  ctx.moveTo(scale * 0.02, -scale * 0.1);
  ctx.lineTo(scale * 0.042, -scale * 0.165);

  // Backward tine
  ctx.moveTo(scale * 0.02, -scale * 0.1);
  ctx.lineTo(-scale * 0.015, -scale * 0.145);

  ctx.stroke();

  // Ivory tips
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(scale * 0.055, -scale * 0.075, 1.2, 0, Math.PI * 2);
  ctx.arc(scale * 0.042, -scale * 0.165, 1.2, 0, Math.PI * 2);
  ctx.arc(-scale * 0.015, -scale * 0.145, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
