import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getSessions } from "../../api/chat/adminChatAPI";
import { formatDateTime } from "../../constants/fraud/fraudCaseLabels";
import { connectAdminChatSocket, disconnectChatSocket } from "../../api/chat/chatSocket";

const STATUS = {
    WAITING: { label: "대기중", color: "var(--red)", bg: "rgba(220, 38, 38, 0.12)" },
    IN_PROGRESS: { label: "상담중", color: "var(--green)", bg: "rgba(5, 150, 105, 0.12)"},
    CLOSED: { label: "상담 종료", color: "var(--muted)", bg: "rgba(107, 114, 128, 0.12)"},
};

// 상태 필터 버튼 목록(다중 선택)
const STATUS_OPTIONS = [
    { value: "WAITING", label: "대기중" },
    { value: "IN_PROGRESS", label: "상담중" },
    { value: "CLOSED", label: "상담 종료" },
];

function AdminChatList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const adminId = user?.userId;

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scope, setScope] = useState("all"); // "all" | "mine"
    const [statusFilters, setStatusFilters] = useState([]);

    function loadSessions() {
        setLoading(true);
        setError(null);
        getSessions(statusFilters, scope === "mine" ? adminId : undefined)
            .then(setSessions)
            .catch(() => setError('상담 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    } 

    useEffect(() => {
        loadSessions();
    }, [scope, statusFilters, adminId]);

    function toggleStatusFilter(value) {
        setStatusFilters((prev) => 
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }

    const [toast, setToast] = useState(null);
    useEffect(() => {
        const socket = connectAdminChatSocket(() => {
            loadSessions();
            setToast("새 메시지가 도착했습니다.");
            setTimeout(() => setToast(null), 2000);
        });
        return () => disconnectChatSocket(socket);
    }, [scope, statusFilters, adminId]);

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>

    return (
        <>
            {toast && (
                <div style={{
                    position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
                    zIndex: 2000, padding: "12px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                    color: "#fff", background: "#2563EB", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}>
                    {toast}
                </div>
            )}

            <TopBar title="상담 관리" crumb="관리자 / 상담" search={false} />

            {/* 상태 필터 버튼(다중선택) */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {STATUS_OPTIONS.map((opt) => {
                    const active = statusFilters.includes(opt.value);
                    const s = STATUS[opt.value];
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            className="minibtn"
                            onClick={() => toggleStatusFilter(opt.value)}
                            style={{
                                padding: "10px 22px",
                                fontSize: 14,
                                fontWeight: active ? "bold" : "normal",
                                ...(active ? { color: s.color, background: s.bg, borderColor: s.color } : {}),
                            }}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            {/* 보기 범위 폴더형 탭 */}
            <div style={{ display: "flex" }}>
                <div
                    onClick={() => setScope("all")}
                    style={{
                        cursor: "pointer", padding: "10px 24px", fontSize: 14,
                        fontWeight: scope === "all" ? "bold" : "normal",
                        border: "1px solid var(--border-color)", borderBottom: scope === "all" ? "none" : "1px solid var(--border-color)",
                        borderRadius: "8px 8px 0 0",
                        background: scope === "all" ? "var(--panel-bg, #fff)" : "rgba(0,0,0,0.03)",
                        position: "relative", top: 1,
                    }}
                >
                    전체 상담
                </div>
                <div
                    onClick={() => setScope("mine")}
                    style={{
                        cursor: "pointer", padding: "10px 24px", fontSize: 14,
                        fontWeight: scope === "mine" ? "bold" : "normal",
                        border: "1px solid var(--border-color)", borderBottom: scope === "mine" ? "none" : "1px solid var(--border-color)",
                        borderRadius: "8px 8px 0 0",
                        background: scope === "mine" ? "var(--panel-bg, #fff)" : "rgba(0,0,0,0.03)",
                        position: "relative", top: 1,
                    }}
                >
                    내 상담
                </div>
            </div>

            <Panel
                sub={`총 ${sessions.length}건`}
                right={<button className="minibtn" onClick={loadSessions}>새로고침</button>}
                style={{ borderRadius: "0 8px 8px 8px" }}
            >
                <table>
                    <thead>
                        <tr>
                            <th>상태</th><th>고객</th><th>최근 메시지</th><th>요청시각</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)" }}>상담 내역이 없습니다.</td></tr>
                        )}
                        {sessions.map((session) => {
                            const s = STATUS[session.status] ?? { label: session.status, color: "var(--muted)", bg: "transparent" };
                            return (
                                <tr key={session.sessionId} style={{ cursor: "pointer" }} onClick={() => navigate(`/mypage/admin-chats/${session.sessionId}`)}>
                                    <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                                    <td>
                                        {session.adminUnread && (
                                            <span className="fdot" style={{ display: "inline-block", backgroung: "var(--red)", marginRight: 6 }} />
                                        )}
                                        {session.userName}
                                    </td>
                                    <td style={{ fontSize: 12.5}}>{session.lastMessagePreview}</td>
                                    <td style={{ fontSize: 11.5, color: "var(--muted)"}}>{formatDateTime(session.createdAt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>                
            </Panel>
        </>
    );
}

export default AdminChatList;