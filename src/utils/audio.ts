/**
 * Web Audio synthesizer for waterfowl species calls, forest wildlife, and environmental sounds.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/**
 * 1. Common Pochard call
 */
export function playPochardCall(variant: 'male_whistle' | 'female_croak' = 'male_whistle') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (variant === 'male_whistle') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.45);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  } else {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }
}

/**
 * 2. Mallard "quack-quack" call
 */
export function playMallardQuack() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const triggerQuack = (delay: number, pitchFactor = 1.0) => {
    const t = now + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380 * pitchFactor, t);
    osc.frequency.exponentialRampToValueAtTime(220 * pitchFactor, t + 0.22);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * pitchFactor, t);
    filter.Q.setValueAtTime(2.2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  };

  triggerQuack(0, 1.0);
  triggerQuack(0.24, 0.9);
}

/**
 * 3. Mandarin Duck whistle-cluck call
 */
export function playMandarinCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(1450, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(750, now + 0.32);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.36);
}

/**
 * 4. Eurasian Teal high-pitched piping whistle ("krik-krik")
 */
export function playTealCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const playChirp = (delay: number) => {
    const t = now + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(2100, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  };

  playChirp(0);
  playChirp(0.14);
}

/**
 * 5. Tufted Duck breathy clicking purr
 */
export function playTuftedDuckCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.linearRampToValueAtTime(260, now + 0.22);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(550, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * 6. European Elk / Moose deep gut grunt & bugle
 */
export function playElkCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(85, now + 0.45);
  osc.frequency.linearRampToValueAtTime(70, now + 0.8);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);
}

/**
 * 7. European Roe Deer soft alarm bark
 */
export function playRoeDeerCall() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Water splash when diving or surfacing
 */
export function playWaterSplash(isSubmerge = true) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * (isSubmerge ? 0.35 : 0.25));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isSubmerge ? 1200 : 1600, now);
  filter.frequency.exponentialRampToValueAtTime(240, now + (isSubmerge ? 0.32 : 0.22));

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isSubmerge ? 0.35 : 0.25));

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * Droplet plop sound for breadcrumbs
 */
export function playWaterPlop() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Foliage rustle sound for forest wildlife browsing
 */
export function playFoliageRustle() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.3);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(1.2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * Weather ambient sound: Gentle rain shower
 */
export function playRainSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.9);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * 0.6;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(1400, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);

  noise.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

/**
 * Weather ambient sound: Cold winter wind gust
 */
export function playWinterWind() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.9);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(280, now);
  filter.Q.setValueAtTime(4.0, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.0);
}

/**
 * Weather ambient sound: Warm summer breeze
 */
export function playSummerBreeze() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(460, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(390, now + 0.7);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.8);
}

/**
 * Weather ambient sound: Wildfire crackling embers and roaring blaze
 */
export function playWildfireSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Low rumbling roar of the flames
  const roarOsc = ctx.createOscillator();
  const roarGain = ctx.createGain();
  const roarFilter = ctx.createBiquadFilter();

  roarOsc.type = 'sawtooth';
  roarOsc.frequency.setValueAtTime(65, now);
  roarOsc.frequency.exponentialRampToValueAtTime(95, now + 0.4);
  roarOsc.frequency.exponentialRampToValueAtTime(55, now + 1.1);

  roarFilter.type = 'lowpass';
  roarFilter.frequency.setValueAtTime(140, now);

  roarGain.gain.setValueAtTime(0.001, now);
  roarGain.gain.linearRampToValueAtTime(0.16, now + 0.15);
  roarGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  roarOsc.connect(roarFilter);
  roarFilter.connect(roarGain);
  roarGain.connect(ctx.destination);

  roarOsc.start(now);
  roarOsc.stop(now + 1.25);

  // 2. Crackling sparks / popping embers (bursts of bandpassed noise)
  const bufferSize = ctx.sampleRate * 0.8;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Sparse pops
    output[i] = Math.random() < 0.04 ? (Math.random() * 2 - 1) * 0.8 : 0;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const crackleFilter = ctx.createBiquadFilter();
  crackleFilter.type = 'bandpass';
  crackleFilter.frequency.setValueAtTime(1800, now);
  crackleFilter.Q.setValueAtTime(3.0, now);

  const crackleGain = ctx.createGain();
  crackleGain.gain.setValueAtTime(0.001, now);
  crackleGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
  crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  noiseSource.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 0.88);
}

/**
 * Weather ambient sound: Rushing flood torrents and turbulent surging water
 */
export function playFloodSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Heavy rushing water torrent (filtered continuous noise)
  const bufferSize = ctx.sampleRate * 1.4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(250, now);
  filter.frequency.exponentialRampToValueAtTime(550, now + 0.5);
  filter.frequency.exponentialRampToValueAtTime(280, now + 1.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 1.45);

  // 2. Low resonant water surge oscillator
  const surgeOsc = ctx.createOscillator();
  const surgeGain = ctx.createGain();
  surgeOsc.type = 'sine';
  surgeOsc.frequency.setValueAtTime(90, now);
  surgeOsc.frequency.linearRampToValueAtTime(140, now + 0.6);
  surgeOsc.frequency.linearRampToValueAtTime(80, now + 1.3);

  surgeGain.gain.setValueAtTime(0.001, now);
  surgeGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
  surgeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

  surgeOsc.connect(surgeGain);
  surgeGain.connect(ctx.destination);

  surgeOsc.start(now);
  surgeOsc.stop(now + 1.4);
}

