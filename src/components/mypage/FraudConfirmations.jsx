// 이상거래 확인 페이지
import { useMemo, useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function FraudConfirmations() {
    const [filter, setFilter] = useState("all");

    // 테스터용 임시 데이터
     const [fraudCases, setFraudCases] = useState([
    {
      id: 1,
      merchant: "APPLE.COM/BILL",
      amount: 129000,
      occurredAt: "2026-08-28 09:42",
      type: "해외결제",
      riskScore: 92,
      status: "확인 필요",
    },
    {
      id: 2,
      merchant: "쿠팡",
      amount: 78000,
      occurredAt: "2026-08-27 21:15",
      type: "온라인결제",
      riskScore: 81,
      status: "확인 필요",
    },
    {
      id: 3,
      merchant: "스타벅스 강남점",
      amount: 6500,
      occurredAt: "2026-08-26 14:20",
      type: "오프라인결제",
      riskScore: 73,
      status: "정상 확인",
    },
  ]);

  const filteredCases = useMemo(() => {
    if (filter === "pending") {
      return fraudCases.filter(
        (fraudCase) => fraudCase.status === "확인 필요"
      );
    }

    return fraudCases;
  }, [filter, fraudCases]);

  const pendingCount = fraudCases.filter(
    (fraudCase) => fraudCase.status === "확인 필요"
  ).length;

  // 본인 거래로 확인
  const handleSafe = (id) => {
    setFraudCases((prev) =>
      prev.map((fraudCase) =>
        fraudCase.id === id
          ? {
              ...fraudCase,
              status: "정상 확인",
            }
          : fraudCase
      )
    );
  };

  // 본인 거래가 아닌 경우
  const handleFraud = (id) => {
    setFraudCases((prev) =>
      prev.map((fraudCase) =>
        fraudCase.id === id
          ? {
              ...fraudCase,
              status: "신고 필요",
            }
          : fraudCase
      )
    );
  };

  return (
    <>
      <TopBar
        title="이상거래 확인"
        crumb="홈 / 보안·신고 / 이상거래 확인"
        search={false}
      />

      {/* 안내 영역 */}
      <div
        style={{
          padding: "18px 20px",
          marginBottom: "20px",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--ink)",
            marginBottom: "7px",
          }}
        >
          확인이 필요한 거래가 {pendingCount}건 있습니다.
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: "1.6",
          }}
        >
          이상거래로 탐지된 거래를 확인해주세요.
          본인이 이용한 거래가 아니라면 거래 신고를 진행할 수 있습니다.
        </div>
      </div>

      <Panel
        title="이상거래 내역"
        sub="이상거래 탐지 시스템에서 확인이 필요한 거래입니다."
        right={
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              className="minibtn"
              onClick={() => setFilter("all")}
              style={{
                background:
                  filter === "all"
                    ? "var(--blue)"
                    : "var(--panel2)",
                color:
                  filter === "all"
                    ? "#fff"
                    : "var(--ink)",
                borderColor:
                  filter === "all"
                    ? "var(--blue)"
                    : "var(--line)",
              }}
            >
              전체
            </button>

            <button
              type="button"
              className="minibtn"
              onClick={() => setFilter("pending")}
              style={{
                background:
                  filter === "pending"
                    ? "var(--blue)"
                    : "var(--panel2)",
                color:
                  filter === "pending"
                    ? "#fff"
                    : "var(--ink)",
                borderColor:
                  filter === "pending"
                    ? "var(--blue)"
                    : "var(--line)",
              }}
            >
              확인 필요
            </button>
          </div>
        }
      >
        {filteredCases.length === 0 ? (
          <div
            style={{
              padding: "50px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            확인할 이상거래가 없습니다.
          </div>
        ) : (
          <div>
            {/* 테이블 제목 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.5fr 1fr 1.2fr 0.8fr 0.8fr 1.3fr",
                gap: "12px",
                padding: "12px 10px",
                borderBottom: "1px solid var(--line)",
                color: "var(--muted)",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              <div>거래처</div>
              <div>결제금액</div>
              <div>거래일시</div>
              <div>거래유형</div>
              <div>위험도</div>
              <div>상태</div>
            </div>

            {/* 거래 목록 */}
            {filteredCases.map((fraudCase) => (
              <div
                key={fraudCase.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.5fr 1fr 1.2fr 0.8fr 0.8fr 1.3fr",
                  gap: "12px",
                  alignItems: "center",
                  padding: "18px 10px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {/* 거래처 */}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--ink)",
                  }}
                >
                  {fraudCase.merchant}
                </div>

                {/* 금액 */}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--ink)",
                  }}
                >
                  ₩ {fraudCase.amount.toLocaleString()}
                </div>

                {/* 날짜 */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  {fraudCase.occurredAt}
                </div>

                {/* 거래 유형 */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink)",
                  }}
                >
                  {fraudCase.type}
                </div>

                {/* 위험도 */}
                <div>
                  <span
                    className="filterpill"
                    style={{
                      color:
                        fraudCase.riskScore >= 90
                          ? "#ef4444"
                          : fraudCase.riskScore >= 80
                          ? "#f59e0b"
                          : "var(--blue)",
                    }}
                  >
                    {fraudCase.riskScore}%
                  </span>
                </div>

                {/* 상태 / 버튼 */}
                <div>
                  {fraudCase.status === "확인 필요" ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <button
                        type="button"
                        className="minibtn"
                        onClick={() => handleSafe(fraudCase.id)}
                      >
                        본인 거래
                      </button>

                      <button
                        type="button"
                        className="minibtn"
                        onClick={() => handleFraud(fraudCase.id)}
                        style={{
                          borderColor: "#ef4444",
                          color: "#ef4444",
                        }}
                      >
                        모르는 거래
                      </button>
                    </div>
                  ) : (
                    <span
                      className="filterpill"
                      style={{
                        color:
                          fraudCase.status === "신고 필요"
                            ? "#ef4444"
                            : "#22c55e",
                      }}
                    >
                      {fraudCase.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}