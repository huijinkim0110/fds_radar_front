// 거래신고 페이지
import { useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function TransactionReport() {
    const [selectedTransaction, setselectedTransaction] = useState("");
    const [reason, setReason] = useState("");
    const [detail, setDetail] = useState("");

     // 화면 구성용 임시 거래 데이터
  const transactions = [
    {
      id: 1,
      merchant: "APPLE.COM/BILL",
      amount: 129000,
      occurredAt: "2026-08-28 09:42",
    },
    {
      id: 2,
      merchant: "쿠팡",
      amount: 78000,
      occurredAt: "2026-08-27 21:15",
    },
    {
      id: 3,
      merchant: "GOOGLE PAYMENT",
      amount: 45000,
      occurredAt: "2026-08-26 18:10",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTransaction || !reason) {
      alert("신고할 거래와 신고 사유를 선택해주세요.");
      return;
    }

    alert("거래 신고가 접수되었습니다.");

    setSelectedTransaction("");
    setReason("");
    setDetail("");
  };

  return (
    <>
      <TopBar
        title="거래 신고"
        crumb="홈 / 보안·신고 / 거래 신고"
        search={false}
      />

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
          의심스러운 거래를 신고할 수 있습니다.
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: "1.6",
          }}
        >
          본인이 이용하지 않은 거래를 선택한 후 신고 사유를 작성해주세요.
          신고 내용은 확인 후 처리됩니다.
        </div>
      </div>

      <Panel
        title="거래 신고 접수"
        sub="신고할 거래와 사유를 입력해주세요."
      >
        <form onSubmit={handleSubmit}>
          {/* 거래 선택 */}
          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              신고할 거래
            </label>

            <select
              value={selectedTransaction}
              onChange={(e) => setSelectedTransaction(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "var(--panel2)",
                color: "var(--ink)",
                fontSize: "13px",
                outline: "none",
              }}
            >
              <option value="">거래를 선택해주세요</option>

              {transactions.map((transaction) => (
                <option
                  key={transaction.id}
                  value={transaction.id}
                >
                  {transaction.occurredAt} / {transaction.merchant} / ₩
                  {transaction.amount.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* 신고 사유 */}
          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              신고 사유
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              {[
                "본인이 하지 않은 거래",
                "결제 금액이 다름",
                "중복 결제",
                "알 수 없는 가맹점",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="minibtn"
                  onClick={() => setReason(item)}
                  style={{
                    padding: "12px",
                    background:
                      reason === item
                        ? "var(--blue)"
                        : "var(--panel2)",
                    color:
                      reason === item
                        ? "#fff"
                        : "var(--ink)",
                    borderColor:
                      reason === item
                        ? "var(--blue)"
                        : "var(--line)",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 상세 내용 */}
          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              상세 내용
            </label>

            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="거래와 관련된 내용을 입력해주세요."
              rows={6}
              style={{
                width: "100%",
                resize: "vertical",
                padding: "12px",
                boxSizing: "border-box",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "var(--panel2)",
                color: "var(--ink)",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          {/* 주의사항 */}
          <div
            style={{
              padding: "14px 16px",
              marginBottom: "22px",
              borderRadius: "8px",
              background: "var(--panel2)",
              border: "1px solid var(--line)",
              fontSize: "12px",
              color: "var(--muted)",
              lineHeight: "1.7",
            }}
          >
            신고 접수 후 담당자가 거래 내용을 확인합니다.
            동일한 거래를 반복해서 신고하지 않도록 확인해주세요.
          </div>

          {/* 버튼 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              type="button"
              className="minibtn"
              onClick={() => {
                setSelectedTransaction("");
                setReason("");
                setDetail("");
              }}
            >
              초기화
            </button>

            <button
              type="submit"
              className="minibtn"
              style={{
                background: "var(--blue)",
                color: "#fff",
                borderColor: "var(--blue)",
              }}
            >
              거래 신고하기
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}