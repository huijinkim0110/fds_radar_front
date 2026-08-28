import { useState } from "react";
import { MOCK } from "../../data/mock.js"; // 목 데이터 경로에 맞게 수정하세요
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import TxTable from "../TxTable.jsx";

export default function Accounts() {
  // 1. 보유 계좌 리스트 (목데이터의 cards 활용)
  const [accounts, setAccounts] = useState(
    MOCK.cards.map((card, index) => ({
      ...card,
      id: index + 1,
      alias: card.title, // 계좌 별칭 (수정 가능하도록)
      transactions: MOCK.transactions.slice(index * 2, index * 2 + 3), // 계좌별 임시 거래 내역
    }))
  );

  // 2. 선택된 계좌 (기본값은 첫 번째 계좌)
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  
  // 3. 별칭 수정 모드 상태
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasInput, setAliasInput] = useState(selectedAccount.alias);

  // 총 자산 계산 (숫자형태로 변환해서 합산)
  const totalBalance = accounts.reduce((acc, cur) => {
    // "₩ 8,420,000" 형태에서 숫자만 추출
    const num = Number(cur.value.replace(/[^0-9]/g, "")) || 0;
    return acc + num;
  }, 0);

  // 계좌 선택 변경 핸들러
  const handleSelectAccount = (acc) => {
    setSelectedAccount(acc);
    setAliasInput(acc.alias);
    setIsEditingAlias(false);
  };

  // 별칭 저장 핸들러
  const handleSaveAlias = () => {
    const updatedAccounts = accounts.map((item) =>
      item.id === selectedAccount.id ? { ...item, alias: aliasInput } : item
    );
    setAccounts(updatedAccounts);
    setSelectedAccount({ ...selectedAccount, alias: aliasInput });
    setIsEditingAlias(false);
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <TopBar title="계좌 관리" crumb="홈 / 계좌 관리" />

      {/* 1. 보유 계좌 요약 및 총 자산 섹션 */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "16px", color: "#64748B", marginBottom: "4px" }}>내 총 자산</div>
        <div style={{ fontSize: "32px", fontWeight: "700", color: "#1E293B", marginBottom: "20px" }}>
          ₩ {totalBalance.toLocaleString()}
        </div>

        {/* 계좌 카드 가로 스크롤/그리드 영역 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {accounts.map((acc) => {
            const isSelected = selectedAccount.id === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => handleSelectAccount(acc)}
                style={{
                  background: acc.bg,
                  borderRadius: "16px",
                  padding: "24px",
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: isSelected ? "0 0 0 3px #3B82F6" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "8px" }}>{acc.alias} ({acc.num})</div>
                <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "16px" }}>{acc.value}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.9 }}>
                  <span>주거래 은행</span>
                  <span>{isSelected ? "조회 중 ▼" : "선택하기"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 선택된 계좌 상세 정보 및 별칭 관리 섹션 */}
      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isEditingAlias ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    style={{ padding: "4px 8px", fontSize: "18px", borderRadius: "4px", border: "1px solid #CBD5E1" }}
                  />
                  <button onClick={handleSaveAlias} style={{ padding: "4px 12px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>저장</button>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: 0, fontSize: "20px" }}>{selectedAccount.alias}</h3>
                  <button onClick={() => setIsEditingAlias(true)} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: "14px" }}>✏️ 별칭 수정</button>
                </>
              )}
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>계좌번호: {selectedAccount.num} | 잔액: {selectedAccount.value}</p>
          </div>

          {/* 3. 연계 금융 상품 및 간편 송금 버튼 영역 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={() => alert(`${selectedAccount.alias}에서 간편 송금을 시작합니다.`)}
              style={{ padding: "10px 16px", background: "#2563EB", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              💸 송금하기
            </button>
            <button 
              onClick={() => alert("추가 입금 또는 상품 상세 페이지로 이동합니다.")}
              style={{ padding: "10px 16px", background: "#F1F5F9", color: "#334155", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              📦 상품 관리
            </button>
          </div>
        </div>

        {/* 해당 계좌의 최근 거래 내역 */}
        <h4 style={{ marginBottom: "12px", color: "#334155" }}>이 계좌의 최근 거래 내역</h4>
        <TxTable rows={selectedAccount.transactions} showKind />
      </Panel>
    </div>
  );
}