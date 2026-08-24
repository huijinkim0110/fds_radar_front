import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrCreateSession, closeSession, sendFreeTextMessage, saveChatMessage } from "../../api/chat/chatAPI";
import { connectChatSocket, sendChatSocketMessage, disconnectChatSocket } from "../../api/chat/chatSocket";
import { CHAT_MENU_TREE, NOT_IMPLEMENTED_MESSAGE } from "../../constants/chat/chatMenuTree";
import { useChatActions } from "../../hooks/chat/useChatActions";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function ChatWidget() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [menuPath, setMenuPath] = useState([]);
    const [adminMode, setAdminMode] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    const socketRef = useRef(null);

    function addLocalMessage(senderType, content, navAction = null) {
        setMessages((prev) => [...prev, { senderType, content, navAction, createdAt: new Date().toISOString() }]);
    }

    const { runAction } = useChatActions(addLocalMessage, () => setMenuPath([]), enterAdminMode);

    useEffect(() => {
        if (!open || session) return;

        getOrCreateSession(TEMP_USER_ID).then((data) => {
            setSession(data);
            setMessages(data.messages || []);
        });
    }, [open]);

    useEffect(() => {
        return () => disconnectChatSocket(socketRef.current);
    }, []);

    function getCurrentMenu() {
        let node = CHAT_MENU_TREE;
        for (const key of menuPath) {
            node = node[key];
        }
        return node;
    }

    function handleMenuClick(key) {
        const currentMenu = getCurrentMenu();
        const nextNode = currentMenu[key];

        addLocalMessage('USER', key);

        if (nextNode.implemented === false) {
            addLocalMessage('BOT', NOT_IMPLEMENTED_MESSAGE);
            return;
        }

        if (nextNode.implemented === true) {
            runAction(nextNode);
            return;
        }

        setMenuPath((prev) => [...prev, key]);
    }

    function handleMenuBack() {
        setMenuPath((prev) => prev.slice(0, -1));
    }

    function handleNavigateClick(navAction) {
        navigate(navAction.path);
        setOpen(false);
    }

    function handleSendFreeText() {
        if (!inputText.trim() || !session) return;

        const text = inputText;
        addLocalMessage('USER', text);
        setInputText('');
        setSending(true);

        // 사용자 메시지 저장(화면 표시와 별개로 이력 보존)
        saveChatMessage(session.sessionId, 'USER', TEMP_USER_ID, text);

        sendFreeTextMessage(TEMP_USER_ID, session.sessionId, text)
            .then((result) => {
                addLocalMessage('BOT', result.reply);
                // 봇 응답 저장(senderId는 BOT이므로 null)
                saveChatMessage(session.sessionId, 'BOT', null, result.reply);

                if (result.needsAdmin && !adminMode) {
                    enterAdminMode();
                }
            })
            .catch(() => addLocalMessage('BOT', '오류가 발생했어요. 다시 시도해주세요.'))
            .finally(() => setSending(false));
    }

    function enterAdminMode() {
        setAdminMode(true);
        socketRef.current = connectChatSocket(session.sessionId, (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
    }

    function handleSendAdminMessage() {
        if (!inputText.trim() || !socketRef.current) return;

        sendChatSocketMessage(socketRef.current, session.sessionId, 'USER', TEMP_USER_ID, inputText);
        setInputText('');
    }

    function handleNewChat() {
        if (!session) return;
        if (!window.confirm('새 대화를 시작하시겠어요? 현재 대화는 이력에 저장돼요.')) return;

        disconnectChatSocket(socketRef.current);
        socketRef.current = null;

        closeSession(session.sessionId).then(() => {
            setSession(null);
            setMessages([]);
            setMenuPath([]);
            setAdminMode(false);
        });
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)}>
                챗봇
            </button>
        )
    }

    const currentMenu = getCurrentMenu();
    const menuKeys = currentMenu ? Object.keys(currentMenu).filter((k) => k !== 'implemented' && k !== 'action' && k !== 'payload') : [];

    return (
        <div>
            <div>
                <span>FDS Radar 챗봇</span>
                <button onClick={handleNewChat}>새 대화 시작</button>
                <button onClick={() => setOpen(false)}>닫기</button>
            </div>

            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.senderType}</strong>: {msg.content}
                        {msg.navAction && (
                            <button onClick={() => handleNavigateClick(msg.navAction)}>
                                {msg.navAction.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {!adminMode && menuPath.length > 0 && (
                <button onClick={handleMenuBack}>← 이전</button>
            )}

            {!adminMode && menuKeys.length > 0 && (
                <div>
                    {menuKeys.map((key) => (
                        <button key={key} onClick={() => handleMenuClick(key)}>
                            {key}
                        </button>
                    ))}
                </div>
            )}

            <div>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            adminMode ? handleSendAdminMessage() : handleSendFreeText();
                        }
                    }}
                />
                <button onClick={adminMode ? handleSendAdminMessage : handleSendFreeText} disabled={sending}>
                    전송
                </button>
            </div>
        </div>
    );
}

export default ChatWidget;