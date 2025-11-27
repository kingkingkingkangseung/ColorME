// src/components/ProfileBar.jsx
import React from "react";

export default function ProfileBar({
  user,
  loading,
  onLogout,
  onEditProfile,
  profile,
}) {
  if (!user) return null;

  const displayName =
    profile?.displayName ||
    user.name ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";
  const avatarUrl = profile?.avatarUrl;

  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 999,
        padding: "10px 18px",
        background: "rgba(15,23,42,1)",
        border: "1px solid rgba(31,41,55,1)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* 왼쪽: 아바타 + 이름/이메일 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          />
        ) : (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "999px",
              background: "radial-gradient(circle at top, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#0b1120",
            }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {displayName}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "rgb(148,163,184)",
            }}
          >
            {user.email}
          </span>
        </div>
      </div>

      {/* 가운데: 한 줄 설명/상태 텍스트 (flex:1 라서 중간에 위치) */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 13,
          color: "rgb(148,163,184)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {loading
          ? "프로필 정보를 불러오는 중..."
          : "오늘의 룩 저장하고, 나만의 팔레트 만들어요 ✨"}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onEditProfile}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(59,130,246,0.4)",
            fontSize: 12,
            cursor: "pointer",
            background: "rgba(30,58,138,0.6)",
            color: "#bfdbfe",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          프로필 수정
        </button>
        <button
          onClick={onLogout}
          style={{
            padding: "6px 16px",
            borderRadius: 999,
            border: "none",
            fontSize: 12,
            cursor: "pointer",
            background: "rgba(148,27,61,0.9)",
            color: "#f9fafb",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
