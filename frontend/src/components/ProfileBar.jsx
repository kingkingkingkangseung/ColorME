// src/components/ProfileBar.jsx
import React from "react";

export default function ProfileBar({ user, profile, onLogout, onEditProfile }) {
  if (!user) return null;

  const email = user.email || "";
  const baseName = email.split("@")[0];
  const displayName = profile?.displayName?.trim() || baseName;
  const avatarLetter = displayName[0]?.toUpperCase() || baseName[0]?.toUpperCase() || "U";
  const avatarUrl = profile?.avatarUrl;

  return (
    <div
      className="profile-bar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        borderRadius: "999px",
        background: "rgba(15,23,42,0.8)",
        border: "1px solid rgba(148,163,184,0.6)",
      }}
    >
      {/* 동그란 프로필 아바타 */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
      ) : (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 0% 0%, #22c55e, #0f172a 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "white",
            fontSize: 16,
          }}
        >
          {avatarLetter}
        </div>
      )}

      {/* 유저 정보 */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgb(248,250,252)",
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "rgb(148,163,184)",
          }}
        >
          {email}
        </span>
      </div>

      {/* 가운데 한 줄 구분선 + 설명 */}
      <div
        style={{
          width: 1,
          alignSelf: "stretch",
          background: "rgba(51,65,85,0.8)",
          margin: "0 8px",
        }}
      />

      <span
        style={{
          fontSize: 12,
          color: "rgb(148,163,184)",
        }}
      >
        오늘의 룩 저장하고, 나만의 팔레트 만드세요 ✨
      </span>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(99,102,241,0.6)",
              background: "rgba(67,56,202,0.2)",
              color: "#c7d2fe",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            프로필 수정
          </button>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            border: "none",
            background: "rgba(239,68,68,0.15)",
            color: "rgb(248,250,252)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
