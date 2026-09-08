import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyCards } from "../../account/cardAPI";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

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

  const [showAddCard, setShowAddCard] = useState(false);
  const [addForm, setAddForm] = useState({
    cardName: "",
    cardType: "CHECK",
    creditLimit: 3000000,
    institutionId: 1,
  });
  const [addMsg, setAddMsg] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
  if (!userId) { setLoading(false); return; }
  getMyCards(userId)
    .then((data) => {
      const active = data.filter(c => c.status !== "CANCELLED");
      setCards(active);
      if (active.length > 0) setSelectedId(active[0].id);
    })
    .catch(() => setError("카드 목록을 불러오지 못했습니다."))
    .finally(() => setLoading(false));
}, [userId]);

  const selected = cards.find((c) => c.id === selectedId);

  async function handleAddCard(e) {
    e.preventDefault();
    if (!addForm.cardName) return setAddMsg("카드 이름을 입력하세요.");

    setAdding(true);
    try {
      const res = await fetch(`http://localhost:9090/api/cards?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardName: addForm.cardName,
          cardType: addForm.cardType,
          creditLimit: Number(addForm.creditLimit),
          institutionId: addForm.institutionId,
        }),
      });
      if (!res.ok) throw new Error();
      setAddMsg("카드가 추가되었습니다!");
      const updated = await getMyCards(userId);
      setCards(updated);
      setSelectedId(updated[updated.length - 1]?.id ?? null);
      setTimeout(() => {
        setShowAddCard(false);
        setAddMsg("");
        setAddForm({ cardName: "", cardType: "CHECK", creditLimit: 3000000, institutionId: 1 });
      }, 1500);
    } catch {
      setAddMsg("카드 추가에 실패했습니다.");
    } finally {
      setAdding(false);
    }
  }

 async function handleCancelCard() {
  if (!window.confirm("정말 이 카드를 해지하시겠습니까?")) return;
  try {
    const res = await fetch(`http://localhost:9090/api/cards/${selected.id}?userId=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error();
    alert("카드가 해지되었습니다.");
    const updated = await getMyCards(userId);
    const active = updated.filter(c => c.status !== "CANCELLED");
    setCards(active);
    setSelectedId(active.length > 0 ? active[0].id : null);
  } catch {
    alert("해지에 실패했습니다.");
  }
}

  if (loading) return <div className="loading">불러오는 중…</div>;
  if (error) return (
    <>
      <TopBar title="카드 관리" crumb="마이페이지 / 카드 관리" search={false} />
      <Panel><div className="prod-empty">{error}</div></Panel>
    </>
  );

  return (
    <>
      <TopBar title="카드 관리" crumb="마이페이지 / 카드 관리" search={false} />

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>보유 카드 {cards.length}장</div>
        <button
          onClick={() => setShowAddCard(true)}
          style={{ background: "var(--blue)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}
        >
          + 카드 추가
        </button>
      </div>

      {cards.length === 0 ? (
        <Panel><div className="prod-empty">보유한 카드가 없습니다. 카드를 추가해보세요.</div></Panel>
      ) : (
        <>
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
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="minibtn" onClick={() => alert("비밀번호 변경 신청이 접수되었습니다.")}>
                  🔑 비밀번호 변경
                </button>
                <button className="minibtn warn" onClick={() => alert("분실 신고가 접수되었습니다.")}>
                  🚨 분실 신고
                </button>
                <button className="minibtn warn" onClick={handleCancelCard}>
                  카드 해지
                </button>
              </div>
            </Panel>
          )}
        </>
      )}

      {/* 카드 추가 모달 */}
      {showAddCard && (
        <div className="modal-bg" onClick={() => setShowAddCard(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">카드 추가</h3>
            <form onSubmit={handleAddCard}>
              <div className="field">
                <label>카드 이름</label>
                <input
                  value={addForm.cardName}
                  onChange={(e) => setAddForm({ ...addForm, cardName: e.target.value })}
                  placeholder="예: 주거래 체크카드"
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              <div className="field">
                <label>카드 유형</label>
                <select
                  value={addForm.cardType}
                  onChange={(e) => setAddForm({ ...addForm, cardType: e.target.value })}
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                >
                  <option value="CHECK">체크카드</option>
                  <option value="CREDIT">신용카드</option>
                </select>
              </div>
              <div className="field">
                <label>이용 한도 (원)</label>
                <input
                  type="number"
                  value={addForm.creditLimit}
                  onChange={(e) => setAddForm({ ...addForm, creditLimit: e.target.value })}
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              {addMsg && (
                <div style={{ color: addMsg.includes("추가") ? "var(--green)" : "var(--red)", fontSize: 13, marginBottom: 12 }}>
                  {addMsg}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowAddCard(false)} className="minibtn" style={{ flex: 1, padding: "11px 0" }}>취소</button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={adding}>
                  {adding ? "추가 중…" : "추가하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}