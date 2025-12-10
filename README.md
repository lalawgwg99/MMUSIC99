# 🎵 AI Station - 智能音樂生成器

> Oracle 設計 × AI 靈魂 = 終極音樂創作體驗

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://github.com/lalawgwg99/MMUSIC99)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 特色功能

### 🎭 情感識別系統

- **5 種情緒模式**: 快樂 / 悲傷 / 憤怒 / 平靜 / 興奮
- **智能參數調整**: 自動調整 BPM、調性、濾波器、混響
- **情感驅動**: 讓音樂真正表達情緒

### 🎚️ 即時 DJ 控制

- **BPM 控制**: 60-200 BPM 即時調整
- **濾波器**: 0-100% 頻率控制
- **混響**: 0-100% 空間深度
- **音量**: 0-100% 主音量
- **平滑過渡**: 所有參數平滑變化

### 🧠 AI 學習機制

- **喜好追蹤**: 記錄您喜歡/不喜歡的音樂
- **localStorage 持久化**: 跨會話保存偏好
- **智能推薦**: 未來可基於學習優化生成

### 💾 專業導出

- **WAV 格式**: 無損音質導出
- **完整錄製**: 捕捉所有音頻層
- **一鍵下載**: 自動命名並下載

### 🎨 Oracle 設計

- **極簡美學**: 黑暗主題 + 掃描線效果
- **漸進式披露**: 功能在需要時出現
- **視覺化中心**: 巨大的 Oracle 眼睛
- **專業音樂引擎**: 真實和弦進行

## 🚀 快速開始

### 安裝

```bash
# 克隆倉庫
git clone https://github.com/lalawgwg99/MMUSIC99.git
cd MMUSIC99

# 安裝依賴
npm install

# 配置環境變數
cp .env.example .env.local
# 編輯 .env.local，填入你的 Hugging Face API Token
# 獲取 Token: https://huggingface.co/settings/tokens

# 啟動開發伺服器
npm run dev
```

### 環境變數設置

本專案使用 **Hugging Face MusicGen API** 生成音樂，需要配置 API Token：

1. 前往 [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. 創建一個新的 Access Token（選擇 Read 權限）
3. 複製 `.env.example` 為 `.env.local`
4. 在 `.env.local` 中填入你的 Token：

   ```
   VITE_HF_TOKEN=hf_your_token_here
   ```

### 使用

1. **選擇情緒**（可選）
   - 點擊情緒按鈕選擇心情
   - 音樂會自動調整參數

2. **選擇風格**
   - 點擊 1-3 個風格符文
   - 或不選擇，讓 Oracle 隨機選擇

3. **開始創作**
   - 點擊中央 Oracle 眼睛
   - 音樂立即開始生成

4. **即時控制**
   - 播放時右下角出現 DJ 面板
   - 即時調整參數

5. **保存作品**
   - 播放結束後點擊「導出」
   - WAV 文件自動下載

## 🎼 音樂風格

- 🚀 **Cyberpunk** - 賽博龐克
- 🎹 **Lo-Fi** - 療癒爵士
- 🌌 **Ambient** - 虛空氛圍
- 🔥 **8-Bit** - 復古遊戲
- 🎻 **Cinematic** - 史詩電影
- 🌅 **Retrowave** - 合成器浪潮
- 🧪 **Acid** - 酸性科技
- 👹 **Trap** - 陷阱重低音
- 🌊 **Deep House** - 深邃浩室
- ⚡ **Glitch** - 故障核心

## 🛠️ 技術棧

- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Hugging Face MusicGen** - AI 音樂生成
- **Vite** - 快速建置工具
- **Tailwind CSS** - 樣式框架

## 📂 專案結構

```
ai-station/
├── App.tsx              # 主應用組件
├── types.ts             # TypeScript 類型定義
├── constants.ts         # 常量與配置
├── services/
│   └── audioEngine.ts   # 音頻引擎核心
├── components/
│   └── Visualizer.tsx   # 視覺化組件
└── package.json         # 依賴配置
```

## 🎯 核心架構

### AudioEngine

- **多層合成**: Bass + Pad + Lead + Percussion
- **和弦進行**: 風格專屬和聲邏輯
- **段落系統**: Intro → Verse → Build → Drop → Outro
- **效果鏈**: Auto-filter + Delay + Chorus + Reverb

### 情感系統

```typescript
{
  happy: { tonality: 'major', bpmMultiplier: 1.2 },
  sad: { tonality: 'minor', bpmMultiplier: 0.7 },
  angry: { tonality: 'minor', bpmMultiplier: 1.4 },
  calm: { tonality: 'major', bpmMultiplier: 0.8 },
  excited: { tonality: 'major', bpmMultiplier: 1.3 }
}
```

## 🌐 部署

### Netlify (推薦)

1. 推送代碼到 GitHub
2. 在 Netlify 連接你的 GitHub 倉庫
3. 設置環境變數：
   - 變數名：`VITE_HF_TOKEN`
   - 變數值：你的 Hugging Face API Token
4. 部署設置：
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel

```bash
npm install -g vercel
vercel
# 在 Vercel Dashboard 設置環境變數 VITE_HF_TOKEN
```

## 📝 授權

MIT License - 自由使用、修改、分發

## 🙏 致謝

- **Tone.js** - 強大的音頻合成庫
- **React** - 優雅的 UI 框架
- **Vite** - 極速開發體驗

## 🎵 開始創作

**不再只是製造聲音，而是創造生命！**

立即訪問：[AI Station](https://github.com/lalawgwg99/MMUSIC99)

---

Made with ❤️ by [lalawgwg99](https://github.com/lalawgwg99)
