import { useState } from "react";
import { MOCK } from "../../data/mock.js"; // 목 데이터 경로에 맞게 수정하세요
import TopBar from "../TopBar.jsx";
import TxTable from "../TxTable.jsx";
import Panel from "../Panel.jsx";

const TABS = ["전체", "정상", "검토중", "차단됨"];
const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 거래 내역 개수

export default function Transactions() {
  const [rows] = useState(MOCK.transactions);
  const [tab, setTab] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);

  // 탭 변경 시 1페이지로 초기화하면서 탭 필터링
  const handleTabChange = (t) => {
    setTab(t);
    setCurrentPage(1);
  };

  const filtered = tab === "전체" ? rows : rows.filter((r) => r.status === tab);

  // 전체 페이지 수 및 현재 페이지 데이터 자르기
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    // 마이페이지 레이아웃 안에서 자연스럽게 보이도록 불필요한 바깥쪽 마진 축소
    <div style={{ width: "100%" }}>
      <TopBar title="거래 내역" crumb="마이페이지 / 거래 내역" />
      
      {/* 탭 영역 */}
      <div className="tabs" style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
        {TABS.map((t) => (
          <button 
            key={t} 
            className={tab === t ? "on" : ""} 
            onClick={() => handleTabChange(t)}
            style={{ 
              padding: "8px 16px", 
              cursor: "pointer",
              borderRadius: "6px",
              border: "1px solid #CBD5E1",
              background: tab === t ? "#3B82F6" : "#FFF",
              color: tab === t ? "#FFF" : "#334155",
              fontWeight: "600"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <Panel>
        <TxTable rows={currentRows} showKind />
        
        {/* 페이저 영역 */}
        <div className="pager" style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={currentPage === page ? "on" : ""}
              onClick={() => setCurrentPage(page)}
              style={{ 
                padding: "6px 12px", 
                cursor: "pointer",
                background: currentPage === page ? "#3B82F6" : "#FFF",
                color: currentPage === page ? "#FFF" : "#334155",
                border: "1px solid #CBD5E1",
                borderRadius: "4px"
              }}
            >
              {page}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            다음
          </button>
        </div>
      </Panel>
    </div>
  );
}