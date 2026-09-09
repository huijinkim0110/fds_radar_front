import { useEffect, useState } from "react";
import { getPortfolio, cancelSubscription } from "../../api/financialProduct/simulatedSubscriptionAPI";
import { useAuth } from "../../context/AuthContext.jsx";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

function SimulatedSubscriptionList() {
  const { user } = useAuth();
  const userId = user?.userId ?? 1;

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  function loadPortfolio() {
    setLoading(true);
    setError(null);
    getPortfolio(userId)
      .then((data) => setSubscriptions(data))
      .catch(() => setError("가입 내역을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  function handleCancel(id) {
    if (!window.confirm("이 상품의 모의가입을 해지하시겠습니까?")) return;
    setCancellingId(id);
    cancelSubscription(id)
      .then(() => {
        setSubscriptions((prev) => prev.filter((s) => s.simulatedSubscriptionId !== id));
      })
      .catch(() => alert("해지에 실패했습니다."))
      .finally(() => setCancellingId(null));
  }

  if (loading) return <div className="loading">불러오는 중…</div>;
  if (error) return (
    <>
      <TopBar title="모의가입 포트폴리오" crumb="마이페이지 / 포트폴리오" search={false} />
      <Panel><div className="prod-empty">{error}</div></Panel>
    </>
  );

  const totalMaturity = subscriptions.reduce((sum, s) => sum + (s.expectedMaturityAmount ?? 0), 0);
  const totalPaid = subscriptions.reduce((sum, s) => sum + (s.paidAmount ?? 0), 0);

  return (
    <>
      <TopBar title="모의가입 포트폴리오" crumb="마이페이지 / 포트폴리오" search={false} />

      {subscriptions.length === 0 ? (
        <Panel>
          <div className="prod-empty">
            <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
            모의가입한 상품이 없습니다.
          </div>
        </Panel>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "stretch" }}>
          {/* 왼쪽: 요약 (높이는 stretch로 오른쪽 따라감) */}
          <Panel title="포트폴리오 요약" sub="전체 합계">
            <div className="sub-sum-item">
              <div className="sub-sum-label">가입 상품</div>
              <div className="sub-sum-value" style={{ color: "var(--blue)" }}>{subscriptions.length}개</div>
            </div>
            <div className="sub-sum-item">
              <div className="sub-sum-label">예상 만기금액</div>
              <div className="sub-sum-value" style={{ color: "var(--green)" }}>₩{totalMaturity.toLocaleString()}</div>
            </div>
            <div className="sub-sum-item">
              <div className="sub-sum-label">누적 납입액</div>
              <div className="sub-sum-value" style={{ color: "var(--amber)" }}>₩{totalPaid.toLocaleString()}</div>
            </div>
          </Panel>

          {/* 오른쪽: 상품 목록 — 간격 넓힘 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subscriptions.map((s) => (
              <Panel key={s.simulatedSubscriptionId}>
                <div className="sub-head">
                  <div>
                    <div className="sub-name">{s.productName}</div>
                    <div className="sub-acc">출금 {s.accountNumber}</div>
                  </div>
                  <button
                    className="minibtn warn"
                    onClick={() => handleCancel(s.simulatedSubscriptionId)}
                    disabled={cancellingId === s.simulatedSubscriptionId}
                  >
                    {cancellingId === s.simulatedSubscriptionId ? "해지 중…" : "해지"}
                  </button>
                </div>

                {s.achievementRate != null && (
                  <div className="sub-progress">
                    <div className="sub-progress-top">
                      <span>달성률</span>
                      <b>{s.achievementRate}%</b>
                    </div>
                    <div className="sub-bar">
                      <span style={{ width: `${Math.min(s.achievementRate, 100)}%` }} />
                    </div>
                  </div>
                )}

                <div className="sub-info sub-info-wide">
                  {s.goalName && <div><span>연결 목표</span><b>{s.goalName}</b></div>}
                  <div><span>가입금액</span><b>{s.subscriptionAmount?.toLocaleString()}원</b></div>
                  {s.monthlyPayment != null && <div><span>월 납입액</span><b>{s.monthlyPayment.toLocaleString()}원</b></div>}
                  <div><span>가입기간</span><b>{s.subscriptionPeriod}개월</b></div>
                  <div><span>예상 만기금액</span><b>{s.expectedMaturityAmount?.toLocaleString()}원</b></div>
                  <div><span>누적 납입액</span><b>{s.paidAmount?.toLocaleString()}원</b></div>
                  {s.monthlyPayment != null && <div><span>납입 회차</span><b>{s.paidInstallments}/{s.subscriptionPeriod}회</b></div>}
                  {s.nextPaymentDate && <div><span>다음 납입일</span><b>{s.nextPaymentDate.slice(0, 10)}</b></div>}
                  <div><span>가입일</span><b>{s.subscribedAt?.slice(0, 10)}</b></div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default SimulatedSubscriptionList;