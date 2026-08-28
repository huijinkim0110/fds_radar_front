import { useState } from "react";
import { MOCK } from "../../data/mock.js";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

export default function Cards() {
  const [cards, setCards] = useState(
    MOCK.cards.map((card, index) => ({
      ...card,
      id: index + 1,
      status: "정상 사용",
      limit: "₩ 3,000,000",
    }))
  );

  const [selectedCard, setSelectedCard] = useState(cards[0]);

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

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                style={{
                  background: card.bg,
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
                    background: "rgba(255,255,255,0.2)", 
                    padding: "2px 8px", 
                    borderRadius: "12px", 
                    fontSize: "12px",
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
            <strong style={{ color: "#10B981", marginLeft: "4px" }}>
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

        {/* 카드 제어 액션 버튼들 (잠금 기능 제거됨) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
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