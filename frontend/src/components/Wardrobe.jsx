// src/components/Wardrobe.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Wardrobe({ apiBase, token }) {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameMap, setRenameMap] = useState({});
  const [message, setMessage] = useState("");

  const notifyFavoritesChange = () =>
    window.dispatchEvent(new Event("colorme:favoritesUpdated"));

  const fetchOutfits = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${apiBase}/outfits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const list = res.data || [];
      setOutfits(list);
      const initNames = {};
      list.forEach((o) => {
        initNames[o.id] = o.name;
      });
      setRenameMap(initNames);
      notifyFavoritesChange();
    } catch (err) {
      console.error(err);
      setMessage("내 옷장을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRename = async (id) => {
    const newName = (renameMap[id] || "").trim();
    if (!newName) return;
    try {
      await axios.put(
        `${apiBase}/outfits/${id}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("코디 이름이 수정되었습니다.");
      setOutfits((prev) =>
        prev.map((o) => (o.id === id ? { ...o, name: newName } : o))
      );
      notifyFavoritesChange();
    } catch (err) {
      console.error(err);
      setMessage("이름 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 코디를 삭제할까요?")) return;
    try {
      await axios.delete(`${apiBase}/outfits/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOutfits((prev) => prev.filter((o) => o.id !== id));
      setMessage("코디가 삭제되었습니다.");
      notifyFavoritesChange();
    } catch (err) {
      console.error(err);
      setMessage("삭제 중 오류가 발생했습니다.");
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const res = await axios.post(
        `${apiBase}/outfits/${id}/favorite`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const next = res.data?.isFavorite;
      setOutfits((prev) =>
        prev.map((o) => (o.id === id ? { ...o, isFavorite: next } : o))
      );
      notifyFavoritesChange();
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
      setMessage("즐겨찾기 중 오류가 발생했습니다.");
    }
  };

  if (!token) {
    return (
      <div
        style={{
          borderRadius: 24,
          padding: 24,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(51,65,85,0.9)",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          내 옷장
        </h2>
        <p style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
          저장된 코디를 보려면 먼저 로그인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 24,
        padding: 24,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.9)",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        내 옷장
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "rgb(148,163,184)",
          marginBottom: 16,
        }}
      >
        색조합 시뮬레이터에서 저장한 코디들이 여기 모여 있습니다. 이름을
        바꾸거나 삭제할 수 있어요.
      </p>

      {loading && (
        <div style={{ fontSize: 13, color: "rgb(148,163,184)", marginBottom: 8 }}>
          불러오는 중...
        </div>
      )}
      {message && (
        <div style={{ fontSize: 12, color: "rgb(148,163,184)", marginBottom: 8 }}>
          {message}
        </div>
      )}

      {outfits.length === 0 && !loading ? (
        <div style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
          아직 저장된 코디가 없습니다. 색조합 시뮬레이터에서 마음에 드는 조합을
          저장해 보세요.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {outfits.map((o) => (
            <div
              key={o.id}
              style={{
                borderRadius: 18,
                padding: 16,
                background: "rgba(15,23,42,1)",
                border: "1px solid rgba(30,41,59,1)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* 작은 아바타 미리보기 */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 220,
                    height: 360,
                    borderRadius: 36,
                    padding: 24,
                    background:
                      "radial-gradient(circle at top, #1f2937, #020617)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "#f5f5f5",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
                    }}
                  />
                  <div
                    style={{
                      width: 45,
                      height: 14,
                      borderRadius: 999,
                      background: "#d1d5db",
                    }}
                  />
                  <div
                    style={{
                      width: 175,
                      height: 260,
                      borderRadius: "120px 120px 75px 75px",
                      background: o.topColor,
                      boxShadow: "0 18px 34px rgba(0,0,0,0.55)",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: -6,
                    }}
                  >
                    <div
                      style={{
                        width: 55,
                        height: 120,
                        borderRadius: 48,
                        background: o.bottomColor,
                      }}
                    />
                    <div
                      style={{
                        width: 55,
                        height: 120,
                        borderRadius: 48,
                        background: o.bottomColor,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 24,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 55,
                        height: 24,
                        borderRadius: 999,
                        background: o.shoesColor,
                      }}
                    />
                    <div
                      style={{
                        width: 55,
                        height: 24,
                        borderRadius: 999,
                        background: o.shoesColor,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 이름/버튼 */}
              <input
                type="text"
                value={renameMap[o.id] ?? o.name}
                onChange={(e) =>
                  setRenameMap((prev) => ({
                    ...prev,
                    [o.id]: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(55,65,81,1)",
                  background: "rgba(15,23,42,1)",
                  color: "white",
                  fontSize: 12,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginTop: 4,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => handleRename(o.id)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "none",
                    fontSize: 12,
                    cursor: "pointer",
                    background: "rgb(59,130,246)",
                    color: "#0b1120",
                    fontWeight: 600,
                  }}
                >
                  이름 저장
                </button>
                <button
                  onClick={() => toggleFavorite(o.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid rgba(251,191,36,0.7)",
                    background: o.isFavorite ? "rgba(251,191,36,0.2)" : "transparent",
                    color: o.isFavorite ? "#fbbf24" : "#9ca3af",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  title={o.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  ★
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  style={{
                    flex: 0.6,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "none",
                    fontSize: 12,
                    cursor: "pointer",
                    background: "rgba(239,68,68,0.9)",
                    color: "#f9fafb",
                  }}
                >
                  삭제
                </button>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "rgb(148,163,184)",
                  marginTop: 4,
                }}
              >
                Top: {o.topColor} / Bottom: {o.bottomColor} / Shoes:{" "}
                {o.shoesColor}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
