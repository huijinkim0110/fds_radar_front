import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { markSessionInProgress, getSessionById } from "../../api/chat/adminChatAPI";
import { connectChatSocket, sendChatSocketMessage, disconnectChatSocket } from "../../api/chat/chatSocket";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const STATUS = {
    WAITING: { label: "대기중", color: "var(--amber)", bg: "rgba(217, 119, 6, 0.12)" },
    IN_PROGRESS: { label: "상담 진행중", color: "var(--green)", bg: "rgba(5, 150, 105, 0.12)" },
    CLOSED: { label: "상담 종료", color: "var(--muted)", bg: "rgba(107, 114, 128, 0.12)"},
};

function AdminChatRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const adminId = user?.userId;
    const adminName = user?.name ?? "상담원";

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!adminId) return;
        let cancelled = false;

        markSessionInProgress(sessionId, adminId)
            .then(() => {
                if (cancelled) return;

                getSessionById(sessionId).then((data) => {
                    if (cancelled) return;
                    setSession(data);
                    setMessages(data.mesages || []);
                });

                socketRef.current = connectChatSocket(sessionId, (msg) => {
                    setMessages((prev) => [...prev, msg]);
                });
            })
            .catch((err) => {
                if (cancelled) return;
                if (err.response?.status === 403) {
                    showToast(err.response.data?.message || "접근 권한이 없습니다.");
                    navigate('/mypage/admin-chats');
                    return;
                }
                alert("상담방을 불러오지 못했습니다.");
                navigate('/mypage/admin-chats');
            });
        
        return () => {
            cancelled = true;
            disconnectChatSocket(socketRef.current);
            socketRef.current = null;
        };
    }, [sessionId, adminId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    function handleSend() {
        if (!inputText.trim() || !socketRef.current) return;

        sendChatSocketMessage(socketRef.current, sessionId, 'ADMIN', adminId, inputText);
        setInputText('');
    }

    const status = STATUS[session?.status] ?? { label: session?.status ?? '', color: 'var(--muted)', bg: 'transparent' };

    return (
        <>
            <button className="minibtn" style={{ marginBottom: 12 }} onClick={() => navigate('/mypage/admin-chats')}>
                ← 목록으로
            </button>
            <TopBar title={`상담방 #${sessionId}`} crumb="관리자 / 상담" search={false} />

            <Panel
                title={session?.userName ?? `고객 #${session?.userId ?? ''}`}
                right={<span className="chip" style={{ color: status.color, background: status.bg }}>{status.label}</span>}
            >
                <div className="acr-thread" ref={scrollRef}>
                    {messages.length === 0 && <div className="acr-empty">대화 내역이 없습니다.</div>}
                    {messages.map((msg, idx) => {
                        if (msg.senderType === 'SYSTEM') {
                            return <div key={idx} className="acr-system">{msg.content}</div>;
                        }
                        const isAdmin = msg.senderType === 'ADMIN';
                        return (
                            <div key={idx} className={`acr-msg ${isAdmin ? 'admin' : 'user'}`}>
                                <div className="acr-sender">
                                    {msg.senderType === 'BOT' ? '챗봇' : isAdmin ? '나' : (session?.userName ?? `고객 #${session?.userId ?? ''}`)}
                                </div>
                                <div className="acr-bubble">{msg.content}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="acr-input">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSend();
                        }}
                    />
                    <button className="minibtn" onClick={handleSend}>전송</button>
                </div>
            </Panel>
        </>
    );
}

export default AdminChatRoom;