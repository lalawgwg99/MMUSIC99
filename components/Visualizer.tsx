
import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { VibeStyle } from '../types';
import { STYLE_COLORS } from '../constants';

interface VisualizerProps {
  activeStyles: VibeStyle[];
  isPlaying: boolean;
  onClick: () => void;
  isComposing: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ activeStyles, isPlaying, onClick, isComposing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Handle resizing
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      // Base radius for the "Eye"
      const baseRadius = Math.min(width, height) * 0.25; 

      ctx.clearRect(0, 0, width, height);

      // --- Idle / Composing State ---
      if (!isPlaying) {
        // Draw a breathing circle
        const time = Date.now() / 1000;
        const breath = Math.sin(time * 2) * 5;
        const radius = baseRadius + breath;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        if (isComposing) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 10]);
            rotationRef.current += 0.05;
        } else {
            ctx.strokeStyle = activeStyles.length > 0 ? STYLE_COLORS[activeStyles[0]] : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            rotationRef.current = 0;
        }

        // Apply rotation for loading effect
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);
        ctx.translate(-centerX, -centerY);
        ctx.stroke();
        ctx.restore();

        // Inner text
        ctx.font = isComposing ? "12px monospace" : "14px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Text is drawn in parent usually, but we can add effects here if needed
        return;
      }

      // --- Playing State (Polar Visualization) ---
      const analyser = audioEngine.getAnalyser();
      // Use Frequency Data for spectral visualizer instead of waveform for the "Eye" effect
      // But waveform is smoother for circles. Let's stick to waveform but map to polar.
      const values = analyser.getValue(); 
      
      // Determine Colors
      const primaryColor = activeStyles.length > 0 ? STYLE_COLORS[activeStyles[0]] : '#fff';
      const secondaryColor = activeStyles.length > 1 ? STYLE_COLORS[activeStyles[1]] : '#fff';

      // 1. Draw Outer Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, baseRadius * 2);
      gradient.addColorStop(0, primaryColor + '00'); // Transparent center
      gradient.addColorStop(0.5, primaryColor + '40'); // Mid glow
      gradient.addColorStop(1, '#00000000'); // Fade out

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw The Waveform Ring
      ctx.beginPath();
      
      // We want to close the loop smoothly
      const totalPoints = values.length;
      // Close the circle
      for (let i = 0; i <= totalPoints; i++) {
        // Map index to angle
        const angle = (i / totalPoints) * Math.PI * 2 - (Math.PI / 2); // Start at top
        
        // Wrap around index for the last point
        const index = i % totalPoints;
        const v = values[index] as number; 
        
        // Map amplitude to radius
        // v is usually -1 to 1. 
        const offset = v * (baseRadius * 0.4); 
        const r = baseRadius + offset;

        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = primaryColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = primaryColor;
      ctx.stroke();

      // 3. Draw Secondary Ring (Bass/Low Freq representation simulation)
      if (activeStyles.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = secondaryColor;
          ctx.shadowBlur = 5;
          ctx.shadowColor = secondaryColor;
          
          for (let i = 0; i <= totalPoints; i+=2) {
            const angle = (i / totalPoints) * Math.PI * 2 - (Math.PI / 2) + 0.1; // Offset angle
            const index = i % totalPoints;
            const v = values[index] as number; 
            const r = (baseRadius * 0.8) - (v * baseRadius * 0.2); // Inner ring, inverted movement

            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(render);
    };

    render();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeStyles, isPlaying, isComposing]);

  return (
    <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={onClick}>
        {/* Interaction Hint */}
        {!isPlaying && !isComposing && (
             <div className="absolute z-20 text-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                 <p className="text-xs font-mono tracking-[0.3em] text-white/50 mb-2">TOUCH TO INVOKE</p>
             </div>
        )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

export default Visualizer;
