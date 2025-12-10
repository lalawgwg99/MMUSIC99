
import * as Tone from 'tone';
import { VibeStyle, MusicalSection, Emotion, DJControls } from '../types';
import { EMOTION_PARAMETERS } from '../constants';

// Music Theory Data
const CHORD_PROGRESSIONS = {
  [VibeStyle.CYBERPUNK]: [['C3', 'D#3', 'G3'], ['G#2', 'C3', 'D#3'], ['A#2', 'D3', 'F3'], ['F2', 'G#2', 'C3']], // i - VI - VII - iv
  [VibeStyle.LOFI]: [['C3', 'E3', 'G3', 'B3'], ['F3', 'A3', 'C4', 'E4'], ['D3', 'F3', 'A3', 'C4'], ['G3', 'B3', 'D4', 'F4']], // Imaj7 - IVmaj7 - ii7 - V7
  [VibeStyle.AMBIENT]: [['F2', 'A2', 'C3', 'E3'], ['G2', 'B2', 'D3', 'F3'], ['E2', 'G2', 'B2', 'D3'], ['A2', 'C3', 'E3', 'G3']],
  [VibeStyle.CINEMATIC]: [['D2', 'F2', 'A2'], ['A#1', 'D2', 'F2'], ['C2', 'E2', 'G2'], ['G1', 'A#1', 'D2']], // Epic Minor
  [VibeStyle.RETROWAVE]: [['C3', 'G3', 'C4'], ['A#2', 'F3', 'A#3'], ['G#2', 'D#3', 'G#3'], ['G2', 'D3', 'G3']],
  // Default fallback
  DEFAULT: [['C3', 'E3', 'G3'], ['F3', 'A3', 'C4'], ['A2', 'C3', 'E3'], ['G2', 'B2', 'D3']]
};

interface InstrumentLayer {
  style: VibeStyle;
  lead?: Tone.PolySynth | Tone.Synth | Tone.FMSynth;
  bass?: Tone.MonoSynth | Tone.MembraneSynth;
  pad?: Tone.PolySynth;
  lfo?: Tone.LFO;
}

class AudioEngine {
  private layers: InstrumentLayer[] = [];
  private loop: Tone.Loop | null = null;
  private analyser: Tone.Analyser;
  private masterLimiter: Tone.Limiter;
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private autoFilter: Tone.AutoFilter;
  private isInitialized: boolean = false;

  // State for callbacks
  private onSectionChange: ((section: MusicalSection) => void) | null = null;
  private onChordChange: ((chord: string) => void) | null = null;

  // New: Emotion & DJ Controls
  private currentEmotion: Emotion | null = null;
  private djControls: DJControls = { bpm: 120, filter: 50, reverb: 30, volume: 80 };
  private recorder: Tone.Recorder | null = null;
  private baseBpm: number = 120;

  constructor() {
    this.masterLimiter = new Tone.Limiter(-2).toDestination();
    this.reverb = new Tone.Reverb({ decay: 4, wet: 0.3 }).connect(this.masterLimiter);
    this.delay = new Tone.FeedbackDelay("8n.", 0.3).connect(this.masterLimiter);
    this.autoFilter = new Tone.AutoFilter("4n").connect(this.masterLimiter).start();
    this.analyser = new Tone.Analyser('waveform', 256);
    this.masterLimiter.connect(this.analyser);
  }

  async initialize() {
    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
  }

  setCallbacks(
    onSectionChange: (section: MusicalSection) => void,
    onChordChange: (chord: string) => void
  ) {
    this.onSectionChange = onSectionChange;
    this.onChordChange = onChordChange;
  }

  getAnalyser() {
    return this.analyser;
  }

  // ==================== NEW: Emotion Integration ====================
  setEmotion(emotion: Emotion | null) {
    this.currentEmotion = emotion;
    if (emotion && this.loop) {
      const params = EMOTION_PARAMETERS[emotion];
      const newBpm = this.baseBpm * params.bpmMultiplier;
      Tone.Transport.bpm.rampTo(newBpm, 1);
      this.djControls.bpm = newBpm;
    }
  }

  getCurrentEmotion(): Emotion | null {
    return this.currentEmotion;
  }

  // ==================== NEW: DJ Controls ====================
  updateDJControls(controls: Partial<DJControls>) {
    this.djControls = { ...this.djControls, ...controls };

    if (controls.bpm !== undefined) {
      Tone.Transport.bpm.rampTo(controls.bpm, 0.5);
    }
    if (controls.filter !== undefined) {
      const freq = 200 + (controls.filter / 100) * 2000;
      this.autoFilter.baseFrequency.rampTo(freq, 0.1);
    }
    if (controls.reverb !== undefined) {
      this.reverb.wet.rampTo(controls.reverb / 100, 0.1);
    }
    if (controls.volume !== undefined) {
      Tone.Destination.volume.rampTo((controls.volume / 100) * 20 - 20, 0.1);
    }
  }

