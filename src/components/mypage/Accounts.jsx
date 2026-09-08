import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyAccounts, transfer, getMyRecipients } from "../../account/accountAPI";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const BG = [
  "linear-gradient(135deg,#3B5578,#4A6B94)",
  "linear-gradient(135deg,#5B5578,#6E6494)",
  "linear-gradient(135deg,#4A5568,#2D3748)",
];

const isSavings = (acc) => acc.accountName?.includes("적금");
const isEmergency = (acc) => acc.accountName?.includes("비상금");

export default function Accounts() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTransfer, setShowTransfer] = useState(false);
  const [fromAccount, setFromAccount] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState({ receiverAccountNumber: "", amount: "" });
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addForm, setAddForm] = useState({
    accountName: "",
    accountType: "CHECKING",
    dailyTransferLimit: 3000000,
    institutionId: 1,
  });
  const [addMsg, setAddMsg] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
  if (!userId) { setLoading(false); return; }
  getMyAccounts(userId)
    .then((data) => {
      const active = data.filter(a => a.status !== "CLOSED");
      setAccounts(active);
      if (active.length > 0) setSelectedId(active[0].id);
    })
    .catch(() => setError("계좌 목록을 불러오지 못했습니다."))
    .finally(() => setLoading(false));
}, [userId]);

  const selected = accounts.find((a) => a.id === selectedId);
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  function openTransfer(acc) {
    if (isSavings(acc)) { alert("적금 계좌는 송금이 불가능합니다."); return; }
    if (isEmergency(acc) && emergencyCount >= 2) { alert("비상금 통장은 비상 출금 2회까지만 가능합니다."); return; }
    setFromAccount(acc);
    setForm({ receiverAccountNumber: "", amount: "" });
    setMsg("");
    setShowTransfer(true);
    getMyRecipients(userId).then(setRecipients).catch(() => setRecipients([]));
  }

  function pickRecipient(r) {
    setForm({ ...form, receiverAccountNumber: r.accountNumber.replace(/\*/g, "") });
  }

  async function handleTransfer(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.receiverAccountNumber) return setMsg("받는 계좌번호를 입력하세요.");
    if (!amt || amt <= 0) return setMsg("금액을 입력하세요.");
    if (amt > Number(fromAccount.balance)) return setMsg("잔액이 부족합니다.");

    const known = recipients.some((r) => r.accountNumber.replace(/\*/g, "").endsWith(form.receiverAccountNumber.slice(-4)));
    if (!known) {
      if (!window.confirm("처음 보내는 계좌입니다. 정말 보내시겠습니까?")) return;
    }

    setSending(true);
    try {
      await transfer(userId, form.receiverAccountNumber, amt);
      setMsg("송금이 완료되었습니다.");
      if (isEmergency(fromAccount)) setEmergencyCount((c) => c + 1);
      getMyAccounts(userId).then(setAccounts).catch(() => {});
      setTimeout(() => { setShowTransfer(false); setMsg(""); }, 1500);
    } catch {
      setMsg("송금에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  async function handleAddAccount(e) {
    e.preventDefault();
    if (!addForm.accountName) return setAddMsg("계좌 별칭을 입력하세요.");

    setAdding(true);
    try {
      const res = await fetch(`http://localhost:9090/api/accounts?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: addForm.accountName,
          accountType: addForm.accountType,
          dailyTransferLimit: Number(addForm.dailyTransferLimit),
          institutionId: addForm.institutionId,
        }),
      });
      if (!res.ok) throw new Error();
      setAddMsg("계좌가 추가되었습니다!");
      getMyAccounts(userId).then(setAccounts).catch(() => {});
      setTimeout(() => {
        setShowAddAccount(false);
        setAddMsg("");
        setAddForm({ accountName: "", accountType: "CHECKING", dailyTransferLimit: 3000000, institutionId: 1 });
      }, 1500);
    } catch {
      setAddMsg("계좌 추가에 실패했습니다.");
    } finally {
      setAdding(false);
    }
  }

  async function handleCloseAccount() {
  if (!window.confirm("정말 이 계좌를 해지하시겠습니까?")) return;
  try {
    const res = await fetch(`http://localhost:9090/api/accounts/${selected.id}?userId=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error();
    alert("계좌가 해지되었습니다.");
    const updated = await getMyAccounts(userId);
    const active = updated.filter(a => a.status !== "CLOSED");
    setAccounts(active);
    setSelectedId(active.length > 0 ? active[0].id : null);
  } catch {
    alert("해지에 실패했습니다. 잔액이 남아있으면 해지할 수 없습니다.");
  }
}

  if (loading) return <div className="loading">불러오는 중…</div>;
  if (error) return (
    <>
      <TopBar title="계좌 관리" crumb="마이페이지 / 계좌 관리" search={false} />
      <Panel><div className="prod-empty">{error}</div></Panel>
    </>
  );

  return (
    <>
      <TopBar title="계좌 관리" crumb="마이페이지 / 계좌 관리" search={false} />

      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>내 총 자산</div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>₩ {totalBalance.toLocaleString()}</div>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          style={{ background: "var(--blue)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}
        >
          + 계좌 추가
        </button>
      </div>

      {accounts.length === 0 ? (
        <Panel><div className="prod-empty">보유한 계좌가 없습니다. 계좌를 추가해보세요.</div></Panel>
      ) : (
        <>
          <div className="acc-grid">
            {accounts.map((acc, i) => {
              const isSel = acc.id === selectedId;
              const savings = isSavings(acc);
              return (
                <div
                  key={acc.id}
                  className="acc-card"
                  onClick={() => setSelectedId(acc.id)}
                  style={{ background: BG[i % BG.length], boxShadow: isSel ? "0 0 0 3px var(--blue)" : "none" }}
                >
                  <div className="acc-name">{acc.accountName} <span>({acc.accountNumber})</span></div>
                  <div className="acc-balance">₩ {Number(acc.balance).toLocaleString()}</div>
                  <div className="acc-foot">
                    <span>{acc.status === "ACTIVE" ? "정상" : acc.status}</span>
                    {!savings ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); openTransfer(acc); }}
                        style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 8, cursor: "pointer" }}
                      >↗ 송금</button>
                    ) : (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>입금 전용</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <Panel title={selected.accountName} sub={`계좌번호 ${selected.accountNumber}`} style={{ marginTop: 20 }}>
              <div className="acc-detail">
                <div className="acc-detail-item">
                  <div className="acc-detail-label">잔액</div>
                  <div className="acc-detail-value">₩ {Number(selected.balance).toLocaleString()}</div>
                </div>
                <div className="acc-detail-item">
                  <div className="acc-detail-label">1일 이체한도</div>
                  <div className="acc-detail-value">
                    {isSavings(selected) ? "—" : `₩ ${Number(selected.dailyTransferLimit).toLocaleString()}`}
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
                <button className="minibtn warn" onClick={handleCloseAccount}>
                  계좌 해지
                </button>
              </div>
            </Panel>
          )}
        </>
      )}

      {/* 계좌 추가 모달 */}
      {showAddAccount && (
        <div className="modal-bg" onClick={() => setShowAddAccount(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">계좌 추가</h3>
            <form onSubmit={handleAddAccount}>
              <div className="field">
                <label>계좌 별칭</label>
                <input
                  value={addForm.accountName}
                  onChange={(e) => setAddForm({ ...addForm, accountName: e.target.value })}
                  placeholder="예: 주거래 통장"
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              <div className="field">
                <label>계좌 유형</label>
                <select
                  value={addForm.accountType}
                  onChange={(e) => setAddForm({ ...addForm, accountType: e.target.value })}
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                >
                  <option value="CHECKING">입출금</option>
                  <option value="SAVINGS">적금</option>
                </select>
              </div>
              <div className="field">
                <label>1일 이체한도 (원)</label>
                <input
                  type="number"
                  value={addForm.dailyTransferLimit}
                  onChange={(e) => setAddForm({ ...addForm, dailyTransferLimit: e.target.value })}
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              {addMsg && (
                <div style={{ color: addMsg.includes("추가") ? "var(--green)" : "var(--red)", fontSize: 13, marginBottom: 12 }}>
                  {addMsg}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowAddAccount(false)} className="minibtn" style={{ flex: 1, padding: "11px 0" }}>취소</button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={adding}>
                  {adding ? "추가 중…" : "추가하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 송금 모달 */}
      {showTransfer && fromAccount && (
        <div className="modal-bg" onClick={() => setShowTransfer(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">송금하기</h3>
            <div className="modal-from">
              {fromAccount.accountName} · 잔액 ₩ {Number(fromAccount.balance).toLocaleString()}
            </div>
            {recipients.length > 0 && (
              <div className="recip-list">
                <div className="recip-label">최근 보낸 계좌</div>
                <div className="recip-row">
                  {recipients.map((r) => (
                    <button key={r.id} className="recip-chip" onClick={() => pickRecipient(r)}>
                      {r.recipientName} <span>{r.accountNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleTransfer}>
              <div className="field">
                <label>받는 계좌번호</label>
                <input
                  value={form.receiverAccountNumber}
                  onChange={(e) => setForm({ ...form, receiverAccountNumber: e.target.value })}
                  placeholder="숫자만 입력"
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              <div className="field">
                <label>금액 (원)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, background: "var(--panel)", color: "var(--ink)" }}
                />
              </div>
              {msg && <div style={{ color: msg.includes("완료") ? "var(--green)" : "var(--red)", fontSize: 13, marginBottom: 12 }}>{msg}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowTransfer(false)} className="minibtn" style={{ flex: 1, padding: "11px 0" }}>취소</button>
                <button type="submit" className="primary" style={{ flex: 1 }} disabled={sending}>
                  {sending ? "송금 중…" : "송금"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}