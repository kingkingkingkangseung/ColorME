import { useState } from 'react';
import PaletteSimulator from './components/PaletteSimulator.jsx';
import Shops from './components/Shops.jsx';
import AiConsult from './components/AiConsult.jsx';

function App() {
  const [tab, setTab] = useState('simulator'); // simulator | shops | ai

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="logo">ColorME</h1>
        <p className="subtitle">색으로 룩을 결정하는 패션 컬러 시뮬레이터</p>
      </header>

      <nav className="tab-nav">
        <button
          className={tab === 'simulator' ? 'tab active' : 'tab'}
          onClick={() => setTab('simulator')}
        >
          색조합 시뮬레이터
        </button>
        <button
          className={tab === 'shops' ? 'tab active' : 'tab'}
          onClick={() => setTab('shops')}
        >
          쇼핑몰 링크
        </button>
        <button
          className={tab === 'ai' ? 'tab active' : 'tab'}
          onClick={() => setTab('ai')}
        >
          AI 코디 컨설턴트
        </button>
      </nav>

      <main className="app-main">
        <div style={{ display: tab === 'simulator' ? 'block' : 'none' }}>
          <PaletteSimulator />
        </div>

        <div style={{ display: tab === 'shops' ? 'block' : 'none' }}>
          <Shops />
        </div>

        <div style={{ display: tab === 'ai' ? 'block' : 'none' }}>
          <AiConsult />
        </div>
      </main>
    </div>
  );
}

export default App;
