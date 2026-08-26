import { useState, useEffect } from "react";
import { getPendingLockRequests, processLockRequest } from "../../api/dispute/lockRequestAPI";
import { getRequestTargetTypeLabel, formatDateTime } from "../../constants/fraud/fraudCaseLabels";

function LockRequestApprovalModal({ onClose }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    async function fetchPending() {
        setLoading(true);
        setError(null);
        try {
            const data = await getPendingLockRequests();
            setRequests(data);
        } catch (err) {
            setError("대기 중인 잠금 요청을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPending();
    }, []);

    async function handleProcess(id, requestStatus) {
        const confirmMessage =
            requestStatus === "COMPLETED" ? "이 요청을 승인하시겠습니까?" : "이 요청을 반려하시겠습니까?";
        if (!window.confirm(confirmMessage)) return;

        setProcessingId(id);
        try {
            await processLockRequest(id, requestStatus);
            setRequests((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            alert("처리에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3>잠금 요청 처리 대기 목록</h3>
                    <button onClick={onClose}>닫기</button>
                </div>

                {loading && <p>불러오는 중...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && requests.length === 0 && (
                    <p>처리 대기 중인 잠금 요청이 없습니다.</p>
                )}

                {!loading && !error && requests.length > 0 && (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>요청ID</th>
                                <th>대상</th>
                                <th>사유</th>
                                <th>요청일시</th>
                                <th>처리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{getRequestTargetTypeLabel(r.targetType)}</td>
                                    <td>{r.requestReason}</td>
                                    <td>{formatDateTime(r.requestedAt)}</td>
                                    <td>
                                        <button
                                            disabled={processingId === r.id}
                                            onClick={() => handleProcess(r.id, "COMPLETED")}
                                        >
                                            승인
                                        </button>
                                        <button
                                            disabled={processingId === r.id}
                                            onClick={() => handleProcess(r.id, "REJECTED")}
                                        >
                                            반려
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const modalStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    minWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
};

export default LockRequestApprovalModal;