import { useEffect, useState } from 'react';
import axios from 'axios';

const MOODS = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'street', label: 'Street' },
  { id: 'casual', label: 'Casual' },
];

const EXTENDED_PALETTES = {
  minimal: [
    '#ffffff',
    '#000000',
    '#f5f5f5',
    '#e5e7eb',
    '#d4d4d8',
    '#a3a3a3',
    '#52525b',
    '#0f172a',
  ],
  street: [
    '#000000',
    '#f97316',
    '#facc15',
    '#22c55e',
    '#3b82f6',
    '#ef4444',
    '#a855f7',
    '#eab308',
  ],
  casual: [
    '#f97316',
    '#fbbf24',
    '#34d399',
    '#38bdf8',
    '#a855f7',
    '#f472b6',
    '#64748b',
    '#0f172a',
  ],
};

function PaletteSimulator() {
  const [mood, setMood] = useState('minimal');
  const [palette, setPalette] = useState([]);
  const [selectedPart, setSelectedPart] = useState('top'); // top | bottom | shoes

  const [topColor, setTopColor] = useState('#FFFFFF');
  const [bottomColor, setBottomColor] = useState('#000000');
  const [shoesColor, setShoesColor] = useState('#CCCCCC');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [outfitName, setOutfitName] = useState('');

  useEffect(() => {
    async function fetchPalette() {
      try {
        const res = await axios.get(`http://localhost:4000/palette?mood=${mood}`);
        const serverColors = res.data.palette || [];
        const extended = EXTENDED_PALETTES[mood] || [];
        const merged = Array.from(new Set([...serverColors, ...extended]));
        setPalette(merged);

        // 기본값 세팅
        if (colors.length >= 3) {
          setTopColor(colors[0]);
          setBottomColor(colors[1]);
          setShoesColor(colors[2]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchPalette();
  }, [mood]);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const res = await axios.get('http://localhost:4000/outfits');
        setSavedOutfits(res.data);
      } catch (err) {
        console.error('Failed to load outfits', err);
      }
    };
    fetchOutfits();
  }, []);

  const handleColorClick = (color) => {
    if (selectedPart === 'top') setTopColor(color);
    if (selectedPart === 'bottom') setBottomColor(color);
    if (selectedPart === 'shoes') setShoesColor(color);
  };

  const handleSaveOutfit = async () => {
    const trimmed = outfitName.trim();
    if (!trimmed) {
      alert('코디 이름을 입력해주세요. 예: 데이트룩, 클럽룩');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/outfits', {
        name: trimmed,
        topColor,
        bottomColor,
        shoesColor,
      });
      setSavedOutfits((prev) => [...prev, res.data]);
      setOutfitName('');
    } catch (err) {
      console.error('Failed to save outfit', err);
      alert('코디 저장 중 오류가 발생했습니다.');
    }
  };

  const handleApplyOutfit = (outfit) => {
    setTopColor(outfit.topColor);
    setBottomColor(outfit.bottomColor);
    setShoesColor(outfit.shoesColor);
  };

  const handleDeleteOutfit = async (id) => {
    if (!window.confirm('이 코디를 삭제할까요?')) return;
    try {
      await axios.delete(`http://localhost:4000/outfits/${id}`);
      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete outfit', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className="panel">
      <h2>오늘의 무드 기반 색조합 시뮬레이터</h2>

      {/* 무드 선택 */}
      <div className="mood-row">
        <span className="label">Mood</span>
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={`pill ${mood === m.id ? 'pill-active' : ''}`}
            onClick={() => setMood(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 파츠 선택 */}
      <div className="part-row">
        <span className="label">부분 선택</span>
        <button
          className={`pill ${selectedPart === 'top' ? 'pill-active' : ''}`}
          onClick={() => setSelectedPart('top')}
        >
          상의
        </button>
        <button
          className={`pill ${selectedPart === 'bottom' ? 'pill-active' : ''}`}
          onClick={() => setSelectedPart('bottom')}
        >
          하의
        </button>
        <button
          className={`pill ${selectedPart === 'shoes' ? 'pill-active' : ''}`}
          onClick={() => setSelectedPart('shoes')}
        >
          신발
        </button>
      </div>

      {/* 팔레트 */}
      <div className="palette-row">
        {palette.map((color) => (
          <button
            key={color}
            className="color-chip"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={color}
          />
        ))}
        <label className="color-picker-chip">
          <span>Custom</span>
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              const value = e.target.value;
              setCustomColor(value);
              handleColorClick(value);
            }}
          />
        </label>
      </div>

      {/* 아바타 영역 */}
      <div className="avatar-wrapper">
        <div className="avatar-body">
          {/* 머리 + 목 (피부색 고정) */}
          <div className="avatar-head" />
          <div className="avatar-neck" />

          {/* 상의 – topColor */}
          <div className="avatar-torso" style={{ backgroundColor: topColor }} />

          {/* 하의 – 바지 두 다리 */}
          <div className="avatar-legs">
            <div className="avatar-leg" style={{ backgroundColor: bottomColor }} />
            <div className="avatar-leg" style={{ backgroundColor: bottomColor }} />
          </div>

          {/* 신발 – 좌/우 두 개 */}
          <div className="avatar-shoes-row">
            <div className="avatar-shoe" style={{ backgroundColor: shoesColor }} />
            <div className="avatar-shoe" style={{ backgroundColor: shoesColor }} />
          </div>
        </div>
      </div>

      <p className="current-combo">
        현재 조합 Top: {topColor} / Bottom: {bottomColor} / Shoes: {shoesColor}
      </p>

      <div className="save-outfit-row">
        <input
          className="save-outfit-input"
          type="text"
          placeholder="이 코디 이름 (예: 데이트룩, 클럽룩)"
          value={outfitName}
          onChange={(e) => setOutfitName(e.target.value)}
        />
        <button className="primary-btn" onClick={handleSaveOutfit}>
          이 조합 저장
        </button>
      </div>

      <div className="saved-outfits">
        {savedOutfits.length === 0 ? (
          <p className="saved-empty">아직 저장된 코디가 없습니다.</p>
        ) : (
          savedOutfits.map((o) => (
            <div key={o.id} className="saved-outfit-card">
              <div className="saved-outfit-header">
                <span className="saved-outfit-name">{o.name}</span>
                <span className="saved-outfit-date">
                  {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="saved-outfit-preview">
                <div className="preview-color top" style={{ backgroundColor: o.topColor }} />
                <div
                  className="preview-color bottom"
                  style={{ backgroundColor: o.bottomColor }}
                />
                <div
                  className="preview-color shoes"
                  style={{ backgroundColor: o.shoesColor }}
                />
              </div>
              <div className="saved-outfit-actions">
                <button className="secondary-btn" onClick={() => handleApplyOutfit(o)}>
                  이 코디 불러오기
                </button>
                <button className="danger-btn" onClick={() => handleDeleteOutfit(o.id)}>
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default PaletteSimulator;
