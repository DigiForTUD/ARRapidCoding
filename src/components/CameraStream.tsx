import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { LakePreset, NormalizedRect, Season, WeatherCondition } from '../types';

interface CameraStreamProps {
  onCaptureFrame: (base64Image: string) => void;
  activePreset: LakePreset | null;
  isScanning: boolean;
  onClearPreset: () => void;
  onRequestPresetModal: () => void;
  season?: Season;
  weather?: WeatherCondition;
  forestRegion?: NormalizedRect | null;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  onCaptureFrame,
  activePreset,
  isScanning,
  onClearPreset,
  onRequestPresetModal,
  season = 'summer',
  weather = 'clear',
  forestRegion = null,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasCaptureRef = useRef<HTMLCanvasElement | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Determine current backdrop image (switches to snow-covered winter photo if winter season)
  const currentPresetImage = activePreset
    ? season === 'winter' && activePreset.winterImage
      ? activePreset.winterImage
      : activePreset.image
    : null;

  // Initialize camera
  const startCamera = useCallback(async () => {
    if (activePreset) return; // In preset mode, no camera needed

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. You can still test with beautiful lake scenery presets!'
          : 'Unable to access video camera. Using lake demo simulation mode.'
      );
    }
  }, [facingMode, activePreset]);

  // Restart camera on facing mode or preset clear
  useEffect(() => {
    if (!activePreset) {
      startCamera();
    } else {
      // Stop camera if preset is selected to save battery
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsCameraActive(false);
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera, activePreset]);

  // Frame capture function (takes snapshot of video or preset image)
  const captureCurrentFrame = useCallback(() => {
    if (currentPresetImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 480);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          onCaptureFrame(base64);
        }
      };
      img.src = currentPresetImage;
      return;
    }

    const video = videoRef.current;
    if (!video || !isCameraActive || video.videoWidth === 0) return;

    if (!canvasCaptureRef.current) {
      canvasCaptureRef.current = document.createElement('canvas');
    }
    const canvas = canvasCaptureRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, 640, 480);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      onCaptureFrame(base64);
    }
  }, [currentPresetImage, isCameraActive, onCaptureFrame]);

  // Auto-scan trigger
  useEffect(() => {
    if (isScanning) {
      captureCurrentFrame();
    }
  }, [isScanning, captureCurrentFrame]);

  // Toggle camera direction
  const toggleCameraDirection = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Environmental visual filter style based on season & weather
  let filterStyle = '';
  if (weather === 'wildfire') {
    filterStyle = 'brightness(0.82) contrast(1.25) saturate(1.45) sepia(0.36) hue-rotate(-22deg)';
  } else if (weather === 'flood') {
    filterStyle = 'brightness(0.80) contrast(1.12) saturate(0.78) hue-rotate(-8deg)';
  } else if (season === 'summer' && weather === 'clear') {
    filterStyle = 'brightness(1.05) saturate(1.15) contrast(1.03) sepia(0.04)';
  } else if (season === 'winter' && weather !== 'rain') {
    filterStyle = 'brightness(1.04) contrast(1.08) saturate(0.92) hue-rotate(-5deg)';
  } else if (weather === 'rain') {
    filterStyle = 'brightness(0.85) contrast(0.96) saturate(0.82) hue-rotate(-4deg)';
  } else if (weather === 'fog') {
    filterStyle = 'contrast(0.78) brightness(0.95) saturate(0.82)';
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
      {/* 1. Live Camera Stream */}
      {!activePreset && (
        <video
          id="ar-camera-feed"
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ filter: filterStyle }}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-[filter] duration-700"
        />
      )}

      {/* 2. Lake Preset Backdrop (when preset is active) */}
      {activePreset && currentPresetImage && (
        <div className="absolute inset-0 z-0">
          <img
            key={currentPresetImage}
            src={currentPresetImage}
            alt={activePreset.name}
            style={{ filter: filterStyle }}
            className="w-full h-full object-cover transition-opacity duration-700"
          />

          {/* Preset indicator pill */}
          <div className="absolute bottom-6 left-6 z-10 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-white/90 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                season === 'winter' ? 'bg-sky-400' : 'bg-emerald-400'
              } animate-pulse`}
            />
            <span>
              Preset: {activePreset.name}{' '}
              {season === 'winter' ? '(Winter Snow Edition)' : ''}
            </span>
            <button
              id="btn-return-camera"
              onClick={onClearPreset}
              className="ml-2 underline text-sky-300 hover:text-sky-200 transition-colors"
            >
              Use Live Camera
            </button>
          </div>
        </div>
      )}

      {/* 3. Environmental Atmosphere Backdrop Layers */}
      {/* A. Rain: Overcast storm clouds at top of horizon */}
      {weather === 'rain' && (
        <div
          className="absolute inset-x-0 top-0 h-2/3 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.45) 40%, rgba(51, 65, 85, 0.15) 75%, transparent 100%)',
          }}
        />
      )}

      {/* B. Sunny Summer: Golden light radiating across scene */}
      {season === 'summer' && weather === 'clear' && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(ellipse at 18% 12%, rgba(254, 240, 138, 0.22) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 75%)',
          }}
        />
      )}

      {/* C. Winter: Cool frost vignette around scene borders */}
      {season === 'winter' && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            boxShadow: 'inset 0 0 90px rgba(186, 230, 253, 0.28)',
          }}
        />
      )}

      {/* D. Fog: Atmospheric soft haze wash */}
      {weather === 'fog' && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(to bottom, rgba(241, 245, 249, 0.28) 0%, rgba(226, 232, 240, 0.38) 45%, rgba(203, 213, 225, 0.25) 80%, transparent 100%)',
          }}
        />
      )}

      {/* E. Wildfire: Smoky ambient red-amber radial heat glow + Burning Forest Trees in Picture */}
      {weather === 'wildfire' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
            style={{
              background:
                'radial-gradient(ellipse at 50% 35%, rgba(249, 115, 22, 0.32) 0%, rgba(185, 28, 28, 0.28) 55%, rgba(24, 24, 27, 0.6) 100%)',
            }}
          />
          {forestRegion && (
            <div
              className="absolute pointer-events-none z-[1] transition-opacity duration-1000 overflow-hidden"
              style={{
                top: `${forestRegion.ymin / 10}%`,
                left: `${forestRegion.xmin / 10}%`,
                width: `${(forestRegion.xmax - forestRegion.xmin) / 10}%`,
                height: `${(forestRegion.ymax - forestRegion.ymin) / 10}%`,
              }}
            >
              {/* Scorched tree darkening: transforms real green tree foliage into charred dark wood */}
              <div
                className="w-full h-full"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(20, 8, 3, 0.76) 0%, rgba(45, 15, 5, 0.84) 60%, rgba(85, 22, 5, 0.68) 100%)',
                  mixBlendMode: 'multiply',
                }}
              />
              {/* Incandescent thermal glow on the real tree branches */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 80%, rgba(255, 115, 0, 0.55) 0%, rgba(220, 38, 38, 0.4) 55%, transparent 90%)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>
          )}
        </>
      )}

      {/* F. Flood: Dark storm cloud surge & water-level tint */}
      {weather === 'flood' && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-700"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15, 23, 42, 0.68) 0%, rgba(30, 41, 59, 0.45) 45%, rgba(51, 65, 85, 0.42) 75%, rgba(30, 41, 59, 0.72) 100%)',
          }}
        />
      )}

      {/* 4. Camera Error / Denied Fallback Banner */}
      {cameraError && !activePreset && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/90 backdrop-blur-sm text-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Camera Unavailable</h2>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            {cameraError}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-retry-camera"
              onClick={startCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-white/10 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              id="btn-use-preset-fallback"
              onClick={onRequestPresetModal}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Choose Lake Preset
            </button>
          </div>
        </div>
      )}

      {/* Camera flip floating pill (when live camera is active) */}
      {!activePreset && isCameraActive && (
        <button
          id="btn-flip-camera"
          onClick={toggleCameraDirection}
          className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-black/65 transition-all shadow-md active:scale-95"
          title="Flip camera"
          aria-label="Switch camera"
        >
          <Camera className="w-5 h-5 text-white/90" />
        </button>
      )}
    </div>
  );
};
