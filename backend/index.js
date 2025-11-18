// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let savedOutfits = [];
let nextOutfitId = 1;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ─────────────────────────────────────
// 1) 무드 → 팔레트 API
// ─────────────────────────────────────
const palettes = {
  minimal: ['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0', '#BFA888'],
  street: ['#111111', '#FF5733', '#FFC300', '#1C1C1C', '#3498DB'],
  casual: ['#F5F5DC', '#2E8B57', '#8B4513', '#D2B48C', '#4682B4'],
};

app.get('/palette', (req, res) => {
  const mood = req.query.mood || 'minimal';
  const palette = palettes[mood] || palettes.minimal;
  res.json({ mood, palette });
});

// ─────────────────────────────────────
// 2) 쇼핑몰 링크 API
// ─────────────────────────────────────
app.get('/shops', (req, res) => {
  res.json([
    { name: '무신사', url: 'https://www.musinsa.com', category: '종합' },
    { name: '29CM', url: 'https://www.29cm.co.kr', category: '종합' },
    { name: '세컨드솔드', url: 'https://www.seconduse.com', category: '중고/빈티지' },
    // 필요하면 나중에 더 추가
  ]);
});

// ─────────────────────────────────────
// 3) AI 코디 질문 API
// ─────────────────────────────────────
app.post('/ask-ai', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',   // 가볍고 빠른 모델
      input: [
        {
          role: 'system',
          content:
            '넌 패션 스타일리스트이자 색채 전문가야. 사용자의 옷/상황/무드를 듣고, 색 조합과 아이템을 한두 문장으로 간단히 추천해줘.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    // GPT가 준 텍스트 꺼내기
    const answer = response.output[0].content[0].text;

    res.json({ answer });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'AI error' });
  }
});

// ─────────────────────────────────────
// 4) 코디 저장 API
// ─────────────────────────────────────
app.get('/outfits', (req, res) => {
  res.json(savedOutfits);
});

app.post('/outfits', (req, res) => {
  const { name, topColor, bottomColor, shoesColor } = req.body;

  if (!name || !topColor || !bottomColor || !shoesColor) {
    return res
      .status(400)
      .json({ error: 'name, topColor, bottomColor, shoesColor가 필요합니다.' });
  }

  const outfit = {
    id: nextOutfitId++,
    name,
    topColor,
    bottomColor,
    shoesColor,
    createdAt: new Date().toISOString(),
  };

  savedOutfits.push(outfit);
  res.status(201).json(outfit);
});

app.delete('/outfits/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = savedOutfits.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '해당 코디를 찾을 수 없습니다.' });
  }

  const deleted = savedOutfits.splice(index, 1)[0];
  res.json(deleted);
});

// ─────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
