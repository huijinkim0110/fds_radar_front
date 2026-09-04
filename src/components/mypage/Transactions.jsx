import { useEffect, useMemo, useState } from "react";
import TopBar from "../TopBar.jsx";
import TxTable from "../TxTable.jsx";
import Panel from "../Panel.jsx";
import { getMyTransactions } from "../../api/transaction/transactionAPI";

const TEMP_USER_ID = 2; // 인증 붙기 전까지 임시 고정값

const TABS = ["전체", "정상", "검토중", "차단됨"];
const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 거래 내역 개수

// TransactionStatus(APPROVED/PENDING/CANCELED) -> 화면 탭/칩에서 쓰는 한글 라벨
function mapStatus(status) {
    if (status === "APPROVED") return "정상";
    if (status === "PENDING") return "검토중";
    if (status === "CANCELED") return "차단됨";
    return status;
}

// TransactionType -> 계좌이체 등 가맹점명이 없는 거래에서 대체로 보여줄 라벨
function mapTypeLabel(type) {
    if (type === "CARD_PAYMENT") return "카드결제";
    if (type === "ACCOUNT_TRANSFER") return "계좌이체";
    return type;
}

function formatDateTime(isoString) {
    if (!isoString) return "-";
    return isoString.replace("T", " ").slice(0, 16);
}

// API 응답(TransactionResponse) -> TxTable이 기대하는 필드(time/name/kind/amt/status)로 매핑
// name: 거래유형 기준으로 결정 - 카드결제는 가맹점명, 계좌이체는 수취인명
// (값 존재 여부가 아니라 타입 기준으로 판단 - merchant_id/recipient_id가 둘 다 남아있는
//  지저분한 데이터가 있어도 엉뚱한 값이 뜨지 않도록 방어)
// kind: 거래유형(카드결제/계좌이체)
function mapRow(raw) {
    const name = raw.transactionType === "ACCOUNT_TRANSFER"
        ? (raw.recipientName ?? "-")
        : (raw.merchantName ?? "-");

    return {
        id: raw.transactionId,
        time: formatDateTime(raw.occurredAt),
        name,
        kind: mapTypeLabel(raw.transactionType),
        amt: `${raw.amount?.toLocaleString()}원`,
        status: mapStatus(raw.status),
    };
}

export default function Transactions() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("전체");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getMyTransactions(TEMP_USER_ID)
            .then((data) => setRows(data.content.map(mapRow)))
            .catch(() => setError('거래내역을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, []);

    // 탭 변경 시 1페이지로 초기화하면서 탭 필터링
    const handleTabChange = (t) => {
        setTab(t);
        setCurrentPage(1);
    };

    const filtered = useMemo(
        () => (tab === "전체" ? rows : rows.filter((r) => r.status === tab)),
        [tab, rows]
    );

    // 전체 페이지 수 및 현재 페이지 데이터 자르기
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentRows = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div style={{ width: "100%" }}>
                <TopBar title="거래 내역" crumb="마이페이지 / 거래 내역" />
                <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
                    불러오는 중...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: "100%" }}>
                <TopBar title="거래 내역" crumb="마이페이지 / 거래 내역" />
                <div style={{ padding: "60px 0", textAlign: "center", color: "#ef4444" }}>
                    {error}
                </div>
            </div>
        );
    }

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
                {currentRows.length === 0 ? (
                    <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                        표시할 거래내역이 없습니다.
                    </div>
                ) : (
                    <TxTable rows={currentRows} showKind />
                )}

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