import { useId, useState } from 'react';
import { searchCities, type City } from '../lib/cities';

export function CitySearch({ value, onChange }: { value: City | null; onChange: (c: City) => void }) {
  const [q, setQ] = useState('');
  const listId = useId();
  const results = searchCities(q);
  return (
    <div className="city-search">
      <input
        type="search" placeholder="도시 이름 (예: 서울, Tokyo)" value={q}
        onChange={(e) => setQ(e.target.value)} aria-label="출생 도시 검색" aria-controls={listId}
      />
      {value && !q && <p className="picked" aria-live="polite">{value.ko} · {value.en}</p>}
      {results.length > 0 && (
        <ul id={listId}>
          {results.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => { onChange(c); setQ(''); }}>
                {c.ko} <span className="muted">{c.en}, {c.cc}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
