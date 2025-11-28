import React, { useRef, useEffect, useState } from 'react';
import { Camera, Scan, RefreshCw } from 'lucide-react';
import { BrutalButton } from './UIComponents';

interface ScannerProps {
  onScanComplete: (image: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Camera Access Denied", err);
      // Fallback for non-https/permissions issues
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Simulate "Analyzing" delay
      setTimeout(() => {
        onScanComplete(dataUrl);
      }, 1500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      {/* Viewport */}
      <div className="relative flex-1 overflow-hidden">
        {streamActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <p className="text-cyan-500 font-mono">OPTICAL SENSORS OFFLINE</p>
          </div>
        )}
        
        {/* AR Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 font-mono text-xs text-cyan-400">
          <div>LAT: 34.0522 N</div>
          <div>LNG: 118.2437 W</div>
          <div>NET_STATUS: UNSTABLE</div>
        </div>

        {/* Target Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-400/50">
           <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
           <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
           <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
           <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
           {scanning && <div className="scan-line top-0"></div>}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="h-32 bg-black border-t border-cyan-900 p-6 flex justify-around items-center">
        <BrutalButton variant="secondary" onClick={onCancel}>
          ABORT
        </BrutalButton>
        
        <button 
          onClick={capture}
          disabled={scanning}
          className="w-20 h-20 rounded-full border-4 border-cyan-400 bg-black flex items-center justify-center relative hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center">
            {scanning ? <RefreshCw className="animate-spin text-cyan-200" /> : <Scan className="text-cyan-200" />}
          </div>
        </button>

        <div className="w-24"></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default Scanner;