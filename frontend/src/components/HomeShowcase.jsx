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

export default function HomeShowcase({ profile, outfits = [], outfitsLoading = false }) {
  const heroUrl = profile?.heroUrl;
  const boardText = profile?.bio?.trim();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const recentOutfits = outfits.filter((outfit) => {
    if (!outfit?.createdAt) return true;
    const date = new Date(outfit.createdAt);
    return date >= weekAgo;
  });

  const moodCounts = recentOutfits.reduce(
    (acc, outfit) => {
      const mood = (outfit?.mood || "minimal").toLowerCase();
      if (mood === "minimal") acc.minimal += 1;
      else if (mood === "street") acc.street += 1;
      else if (mood === "casual") acc.casual += 1;
      return acc;
    },
    { minimal: 0, street: 0, casual: 0 }
  );
  const totalMood = moodCounts.minimal + moodCounts.street + moodCounts.casual;
  const moodRatios = {
    minimal: totalMood ? moodCounts.minimal / totalMood : 0,
    street: totalMood ? moodCounts.street / totalMood : 0,
    casual: totalMood ? moodCounts.casual / totalMood : 0,
  };

  const moodLabels = {
    minimal: "Minimal",
    street: "Street",
    casual: "Casual",
  };

  const topMoodKey = Object.entries(moodRatios).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topMoodLabel = topMoodKey ? moodLabels[topMoodKey] : "Minimal";

  let avgContrast = 0;
  let avgChroma = 0;
  if (recentOutfits.length > 0) {
    let contrastSum = 0;
    let chromaSum = 0;
    recentOutfits.forEach((outfit) => {
      const colors = [outfit.topColor, outfit.bottomColor, outfit.shoesColor].filter(Boolean);
      if (!colors.length) return;
      const hslValues = colors.map((hex) => rgbToHsl(hexToRgb(hex)));
      const values = hslValues.map((c) => c.l);
      const chromas = hslValues.map((c) => c.s);
      contrastSum += Math.max(...values) - Math.min(...values);
      chromaSum += chromas.reduce((a, b) => a + b, 0) / chromas.length;
    });
    avgContrast = contrastSum / recentOutfits.length;
    avgChroma = chromaSum / recentOutfits.length;
  }

  const contrastLabel =
    avgContrast >= 0.35 ? "명도 대비가 강한 편" : avgContrast <= 0.18 ? "명도 대비가 부드러운 편" : "명도 균형이 안정적인 편";
  const chromaLabel =
    avgChroma >= 0.45 ? "채도가 비교적 높음" : avgChroma <= 0.2 ? "채도가 낮아 차분함" : "채도 균형이 무난함";

  const aiSummary =
    totalMood > 0
      ? `이번 주는 ${topMoodLabel} 비중이 높고, ${contrastLabel}으로 보여요.`
      : "이번 주 데이터가 아직 많지 않아요. 코디를 저장하면 스타일 성향을 분석해 줄게요.";

  let aiRecommendation = "다음 코디는 상의와 하의 중 한쪽의 명도를 살짝 조절해 균형을 맞춰보세요.";
  if (avgContrast >= 0.35) {
    aiRecommendation = "다음 코디는 하의 명도를 살짝 올리면 더 안정감 있는 룩이 됩니다.";
  } else if (avgContrast <= 0.18) {
    aiRecommendation = "다음 코디에 포인트 컬러 하나만 넣어 대비를 살려보세요.";
  } else if (avgChroma >= 0.45) {
    aiRecommendation = "신발이나 액세서리를 중립색으로 두면 채도가 정리됩니다.";
  } else if (avgChroma <= 0.2) {
    aiRecommendation = "채도가 조금 더 높은 포인트 컬러를 추가하면 생기가 생겨요.";
  }

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

          <div
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 18,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(59,130,246,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5f5" }}>
              이번 주 무드 통계 · AI 요약
            </div>
            {outfitsLoading ? (
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>분석 중...</p>
            ) : totalMood > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["minimal", "street", "casual"].map((key) => {
                  const ratio = moodRatios[key];
                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "#cbd5f5",
                          marginBottom: 6,
                        }}
                      >
                        <span>{moodLabels[key]}</span>
                        <span>{Math.round(ratio * 100)}%</span>
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
                            width: `${Math.round(ratio * 100)}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #38bdf8, #22c55e)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                이번 주 저장된 코디가 없어요. 저장을 시작하면 통계를 보여줄게요.
              </p>
            )}

            <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.6 }}>
              <strong>AI 요약:</strong> {aiSummary}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
              <strong>추천:</strong> {aiRecommendation}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
