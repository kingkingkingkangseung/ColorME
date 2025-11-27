export default function HomeShowcase({ profile }) {
  const heroUrl = profile?.heroUrl;
  const boardText = profile?.bio?.trim();

  return (
    <section
      style={{
        borderRadius: 28,
        padding: 24,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.8)",
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            borderRadius: 24,
            background: "radial-gradient(circle at top, #0f172a, #020617)",
            border: "1px solid rgba(59,130,246,0.2)",
            minHeight: 360,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {heroUrl ? (
            <img
              src={heroUrl}
              alt="my style"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 14,
                padding: 24,
              }}
            >
              아직 메인 사진이 없어요. 프로필 수정에서 내가 고른 패션 사진을
              올려주세요.
            </div>
          )}
        </div>

        <div
          style={{
            borderRadius: 24,
            background: "rgba(2,6,23,0.6)",
            border: "1px dashed rgba(148,163,184,0.3)",
            minHeight: 360,
            color: "#e5e7eb",
            fontSize: 14,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#cbd5f5" }}>
            프리보드
          </div>
          {boardText ? (
            <p
              style={{
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {boardText}
            </p>
          ) : (
            <p
              style={{
                color: "#94a3b8",
                margin: 0,
              }}
            >
              아직 한 줄 소개를 작성하지 않았어요. 프로필 수정에서 오늘의 코디
              노트를 남겨 보세요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
