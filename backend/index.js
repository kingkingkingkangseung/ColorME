// backend/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const { prisma } = require('./prismaClient');

const app = express();
const PORT = process.env.PORT || 4000;

function mapOutfitRow(row) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    topColor: row.topColor,
    bottomColor: row.bottomColor,
    shoesColor: row.shoesColor,
    isFavorite: !!row.isFavorite,
    createdAt: row.createdAt,
  };
}

// ───────────────────── Middleware ─────────────────────
app.use(
  cors({
    origin: 'https://colorme-eta.vercel.app',
  })
);
app.use(express.json({ limit: '15mb' }));

// ───────────────────── JWT & Auth 미들웨어 ─────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authRequired(req, res, next) {
  const auth = req.header('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ error: '토큰이 유효하지 않습니다.' });
  }
}

// ───────────────────── OpenAI 설정 (AI 코디 컨설턴트) ─────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ───────────────────── Routes ─────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// 1) 회원가입
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email과 password가 필요합니다.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: '이미 존재하는 이메일입니다.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
      },
      select: { id: true, email: true },
    });

    const token = createToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '서버 오류(회원가입)' });
  }
});

// 2) 로그인
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email과 password가 필요합니다.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const payload = { id: user.id, email: user.email };
    const token = createToken(payload);
    res.json({ user: payload, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '서버 오류(로그인)' });
  }
});

// 3) 내 정보
app.get('/auth/me', authRequired, async (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email } });
});

// 프로필 조회/저장
app.get('/profile', authRequired, async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    res.json({
      displayName: profile?.displayName || '',
      avatarUrl: profile?.avatarUrl || '',
      heroUrl: profile?.heroUrl || '',
      bio: profile?.bio || '',
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: '프로필을 불러오지 못했습니다.' });
  }
});

app.put('/profile', authRequired, async (req, res) => {
  const userId = req.user.id;
  const { displayName = '', avatarUrl = '', heroUrl = '', bio = '' } = req.body || {};
  try {
    const saved = await prisma.profile.upsert({
      where: { userId },
      update: { displayName, avatarUrl, heroUrl, bio },
      create: { userId, displayName, avatarUrl, heroUrl, bio },
    });
    res.json({
      displayName: saved.displayName || '',
      avatarUrl: saved.avatarUrl || '',
      heroUrl: saved.heroUrl || '',
      bio: saved.bio || '',
    });
  } catch (err) {
    console.error('Save profile error:', err);
    res.status(500).json({ error: '프로필 저장 중 오류가 발생했습니다.' });
  }
});

// 4) 팔레트(무드 → 색 배열)
const PALETTES = {
  minimal: ['#ffffff', '#000000', '#f5f5f5', '#e5e7eb', '#d4d4d8', '#a3a3a3', '#52525b', '#0f172a'],
  street: ['#000000', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#eab308'],
  casual: ['#f97316', '#fbbf24', '#34d399', '#38bdf8', '#a855f7', '#f472b6', '#64748b', '#0f172a'],
};

app.get('/palette', (req, res) => {
  const mood = req.query.mood || 'minimal';
  const palette = PALETTES[mood] || PALETTES.minimal;
  res.json({ mood, palette });
});

// 5) AI 코디 컨설턴트
app.post('/ask-ai', async (req, res) => {
  const { question } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            '너는 패션 코디를 도와주는 어시스턴트야. 색조합과 무드 위주로 한 줄~두 줄 정도로 짧게 추천해줘.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    const answer = response.output[0].content[0].text;
    res.json({ answer });
  } catch (err) {
    console.error('ask-ai error:', err);
    res.status(500).json({ error: 'AI 호출 중 오류가 발생했습니다.' });
  }
});

// 6) 코디(Outfit) – 사용자별 저장 (인증 필요)

// 전체 코디 조회 (내 것만)
app.get('/outfits', authRequired, async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await prisma.outfit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rows.map(mapOutfitRow));
  } catch (err) {
    console.error('Get outfits error:', err);
    res.status(500).json({ error: '코디 조회 중 오류' });
  }
});

// 코디 저장
app.post('/outfits', authRequired, async (req, res) => {
  const userId = req.user.id;
  const { name, topColor, bottomColor, shoesColor } = req.body || {};

  if (!name || !topColor || !bottomColor || !shoesColor) {
    return res.status(400).json({
      error: 'name, topColor, bottomColor, shoesColor가 필요합니다.',
    });
  }

  try {
    const outfit = await prisma.outfit.create({
      data: {
        userId,
        name,
        topColor,
        bottomColor,
        shoesColor,
      },
    });
    res.status(201).json(mapOutfitRow(outfit));
  } catch (err) {
    console.error('Save outfit error:', err);
    res.status(500).json({ error: '코디 저장 중 오류' });
  }
});

// 코디 삭제
app.delete('/outfits/:id', authRequired, async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  try {
    const existing = await prisma.outfit.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: '코디를 찾을 수 없습니다.' });
    }

    await prisma.outfit.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete outfit error:', err);
    res.status(500).json({ error: '코디 삭제 중 오류' });
  }
});

// 즐겨찾기 토글
app.post('/outfits/:id/favorite', authRequired, async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  try {
    const outfit = await prisma.outfit.findFirst({ where: { id, userId } });
    if (!outfit) {
      return res.status(404).json({ error: '코디를 찾을 수 없습니다.' });
    }
    const updated = await prisma.outfit.update({
      where: { id },
      data: { isFavorite: !outfit.isFavorite },
    });
    res.json({ ok: true, isFavorite: updated.isFavorite });
  } catch (err) {
    console.error('Favorite toggle error:', err);
    res.status(500).json({ error: '즐겨찾기 업데이트 중 오류' });
  }
});

// ───────────────────── 서버 시작 ─────────────────────
async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log('✅ Backend running on http://localhost:' + PORT);
    });
  } catch (err) {
    console.error('서버 시작 실패:', err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
