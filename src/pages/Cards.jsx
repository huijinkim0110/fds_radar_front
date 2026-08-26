import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { MOCK } from "../data/mock.js";
import TopBar from "../components/TopBar.jsx";
import Panel from "../components/Panel.jsx";

export default function Cards() {
  const [cards, setCards] = useState([]);
  const spending = MOCK.spending; // 지출 통계도 별도 API로 뺄 수 있음

  useEffect(() => {
    api.getCards().then(setCards);
  }, []);

  return (
    <>
      <TopBar title="카드·계좌" crumb="홈 / 결제수단" search={false} />

      <Panel title="등록된 결제수단" sub={`${cards.length}개`}>
        <div className="cardrow">
          {cards.map((c, i) => (
            <div key={i} className="fincard" style={{ background: c.bg }}>
              <div>
                <div className="fc-t">{c.title}</div>
                <div className="fc-n">{c.num}</div>
              </div>
              <div className="fc-b" style={c.small ? { fontSize: 13, opacity: 0.9 } : {}}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="카테고리별 지출" sub="이번 달">
        <div className="cat">
          {spending.map((s, i) => (
            <div key={i}>
              <div className="h"><span>{s.label}</span><b>{s.amt}</b></div>
              <div className="track"><span style={{ width: `${s.pct}%`, background: s.color }} /></div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
