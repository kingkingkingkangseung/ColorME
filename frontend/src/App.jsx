// src/App.jsx
import { useEffect, useState } from "react";
import axios from "axios";

import AuthPanel from "./components/AuthPanel";
import PaletteSimulator from "./components/PaletteSimulator";
import AiConsultant from "./components/AiConsultant";
import ShopLinks from "./components/ShopLinks";
import ProfileBar from "./components/ProfileBar";
import Wardrobe from "./components/Wardrobe";
import ProfileModal from "./components/ProfileModal";
import HomeShowcase from "./components/HomeShowcase";
import ColorGuide from "./components/ColorGuide";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://colorme-production.up.railway.app";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("colorme_token");
    } catch {
      return null;
    }
  });

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [simMood, setSimMood] = useState("minimal");
  const [simTopColor, setSimTopColor] = useState("#ffffff");
  const [simBottomColor, setSimBottomColor] = useState("#000000");
  const [simShoesColor, setSimShoesColor] = useState("#f5f5f5");

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    const fetchMe = async () => {
      try {
        setLoadingMe(true);
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMe(res.data);
      } catch (err) {
        console.error("me 호출 실패:", err);
        setMe(null);
        setToken(null);
        try {
          localStorage.removeItem("colorme_token");
        } catch {}
      } finally {
        setLoadingMe(false);
      }
    };

    fetchMe();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("프로필 불러오기 실패:", err);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setMe(user || null);
    try {
      localStorage.setItem("colorme_token", newToken);
    } catch {}
  };

  const handleLogout = () => {
    setToken(null);
    setMe(null);
    try {
      localStorage.removeItem("colorme_token");
    } catch {}
  };

  const handleSaveProfile = async (nextProfile) => {
    if (!token) return;
    try {
      const res = await axios.put(`${API_BASE}/profile`, nextProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setProfileModalOpen(false);
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      alert("프로필 저장 중 문제가 발생했습니다.");
    }
  };

  const harmonyPresets = {
    complementary: {
      mood: "street",
      top: "#1D4ED8",
      bottom: "#F97316",
      shoes: "#F5F5F5",
    },
    analogous: {
      mood: "casual",
      top: "#FBBF24",
      bottom: "#F97316",
      shoes: "#FEF3C7",
    },
    triadic: {
      mood: "street",
      top: "#2563EB",
      bottom: "#FACC15",
      shoes: "#F97316",
    },
    "split-complementary": {
      mood: "minimal",
      top: "#475569",
      bottom: "#B45309",
      shoes: "#94A3B8",
    },
    tetradic: {
      mood: "street",
      top: "#0F172A",
      bottom: "#FB7185",
      shoes: "#FCD34D",
    },
  };

  const applyHarmonyPreset = (key) => {
    const preset = harmonyPresets[key];
    if (!preset) return;
    setActiveTab("palette");
    setSimMood(preset.mood || "minimal");
    setSimTopColor(preset.top || "#ffffff");
    setSimBottomColor(preset.bottom || "#000000");
    setSimShoesColor(preset.shoes || "#f5f5f5");
    setTimeout(() => {
      const el = document.getElementById("palette-simulator");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // ✅ 1) 토큰이 없을 때: 로그인 화면만 보여주기
  if (!token) {
    return (
      <>
        <div
          style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#e5e7eb",
            padding: "24px 24px 40px",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <header style={{ marginBottom: 24 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                ColorME
              </h1>
              <p style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
                색으로 룩을 결정하는 패션 컬러 시뮬레이터
              </p>
            </header>
            <AuthPanel apiBase={API_BASE} onAuthSuccess={handleLoginSuccess} />
          </div>
        </div>
        <ProfileModal
          open={profileModalOpen}
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      </>
    );
  }

  // ✅ 2) 여기부터는 "로그인 된 뒤 메인 화면"
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "#e5e7eb",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* 헤더 */}
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            ColorME
          </h1>
          <p style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
            색으로 룩을 결정하는 패션 컬러 시뮬레이터
          </p>
        </header>

        {/* ⬇️ 로그인 카드 없어지고, 위에는 프로필 바만 */}
        {me && (
          <ProfileBar
            user={me}
            loading={loadingMe || profileLoading}
            profile={profile}
            onLogout={handleLogout}
            onEditProfile={() => setProfileModalOpen(true)}
          />
        )}

        {/* 탭 네비게이션 */}
        <div
          style={{
            display: "flex",
            gap: 12,
            margin: "18px 0 22px",
          }}
        >
          {[
            { key: "home", label: "홈" },
            { key: "palette", label: "색조합 시뮬레이터" },
            { key: "shop", label: "쇼핑몰 링크" },
            { key: "ai", label: "AI 코디 컨설턴트" },
            { key: "wardrobe", label: "내 옷장" },
            { key: "guide", label: "Color 가이드" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 999,
                border: "none",
                fontSize: 14,
                cursor: "pointer",
                background:
                  activeTab === tab.key
                    ? "rgb(59,130,246)"
                    : "rgba(15,23,42,1)",
                color:
                  activeTab === tab.key
                    ? "#0b1120"
                    : "rgb(209,213,219)",
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        {activeTab === "home" && <HomeShowcase profile={profile} />}

        {activeTab === "palette" && (
          <PaletteSimulator
            apiBase={API_BASE}
            token={token}
            mood={simMood}
            setMood={setSimMood}
            topColor={simTopColor}
            setTopColor={setSimTopColor}
            bottomColor={simBottomColor}
            setBottomColor={setSimBottomColor}
            shoesColor={simShoesColor}
            setShoesColor={setSimShoesColor}
            onGoWardrobe={() => setActiveTab("wardrobe")}
          />
        )}

        {activeTab === "shop" && <ShopLinks />}

        {activeTab === "ai" && (
          <AiConsultant apiBase={API_BASE} token={token} />
        )}

        {activeTab === "wardrobe" && (
          <Wardrobe apiBase={API_BASE} token={token} />
        )}
        {activeTab === "guide" && (
          <ColorGuide onSelectHarmony={applyHarmonyPreset} />
        )}
        </div>
      </div>
      <ProfileModal
        open={profileModalOpen}
        profile={profile}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

export default App;