  getDJControls(): DJControls {
    return { ...this.djControls };
  }

  // ==================== NEW: Recording ====================
  async startRecording() {
    this.recorder = new Tone.Recorder();
    Tone.Destination.connect(this.recorder);
    this.recorder.start();
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recorder) throw new Error('No active recording');
    const recording = await this.recorder.stop();
    this.recorder.dispose();
    this.recorder = null;
    return recording;
  }

  isRecording(): boolean {
    return this.recorder !== null;
  }

  private createInstrumentsForStyle(style: VibeStyle): InstrumentLayer {
    let lead, bass, pad, lfo;

    switch (style) {
      case VibeStyle.CYBERPUNK:
        lead = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(this.delay).connect(this.reverb);

        bass = new Tone.MonoSynth({
          oscillator: { type: "square" },
          filter: { Q: 2, type: "lowpass", rolloff: -24 },
          envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.2 }
        }).connect(this.masterLimiter);
        break;

      case VibeStyle.LOFI:
        lead = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3,
          modulationIndex: 2,
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.5 }
        }).connect(this.reverb);
        // Add subtle vibrato via LFO to detune
        break;

      case VibeStyle.AMBIENT:
        pad = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { attack: 1.5, decay: 1, sustain: 0.8, release: 3 }
        }).connect(this.reverb).connect(this.autoFilter);
        break;

      case VibeStyle.ACID:
        lead = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          filter: { Q: 8, type: "lowpass", rolloff: -24 },
          envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.1 }
        }).connect(this.delay);

        // Dynamic Filter LFO
        lfo = new Tone.LFO("8n", 400, 3000).start();
        if (lead instanceof Tone.MonoSynth) {
          lfo.connect(lead.filter.frequency);
        }
        break;

      case VibeStyle.CINEMATIC:
        lead = new Tone.PolySynth(Tone.Synth, { // Strings-like
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.5 }
        }).connect(this.reverb);

        bass = new Tone.MonoSynth({ // Deep braam
          oscillator: { type: "sawtooth" },
          filter: { frequency: 200 },
          envelope: { attack: 0.1, decay: 0.5, sustain: 0.8, release: 1 }
        }).connect(this.masterLimiter);
        break;

      default:
        lead = new Tone.PolySynth(Tone.Synth).connect(this.reverb);
        bass = new Tone.MonoSynth().connect(this.masterLimiter);
    }

    return { style, lead, bass, pad, lfo };
  }

  generateCombinedPattern(activeStyles: VibeStyle[]) {
    if (this.loop) {
      this.loop.dispose();
      this.loop = null;
    }

    const primaryStyle = activeStyles[0];
    const progressions = CHORD_PROGRESSIONS[primaryStyle as keyof typeof CHORD_PROGRESSIONS] || CHORD_PROGRESSIONS.DEFAULT;

    // Song Structure State
    let tick = 0;
    let currentSection = MusicalSection.INTRO;
    let chordIndex = 0;

    // Set BPM based on primary style
    let bpm = 120;
    if (primaryStyle === VibeStyle.LOFI) bpm = 85;
    else if (primaryStyle === VibeStyle.AMBIENT) bpm = 70;
    else if (primaryStyle === VibeStyle.TRAP || primaryStyle === VibeStyle.GLITCH) bpm = 145;
    else if (primaryStyle === VibeStyle.DEEP_HOUSE) bpm = 124;

    Tone.Transport.bpm.value = bpm;

    this.loop = new Tone.Loop((time) => {
      // --- 1. Determine Section & Structure ---
      // 16 bars per section approx (assuming 8n ticks)
      // 1 bar = 8 ticks (of 8th notes) -> 16 bars = 128 ticks
      const sectionLength = 64;
      const totalTicks = tick % (sectionLength * 5); // Cycle through 5 sections

      if (tick === 0) currentSection = MusicalSection.INTRO;
      else if (tick === sectionLength) currentSection = MusicalSection.VERSE;
      else if (tick === sectionLength * 2) currentSection = MusicalSection.BUILD;
      else if (tick === sectionLength * 3) currentSection = MusicalSection.DROP;
      else if (tick === sectionLength * 4) currentSection = MusicalSection.OUTRO;

      if (tick % sectionLength === 0 && this.onSectionChange) {
        this.onSectionChange(currentSection);
      }

      // --- 2. Determine Harmony (Chord Progression) ---
      // Change chord every 16 ticks (2 bars)
      if (tick % 16 === 0) {
        chordIndex = (chordIndex + 1) % progressions.length;
        if (this.onChordChange) {
          // Simple chord naming for UI
          const chordName = progressions[chordIndex][0].replace(/\d/, '');
          this.onChordChange(chordName + (primaryStyle === VibeStyle.LOFI ? "maj7" : "m"));
        }
      }
      const currentChordNotes = progressions[chordIndex];
      const rootNote = currentChordNotes[0];

      // --- 3. Performer Logic (Iterate Styles) ---
      this.layers.forEach((layer) => {
        const { style, lead, bass, pad } = layer;
        const r = Math.random();

        // === Section Dynamics ===
        let density = 0.5;
        let allowBass = true;
        let allowLead = true;

        switch (currentSection) {
          case MusicalSection.INTRO:
            density = 0.2;
            allowBass = false; // No bass in intro usually
            break;
          case MusicalSection.BUILD:
            density = 0.8;
            // Snare rolls logic would go here
            break;
          case MusicalSection.DROP:
            density = 1.0;
            break;
          case MusicalSection.BREAKDOWN:
            density = 0.3;
            allowBass = true;
            allowLead = false;
            break;
          case MusicalSection.OUTRO:
            density = 0.2;
            allowBass = false;
            break;
        }

        // === Play Logic ===

        // PAD (Always plays to fill space)
        if (pad && (tick % 32 === 0 || tick === 0) && currentSection !== MusicalSection.DROP) {
          pad.triggerAttackRelease(currentChordNotes, "2n", time);
        }

        // BASS
        if (bass && allowBass) {
          if (style === VibeStyle.CYBERPUNK || style === VibeStyle.RETROWAVE) {
            // Running bass (8th notes)
            if (currentSection === MusicalSection.DROP || tick % 2 === 0) {
              bass.triggerAttackRelease(rootNote.replace('3', '2').replace('4', '3'), "8n", time);
            }
          } else if (style === VibeStyle.ACID) {
            // Random acid lines
            if (Math.random() > 0.3) {
              const acidNote = currentChordNotes[Math.floor(Math.random() * currentChordNotes.length)];
              bass.triggerAttackRelease(acidNote, "16n", time); // Uses lead slot in interface but acts as bassline
            }
          } else if (tick % 8 === 0) {
            // Simple root notes for others
            bass.triggerAttackRelease(rootNote.replace('3', '2'), "4n", time);
          }
        }

        // LEAD / MELODY
        if (lead && allowLead) {
          if (style === VibeStyle.ACID) {
            // ACID logic handled above (it's a bass-lead hybrid)
          } else if (r < density) {
            // Pick a note from the chord or a passing tone (simple implementation: chord tones)
            const note = currentChordNotes[Math.floor(Math.random() * currentChordNotes.length)];

            // Humanization: Velocity & Timing
            const velocity = 0.6 + Math.random() * 0.4; // 0.6 - 1.0
            const humanTiming = time + (Math.random() * 0.02 - 0.01); // +/- 10ms

            if (lead instanceof Tone.PolySynth || lead instanceof Tone.Synth || lead instanceof Tone.FMSynth) {
              const length = currentSection === MusicalSection.BREAKDOWN ? "2n" : "8n";

              // Build-up effect: shorten notes, higher pitch pitch
              if (currentSection === MusicalSection.BUILD && Math.random() > 0.5) {
                lead.triggerAttackRelease(note, "16n", humanTiming, velocity);
              } else {
                lead.triggerAttackRelease(note, length, humanTiming, velocity);
              }
            }
          }
        }
      });

      tick++;
    }, "8n");

    this.loop.start(0);
  }

  start(styles: VibeStyle[]) {
    this.stop();
    this.layers = styles.map(style => this.createInstrumentsForStyle(style));
    this.generateCombinedPattern(styles);

    // Save base BPM for emotion adjustments
    this.baseBpm = Tone.Transport.bpm.value;
    this.djControls.bpm = this.baseBpm;

    // Apply emotion if set
    if (this.currentEmotion) {
      const params = EMOTION_PARAMETERS[this.currentEmotion];
      const newBpm = this.baseBpm * params.bpmMultiplier;
      Tone.Transport.bpm.value = newBpm;
      this.djControls.bpm = newBpm;
    }

    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    if (this.loop) {
      this.loop.dispose();
      this.loop = null;
    }
    this.layers.forEach(layer => {
      if (layer.lead) layer.lead.dispose();
      if (layer.bass) layer.bass.dispose();
      if (layer.pad) layer.pad.dispose();
      if (layer.lfo) layer.lfo.dispose();
    });
    this.layers = [];
    Tone.Transport.cancel();

    // Reset state in UI
    if (this.onSectionChange) this.onSectionChange(MusicalSection.INTRO);
  }
}

export const audioEngine = new AudioEngine();
