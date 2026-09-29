import { useState, type FormEvent } from 'react';
import { cityById, type City } from '../lib/cities';
import type { BirthInput } from '../lib/store';
import { CitySearch } from './CitySearch';

export function BirthForm({ initial, onSubmit, onClear }: {
  initial: BirthInput | null; onSubmit: (v: BirthInput) => void; onClear: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [time, setTime] = useState(initial?.time ?? '12:00');
  const [unknown, setUnknown] = useState(initial ? initial.time === null : false);
  const [city, setCity] = useState<City | null>(initial ? cityById(initial.cityId) : null);
  const ready = !!date && !!city && (unknown || !!time);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || !city) return;
    onSubmit({ name: name.trim(), date, time: unknown ? null : time, cityId: city.id });
  }
  function clear() {
    setName(''); setDate(''); setTime('12:00'); setUnknown(false); setCity(null);
    onClear();
  }

  return (
    <form className="birth-form" onSubmit={submit}>
      <label>이름 (카드에 표시, 비워도 돼요)<input value={name} maxLength={12} onChange={(e) => setName(e.target.value)} /></label>
      <label>생년월일<input type="date" required value={date} min="1900-01-01" max="2100-12-31" onChange={(e) => setDate(e.target.value)} /></label>
      <label>태어난 시각<input type="time" value={time} disabled={unknown} onChange={(e) => setTime(e.target.value)} /></label>
      <label className="check"><input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />시각을 몰라요</label>
      <div className="field"><span>출생 도시</span><CitySearch value={city} onChange={setCity} /></div>
      <div className="actions">
        <button type="submit" disabled={!ready}>카드 만들기</button>
        <button type="button" className="ghost" onClick={clear}>입력 지우기</button>
      </div>
      <p className="note">입력한 정보는 이 브라우저에만 저장되고 어디로도 보내지 않아요. 카드에는 생년월일·시각·도시가 들어가지 않아요.</p>
    </form>
  );
}
