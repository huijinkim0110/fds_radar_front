import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markSessionInProgress, getSessionById } from "../../api/chat/adminChatAPI";
import { connectChatSocket, sendChatSocketMessage, disconnectChatSocket } from "../../api/chat/chatSocket";

const TEMP_ADMIN_ID = 1;

function AdminChatRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        markSessionInProgress(sessionId, TEMP_ADMIN_ID);

        // 기존 대화 이력 코드
        getSessionById(sessionId).then((data) => {
            setMessages(data.messages || []);
        });

        socketRef.current = connectChatSocket(sessionId, (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => disconnectChatSocket(socketRef.current);
    }, [sessionId]);

    function handleSend() {
        if (!inputText.trim() || !socketRef.current) return;

        sendChatSocketMessage(socketRef.current, sessionId, 'ADMIN', TEMP_ADMIN_ID, inputText);
        setInputText('');
    }

    return (
        <div>
            <button onClick={() => navigate('/admin/chats')}>← 목록으로</button>
            <h2>상담방 #{sessionId}</h2>

            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.senderType}</strong>: {msg.content}
                    </div>
                ))}
            </div>

            <div>
                <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="메시지를 입력하세요."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                />
                <button onClick={handleSend}>전송</button>
            </div>
        </div>
    );
}

export default AdminChatRoom;