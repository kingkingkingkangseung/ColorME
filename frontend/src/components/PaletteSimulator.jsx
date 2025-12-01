// src/components/PaletteSimulator.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MOODS = ["minimal", "street", "casual"];

const PALETTES = {
  minimal: ["#ffffff", "#000000", "#f5f5f5", "#d1d5db", "#4b5563"],
  street: ["#111827", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"],
  casual: ["#f97316", "#fb7185", "#22c55e", "#3b82f6", "#a855f7"],
};

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
