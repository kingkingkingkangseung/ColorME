import {
  summaryText,
  basics,
  basicTips,
  harmonyCards,
  moodGuides,
  scenarioCards,
  usageSteps,
} from '../data/colorGuide';

function SectionCard({ children }) {
  return (
    <section
      style={{
        borderRadius: 24,
        padding: 24,
        background: 'rgba(15,23,42,0.9)',
        border: '1px solid rgba(51,65,85,0.8)',
        maxWidth: 1080,
        margin: '0 auto 24px',
      }}
    >
      {children}
    </section>
  );
}

export default function ColorGuide({ onSelectHarmony }) {
  return (
    <div style={{ paddingBottom: 32 }}>
      <SectionCard>
        <h2 style={{ marginTop: 0 }}>{summaryText.title}</h2>
        <p style={{ color: 'rgb(148,163,184)', marginBottom: 0 }}>{summaryText.body}</p>
      </SectionCard>

      <SectionCard>
        <h3 style={{ marginTop: 0 }}>기본 개념 3줄 요약</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: 16,
          }}
        >
          {basics.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: 18,
                padding: 18,
                background: 'rgba(2,6,23,0.7)',
                border: '1px solid rgba(51,65,85,0.6)',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e5e7eb' }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{item.subtitle}</div>
              <p style={{ fontSize: 13, color: '#cbd5f5', margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
        <ul style={{ marginTop: 16, color: '#94a3b8', fontSize: 13 }}>
          {basicTips.map((tip, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              {tip}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard>
        <h3 style={{ marginTop: 0 }}>컬러 하모니 유형별 가이드</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 16,
          }}
        >
          {harmonyCards.map((card) => (
            <div
              key={card.type}
              style={{
                borderRadius: 20,
                padding: 18,
                background: 'rgba(2,6,23,0.7)',
                border: '1px solid rgba(59,130,246,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>
                {card.type} <span style={{ color: '#94a3b8', fontSize: 12 }}>({card.titleKo})</span>
              </div>
              <p style={{ fontSize: 13, color: '#cbd5f5', margin: 0 }}>{card.description}</p>
              <p style={{ fontSize: 13, color: '#fcd34d', margin: '4px 0' }}>{card.tip}</p>
              <p style={{ fontSize: 12, color: '#a5b4fc', margin: '4px 0' }}>
                무드: {card.exampleMood}
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>추천 조합: {card.example}</p>
              <button
                onClick={() => onSelectHarmony && onSelectHarmony(card.presetKey)}
                style={{
                  marginTop: 'auto',
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(59,130,246,0.5)',
                  background: onSelectHarmony ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color: '#93c5fd',
                  fontSize: 12,
                  cursor: onSelectHarmony ? 'pointer' : 'default',
                }}
              >
                ColorME에서 보기
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <h3 style={{ marginTop: 0 }}>무드별 추천 팔레트</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 16,
          }}
        >
          {moodGuides.map((guide) => (
            <div
              key={guide.mood}
              style={{
                borderRadius: 18,
                padding: 18,
                background: 'rgba(2,6,23,0.7)',
                border: '1px solid rgba(51,65,85,0.6)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>{guide.mood}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{guide.keywords}</div>
              <p style={{ fontSize: 13, color: '#cbd5f5', margin: 0 }}>추천 색: {guide.colors.join(', ')}</p>
              <ul style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                {guide.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <h3 style={{ marginTop: 0 }}>실전 예시 코디 시나리오</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 16,
          }}
        >
          {scenarioCards.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: 18,
                padding: 18,
                background: 'rgba(2,6,23,0.7)',
                border: '1px solid rgba(51,65,85,0.6)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>{card.title}</div>
              <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
                {card.palette.map((color) => (
                  <span
                    key={color}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: '1px solid rgba(15,23,42,0.8)',
                      background: color,
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#cbd5f5', margin: 0 }}>{card.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <h3 style={{ marginTop: 0 }}>ColorME 사용법</h3>
        <ol style={{ color: '#e5e7eb', fontSize: 13, paddingLeft: 18 }}>
          {usageSteps.map((step, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              {step}
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
