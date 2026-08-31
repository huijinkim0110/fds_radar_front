import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyAccounts } from "../../account/accountAPI";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

// 계좌 유형별 카드 배경색
const BG = [
  "linear-gradient(135deg,#1E40AF,#3B82F6)",
  "linear-gradient(135deg,#6D28D9,#4C1D95)",
  "linear-gradient(135deg,#334155,#0F172A)",
];

export default function Accounts() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getMyAccounts(userId)
      .then((data) => {
        setAccounts(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => setError("계좌 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [userId]);

  const selected = accounts.find((a) => a.id === selectedId);

  // 총 자산
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  if (loading) return <div className="loading">불러오는 중…</div>;
  if (error) return (
    <>
      <TopBar title="계좌 관리" crumb="마이페이지 / 계좌 관리" search={false} />
      <Panel><div className="prod-empty">{error}</div></Panel>
    </>
  );
  if (accounts.length === 0) return (
    <>
      <TopBar title="계좌 관리" crumb="마이페이지 / 계좌 관리" search={false} />
      <Panel><div className="prod-empty">보유한 계좌가 없습니다.</div></Panel>
    </>
  );

  return (
    <>
      <TopBar title="계좌 관리" crumb="마이페이지 / 계좌 관리" search={false} />

      {/* 총 자산 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>내 총 자산</div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>₩ {totalBalance.toLocaleString()}</div>
      </div>

      {/* 계좌 카드 목록 */}
      <div className="acc-grid">
        {accounts.map((acc, i) => {
          const isSel = acc.id === selectedId;
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
                <span>{isSel ? "조회 중 ▼" : "선택"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택 계좌 상세 */}
      {selected && (
        <Panel title={selected.accountName} sub={`계좌번호 ${selected.accountNumber}`} style={{ marginTop: 20 }}>
          <div className="acc-detail">
            <div className="acc-detail-item">
              <div className="acc-detail-label">잔액</div>
              <div className="acc-detail-value">₩ {Number(selected.balance).toLocaleString()}</div>
            </div>
            <div className="acc-detail-item">
              <div className="acc-detail-label">1일 이체한도</div>
              <div className="acc-detail-value">₩ {Number(selected.dailyTransferLimit).toLocaleString()}</div>
            </div>
            <div className="acc-detail-item">
              <div className="acc-detail-label">상태</div>
              <div className="acc-detail-value" style={{ color: "var(--green)" }}>
                {selected.status === "ACTIVE" ? "정상 사용중" : selected.status}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}