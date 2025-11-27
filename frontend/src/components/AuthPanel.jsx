import { useState } from 'react';
import axios from 'axios';

function AuthPanel({ onAuthSuccess, apiBase = 'http://localhost:4000' }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (mode === 'register') {
      if (!confirmPassword) {
        setMessage('비밀번호 확인을 입력해 주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (password.length < 6) {
        setMessage('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
    }

    const url =
      mode === 'login'
        ? `${apiBase}/auth/login`
        : `${apiBase}/auth/register`;

    try {
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password };
      const res = await axios.post(url, payload);
      const { user, token } = res.data;

      localStorage.setItem('colorme_token', token);
      if (onAuthSuccess) {
        onAuthSuccess(token, user);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || '요청 중 오류가 발생했습니다.';
      setMessage(msg);
    }
  };

  return (
    <section className="panel" style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2>ColorME 로그인</h2>
      <p className="desc">
        계정을 만들고 나만의 코디 조합을 저장해 보세요.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={mode === 'login' ? 'primary-btn' : 'secondary-btn'}
          onClick={() => setMode('login')}
        >
          로그인
        </button>
        <button
          className={mode === 'register' ? 'primary-btn' : 'secondary-btn'}
          onClick={() => setMode('register')}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          이메일
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          비밀번호
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {mode === 'register' && (
          <label className="auth-label">
            비밀번호 확인
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        )}

        {message && <p className="auth-error">{message}</p>}

        <button type="submit" className="primary-btn" style={{ marginTop: 12 }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </button>
        {mode === 'register' && (
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            * 최소 6자리 비밀번호, 동일하게 한 번 더 입력해 주세요.
          </p>
        )}
      </form>
    </section>
  );
}

export default AuthPanel;
