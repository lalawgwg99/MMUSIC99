// 檔案位置: services/audioEngine.ts

import { VibeStyle, Emotion } from '../types';

// 定義 Hugging Face 的 API URL (使用 Meta 的 MusicGen Small 模型)
const API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-small";

// ⚠️ 重要：從環境變數讀取 Hugging Face Token
// 在 Netlify 上設置環境變數 VITE_HF_TOKEN
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "";

export interface GenerationParams {
  emotion: Emotion | null;
  styles: VibeStyle[];
}

/**
 * 生成 AI 音樂 Vibe
 * @param params 包含情緒和風格的參數
 * @returns HTMLAudioElement 或 null（如果失敗）
 */
export const generateVibe = async (params: GenerationParams): Promise<HTMLAudioElement | null> => {
  // 1. 組合 Prompt (咒語)
  // 將中文選項轉譯成英文 Prompt，這樣 AI 才聽得懂
  const emotionText = params.emotion ? translateEmotion(params.emotion) : "neutral";
  const styleTexts = params.styles.map(style => translateStyle(style)).join(", ");

  const prompt = `A ${styleTexts} track with ${emotionText} mood, high quality, melodic, loops`;

  console.log(`🎵 正在召喚 VIBE: ${prompt}`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 回應錯誤: ${response.status} - ${errorText}`);
    }

    // 2. 取得二進位音檔 (Blob)
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // 3. 建立並回傳 Audio 物件
    const audio = new Audio(audioUrl);
    console.log("✅ 音樂生成成功！");
    return audio;

  } catch (error) {
    console.error("❌ 生成失敗:", error);
    return null;
  }
};

/**
 * 簡單的翻譯 helper，把 UI 情緒轉成 AI 懂的英文
 */
function translateEmotion(emotion: Emotion): string {
  const map: Record<Emotion, string> = {
    [Emotion.HAPPY]: "happy, upbeat",
    [Emotion.SAD]: "sad, melancholic, slow",
    [Emotion.ANGRY]: "angry, aggressive, heavy metal",
    [Emotion.CALM]: "calm, ambient, meditation",
    [Emotion.EXCITED]: "excited, energetic, fast tempo",
  };
  return map[emotion] || "neutral";
}

/**
 * 簡單的翻譯 helper，把 UI 風格轉成 AI 懂的英文
 */
function translateStyle(style: VibeStyle): string {
  const map: Record<VibeStyle, string> = {
    [VibeStyle.CYBERPUNK]: "cyberpunk, synthwave, sci-fi",
    [VibeStyle.LOFI]: "lo-fi hip hop, chill",
    [VibeStyle.AMBIENT]: "dark ambient, space drone",
    [VibeStyle.EIGHT_BIT]: "8-bit, chiptune, nintendo style",
    [VibeStyle.CINEMATIC]: "cinematic, orchestral, hans zimmer style",
    [VibeStyle.RETROWAVE]: "vaporwave, retro, 80s",
    [VibeStyle.ACID]: "acid techno, tb-303",
    [VibeStyle.TRAP]: "trap beat, hip hop",
    [VibeStyle.DEEP_HOUSE]: "deep house, atmospheric, bass heavy",
    [VibeStyle.GLITCH]: "glitch core, distorted, electronic",
  };
  return map[style] || "pop";
}
