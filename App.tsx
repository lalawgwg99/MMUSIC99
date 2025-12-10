
import React, { useState, useEffect, useRef } from 'react';
import { Language, VibeStyle, DurationOption, MixRecipe, MusicalSection, Emotion, DJControls, ExportStatus, AIPreferences } from './types';
import { TRANSLATIONS, STYLE_COLORS, RECIPE_POOL } from './constants';
import { generateVibe } from './services/audioEngine';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [activeStyles, setActiveStyles] = useState<VibeStyle[]>([]); // Empty by default for Oracle logic
  const [duration, setDuration] = useState<DurationOption>(60);
  const [timeLeft, setTimeLeft] = useState(0);

  // Musical State
  const [currentSection, setCurrentSection] = useState<MusicalSection>(MusicalSection.INTRO);
  const [currentChord, setCurrentChord] = useState<string>("");

  // NEW: Advanced Features
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [djControls, setDJControls] = useState<DJControls>({
    bpm: 120, filter: 50, reverb: 30, volume: 80
  });
  const [showDJPanel, setShowDJPanel] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [hasPlayed, setHasPlayed] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const timerRef = useRef<number | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const toggleStyle = (style: VibeStyle) => {
    if (isPlaying) return; // Lock during playback for immersion

    if (activeStyles.includes(style)) {
      setActiveStyles(prev => prev.filter(s => s !== style));
    } else {
      if (activeStyles.length < 3) {
        setActiveStyles(prev => [...prev, style]);
      }
    }
  };

  const handleOracleClick = async () => {
    if (isPlaying) {
      handleStop();
    } else {
      // Oracle Logic: If no style selected, pick random 3
      let stylesToPlay = activeStyles;
      if (activeStyles.length === 0) {
        const allStyles = Object.values(VibeStyle);
        const shuffled = allStyles.sort(() => 0.5 - Math.random());
        stylesToPlay = shuffled.slice(0, 3);
        setActiveStyles(stylesToPlay);
      }

      await startEngine(stylesToPlay);
    }
  };

  const startEngine = async (styles: VibeStyle[]) => {
    if (isComposing) return;

    setIsComposing(true);

    // Call Hugging Face MusicGen API
    const audio = await generateVibe({
      emotion: selectedEmotion,
      styles: styles
    });

    if (!audio) {
      alert("❌ Vibe 連接失敗，請檢查 API Token 或網路連線");
      setIsComposing(false);
      return;
    }

    setCurrentAudio(audio);
    setIsComposing(false);
    setIsPlaying(true);
    setHasPlayed(true);
    setTimeLeft(duration);

    // Play the generated audio
    audio.loop = true; // Loop the music
    audio.volume = djControls.volume / 100;
    audio.play();

    // Start timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsPlaying(false);
    setIsComposing(false);
    setTimeLeft(0);
    setCurrentSection(MusicalSection.INTRO);
    setCurrentChord("");
    setShowDJPanel(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) setActiveStyles([]);
  }

  const handleRandomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    const allStyles = Object.values(VibeStyle);
    const shuffled = allStyles.sort(() => 0.5 - Math.random());
    setActiveStyles(shuffled.slice(0, 3));
  }

  // NEW: Emotion Handler
  const handleEmotionSelect = (emotion: Emotion) => {
    if (isPlaying) return;
    const newEmotion = emotion === selectedEmotion ? null : emotion;
    setSelectedEmotion(newEmotion);
  };

  // NEW: DJ Controls Handler
  const handleDJChange = (key: keyof DJControls, value: number) => {
    const newControls = { ...djControls, [key]: value };
    setDJControls(newControls);

    // Apply volume change to current audio
    if (key === 'volume' && currentAudio) {
      currentAudio.volume = value / 100;
    }
  };

  // NEW: AI Learning Handlers
  const handleLike = () => {
    const prefs: AIPreferences = JSON.parse(
      localStorage.getItem('aiStationPrefs') || '{"likes":[],"dislikes":[]}'
    );
    prefs.likes.push({
      styles: activeStyles,
      emotion: selectedEmotion || undefined,
      timestamp: Date.now()
    });
    localStorage.setItem('aiStationPrefs', JSON.stringify(prefs));
  };

  const handleDislike = () => {
    const prefs: AIPreferences = JSON.parse(
      localStorage.getItem('aiStationPrefs') || '{"likes":[],"dislikes":[]}'
    );
    prefs.dislikes.push({
      styles: activeStyles,
      emotion: selectedEmotion || undefined,
      timestamp: Date.now()
    });
    localStorage.setItem('aiStationPrefs', JSON.stringify(prefs));
  };

  // NEW: Export Handler
  const handleExport = async () => {
    if (!currentAudio) return;

    setExportStatus('processing');

    // Download the current audio blob
    const response = await fetch(currentAudio.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-vibe-${Date.now()}.wav`;
    a.click();

    setExportStatus('complete');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  // Visual Helper: Get main color
  const mainColor = activeStyles.length > 0 ? STYLE_COLORS[activeStyles[0]] : '#4b5563'; // Gray default

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">

      {/* 1. Dynamic Background Void */}
      <div className="absolute inset-0 z-0 transition-colors duration-[2000ms]"
        style={{ background: `radial-gradient(circle at center, ${mainColor}10 0%, #000 70%)` }}>
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-1 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      </div>

      {/* 2. Main Interface Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 px-4">

        {/* Header */}
        <header className="flex w-full max-w-2xl justify-between items-start opacity-80 hover:opacity-100 transition-opacity">
          <div className="text-left">
            <h1 className="text-xs font-mono tracking-[0.5em] text-gray-400 mb-1">{t.subtitle}</h1>
            <h2 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">{t.title}</h2>
          </div>
          <button
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            className="text-[10px] font-mono border border-white/20 px-2 py-1 rounded hover:bg-white/10"
          >
            {lang.toUpperCase()}
          </button>
        </header>

        {/* THE ORACLE EYE (Visualizer + Control) */}
        <main className="flex-1 w-full max-w-2xl relative flex items-center justify-center">
          <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative">
            <Visualizer
              activeStyles={activeStyles}
              isPlaying={isPlaying}
              isComposing={isComposing}
              onClick={handleOracleClick}
            />

            {/* Musical Status Floaters */}
            {isPlaying && (
              <>
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-right">
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest">{t.sections[currentSection]}</div>
                  <div className="text-xl font-bold tracking-tight text-white/90">{currentChord}</div>
                </div>
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-left">
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest">{t.duration}</div>
                  <div className="text-xl font-mono text-white/90">{timeLeft}<span className="text-sm">s</span></div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* NEW: Emotion Selector */}
        {!isPlaying && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              {t.selectEmotion}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {Object.values(Emotion).map(emotion => (
                <button
                  key={emotion}
                  onClick={() => handleEmotionSelect(emotion)}
                  className={`
                    px-3 py-1.5 text-xs font-mono border transition-all duration-300
                    ${selectedEmotion === emotion
                      ? 'bg-white/20 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                      : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'}
                  `}
                >
                  {t.emotions[emotion]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Controls (Runes) */}
        <footer className="w-full max-w-3xl flex flex-col items-center gap-6">

          {/* Control Bar */}
          {!isPlaying && (
            <div className="flex gap-8 items-center justify-center">
              <button onClick={handleClear} className="text-xs text-gray-500 hover:text-white transition-colors font-mono tracking-widest uppercase">
                [{t.clear}]
              </button>
              <button onClick={handleRandomize} className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors font-mono tracking-widest uppercase flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {t.refresh}
              </button>
            </div>
          )}

          {/* Style Chips */}
          <div className={`flex flex-wrap justify-center gap-2 transition-all duration-500 ${isPlaying ? 'opacity-30 blur-sm pointer-events-none scale-95' : 'opacity-100'}`}>
            {Object.values(VibeStyle).map((style) => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`
                  px-3 py-1.5 text-[10px] md:text-xs font-mono tracking-wider border transition-all duration-300
                  ${activeStyles.includes(style)
                    ? `bg-${STYLE_COLORS[style]}/20 text-white border-transparent shadow-[0_0_10px_${STYLE_COLORS[style]}80]`
                    : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                  }
                `}
                style={{
                  backgroundColor: activeStyles.includes(style) ? STYLE_COLORS[style] : 'transparent',
                  color: activeStyles.includes(style) ? '#000' : undefined,
                  fontWeight: activeStyles.includes(style) ? 'bold' : 'normal',
                }}
              >
                {t.styles[style]}
              </button>
            ))}
          </div>

          {/* NEW: Feedback & Export Buttons */}
          {!isPlaying && hasPlayed && (
            <div className="flex gap-3 mt-2 justify-center">
              <button
                onClick={handleLike}
                className="px-4 py-2 text-xs font-mono border border-green-500/50 text-green-500 hover:bg-green-500/20 transition-all"
              >
                ❤️ {t.like}
              </button>
              <button
                onClick={handleDislike}
                className="px-4 py-2 text-xs font-mono border border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
              >
                👎 {t.dislike}
              </button>
              <button
                onClick={handleExport}
                disabled={exportStatus !== 'idle'}
                className="px-4 py-2 text-xs font-mono border border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                💾 {exportStatus === 'idle' ? t.export : exportStatus.toUpperCase()}
              </button>
            </div>
          )}

          {/* Credits / Info */}
          <div className="text-[10px] text-gray-700 font-mono">
            SYSTEM_READY // AUDIO_ENGINE_V3 // {activeStyles.length}/3_SLOTS {selectedEmotion && `// EMOTION:${selectedEmotion}`}
          </div>

        </footer>
      </div>

      {/* NEW: DJ Controls Panel */}
      {isPlaying && (
        <div className="fixed bottom-20 right-4 w-64 bg-black/95 border border-white/20 p-4 rounded backdrop-blur-sm z-50">
          <div className="text-xs text-gray-400 font-mono mb-3 tracking-wider">{t.djControls}</div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 font-mono">BPM: <span className="text-white">{djControls.bpm}</span></label>
              <input
                type="range"
                min="60"
                max="200"
                value={djControls.bpm}
                onChange={(e) => handleDJChange('bpm', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-mono">FILTER: <span className="text-white">{djControls.filter}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                value={djControls.filter}
                onChange={(e) => handleDJChange('filter', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-mono">REVERB: <span className="text-white">{djControls.reverb}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                value={djControls.reverb}
                onChange={(e) => handleDJChange('reverb', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-mono">VOLUME: <span className="text-white">{djControls.volume}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                value={djControls.volume}
                onChange={(e) => handleDJChange('volume', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
