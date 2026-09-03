import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar.jsx";
import Panel from "./Panel.jsx";
import { useChatWidget } from "../context/ChatWidgetContext.jsx";

const FAQS = [
  { q: "실시간 이상거래 탐지(FDS)는 어떻게 작동하나요?", a: "Wonly는 24시간 동안 고객님의 거래 패턴을 AI로 실시간 모니터링하여 평소와 다른 이상 거래가 감지될 경우 즉시 차단하고 알림을 보냅니다." },
  { q: "송금 후 잔액이 바로 반영되지 않아요.", a: "일반적으로 송금은 즉시 처리되나, 은행 네트워크 상황에 따라 1~2분 정도 소요될 수 있습니다. 지속될 경우 고객센터로 문의해주세요." },
  { q: "투자성향 진단은 꼭 해야 하나요?", a: "소액 투자 등 일부 고위험 금융 상품 이용 시 고객님의 안전한 투자를 위해 사전 진단이 권장됩니다." },
  { q: "비밀번호를 잊어버렸어요.", a: "로그인 화면 하단의 '비밀번호 찾기'를 통해 본인 인증 후 재설정하실 수 있습니다." },
];

export default function CustomerCenter() {
  const navigate = useNavigate();
  const { openAdminChat } = useChatWidget();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = FAQS.filter(
    (item) => item.q.includes(searchQuery) || item.a.includes(searchQuery)
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 60px 24px" }}>
      <TopBar title="고객센터" crumb="홈 / 고객센터" search={false} />

      {/* 상단 안내 배너 */}
      <div style={{ marginTop: "24px", marginBottom: "28px" }}>
        <Panel title="무엇을 도와드릴까요?" sub="Wonly 고객 지원 센터입니다.">
          <div style={{ padding: "8px 0" }}>
            <input
              type="text"
              placeholder="궁금한 내용을 검색해보세요 (예: 송금, FDS, 비밀번호)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px",
                background: "var(--bg-input, #0f172a)", border: "1px solid var(--border, #334155)",
                borderRadius: "12px", color: "var(--text, #fff)", fontSize: "15px", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <button 
              onClick={() => { console.log('클릭됨'); openAdminChat();}}
              className="fill" 
              style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer", border: "none" }}
            >
              💬 1:1 채팅 문의
            </button>
            <button 
              onClick={() => alert("전화 상담 연결: 1588-0000 (평일 09:00 - 18:00)")}
              className="ghost" 
              style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
            >
              📞 전화 상담 (1588-0000)
            </button>
          </div>
        </Panel>
      </div>

      {/* 자주 묻는 질문 (FAQ) 목록 */}
      <Panel title="자주 묻는 질문 (FAQ)" sub="가장 많이 찾는 질문입니다">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>검색 결과가 없습니다.</div>
          ) : (
            filteredFaqs.map((item, index) => (
              <div 
                key={index}
                onClick={() => toggleFaq(index)}
                style={{
                  background: "var(--card-bg, rgba(255,255,255,0.03))",
                  border: "1px solid var(--border, #334155)",
                  borderRadius: "12px", padding: "16px 20px", cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "600", fontSize: "16px" }}>
                  <span>Q. {item.q}</span>
                  <span style={{ fontSize: "14px", color: "var(--muted)" }}>{openIndex === index ? "▲" : "▼"}</span>
                </div>
                {openIndex === index && (
                  <div style={{ marginTop: "12px", color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", borderTop: "1px solid var(--border, #334155)", paddingTop: "12px" }}>
                    A. {item.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}