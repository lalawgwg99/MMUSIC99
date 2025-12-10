
export type Language = 'zh' | 'en';

export enum VibeStyle {
  CYBERPUNK = 'CYBERPUNK',
  LOFI = 'LOFI',
  AMBIENT = 'AMBIENT',
  EIGHT_BIT = 'EIGHT_BIT',
  CINEMATIC = 'CINEMATIC',
  RETROWAVE = 'RETROWAVE',
  ACID = 'ACID',
  TRAP = 'TRAP',
  DEEP_HOUSE = 'DEEP_HOUSE',
  GLITCH = 'GLITCH'
}

export enum Emotion {
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  CALM = 'CALM',
  EXCITED = 'EXCITED'
}

export enum MusicalSection {
  INTRO = 'INTRO',
  VERSE = 'VERSE',
  BUILD = 'BUILD',
  DROP = 'DROP',
  BREAKDOWN = 'BREAKDOWN',
  OUTRO = 'OUTRO'
}

export type DurationOption = 15 | 30 | 60;

export interface EmotionParameters {
  tonality: 'major' | 'minor';
  bpmMultiplier: number;
  filterBrightness: number;
  reverbAmount: number;
  velocityBase: number;
}

export interface DJControls {
  bpm: number;
  filter: number;
  reverb: number;
  volume: number;
}

export interface AIPreferences {
  likes: Array<{
    styles: VibeStyle[];
    emotion?: Emotion;
    timestamp: number;
  }>;
  dislikes: Array<{
    styles: VibeStyle[];
    emotion?: Emotion;
    timestamp: number;
  }>;
}

export type ExportStatus = 'idle' | 'recording' | 'processing' | 'complete';

export interface Translation {
  title: string;
  subtitle: string;
  styles: Record<VibeStyle, string>;
  emotions: Record<Emotion, string>;
  sections: Record<MusicalSection, string>;
  duration: string;
  play: string;
  stop: string;
  composing: string;
  loading: string;
  mixing: string;
  maxStyles: string;
  clear: string;
  trending: string;
  applyMix: string;
  refresh: string;
  fetching: string;
  currentChord: string;
  djControls: string;
  like: string;
  dislike: string;
  export: string;
  selectEmotion: string;
}

export interface AudioState {
  isPlaying: boolean;
  isReady: boolean;
  activeStyles: VibeStyle[];
  currentSection: MusicalSection;
  currentChord: string;
}

export interface MixRecipe {
  id: string;
  name: { zh: string; en: string };
  styles: VibeStyle[];
  description: { zh: string; en: string };
}
