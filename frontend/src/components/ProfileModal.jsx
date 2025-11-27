import { useEffect, useState } from "react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileModal({ open, onClose, onSave, profile }) {
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [heroPreview, setHeroPreview] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile?.displayName || "");
      setAvatarPreview(profile?.avatarUrl || "");
      setHeroPreview(profile?.heroUrl || "");
      setBio(profile?.bio || "");
    }
  }, [open, profile]);

  if (!open) return null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await fileToDataUrl(file);
    setAvatarPreview(data);
  };

  const handleHeroChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await fileToDataUrl(file);
    setHeroPreview(data);
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.resolve();
    onSave({
      displayName: displayName.trim(),
      avatarUrl: avatarPreview,
      heroUrl: heroPreview,
      bio: bio.trim(),
    });
    setSaving(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          borderRadius: 24,
          background: "rgba(15,23,42,0.98)",
          border: "1px solid rgba(51,65,85,0.8)",
          padding: 28,
          color: "#e5e7eb",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>프로필 수정</h3>
        <p style={{ fontSize: 13, color: "rgb(148,163,184)" }}>
          이름, 이미지, 한 줄 소개를 수정해서 나만의 홈 화면을 꾸며보세요.
        </p>

        <label style={{ display: "block", marginTop: 12, fontSize: 13 }}>
          표시 이름
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="나만의 닉네임"
            style={{
              width: "100%",
              borderRadius: 999,
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              padding: "8px 14px",
              marginTop: 6,
            }}
          />
        </label>

        <label style={{ display: "block", marginTop: 16, fontSize: 13 }}>
          한 줄 소개 / 코디 노트
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="오늘의 기분, 나만의 스타일 한마디 등을 적어 보세요."
            rows={3}
            style={{
              width: "100%",
              borderRadius: 18,
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              padding: "10px 14px",
              marginTop: 6,
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 24,
            marginTop: 16,
          }}
        >
          <div>
            <span style={{ fontSize: 13 }}>프로필 아바타</span>
            <div
              style={{
                marginTop: 8,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(30,41,59,0.8)",
                border: "1px dashed rgba(59,130,246,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  이미지 없음
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <span style={{ fontSize: 13 }}>메인 배너 이미지</span>
            <div
              style={{
                marginTop: 8,
                width: "100%",
                height: 220,
                position: "relative",
                borderRadius: 20,
                background: "rgba(31,41,55,0.7)",
                border: "1px dashed rgba(248,250,252,0.1)",
                overflow: "hidden",
              }}
            >
              {heroPreview ? (
                <img
                  src={heroPreview}
                  alt="hero preview"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                >
                  아직 선택하지 않았어요
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroChange}
              style={{ marginTop: 8 }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "rgb(59,130,246)",
              color: "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
