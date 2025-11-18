import { useEffect, useState } from 'react';
import axios from 'axios';

function Shops() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await axios.get('http://localhost:4000/shops');
        setShops(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchShops();
  }, []);

  return (
    <section className="panel">
      <h2>패션 쇼핑몰 큐레이션</h2>
      <p className="desc">
        주요 온라인 패션 쇼핑몰들을 한 곳에 모아두었습니다. 새 창에서 열려서
        ColorME 화면은 그대로 유지됩니다.
      </p>

      <ul className="shop-list">
        {shops.map((shop) => (
          <li key={shop.name} className="shop-item">
            <a href={shop.url} target="_blank" rel="noreferrer">
              {shop.name}
            </a>
            {shop.category && <span className="shop-category">{shop.category}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Shops;
