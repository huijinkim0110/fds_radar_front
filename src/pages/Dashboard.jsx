import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import TopBar from "../components/TopBar.jsx";
import KpiCard from "../components/KpiCard.jsx";
import TxTable from "../components/TxTable.jsx";
import Panel from "../components/Panel.jsx";
import { FeedItem } from "../components/Feed.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [txns, setTxns] = useState([]);
  const [balance, setBalance] = useState(0);

  // 송금 모달 상태
  const [showTransfer, setShowTransfer] = useState(false);
  const [form, setForm] = useState({ recipient: "", amount: "" });
  const [transferMsg, setTransferMsg] = useState("");

  useEffect(() => {
    api.getDashboard().then((d) => {
      setData(d);
      setBalance(d.balance);
    });
    api.getTransactions().then((rows) => setTxns(rows.slice(0, 4)));
  }, []);

  // 송금 처리
  async function handleTransfer(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return setTransferMsg("금액을 입력해주세요.");
    if (amt > balance) return setTransferMsg("잔액이 부족합니다.");

    try {
      await api.transfer({ amount: amt, recipientName: form.recipient });
      setBalance((prev) => prev - amt);  // 화면 잔액 즉시 차감
      setTxns((prev) => [
        {
          time: new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
          name: `이체 · ${form.recipient}`,
          kind: "이체",
          amt: `₩ ${amt.toLocaleString()}`,
          status: "정상",
        },
        ...prev.slice(0, 3),
      ]);
      setTransferMsg("송금이 완료되었습니다.");
      setForm({ recipient: "", amount: "" });
      setTimeout(() => {
        setShowTransfer(false);
        setTransferMsg("");
      }, 1500);
    } catch (err) {
      setTransferMsg("송금에 실패했습니다.");
    }
  }

  if (!data) return <div className="loading">불러오는 중…</div>;

  return (
    <>
      <TopBar title="내 대시보드" crumb="홈 / 내 계좌 요약" />

      <div className="balance">
        <div>
          <div className="lbl">내 계좌 잔액</div>
          <div className="big">₩ {balance.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            <span className="safe"><i />계정 보안 상태 · 안전</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="report-btn"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            onClick={() => setShowTransfer(true)}
          >
            ↗ 송금하기
          </button>
          <button className="report-btn" onClick={() => navigate("/report")}>
            ＋ 이상거래 신고
          </button>
        </div>
      </div>

      {/* 송금 모달 */}
      {showTransfer && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: 16, padding: 32,
            width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }}>
            <h3 style={{ color: "#fff", marginBottom: 20 }}>송금하기</h3>
            <form onSubmit={handleTransfer}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#94a3b8", fontSize: 13 }}>받는 사람</label>
                <input
                  style={{
                    width: "100%", padding: "10px 12px", marginTop: 6,
                    background: "#0f172a", border: "1px solid #334155",
                    borderRadius: 8, color: "#fff", fontSize: 15, boxSizing: "border-box"
                  }}
                  placeholder="이름 또는 계좌번호"
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "#94a3b8", fontSize: 13 }}>금액 (원)</label>
                <input
                  type="number"
                  style={{
                    width: "100%", padding: "10px 12px", marginTop: 6,
                    background: "#0f172a", border: "1px solid #334155",
                    borderRadius: 8, color: "#fff", fontSize: 15, boxSizing: "border-box"
                  }}
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              {transferMsg && (
                <div style={{
                  color: transferMsg.includes("완료") ? "#4ade80" : "#f87171",
                  marginBottom: 12, fontSize: 14
                }}>
                  {transferMsg}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowTransfer(false); setTransferMsg(""); }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 8,
                    background: "#334155", color: "#fff", border: "none", cursor: "pointer"
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 8,
                    background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer"
                  }}
                >
                  송금
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="kpis">
        {data.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div className="cols">
        <Panel title="내 최근 거래" sub="의심 거래는 자동 표시" right={<div className="filterpill">전체</div>}>
          <TxTable rows={txns} />
        </Panel>

        <Panel title="보안 알림" sub="내 계정 관련">
          <div className="feed">
            {data.alerts.map((a, i) => <FeedItem key={i} {...a} />)}
          </div>
        </Panel>
      </div>
    </>
  );
}