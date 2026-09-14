import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useChatWidget } from "../../context/ChatWidgetContext.jsx";
import { getSessionHistory } from "../../api/chat/chatAPI";

const STATUS_LABELS = {
    WAITING: "상담원 연결 대기중",
    IN_PROGRESS: "상담 진행중",
    CLOSED: "상담 종료",
};

const STATUS_COLORS = {
    WAITING: "#f59e0b",
    IN_PROGRESS: "#22c55e",
    CLOSED: "var(--muted)",
};

function formatDateTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatHistory() {
    const { user } = useAuth();
    const userId = user?.userId;
    const { setOpen, openAdminChat } = useChatWidget();

    const [sessions, setSessions] = useState(null);

    useEffect(() => {
        if (!userId) return;
        getSessionHistory(userId).then(setSessions).catch(() => setSessions([]));
    }, [userId]);

    function handleSessionClick(session) {
        if (session.status === "CLOSED") return;
        // 진행중/대기중인 상담은 챗봇 위젯을 열어 이어서 상담
        openAdminChat();
    }

    return (
        <>
            <TopBar title="상담 내역" crumb="홈 / 내 정보 / 상담 내역" search={false} />
            <Panel title="상담원 상담 내역" sub="1:1 상담 내역을 확인할 수 있어요." />

            {sessions === null ? (
                <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                    불러오는 중
                </div>
            ) : sessions.length === 0 ? (
                <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                    상담 내역이 없습니다.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sessions.map((session) => {
                        const clickable = session.status !== "CLOSED";
                        return (
                            <div
                                key={session.sessionId}
                                onClick={() => handleSessionClick(session)}
                                style={{
                                    padding: "16px 20px",
                                    borderRadius: "10px",
                                    border: "1px solid var(--line)",
                                    background: "var(--panel2)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    cursor: clickable ? "pointer" : "default",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{fontSize: "12px", fontWeight: "700", color: STATUS_COLORS[session.status] }}>
                                        ● {STATUS_LABELS[session.status] || session.status}
                                    </span>
                                    {session.assignedAdminName && (
                                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                                            담당: {session.assignedAdminName}
                                        </span>
                                    )}
                                </div>

                                <div style={{ fontSize: "13px", color: "var(--ink)" }}>
                                    {session.lastMessagePreview || "대화 내용이 없습니다."}
                                </div>

                                <div
                                    style={{
                                        marginTop: "4px",
                                        paddingTop: "10px",
                                        borderTop: "1px solid var(--line)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "12px",
                                        color: "var(--muted)",
                                    }}
                                >
                                    <span>{formatDateTime(session.createdAt)} 시작</span>
                                    {session.status === "CLOSED" && <span>{formatDateTime(session.closedAt)} 종료</span>}
                                    {clickable && <span style={{ color: "var(--blue)", fontWeight: 600 }}>이어서 상담하기 →</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}