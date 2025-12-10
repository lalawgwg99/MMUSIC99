
import { VibeStyle, Emotion, Language, Translation, MixRecipe, MusicalSection, EmotionParameters } from './types';

// Emotion Parameter Mappings
export const EMOTION_PARAMETERS: Record<Emotion, EmotionParameters> = {
  [Emotion.HAPPY]: {
    tonality: 'major',
    bpmMultiplier: 1.2,
    filterBrightness: 0.8,
    reverbAmount: 0.2,
    velocityBase: 0.85
  },
  [Emotion.SAD]: {
    tonality: 'minor',
    bpmMultiplier: 0.7,
    filterBrightness: 0.3,
    reverbAmount: 0.5,
    velocityBase: 0.6
  },
  [Emotion.ANGRY]: {
    tonality: 'minor',
    bpmMultiplier: 1.4,
    filterBrightness: 1.0,
    reverbAmount: 0.1,
    velocityBase: 0.95
  },
  [Emotion.CALM]: {
    tonality: 'major',
    bpmMultiplier: 0.8,
    filterBrightness: 0.4,
    reverbAmount: 0.6,
    velocityBase: 0.65
  },
  [Emotion.EXCITED]: {
    tonality: 'major',
    bpmMultiplier: 1.3,
    filterBrightness: 0.9,
    reverbAmount: 0.3,
    velocityBase: 0.9
  }
};

export const TRANSLATIONS: Record<Language, Translation> = {
  zh: {
    title: "VIBE // ORACLE",
    subtitle: "AI 靈感神諭",
    styles: {
      [VibeStyle.CYBERPUNK]: "賽博",
      [VibeStyle.LOFI]: "療癒",
      [VibeStyle.AMBIENT]: "虛空",
      [VibeStyle.EIGHT_BIT]: "位元",
      [VibeStyle.CINEMATIC]: "史詩",
      [VibeStyle.RETROWAVE]: "浪潮",
      [VibeStyle.ACID]: "酸性",
      [VibeStyle.TRAP]: "陷阱",
      [VibeStyle.DEEP_HOUSE]: "深邃",
      [VibeStyle.GLITCH]: "故障"
    },
    sections: {
      [MusicalSection.INTRO]: "啟",
      [MusicalSection.VERSE]: "承",
      [MusicalSection.BUILD]: "轉",
      [MusicalSection.DROP]: "合",
      [MusicalSection.BREAKDOWN]: "解",
      [MusicalSection.OUTRO]: "結"
    },
    duration: "週期",
    play: "喚醒",
    stop: "休眠",
    composing: "神經網路同步中...",
    loading: "載入...",
    mixing: "風格符文",
    maxStyles: "能量滿載",
    clear: "歸零",
    trending: "神諭配方",
    applyMix: "載入",
    refresh: "重行占卜",
    fetching: "連線...",
    currentChord: "和聲",
    emotions: {
      [Emotion.HAPPY]: "😊 快樂",
      [Emotion.SAD]: "😢 悲傷",
      [Emotion.ANGRY]: "😠 憤怒",
      [Emotion.CALM]: "😌 平靜",
      [Emotion.EXCITED]: "🤩 興奮"
    },
    djControls: "即時控制",
    like: "喜歡",
    dislike: "不喜歡",
    export: "導出",
    selectEmotion: "選擇情緒"
  },
  en: {
    title: "VIBE // ORACLE",
    subtitle: "AI SONIC ORACLE",
    styles: {
      [VibeStyle.CYBERPUNK]: "CYBER",
      [VibeStyle.LOFI]: "LO-FI",
      [VibeStyle.AMBIENT]: "VOID",
      [VibeStyle.EIGHT_BIT]: "8-BIT",
      [VibeStyle.CINEMATIC]: "EPIC",
      [VibeStyle.RETROWAVE]: "WAVE",
      [VibeStyle.ACID]: "ACID",
      [VibeStyle.TRAP]: "TRAP",
      [VibeStyle.DEEP_HOUSE]: "DEEP",
      [VibeStyle.GLITCH]: "GLITCH"
    },
    sections: {
      [MusicalSection.INTRO]: "INTRO",
      [MusicalSection.VERSE]: "VERSE",
      [MusicalSection.BUILD]: "RISE",
      [MusicalSection.DROP]: "PEAK",
      [MusicalSection.BREAKDOWN]: "FALL",
      [MusicalSection.OUTRO]: "END"
    },
    duration: "CYCLE",
    play: "INVOKE",
    stop: "SEVER",
    composing: "SYNCING NEURAL NET...",
    loading: "LOADING...",
    mixing: "STYLE RUNES",
    maxStyles: "OVERLOAD",
    clear: "VOID",
    trending: "RECIPES",
    applyMix: "LOAD",
    refresh: "REROLL",
    fetching: "CONNECTING...",
    currentChord: "HARMONY",
    emotions: {
      [Emotion.HAPPY]: "😊 HAPPY",
      [Emotion.SAD]: "😢 SAD",
      [Emotion.ANGRY]: "😠 ANGRY",
      [Emotion.CALM]: "😌 CALM",
      [Emotion.EXCITED]: "🤩 EXCITED"
    },
    djControls: "LIVE CONTROL",
    like: "LIKE",
    dislike: "DISLIKE",
    export: "EXPORT",
    selectEmotion: "SELECT MOOD"
  }
};

