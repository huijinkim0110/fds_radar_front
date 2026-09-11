// 이상거래 확인 페이지
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getMyFraudCases, confirmFraudCase } from "../../api/fraud/fraudUserAPI";
import { useAuth } from "../../context/AuthContext.jsx";

// 거래유형 라벨 매핑 객체
const TRANSACTION_TYPE_LABELS = {
    CARD_PAYMENT: "카드결제",
    ACCOUNT_TRANSFER: "계좌이체",
};

// 거래유형 변환 함수 (소문자/대문자 안전 변환)
function formatTransactionType(type) {
    if (!type) return "-";
    const key = String(type).toUpperCase();
    return TRANSACTION_TYPE_LABELS[key] || type;
}

// API 응답(FraudCaseListResponse) -> 화면에서 쓰는 필드명으로 매핑.
function mapCase(raw) {
    return {
        id: raw.fraudCaseId,
        merchant: raw.merchantName,
        amount: raw.amount,
        // [D파트 수정] 원본 ISO 문자열 그대로 보여주던 걸 사람이 읽기 좋은 형식으로 변환
        occurredAt: raw.transactionOccurredAt
            ? new Date(raw.transactionOccurredAt).toLocaleString()
            : "-",
        type: formatTransactionType(raw.transactionType), // [수정] 한글 라벨로 변환 적용
        // fraudProbability는 0~1 사이 소수라 백분율로 변환, 반올림
        riskScore: Math.round((raw.fraudProbability ?? 0) * 100),
        // [D파트 추가] 사건 종결 여부/최종판정을 status 계산에 반영하기 위해 원본값 보관
        caseStatus: raw.caseStatus,
        fraudDecision: raw.fraudDecision,
        status: mapStatus(raw.caseStatus, raw.fraudDecision, raw.confirmation), // [D파트 수정]
    };
}

// [D파트 수정] 사건이 이미 종결(CLOSED)됐으면 관리자 최종판정 결과를 우선 표시.
// 아직 진행 중(RECEIVED/INVESTIGATING)이면 기존처럼 유저 응답(confirmation) 기준으로 표시.
function mapStatus(caseStatus, fraudDecision, confirmation) {
    if (caseStatus === "CLOSED") {
        if (fraudDecision === "FRAUD") return "사기 확정 처리됨";
        if (fraudDecision === "NORMAL") return "정상 처리 완료";
        return "처리 완료";
    }
    if (confirmation === "CONFIRMED") return "정상 확인";
    if (confirmation === "DENIED") return "신고 필요";
    return "확인 필요"; // NO_RESPONSE
}

export default function FraudConfirmations() {

const { user } = useAuth();
const userId = user?.userId ?? 1;

    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");

    const [fraudCases, setFraudCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCases();
    }, []);

    function loadCases() {
        setLoading(true);
        setError(null);
        getMyFraudCases(userId)
            .then((data) => setFraudCases(data.map(mapCase)))
            .catch(() => setError('이상거래 내역을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }

    const filteredCases = useMemo(() => {
        if (filter === "pending") {
            return fraudCases.filter((fraudCase) => fraudCase.status === "확인 필요");
        }
        return fraudCases;
    }, [filter, fraudCases]);

    const pendingCount = fraudCases.filter(
        (fraudCase) => fraudCase.status === "확인 필요"
    ).length;

    // 본인 거래로 확인
    function handleSafe(id) {
        confirmFraudCase(id, "CONFIRMED")
            .then(() => {
                setFraudCases((prev) =>
                    prev.map((fraudCase) =>
                        fraudCase.id === id ? { ...fraudCase, status: "정상 확인" } : fraudCase
                    )
                );
            })
            .catch(() => alert('처리에 실패했습니다. 다시 시도해주세요.'));
    }

    // 본인 거래가 아닌 경우 (상태 변경 + 신고 페이지 이동)
    function handleFraud(fraudCase) {
        confirmFraudCase(fraudCase.id, "DENIED")
            .then(() => {
                setFraudCases((prev) =>
                    prev.map((item) =>
                        item.id === fraudCase.id ? { ...item, status: "신고 필요" } : item
                    )
                );

                const goReport = window.confirm(
                    `[${fraudCase.merchant}] 거래가 '신고 필요' 상태로 처리되었습니다.\n즉시 거래 신고 페이지로 이동하여 상세 사유를 접수하시겠습니까?`
                );

                if (goReport) {
                    navigate("/mypage/fraud-reports", { state: { targetTransaction: fraudCase } });
                }
            })
            .catch(() => alert('처리에 실패했습니다. 다시 시도해주세요.'));
    }

    if (loading) {
        return (
            <>
                <TopBar title="이상거래 확인" crumb="홈 / 보안·신고 / 이상거래 확인" search={false} />
                <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
                    불러오는 중...
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <TopBar title="이상거래 확인" crumb="홈 / 보안·신고 / 이상거래 확인" search={false} />
                <div style={{ padding: "60px 0", textAlign: "center", color: "#ef4444" }}>
                    {error}
                </div>
            </>
        );
    }

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
                    이상거래로 탐지된 거래를 확인해주세요. 본인이 이용한 거래가 아니라면 거래 신고를 진행할 수 있습니다.
                </div>
            </div>

            <Panel
                title="이상거래 내역"
                sub="이상거래 탐지 시스템에서 확인이 필요한 거래입니다."
                right={
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            className="minibtn"
                            onClick={() => setFilter("all")}
                            style={{
                                background: filter === "all" ? "var(--blue)" : "var(--panel2)",
                                color: filter === "all" ? "#fff" : "var(--ink)",
                                borderColor: filter === "all" ? "var(--blue)" : "var(--line)",
                            }}
                        >
                            전체
                        </button>
                        <button
                            type="button"
                            className="minibtn"
                            onClick={() => setFilter("pending")}
                            style={{
                                background: filter === "pending" ? "var(--blue)" : "var(--panel2)",
                                color: filter === "pending" ? "#fff" : "var(--ink)",
                                borderColor: filter === "pending" ? "var(--blue)" : "var(--line)",
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
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.5fr 1fr 1.2fr 0.8fr 0.8fr 1.3fr",
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

                        {filteredCases.map((fraudCase) => (
                            <div
                                key={fraudCase.id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.5fr 1fr 1.2fr 0.8fr 0.8fr 1.3fr",
                                    gap: "12px",
                                    alignItems: "center",
                                    padding: "18px 10px",
                                    borderBottom: "1px solid var(--line)",
                                }}
                            >
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)" }}>
                                    {fraudCase.merchant}
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ink)" }}>
                                    ₩ {fraudCase.amount?.toLocaleString()}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                                    {fraudCase.occurredAt}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--ink)" }}>
                                    {fraudCase.type}
                                </div>
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
                                <div>
                                    {fraudCase.status === "확인 필요" ? (
                                        <div style={{ display: "flex", gap: "6px" }}>
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
                                                onClick={() => handleFraud(fraudCase)}
                                                style={{ borderColor: "#ef4444", color: "#ef4444" }}
                                            >
                                                모르는 거래
                                            </button>
                                        </div>
                                    ) : (
                                        <span
                                            className="filterpill"
                                            style={{
                                                color:
                                                    fraudCase.status === "신고 필요" || fraudCase.status === "사기 확정 처리됨"
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