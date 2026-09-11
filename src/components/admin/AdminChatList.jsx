import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { getActiveSession } from "../../api/chat/adminChatAPI";
import { formatDateTime } from "../../constants/fraud/fraudCaseLabels";
import { connectAdminChatSocket, disconnectChatSocket } from "../../api/chat/chatSocket";

const STATUS = {
    WAITING: { label: "대기중", color: "var(--red)", bg: "rgba(220, 38, 38, 0.12)" },
    IN_PROGRESS: { label: "상담중", color: "var(--green)", bg: "rgba(5, 150, 105, 0.12)"},
};

function AdminChatList() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function loadSessions() {
        setLoading(true);
        setError(null);
        getActiveSession()
            .then(setSessions)
            .catch(() => setError('상담 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    } 

    useEffect(() => {
        loadSessions();
    }, []);

    const [toast, setToast] = useState(null);
    useEffect(() => {
        const socket = connectAdminChatSocket(() => {
            loadSessions();
            setToast("새 메시지가 도착했습니다.");
            setTimeout(() => setToast(null), 2000);
        });
        return () => disconnectChatSocket(socket);
    }, []);

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

            <Panel
                title="1:1 상담 목록"
                sub={`총 ${sessions.length}건`}
                right={<button className="minibtn" onClick={loadSessions}>새로고침</button>}
            >
                <table>
                    <thead>
                        <tr>
                            <th>상태</th><th>고객</th><th>최근 메시지</th><th>요청시각</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)" }}>대기 중인 상담이 없습니다.</td></tr>
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