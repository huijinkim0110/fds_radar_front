import { useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function LockRequestsPage() {
  const [activeTab, setActiveTab] = useState("history");

  // --- 1. 잠금 요청 내역 상태 ---
  const [requests, setRequests] = useState([
    {
      id: "LOCK-2026-001",
      targetType: "카드",
      targetName: "KB국민 로맨틱카드 (•••• 4821)",
      reason: "분실 우려 및 보안 잠금 요청",
      requestedAt: "2026-08-27 16:40",
      status: "승인 완료",
      adminComment: "관리자에 의해 카드 일시 잠금이 정상 처리되었습니다.",
    },
    {
      id: "LOCK-2026-002",
      targetType: "계좌",
      targetName: "주거래 입출금 계좌 (•••• 8420)",
      reason: "보안 강화 및 거래 일시 제한",
      requestedAt: "2026-08-25 11:15",
      status: "심사 중",
      adminComment: "관리자 검토 대기 중입니다.",
    },
  ]);

  // --- 2. 새로운 잠금 신청 폼 상태 ---
  const [targetType, setTargetType] = useState("카드");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  // 잠금 대상 선택지 예시 (카드 및 계좌)
  const targetOptions = {
    카드: [
      { id: "c1", name: "KB국민 로맨틱카드 (•••• 4821)" },
      { id: "c2", name: "체크카드 (•••• 3312)" },
    ],
    계좌: [
      { id: "a1", name: "주거래 입출금 계좌 (•••• 8420)" },
      { id: "a2", name: "모임통장 (•••• 9011)" },
    ],
  };

  // 잠금 신청 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTargetId || !reason) {
      alert("대상 자산과 잠금 사유를 선택해주세요.");
      return;
    }

    const selectedList = targetOptions[targetType];
    const targetObj = selectedList.find((item) => item.id === selectedTargetId);

    const newRequest = {
      id: `LOCK-2026-00${requests.length + 1}`,
      targetType: targetType,
      targetName: targetObj ? targetObj.name : "기타 자산",
      reason: reason,
      requestedAt: "2026-08-28 17:30", // 현재 시간 가정
      status: "심사 중",
      adminComment: "관리자 검토 대기 중입니다.",
    };

    setRequests([newRequest, ...requests]);
    alert("잠금 신청이 성공적으로 접수되었습니다.");

    // 폼 초기화 및 내역 탭으로 이동
    setSelectedTargetId("");
    setReason("");
    setDetail("");
    setActiveTab("history");
  };

  // 신청 취소 핸들러
  const handleCancel = (id, status) => {
    if (status !== "심사 중") {
      alert("이미 처리가 완료된 건은 취소할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말 해당 잠금 신청을 취소하시겠습니까?")) return;
    setRequests((prev) => prev.filter((item) => item.id !== id));
    alert("잠금 신청이 취소되었습니다.");
  };

  return (
    <>
      <TopBar
        title="계좌·카드 잠금 요청"
        crumb="홈 / 보안·신고 / 계좌·카드 잠금 요청"
        search={false}
      />

      {/* 상단 탭 전환 버튼 */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "history" ? "var(--blue)" : "var(--panel)",
            color: activeTab === "history" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          📋 잠금 요청 내역
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("new")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            background: activeTab === "new" ? "var(--blue)" : "var(--panel)",
            color: activeTab === "new" ? "#fff" : "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          🔒 새로운 잠금 신청하기
        </button>
      </div>

      {/* 탭 1: 잠금 요청 내역 리스트 */}
      {activeTab === "history" && (
        <Panel title="잠금 요청 및 처리 현황" sub="계좌 및 카드 일시 잠금 신청 내역 목록입니다.">
          {requests.length === 0 ? (
            <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              조회된 잠금 요청 내역이 없습니다.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {requests.map((item) => {
                const statusColor = item.status === "승인 완료" ? "#22c55e" : item.status === "반려" ? "#ef4444" : "#f59e0b";
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "20px",
                      borderRadius: "12px",
                      border: "1px solid var(--line)",
                      background: "var(--panel2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--blue)" }}>
                          {item.targetType} 잠금
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{item.id}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: statusColor }}>● {item.status}</span>
                        {item.status === "심사 중" && (
                          <button
                            type="button"
                            className="minibtn"
                            onClick={() => handleCancel(item.id, item.status)}
                            style={{ borderColor: "#ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "11px" }}
                          >
                            신청 취소
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)", marginBottom: "4px" }}>
                        {item.targetName}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                        신청 사유: <strong style={{ color: "var(--ink)" }}>{item.reason}</strong>
                      </div>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <div style={{ color: "var(--ink)" }}>
                        <span style={{ color: "var(--muted)", marginRight: "6px" }}>관리자 코멘트:</span>
                        {item.adminComment}
                      </div>
                      <div style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{item.requestedAt} 접수</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* 탭 2: 새로운 잠금 신청 폼 */}
      {activeTab === "new" && (
        <Panel title="계좌·카드 잠금 신청" sub="보안 및 분실 방지를 위해 계좌 또는 카드의 이용을 일시 정지합니다.">
          <form onSubmit={handleSubmit}>
            {/* 자산 유형 선택 (카드 / 계좌) */}
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                잠금 대상 구분
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                {["카드", "계좌"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="minibtn"
                    onClick={() => {
                      setTargetType(type);
                      setSelectedTargetId(""); // 대상 변경 시 초기화
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: targetType === type ? "var(--blue)" : "var(--panel2)",
                      color: targetType === type ? "#fff" : "var(--ink)",
                      borderColor: targetType === type ? "var(--blue)" : "var(--line)",
                      fontWeight: "700",
                    }}
                  >
                    {type} 잠금
                  </button>
                ))}
              </div>
            </div>

            {/* 대상 선택 드롭다운 */}
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                잠금할 {targetType} 선택
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--ink)", fontSize: "13px", outline: "none" }}
              >
                <option value="">잠금할 {targetType}을 선택해주세요</option>
                {targetOptions[targetType].map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 잠금 사유 선택 */}
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                잠금 사유
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {["분실 우려 및 보안 잠금", "해킹/명의도용 의심", "일시적 거래 중단", "기타 사유"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="minibtn"
                    onClick={() => setReason(item)}
                    style={{
                      padding: "12px",
                      background: reason === item ? "var(--blue)" : "var(--panel2)",
                      color: reason === item ? "#fff" : "var(--ink)",
                      borderColor: reason === item ? "var(--blue)" : "var(--line)",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 상세 내용 입력 */}
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
                상세 요청 사항 (선택)
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="추가로 전달할 내용을 입력해주세요."
                rows={4}
                style={{ width: "100%", resize: "vertical", padding: "12px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--panel2)", color: "var(--ink)", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="minibtn"
                onClick={() => {
                  setSelectedTargetId("");
                  setReason("");
                  setDetail("");
                }}
              >
                초기화
              </button>
              <button
                type="submit"
                className="minibtn"
                style={{ background: "var(--blue)", color: "#fff", borderColor: "var(--blue)" }}
              >
                잠금 신청 제출하기
              </button>
            </div>
          </form>
        </Panel>
      )}
    </>
  );
}