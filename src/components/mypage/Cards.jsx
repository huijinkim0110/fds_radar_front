import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyCards } from "../../account/cardAPI";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

// 카드 유형별 배경/라벨
const CARD_TYPE = {
  CHECK: { label: "체크카드", bg: "linear-gradient(135deg,#1E40AF,#3B82F6)" },
  CREDIT: { label: "신용카드", bg: "linear-gradient(135deg,#6D28D9,#4C1D95)" },
  DEBIT: { label: "직불카드", bg: "linear-gradient(135deg,#334155,#0F172A)" },
};

export default function Cards() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [cards, setCards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getMyCards(userId)
      .then((data) => {
        setCards(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => setError("카드 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [userId]);

  const selected = cards.find((c) => c.id === selectedId);

  if (loading) return <div className="loading">불러오는 중…</div>;
  if (error) return (
    <>
      <TopBar title="카드 관리" crumb="마이페이지 / 카드 관리" search={false} />
      <Panel><div className="prod-empty">{error}</div></Panel>
    </>
  );
  if (cards.length === 0) return (
    <>
      <TopBar title="카드 관리" crumb="마이페이지 / 카드 관리" search={false} />
      <Panel><div className="prod-empty">보유한 카드가 없습니다.</div></Panel>
    </>
  );

  return (
    <>
      <TopBar title="카드 관리" crumb="마이페이지 / 카드 관리" search={false} />

      {/* 카드 목록 */}
      <div style={{ marginBottom: 20, fontSize: 14, color: "var(--muted)" }}>보유 카드 {cards.length}장</div>
      <div className="acc-grid">
        {cards.map((card) => {
          const t = CARD_TYPE[card.cardType] || CARD_TYPE.CHECK;
          const isSel = card.id === selectedId;
          return (
            <div
              key={card.id}
              className="acc-card"
              onClick={() => setSelectedId(card.id)}
              style={{ background: t.bg, boxShadow: isSel ? "0 0 0 3px var(--blue)" : "none" }}
            >
              <div className="acc-foot" style={{ marginBottom: 18 }}>
                <span>{card.cardName}</span>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>
                  {card.status === "ACTIVE" ? "정상" : card.status}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 18 }}>
                {card.cardNumber}
              </div>
              <div className="acc-foot">
                <span>{t.label}</span>
                <span>{isSel ? "관리 중" : "선택"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택 카드 상세 */}
      {selected && (
        <Panel title={`${selected.cardName} 상세`} sub={`카드번호 ${selected.cardNumber}`} style={{ marginTop: 20 }}>
          <div className="acc-detail">
            <div className="acc-detail-item">
              <div className="acc-detail-label">카드 유형</div>
              <div className="acc-detail-value">{CARD_TYPE[selected.cardType]?.label || selected.cardType}</div>
            </div>
            <div className="acc-detail-item">
              <div className="acc-detail-label">이용 한도</div>
              <div className="acc-detail-value">₩ {Number(selected.creditLimit).toLocaleString()}</div>
            </div>
            <div className="acc-detail-item">
              <div className="acc-detail-label">사용 가능 한도</div>
              <div className="acc-detail-value" style={{ color: "var(--blue)" }}>
                ₩ {Number(selected.availableLimit).toLocaleString()}
              </div>
            </div>
            <div className="acc-detail-item">
              <div className="acc-detail-label">상태</div>
              <div className="acc-detail-value" style={{ color: "var(--green)" }}>
                {selected.status === "ACTIVE" ? "정상 사용중" : selected.status}
              </div>
            </div>
          </div>

          {/* 카드 액션 (기능은 나중에) */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="minibtn" onClick={() => alert("비밀번호 변경 신청이 접수되었습니다.")}>
              🔑 비밀번호 변경
            </button>
            <button className="minibtn warn" onClick={() => alert("분실 신고가 접수되었습니다.")}>
              🚨 분실 신고
            </button>
          </div>
        </Panel>
      )}
    </>
  );
}