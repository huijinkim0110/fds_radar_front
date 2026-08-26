import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    getRequestTargetTypeLabel,
    getTransactionTypeLabel,
    getLockTargetTypeFromTransactionType,
    formatProbabilityPercent,
    formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";

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
            await fetchDetail(); // 변경 후 최신 상태로 다시 불러옴
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
        if (assigning) return; // 중복 클릭 방지

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
    async function handleLock() {
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
            await fetchHistories(); // 잠금은 사건 상태 자체를 안 바꾸니 detail은 새로고침 불필요
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
    const targetType = getLockTargetTypeFromTransactionType(detail.transactionType);

    const isClosed = detail.caseStatus === "CLOSED";

    return (
        <div>
            <button onClick={() => navigate("/admin/fraud-cases")}>목록으로</button>
            <h2>사건 상세 #{detail.fraudCaseId}</h2>

            <section>
                <h3>사건 정보</h3>
                <p>거래ID: {detail.transactionId}</p>
                <p>상태: {getCaseStatusLabel(detail.caseStatus)}</p>
                <p>우선순위: {getCasePriorityLabel(detail.priority)}</p>
                <p>본인확인: {getUserConfirmationLabel(detail.confirmation)}</p>
                <p>최종판정: {detail.fraudDecision ? getFraudDecisionLabel(detail.fraudDecision) : "미판정"}</p>
                <p>담당자: {detail.assignedAdminId}</p>
                <p>접수일시: {formatDateTime(detail.openedAt)}</p>
                <p>종결일시: {formatDateTime(detail.closedAt)}</p>
            </section>

            <section>
                <h3>상태 변경</h3>
                {detail.caseStatus === "RECEIVED" && (
                    <button onClick={() => handleStatusChange("INVESTIGATING")}>
                        조사 시작 (RECEIVED → INVESTIGATING)
                    </button>
                )}
                {detail.caseStatus === "INVESTIGATING" && (
                    <div>
                        <p>최종 판정:</p>
                        <button onClick={() => handleFinalize("NORMAL")}>정상 거래로 종결</button>
                        <button onClick={() => handleFinalize("FRAUD")}>사기 거래로 종결</button>
                    </div>
                )}
                {isClosed && <p>이미 종결된 사건입니다.</p>}
            </section>

            {!isClosed && (
                <section>
                    <h3>담당자 배정</h3>
                    <select
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
                    <button onClick={handleAssign} disabled={assigning}>
                        {assigning ? "배정 중..." : "배정"}
                    </button>
                </section>
            )}
            {!isClosed && (
                <section>
                    <h3>카드·계좌 잠금 요청</h3>
                    {!targetType ? (
                        <p>이 거래의 유형을 확인할 수 없어 잠금 요청을 진행할 수 없습니다.</p>
                    ) : (
                        <>
                            <p>
                                거래유형: {getTransactionTypeLabel(detail.transactionType)} →
                                잠금 대상: {getRequestTargetTypeLabel(targetType)}
                            </p>
                            <select
                                value={lockReasonPreset}
                                onChange={(e) => setLockReasonPreset(e.target.value)}
                            >
                                <option value="">잠금 사유 선택</option>
                                {LOCK_REASON_PRESETS[targetType].map((reason) => (
                                    <option key={reason} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                            {lockReasonPreset === "기타" && (
                                <input
                                    type="text"
                                    placeholder="기타 사유 입력"
                                    value={customLockReason}
                                    onChange={(e) => setCustomLockReason(e.target.value)}
                                />
                            )}
                            <button onClick={handleLock}>잠금 요청</button>
                        </>
                    )}
                </section>
            )}
            <section>
                <h3>AI 탐지 정보</h3>
                <p>탐지결과ID: {detail.detection?.detectionResultId}</p>
                <p>이상확률: {formatProbabilityPercent(detail.detection?.fraudProbability)}</p>
                <p>예측결과: {getPredictedResultLabel(detail.detection?.predictedResult)}</p>
                <p>이상유형: {getPredictedFraudTypeLabel(detail.detection?.fraudType)}</p>
                <p>탐지근거: {detail.detection?.detectionReason ?? "-"}</p>
            </section>
            <section>
                <h3>처리이력</h3>
                {histories.length === 0 ? (
                    <p>이력이 없습니다.</p>
                ) : (
                    <ul>
                        {histories.map((h) => (
                            <li key={h.caseHistoryId}>
                                [{getFraudActionTypeLabel(h.actionType)}] {h.actionContent}
                                {h.previousStatus !== h.changedStatus && (
                                    <>
                                        {" — "}
                                        {getCaseStatusLabel(h.previousStatus)} → {getCaseStatusLabel(h.changedStatus)}
                                    </>
                                )}
                                {" ("}
                                {formatDateTime(h.createdAt)}
                                {", 담당자: "}
                                {h.adminId}
                                {")"}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default FraudCaseDetail;