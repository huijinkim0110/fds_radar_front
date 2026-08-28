import { useState } from "react";
import { MOCK } from "../../data/mock.js";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

export default function Cards() {
  const [cards, setCards] = useState(
    MOCK.cards.map((card, index) => ({
      ...card,
      id: index + 1,
      status: "정상 사용", // '정상 사용', '승인 대기중(잠금)', '일시 잠금' 등
      limit: "₩ 3,000,000",
      isLocked: false,
    }))
  );

  const [selectedCard, setSelectedCard] = useState(cards[0]);

  // 관리자에게 잠금 신청을 보내는 핸들러
  const handleRequestLock = (cardToRequest) => {
    // 이미 대기 중이거나 잠긴 상태라면 중단
    if (cardToRequest.status === "승인 대기중(잠금)") {
      alert("이미 관리자에게 잠금 승인 요청이 접수된 카드입니다.");
      return;
    }

    const isConfirmed = window.confirm(
      `[${cardToRequest.title} (${cardToRequest.num})] 카드의 일시 잠금을 관리자에게 신청하시겠습니까?\n(관리자 승인 후 최종 잠금 처리됩니다.)`
    );

    if (!isConfirmed) return;

    // 카드 상태를 '승인 대기중'으로 변경
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardToRequest.id) {
          const updatedCard = {
            ...card,
            status: "승인 대기중(잠금)",
          };
          if (selectedCard.id === card.id) setSelectedCard(updatedCard);
          return updatedCard;
        }
        return card;
      })
    );

    alert("관리자에게 카드 잠금 신청이 성공적으로 전송되었습니다. 승인을 기다려주세요.");
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <TopBar title="카드 관리" crumb="홈 / 카드 관리" />

      {/* 보유 카드 목록 섹션 */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#1E293B" }}>보유 카드 ({cards.length}장)</h3>
          <button 
            onClick={() => alert("새로운 카드 신청 페이지로 이동합니다.")}
            style={{ padding: "8px 14px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
          >
            + 새 카드 신청
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {cards.map((card) => {
            const isSelected = selectedCard.id === card.id;
            const isPending = card.status === "승인 대기중(잠금)";

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                style={{
                  background: isPending ? "linear-gradient(135deg, #475569, #334155)" : card.bg,
                  borderRadius: "16px",
                  padding: "24px",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 0 0 3px #3B82F6, 0 10px 15px -3px rgba(0,0,0,0.1)" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.9, marginBottom: "24px" }}>
                  <span>{card.title}</span>
                  <span style={{ 
                    background: isPending ? "#F59E0B" : "rgba(255,255,255,0.2)", 
                    padding: "2px 8px", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: isPending ? "700" : "400"
                  }}>
                    {card.status}
                  </span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "2px", marginBottom: "24px" }}>
                  {card.num}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>카드 이용금액</div>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>{card.value}</div>
                  </div>
                  <span style={{ fontSize: "12px", textDecoration: "underline", opacity: 0.8 }}>
                    {isSelected ? "관리 중" : "선택하기"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 카드 상세 관리 패널 */}
      <Panel>
        <div style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: "16px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{selectedCard.title} 상세 관리</h3>
          <p style={{ margin: 0, color: "#64748B", fontSize: "14px" }}>
            카드 번호: {selectedCard.num} | 현재 상태: 
            <strong style={{ color: selectedCard.status === "승인 대기중(잠금)" ? "#D97706" : "#10B981", marginLeft: "4px" }}>
              {selectedCard.status}
            </strong>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "4px" }}>이용 한도</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B" }}>{selectedCard.limit}</div>
          </div>
          <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "4px" }}>결제 계좌 연결</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#1E293B" }}>주거래 계좌 (•••• 8420)</div>
          </div>
        </div>

        {/* 카드 제어 액션 버튼들 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button
            onClick={() => handleRequestLock(selectedCard)}
            disabled={selectedCard.status === "승인 대기중(잠금)"}
            style={{
              padding: "10px 20px",
              background: selectedCard.status === "승인 대기중(잠금)" ? "#94A3B8" : "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: selectedCard.status === "승인 대기중(잠금)" ? "not-allowed" : "pointer",
            }}
          >
            {selectedCard.status === "승인 대기중(잠금)" ? "⏳ 관리자 승인 대기 중" : "🔒 카드 일시 잠금 신청"}
          </button>
          
          <button
            onClick={() => alert("카드 비밀번호 변경 신청이 접수되었습니다.")}
            style={{ padding: "10px 20px", background: "#F1F5F9", color: "#334155", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            🔑 비밀번호 변경 신청
          </button>

          <button
            onClick={() => alert("분실/재발급 신청이 관리자에게 접수되었습니다.")}
            style={{ padding: "10px 20px", background: "#F1F5F9", color: "#EF4444", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            🚨 분실 신고 및 재발급 신청
          </button>
        </div>
      </Panel>
    </div>
  );
}