export const STYLE_COLORS: Record<VibeStyle, string> = {
  [VibeStyle.CYBERPUNK]: "#06b6d4", // Cyan
  [VibeStyle.LOFI]: "#fbbf24",      // Amber
  [VibeStyle.AMBIENT]: "#8b5cf6",   // Violet
  [VibeStyle.EIGHT_BIT]: "#ef4444", // Red
  [VibeStyle.CINEMATIC]: "#10b981", // Emerald
  [VibeStyle.RETROWAVE]: "#f472b6", // Pink
  [VibeStyle.ACID]: "#a3e635",      // Lime Green
  [VibeStyle.TRAP]: "#9f1239",      // Rose Dark
  [VibeStyle.DEEP_HOUSE]: "#3b82f6",// Blue
  [VibeStyle.GLITCH]: "#e879f9",    // Fuchsia
};

export const RECIPE_POOL: MixRecipe[] = [
  {
    id: 'cyber_chase',
    name: { zh: "霓虹追逐", en: "Neon Chase" },
    styles: [VibeStyle.CYBERPUNK, VibeStyle.ACID, VibeStyle.GLITCH],
    description: { zh: "高能量的賽博龐克與酸性節奏", en: "High energy cyberpunk with acid bass" }
  },
  {
    id: 'retro_dream',
    name: { zh: "午夜夢迴", en: "Midnight Dream" },
    styles: [VibeStyle.LOFI, VibeStyle.RETROWAVE, VibeStyle.AMBIENT],
    description: { zh: "適合深夜的懷舊與放鬆", en: "Nostalgic chill for late nights" }
  },
  {
    id: 'epic_game',
    name: { zh: "史詩關卡", en: "Epic Level" },
    styles: [VibeStyle.CINEMATIC, VibeStyle.EIGHT_BIT, VibeStyle.TRAP],
    description: { zh: "氣勢磅礴的遊戲配樂", en: "Orchestral chiptune with trap beats" }
  },
  {
    id: 'deep_focus',
    name: { zh: "深層專注", en: "Deep Focus" },
    styles: [VibeStyle.DEEP_HOUSE, VibeStyle.AMBIENT, VibeStyle.LOFI],
    description: { zh: "適合工作與讀書的深沉節奏", en: "Deep grooves for work and study" }
  },
  {
    id: 'night_drive',
    name: { zh: "夜行者", en: "Night Drive" },
    styles: [VibeStyle.RETROWAVE, VibeStyle.CYBERPUNK, VibeStyle.CINEMATIC],
    description: { zh: "像是在高速公路上飛馳", en: "Cinematic synthwave for driving" }
  },
  {
    id: 'glitch_hop',
    name: { zh: "故障跳躍", en: "Glitch Hop" },
    styles: [VibeStyle.GLITCH, VibeStyle.TRAP, VibeStyle.EIGHT_BIT],
    description: { zh: "破碎的節奏與懷舊音色", en: "Broken beats with retro textures" }
  },
  {
    id: 'acid_rain',
    name: { zh: "酸雨", en: "Acid Rain" },
    styles: [VibeStyle.ACID, VibeStyle.AMBIENT, VibeStyle.DEEP_HOUSE],
    description: { zh: "迷幻的酸性線條與雨聲氛圍", en: "Psychedelic acid lines in rain" }
  }
];
