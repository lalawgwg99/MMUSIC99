import { VibeStyle } from '../types';

// Emotion to music prompt mapping
const EMOTION_PROMPTS: Record<string, string> = {
  '興奮': 'energetic and uplifting with fast tempo',
  '平靜': 'calm and peaceful with slow tempo',
  '憂鬱': 'melancholic and emotional with minor chords',
  '快樂': 'joyful and cheerful with major chords',
  '憤怒': 'intense and aggressive with heavy beats',
};

// Style to music characteristics mapping
const STYLE_PROMPTS: Record<string, string> = {
  '賽博': 'cyberpunk electronic synth',
  '位元': '8-bit chiptune retro',
  '極簡': 'minimal ambient atmospheric',
  '爵士': 'smooth jazz with piano',
  '搖滾': 'rock guitar driven',
  '電子': 'electronic dance music',
  '古典': 'classical orchestral',
  '嘻哈': 'hip hop with beats',
  '放克': 'funky groove bass',
  '雷鬼': 'reggae rhythm',
};

/**
 * Generate a music vibe based on emotion and styles
 */
export async function generateVibe(
  emotion: string,
  styles: VibeStyle[],
  duration: number = 10
): Promise<Blob> {
  // Build prompt from emotion and styles
  const emotionPrompt = EMOTION_PROMPTS[emotion] || 'ambient music';
  const stylePrompts = styles.map(style => STYLE_PROMPTS[style] || style).join(', ');
  const fullPrompt = `${emotionPrompt}, ${stylePrompts}`;

  console.log('Generating music with prompt:', fullPrompt);

  try {
    // Call Netlify Function instead of direct API
    const response = await fetch('/.netlify/functions/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        duration: duration,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Function Error:', errorData);

      // Handle model loading state
      if (response.status === 503) {
        throw new Error('模型正在加載中，請稍後再試（約20秒）');
      }

      throw new Error(errorData.error || `請求失敗: ${response.status}`);
    }

    const data = await response.json();

    // Convert base64 audio to Blob
    const audioData = atob(data.audio);
    const audioArray = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      audioArray[i] = audioData.charCodeAt(i);
    }

    const blob = new Blob([audioArray], { type: data.contentType });
    return blob;
  } catch (error) {
    console.error('Error generating vibe:', error);
    throw error;
  }
}
