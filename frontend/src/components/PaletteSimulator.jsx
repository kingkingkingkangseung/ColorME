// src/components/PaletteSimulator.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MOODS = ["minimal", "street", "casual"];

const PALETTES = {
  minimal: ["#ffffff", "#000000", "#f5f5f5", "#d1d5db", "#4b5563"],
  street: ["#111827", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"],
  casual: ["#f97316", "#fb7185", "#22c55e", "#3b82f6", "#a855f7"],
};

function hexToRgb(hex) {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return { r, g, b };
  }
  return { r: 255, g: 255, b: 255 };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function hueDiff(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function clampScore(value) {
  return Math.max(0, Math.min(10, value));
}

function moodLabel(m) {
  if (m === "minimal") return "Minimal";
  if (m === "street") return "Street";
  if (m === "casual") return "Casual";
  return m;
}

export default function PaletteSimulator({
  apiBase,
  token,
  onGoWardrobe,
  mood = "minimal",
  setMood = () => {},
  topColor = "#ffffff",
  setTopColor = () => {},
  bottomColor = "#000000",
  setBottomColor = () => {},
  shoesColor = "#f5f5f5",
  setShoesColor = () => {},
}) {
  const [part, setPart] = useState("top"); // top | bottom | shoes

  const [customColor, setCustomColor] = useState("#ff5733");

  const [outfitName, setOutfitName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);

  const colorMetrics = React.useMemo(() => {
    const top = rgbToHsl(hexToRgb(topColor));
    const bottom = rgbToHsl(hexToRgb(bottomColor));
    const shoes = rgbToHsl(hexToRgb(shoesColor));

    const diffTopBottom = hueDiff(top.h, bottom.h);
    const diffTopShoes = hueDiff(top.h, shoes.h);
    const diffBottomShoes = hueDiff(bottom.h, shoes.h);
    const maxDiff = Math.max(diffTopBottom, diffTopShoes, diffBottomShoes);
    const complementaryScore = clampScore(10 - Math.abs(180 - maxDiff) / 18);

    const values = [top.l, bottom.l, shoes.l];
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const valueStd = Math.sqrt(values.reduce((acc, v) => acc + (v - avgValue) ** 2, 0) / values.length);
    const valueScore = clampScore(10 - Math.abs(valueStd - 0.18) / 0.18 * 10);

    const chromaValues = [top.s, bottom.s, shoes.s];
    const avgChroma = chromaValues.reduce((a, b) => a + b, 0) / chromaValues.length;
    const chromaStd = Math.sqrt(
      chromaValues.reduce((acc, v) => acc + (v - avgChroma) ** 2, 0) / chromaValues.length
    );
    const chromaScore = clampScore(10 - Math.abs(chromaStd - 0.2) / 0.2 * 10);

    let harmonyType = "balanced";
    if (maxDiff >= 150) harmonyType = "complementary";
    else if (diffTopBottom <= 35 && diffTopShoes <= 35 && diffBottomShoes <= 35) harmonyType = "analogous";
    else if (
      [diffTopBottom, diffTopShoes, diffBottomShoes].filter((d) => d >= 100 && d <= 140).length >= 2
    )
      harmonyType = "triadic";

    const neutralParts = [
      top.s < 0.12 ? "상의" : null,
      bottom.s < 0.12 ? "하의" : null,
      shoes.s < 0.12 ? "신발" : null,
    ].filter(Boolean);

    return {
      harmonyType,
      complementaryScore: Math.round(complementaryScore * 10) / 10,
      valueScore: Math.round(valueScore * 10) / 10,
      chromaScore: Math.round(chromaScore * 10) / 10,
      neutralParts,
    };
  }, [topColor, bottomColor, shoesColor]);

  const normalizedMood = mood || "minimal";
  const colors = PALETTES[normalizedMood] || PALETTES.minimal;
  useEffect(() => {
    if (!token) {
      setFavoriteOutfits([]);
      return;
    }
    let cancelled = false;
    const loadFavorites = async () => {
      try {
        const res = await axios.get(`${apiBase}/outfits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          const favs = (res.data || [])
            .filter((o) => o.isFavorite)
            .map((o) => ({ id: o.id, name: o.name }))
            .slice(0, 5);
          setFavoriteOutfits(favs);
        }
      } catch (err) {
        console.error("즐겨찾기 목록을 불러오지 못했습니다:", err);
      }
    };
    loadFavorites();
    const handler = () => loadFavorites();
    window.addEventListener("colorme:favoritesUpdated", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("colorme:favoritesUpdated", handler);
    };
  }, [apiBase, token]);

  const handleColorClick = (color) => {
    if (part === "top") setTopColor(color);
    if (part === "bottom") setBottomColor(color);
    if (part === "shoes") setShoesColor(color);
  };

  const handleCustomPick = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    handleColorClick(color);
  };

  const handleSaveOutfit = async () => {
    const name = outfitName.trim();
    if (!name) {
      setSaveMessage("코디 이름을 입력해 주세요.");
      return;
    }
    if (!token) {
      setSaveMessage("코디를 저장하려면 먼저 로그인해야 합니다.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");

      await axios.post(
        `${apiBase}/outfits`,
        {
          name,
          mood: normalizedMood,
          topColor,
          bottomColor,
          shoesColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSaveMessage("코디가 ‘내 옷장’에 저장되었습니다.");
      setOutfitName("");
    } catch (err) {
      console.error(err);
      setSaveMessage("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const harmonyLabel = {
    complementary: "보색 대비",
    analogous: "유사색 안정",
    triadic: "삼색 포인트",
    balanced: "균형 조합",
  }[colorMetrics.harmonyType];

  const harmonyDescription = (() => {
    if (colorMetrics.harmonyType === "complementary") {
      return "상의와 하의가 보색 관계에 가까워 대비가 크고 시선을 끌어요. 신발을 중립색으로 두면 안정감이 더해집니다.";
    }
    if (colorMetrics.harmonyType === "analogous") {
      return "색상환에서 가까운 색들로 구성되어 전체 톤이 부드럽고 안정적인 느낌이에요.";
    }
    if (colorMetrics.harmonyType === "triadic") {
      return "서로 다른 색이 분명해서 포인트가 잘 살아납니다. 하나를 메인으로 잡으면 더 세련돼요.";
    }
    return "명도와 채도의 균형을 기준으로 안정감 있는 조합으로 평가됩니다.";
  })();

  return (
    <div
      id="palette-simulator"
      style={{
        borderRadius: 24,
        padding: 24,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.9)",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
        오늘의 무드 기반 색조합 시뮬레이터
      </h2>

      {/* 무드 선택 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              border: "none",
              fontSize: 14,
              cursor: "pointer",
              background:
                normalizedMood === m ? "rgb(34,197,94)" : "rgba(15,23,42,1)",
              color:
                normalizedMood === m ? "#0b1120" : "rgb(209,213,219)",
            }}
          >
            {moodLabel(m)}
          </button>
        ))}
      </div>

      {/* 부위 선택 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { key: "top", label: "상의" },
          { key: "bottom", label: "하의" },
          { key: "shoes", label: "신발" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPart(p.key)}
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              background:
                part === p.key ? "rgb(34,197,94)" : "rgba(15,23,42,1)",
              color: part === p.key ? "#0b1120" : "rgb(209,213,219)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 색상 칩 + Custom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => handleColorClick(c)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              border:
                topColor === c || bottomColor === c || shoesColor === c
                  ? "2px solid white"
                  : "2px solid transparent",
              background: c,
              cursor: "pointer",
            }}
          />
        ))}

        <div style={{ marginLeft: 16, display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontSize: 13,
              color: "rgb(156,163,175)",
              marginRight: 8,
            }}
          >
            Custom
          </span>
          <input
            type="color"
            value={customColor}
            onChange={handleCustomPick}
            style={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* 아바타 시뮬레이터 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: 260,
            height: 480,
            borderRadius: 40,
            padding: 32,
            background: "radial-gradient(circle at top, #1f2937, #020617)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* 머리 */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#f5f5f5",
              boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
            }}
          />
          {/* 목 */}
          <div
            style={{
              width: 50,
              height: 16,
              borderRadius: 999,
              background: "#d1d5db",
            }}
          />
          {/* 상체 */}
          <div
            style={{
              width: 180,
              height: 270,
              borderRadius: "140px 140px 80px 80px",
              background: topColor,
              boxShadow: "0 20px 36px rgba(0,0,0,0.6)",
            }}
          />
          {/* 하체 */}
          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: -10,
            }}
          >
            <div
              style={{
                width: 60,
                height: 140,
                borderRadius: 50,
                background: bottomColor,
              }}
            />
            <div
              style={{
                width: 60,
                height: 140,
                borderRadius: 50,
                background: bottomColor,
              }}
            />
          </div>
          {/* 신발 */}
          <div
            style={{
              display: "flex",
              gap: 30,
              marginTop: 4,
            }}
          >
            <div
              style={{
                width: 65,
                height: 30,
                borderRadius: 999,
                background: shoesColor,
              }}
            />
            <div
              style={{
                width: 65,
                height: 30,
                borderRadius: 999,
                background: shoesColor,
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 220,
            borderRadius: 24,
            padding: "20px 22px",
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(51,65,85,0.6)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
              Color Harmony Score
            </div>
            <div style={{ fontSize: 12, color: "rgb(148,163,184)", marginTop: 4 }}>
              {harmonyLabel} 기준으로 자동 평가한 결과입니다.
            </div>
          </div>

          {[
            { label: "보색 대비", value: colorMetrics.complementaryScore },
            { label: "명도 균형", value: colorMetrics.valueScore },
            { label: "채도 균형", value: colorMetrics.chromaScore },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#cbd5f5",
                  marginBottom: 6,
                }}
              >
                <span>{item.label}</span>
                <span>{item.value}/10</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(148,163,184,0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.value * 10}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #38bdf8, #22c55e)",
                  }}
                />
              </div>
            </div>
          ))}

          <div
            style={{
              padding: 12,
              borderRadius: 16,
              background: "rgba(2,6,23,0.7)",
              border: "1px solid rgba(51,65,85,0.5)",
              fontSize: 12,
              color: "#e2e8f0",
              lineHeight: 1.5,
            }}
          >
            {harmonyDescription}
            {colorMetrics.neutralParts.length > 0 && (
              <span style={{ display: "block", marginTop: 8, color: "#94a3b8" }}>
                중립감 있는 색상: {colorMetrics.neutralParts.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 현재 조합 텍스트 */}
      <p
        style={{
          marginTop: 16,
          fontSize: 13,
          color: "rgb(156,163,175)",
        }}
      >
        현재 조합 Top: <span style={{ color: "#e5e7eb" }}>{topColor}</span> / Bottom:{" "}
        <span style={{ color: "#e5e7eb" }}>{bottomColor}</span> / Shoes:{" "}
        <span style={{ color: "#e5e7eb" }}>{shoesColor}</span>
      </p>

      {/* 즐겨찾기 섹션 */}
      <div
        style={{
          marginTop: 16,
          borderRadius: 20,
          border: "1px dashed rgba(51,65,85,0.6)",
          padding: 16,
          background: "rgba(2,6,23,0.6)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>
          즐겨찾는 코디
        </div>
        {token ? (
          favoriteOutfits.length > 0 ? (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {favoriteOutfits.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => onGoWardrobe && onGoWardrobe()}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(248,250,252,0.2)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f8fafc",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {fav.name}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "rgb(148,163,184)", marginTop: 8 }}>
              아직 즐겨찾기한 코디가 없습니다. 내 옷장에서 ★ 버튼을 눌러 보세요.
            </p>
          )
        ) : (
          <p style={{ fontSize: 12, color: "rgb(148,163,184)", marginTop: 8 }}>
            즐겨찾기를 보려면 로그인해 주세요.
          </p>
        )}
      </div>

      {/* 코디 저장 영역 */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: "1px solid rgba(31,41,55,1)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
          이 조합을 이름 붙여서 저장하면, 상단 탭의 <b>내 옷장</b>에서 다시 볼 수
          있습니다.
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="예) 데이트룩, 클럽룩, 학교갈 때 룩"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(55,65,81,1)",
              background: "rgba(15,23,42,1)",
              color: "white",
              fontSize: 13,
            }}
          />
          <button
            onClick={handleSaveOutfit}
            disabled={saving}
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              border: "none",
              background: saving ? "rgba(59,130,246,0.6)" : "rgb(59,130,246)",
              color: "#0b1120",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "저장 중..." : "이 조합 저장"}
          </button>
        </div>

        {saveMessage && (
          <div
            style={{
              fontSize: 12,
              color: "rgb(148,163,184)",
              marginTop: 4,
            }}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
