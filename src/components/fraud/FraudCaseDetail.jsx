import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import {
    getFraudCaseDetail,
    updateFraudCaseStatus,
    assignFraudCaseAdmin,
    getFraudCaseHistories,
    finalizeFraudDecision,
    requestFraudCaseLock,
    getAssignableAdmins,
} from "../../api/fraud/fraudCaseAPI";
import {
    getCaseStatusLabel,
    getCasePriorityLabel,
    getUserConfirmationLabel,
    getFraudDecisionLabel,
    getPredictedResultLabel,
    getPredictedFraudTypeLabel,
    getFraudActionTypeLabel,
    formatProbabilityPercent,
    formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";

const STATUS = {
    RECEIVED: { label: "접수", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
    INVESTIGATING: { label: "조사중", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
    CLOSED: { label: "종결", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

const RISK = {
    HIGH: { label: "높음", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
    MEDIUM: { label: "중간", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
    LOW: { label: "낮음", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

const DECISION = {
    FRAUD: { label: "사기", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
    NORMAL: { label: "정상", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
};

const ORIGIN_LABELS = {
    AI_DETECTION: "AI 자동 탐지",
    USER_REPORT: "사용자 신고",
};

const TRANSACTION_TYPE_LABELS = {
    CARD_PAYMENT: "카드결제",
    ACCOUNT_TRANSFER: "계좌이체",
};

const TARGET_TYPE_LABELS = {
    CARD: "카드",
    ACCOUNT: "계좌",
};

// 거래타입으로 잠금 대상을 자동 결정 (관리자가 임의로 못 바꾸게)
function getLockTargetType(transactionType) {
    if (transactionType === "CARD_PAYMENT") return "CARD";
    if (transactionType === "ACCOUNT_TRANSFER") return "ACCOUNT";
    return null;
}

// 백엔드 예외 메시지 끝에 붙는 "id=123" 같은 개발자용 꼬리표를 잘라내고 보여줌
function cleanErrorMessage(err) {
    const raw = err.response?.data?.message ?? err.message ?? "알 수 없는 오류가 발생했습니다.";
    return raw.replace(/\s*id=\d+\s*$/, "").trim();
}

// 잠금 대상(카드/계좌)별 잠금 사유 프리셋 — 필요하면 이 목록만 수정하면 됨
const LOCK_REASON_PRESETS = {
    CARD: [
        "카드 도난/분실 신고",
        "카드 정보 유출 의심",
        "해외 이상거래 탐지",
        "사용자 본인확인 거부",
        "기타",
    ],
    ACCOUNT: [
        "보이스피싱 피해 의심",
        "계좌 도용/명의도용 의심",
        "비정상 대량 이체 탐지",
        "사용자 본인확인 거부",
        "기타",
    ],
};

const selectStyle = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid var(--border, #CBD5E1)",
    fontSize: 13,
};

function FraudCaseDetail() {
    const { fraudCaseId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lockReasonPreset, setLockReasonPreset] = useState("");
    const [customLockReason, setCustomLockReason] = useState("");
    const [admins, setAdmins] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [histories, setHistories] = useState([]);

    async function fetchDetail() {
        try {
            const data = await getFraudCaseDetail(fraudCaseId);
            setDetail(data);
        } catch (err) {
            setError("사건 상세를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchHistories() {
        try {
            const data = await getFraudCaseHistories(fraudCaseId);
            setHistories(data);
        } catch (err) {
            console.error("이력 조회 실패", err);
        }
    }

    async function fetchAdmins() {
        try {
            const data = await getAssignableAdmins();
            setAdmins(data);
        } catch (err) {
            console.error("담당자 목록 조회 실패", err);
        }
    }

    useEffect(() => {
        fetchDetail();
        fetchHistories();
        fetchAdmins();
    }, [fraudCaseId]);

    async function handleStatusChange(newStatus) {
        try {
            await updateFraudCaseStatus(fraudCaseId, newStatus);
            await fetchDetail();
            await fetchHistories();
        } catch (err) {
            alert("상태 변경에 실패했습니다: " + cleanErrorMessage(err));
        }
    }

    async function handleAssign() {
        if (!selectedAdminId) {
            alert("담당자를 선택해주세요.");
            return;
        }
        if (assigning) return;

        setAssigning(true);
        try {
            await assignFraudCaseAdmin(fraudCaseId, Number(selectedAdminId));
            await fetchDetail();
            await fetchHistories();
            setSelectedAdminId("");
        } catch (err) {
            alert("담당자 배정에 실패했습니다: " + cleanErrorMessage(err));
        } finally {
            setAssigning(false);
        }
    }

    async function handleFinalize(decision) {
        try {
            await finalizeFraudDecision(fraudCaseId, decision);
            await fetchDetail();
            await fetchHistories();
        } catch (err) {
            alert("최종 판정에 실패했습니다: " + cleanErrorMessage(err));
        }
    }

    async function handleLock(targetType) {
        if (!lockReasonPreset) {
            alert("잠금 사유를 선택해주세요.");
            return;
        }
        const reason = lockReasonPreset === "기타" ? customLockReason.trim() : lockReasonPreset;
        if (!reason) {
            alert("기타 사유를 입력해주세요.");
            return;
        }
        try {
            await requestFraudCaseLock(fraudCaseId, targetType, reason);
            await fetchHistories();
            setLockReasonPreset("");
            setCustomLockReason("");
            alert("잠금 요청이 처리되었습니다.");
        } catch (err) {
            alert("잠금 요청에 실패했습니다: " + cleanErrorMessage(err));
        }
    }

    if (loading) return <div>불러오는 중...</div>;
    if (error) return <div>{error}</div>;
    if (!detail) return null;

    const targetType = getLockTargetType(detail.transactionType);
    const isClosed = detail.caseStatus === "CLOSED";
    const status = STATUS[detail.caseStatus] ?? { label: getCaseStatusLabel(detail.caseStatus), color: "var(--muted)", bg: "transparent" };
    const risk = RISK[detail.priority] ?? { label: getCasePriorityLabel(detail.priority), color: "var(--muted)", bg: "transparent" };
    const decision = detail.fraudDecision ? DECISION[detail.fraudDecision] : null;

    return (
        <>
            <button className="minibtn" style={{ marginBottom: 12 }} onClick={() => navigate("/mypage/admin-fraud-cases")}>
                ← 목록으로
            </button>
            <TopBar title={`사건 상세 #${detail.fraudCaseId}`} crumb="관리자 / 이상거래 관리" search={false} />

            <Panel title="사건 정보" sub={`거래ID ${detail.transactionId}`}>
                <div className="acc-detail">
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">상태</div>
                        <div className="acc-detail-value">
                            <span className="chip" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                        </div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">우선순위</div>
                        <div className="acc-detail-value">
                            <span className="chip" style={{ color: risk.color, background: risk.bg }}>{risk.label}</span>
                        </div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">사건 생성 경로</div>
                        <div className="acc-detail-value">{ORIGIN_LABELS[detail.origin] ?? "-"}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">본인확인</div>
                        <div className="acc-detail-value">{getUserConfirmationLabel(detail.confirmation)}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">최종판정</div>
                        <div className="acc-detail-value">
                            {decision
                                ? <span className="chip" style={{ color: decision.color, background: decision.bg }}>{decision.label}</span>
                                : "미판정"}
                        </div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">담당자</div>
                        <div className="acc-detail-value">{detail.assignedAdminId}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">접수일시</div>
                        <div className="acc-detail-value">{formatDateTime(detail.openedAt)}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">종결일시</div>
                        <div className="acc-detail-value">{formatDateTime(detail.closedAt)}</div>
                    </div>
                </div>
            </Panel>

            <Panel title="상태 변경" style={{ marginTop: 16 }}>
                {detail.caseStatus === "RECEIVED" && (
                    <button className="minibtn" onClick={() => handleStatusChange("INVESTIGATING")}>
                        조사 시작
                    </button>
                )}
                {detail.caseStatus === "INVESTIGATING" && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>최종 판정:</span>
                        <button className="minibtn warn" onClick={() => handleFinalize("FRAUD")}>사기 처리</button>
                        <button className="minibtn" onClick={() => handleFinalize("NORMAL")}>정상 처리</button>
                    </div>
                )}
                {isClosed && <div style={{ fontSize: 13, color: "var(--muted)" }}>이미 종결된 사건입니다.</div>}
            </Panel>

            {!isClosed && (
                <Panel title="담당자 배정" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <select
                            style={selectStyle}
                            value={selectedAdminId}
                            onChange={(e) => setSelectedAdminId(e.target.value)}
                            disabled={assigning}
                        >
                            <option value="">담당자 선택</option>
                            {admins.map((admin) => (
                                <option key={admin.userId} value={admin.userId}>
                                    {admin.name} (ID: {admin.userId})
                                </option>
                            ))}
                        </select>
                        <button className="minibtn" onClick={handleAssign} disabled={assigning}>
                            {assigning ? "배정 중..." : "배정"}
                        </button>
                    </div>
                </Panel>
            )}

            {!isClosed && (
                <Panel title="카드·계좌 잠금 요청" style={{ marginTop: 16 }}>
                    {!targetType ? (
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>
                            이 거래의 유형을 확인할 수 없어 잠금 요청을 진행할 수 없습니다.
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 13, marginBottom: 10 }}>
                                거래유형: {TRANSACTION_TYPE_LABELS[detail.transactionType] ?? detail.transactionType} →
                                {" "}잠금 대상: <b>{TARGET_TYPE_LABELS[targetType]}</b> (거래 유형에 따라 자동 결정됨)
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <select
                                    style={selectStyle}
                                    value={lockReasonPreset}
                                    onChange={(e) => setLockReasonPreset(e.target.value)}
                                >
                                    <option value="">잠금 사유 선택</option>
                                    {LOCK_REASON_PRESETS[targetType].map((reason) => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </select>
                                {lockReasonPreset === "기타" && (
                                    <input
                                        type="text"
                                        style={selectStyle}
                                        placeholder="기타 사유 입력"
                                        value={customLockReason}
                                        onChange={(e) => setCustomLockReason(e.target.value)}
                                    />
                                )}
                                <button className="minibtn warn" onClick={() => handleLock(targetType)}>잠금 요청</button>
                            </div>
                        </>
                    )}
                </Panel>
            )}

            <Panel title="AI 탐지 정보" style={{ marginTop: 16 }}>
                <div className="acc-detail">
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">탐지결과ID</div>
                        <div className="acc-detail-value">{detail.detection?.detectionResultId}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">이상확률</div>
                        <div className="acc-detail-value" style={{ color: "var(--blue)" }}>
                            {formatProbabilityPercent(detail.detection?.fraudProbability)}
                        </div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">예측결과</div>
                        <div className="acc-detail-value">{getPredictedResultLabel(detail.detection?.predictedResult)}</div>
                    </div>
                    <div className="acc-detail-item">
                        <div className="acc-detail-label">이상유형</div>
                        <div className="acc-detail-value">{getPredictedFraudTypeLabel(detail.detection?.fraudType)}</div>
                    </div>
                    <div className="acc-detail-item" style={{ gridColumn: "1 / -1" }}>
                        <div className="acc-detail-label">탐지근거</div>
                        <div className="acc-detail-value">{detail.detection?.detectionReason ?? "-"}</div>
                    </div>
                </div>
            </Panel>

            <Panel title="처리이력" style={{ marginTop: 16 }}>
                {histories.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>이력이 없습니다.</div>
                ) : (
                    <div className="feed">
                        {histories.map((h) => (
                            <div className="fitem" key={h.caseHistoryId}>
                                <span className="fdot" style={{ background: "var(--blue)" }} />
                                <div>
                                    <div className="ft" style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                                        <span className="chip" style={{ fontSize: 11, flexShrink: 0 }}>
                                            {getFraudActionTypeLabel(h.actionType)}
                                        </span>
                                        <span>{h.actionContent}</span>
                                    </div>
                                    {h.previousStatus && h.previousStatus !== h.changedStatus && (
                                        <div className="fm">{getCaseStatusLabel(h.previousStatus)} → {getCaseStatusLabel(h.changedStatus)}</div>
                                    )}
                                    <div className="fm">{formatDateTime(h.createdAt)} · 담당자 {h.adminId}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </>
    );
}

export default FraudCaseDetail;