import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveSession } from "../../api/chat/adminChatAPI";

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

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>

    return (
        <div>
            <h2>상담 목록</h2>
            <button onClick={loadSessions}>새로고침</button>

            {sessions.length === 0 ? (
                <div>대기 중인 상담이 없습니다.</div>
            ) : (
                <div>
                    {sessions.map((session) => (
                        <div key={session.sessionId} onClick={() => navigate(`/admin/chats/${session.sessionId}`)}>
                            <span>{session.status === 'WAITING' ? '미확인' : '확인함'}</span>
                            <span>{session.userName}</span>
                            <p>{session.lastMessagePreview}</p>
                            <span>{session.createdAt?.slice(0, 16).replace('T', ' ')}</span>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminChatList;