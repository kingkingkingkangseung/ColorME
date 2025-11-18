import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function AiConsult() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef(null); // ✅ 스크롤용 ref

  // 처음 로드 시 localStorage에서 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('colorme_ai_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load AI history:', e);
    }
  }, []);

  // 히스토리 변경될 때마다 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem('colorme_ai_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save AI history:', e);
    }
  }, [history]);

  // ✅ 새 턴 추가될 때마다 맨 아래로 스크롤
  useEffect(() => {
    if (!historyRef.current) return;
    historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:4000/ask-ai', {
        question: trimmed,
      });
      const answer = res.data.answer || '응답이 비어 있습니다.';

      const newTurn = {
        id: Date.now(),
        question: trimmed,
        answer,
        createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [...prev, newTurn]);
      setQuestion('');
    } catch (err) {
      console.error(err);
      const newTurn = {
        id: Date.now(),
        question: trimmed,
        answer: '에러가 발생했습니다. 나중에 다시 시도해 주세요.',
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [...prev, newTurn]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!loading) handleAsk();
    }
  };

  const handleClear = () => {
    if (window.confirm('AI 대화 기록을 모두 삭제할까요?')) {
      setHistory([]);
    }
  };

  return (
    <section className="panel">
      <h2>AI 코디 컨설턴트</h2>
      <p className="desc">
        가지고 있는 옷 / 가고 싶은 자리 / 원하는 무드를 적으면,
        AI가 색조합 중심으로 코디를 여러 번 조언해줍니다.
      </p>

      {/* ✅ 전체 패널을 위(히스토리) / 아래(입력창) 구조로 */}
      <div className="ai-panel">
        {/* 채팅 히스토리 (위쪽, 스크롤 영역) */}
        <div className="chat-history" ref={historyRef}>
          {history.length === 0 ? (
            <p className="empty-hint">
              아직 대화 기록이 없습니다. 아래에서 질문을 입력하고
              &quot;질문 보내기&quot;를 눌러보세요.
            </p>
          ) : (
            history.map((turn) => (
              <div key={turn.id} className="chat-turn">
                <div className="chat-bubble user">
                  <span className="chat-label">YOU</span>
                  <p>{turn.question}</p>
                </div>
                <div className="chat-bubble ai">
                  <span className="chat-label">AI</span>
                  <p>{turn.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력 영역 (아래쪽 고정) */}
        <div className="chat-input-area">
          <textarea
            className="question-input"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예) 베이지 상의에 어울리는 하의를 추천해줘. 내일 학교 갈 때 입을 거야."
          />

          <div className="chat-buttons">
            <button
              className="primary-btn"
              onClick={handleAsk}
              disabled={loading}
            >
              {loading ? '생각 중...' : '질문 보내기'}
            </button>
            {history.length > 0 && (
              <button className="secondary-btn" onClick={handleClear}>
                기록 삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AiConsult;