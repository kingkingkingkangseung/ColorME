const STORES = [
  {
    name: "무신사",
    desc: "국내 최대 스트릿/캐주얼 플랫폼. 신상과 세일 정보를 한 곳에서 확인해 보세요.",
    url: "https://www.musinsa.com",
  },
  {
    name: "크림",
    desc: "한정판 스니커즈, 럭셔리 아이템을 리셀로 거래할 수 있는 플랫폼.",
    url: "https://kream.co.kr",
  },
  {
    name: "후르츠 패밀리",
    desc: "개성 있는 디자이너 브랜드를 선별해 소개하는 편집숍.",
    url: "https://fruitsfamily.com",
  },
];

export default function ShopLinks() {
  return (
    <section
      style={{
        borderRadius: 24,
        padding: 24,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(51,65,85,0.8)",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginTop: 0 }}>패션 쇼핑몰 큐레이션</h2>
      <p style={{ color: "rgb(148,163,184)", marginBottom: 20 }}>
        주요 온라인 패션 쇼핑몰들을 선별해서 모아두었습니다. 링크를 누르면 새
        창에서 열려 ColorME 화면은 그대로 유지됩니다.
      </p>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        {STORES.map((store) => (
          <div
            key={store.name}
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(2,6,23,0.65)",
              border: "1px solid rgba(51,65,85,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e7eb" }}>
              {store.name}
            </div>
            <p style={{ fontSize: 13, color: "rgb(148,163,184)", flex: 1, margin: 0 }}>
              {store.desc}
            </p>
            <a
              href={store.url}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: "auto",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgb(59,130,246)",
                color: "#0b1120",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              사이트 열기
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
