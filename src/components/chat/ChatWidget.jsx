import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrCreateSession, closeSession, sendFreeTextMessage, saveChatMessage } from "../../api/chat/chatAPI";
import { connectChatSocket, sendChatSocketMessage, disconnectChatSocket } from "../../api/chat/chatSocket";
import { CHAT_MENU_TREE, NOT_IMPLEMENTED_MESSAGE, REQUIRES_AUTH_MESSAGE } from "../../constants/chat/chatMenuTree";
import { useChatActions } from "../../hooks/chat/useChatActions";
import { useChatWidget } from "../../context/ChatWidgetContext";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

function ChatWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const { open, setOpen, pendingAdminConnect, clearPendingAdminConnect } = useChatWidget();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [menuPath, setMenuPath] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  function addLocalMessage(senderType, content, navActions = []) {
    setMessages((prev) => [...prev, { senderType, content, navActions, createdAt: new Date().toISOString() }]);
  }

  const { runAction } = useChatActions(addLocalMessage, () => setMenuPath([]), enterAdminMode);

  useEffect(() => {
    if (!open || session) return;
    getOrCreateSession(TEMP_USER_ID).then((data) => {
      setSession(data);
      setMessages(data.messages || []);
    });
  }, [open, session]);

  useEffect(() => {
    return () => disconnectChatSocket(socketRef.current);
  }, []);

  // 고객센터 등 다른 페이지에서 "상담원 연결" 요청이 예약되어 있으면, 세션이 준비되는 대로 자동 연결
  useEffect(() => {
    if (pendingAdminConnect && session && !adminMode) {
      enterAdminMode();
      clearPendingAdminConnect();
    }
  }, [pendingAdminConnect, session, adminMode]);

  // 메시지 늘어나면 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function getCurrentMenu() {
    let node = CHAT_MENU_TREE;
    for (const key of menuPath) node = node[key];
    return node;
  }

  function handleMenuClick(key) {
    const currentMenu = getCurrentMenu();
    const nextNode = currentMenu[key];
    addLocalMessage("USER", key);

    if (nextNode.implemented === false) {
      addLocalMessage("BOT", NOT_IMPLEMENTED_MESSAGE);
      return;
    }

    if (nextNode.requiresAuth && !isLoggedIn) {
      addLocalMessage('BOT', REQUIRES_AUTH_MESSAGE, { path: '/login', label: '로그인하러 가기'});
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
    addLocalMessage("USER", text);
    setInputText("");
    setSending(true);
    saveChatMessage(session.sessionId, "USER", TEMP_USER_ID, text);

    sendFreeTextMessage(TEMP_USER_ID, session.sessionId, text)
      .then((result) => {
        addLocalMessage("BOT", result.reply, result.navActions);
        saveChatMessage(session.sessionId, "BOT", null, result.reply);
        if (result.needsAdmin && !adminMode) enterAdminMode();
      })
      .catch(() => addLocalMessage("BOT", "오류가 발생했어요. 다시 시도해주세요."))
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
    sendChatSocketMessage(socketRef.current, session.sessionId, "USER", TEMP_USER_ID, inputText);
    setInputText("");
  }

  function handleNewChat() {
    if (!session) return;
    const confirmMessage = adminMode
      ? "상담을 종료하시겠어요? 현재 대화는 이력에 저장돼요."
      : "새 대화를 시작하시겠어요? 현재 대화는 이력에 저장돼요.";
    if (!window.confirm(confirmMessage)) return;

    const wasAdminMode = adminMode;
    disconnectChatSocket(socketRef.current);
    socketRef.current = null;

    closeSession(session.sessionId).then(() => {
      setSession(null);
      setMessages(wasAdminMode
        ? [{ senderType: "BOT", content: "상담이 종료되었습니다.", createdAt: new Date().toISOString() }]
        : []);
      setMenuPath([]);
      setAdminMode(false);
      clearPendingAdminConnect();
    });
  }

  // 닫힌 상태: 플로팅 버튼
  if (!open) {
    return (
      <button className="cw-fab" onClick={() => setOpen(true)} aria-label="상담 챗봇 열기">
        💬
      </button>
    );
  }

  const currentMenu = getCurrentMenu();
  const menuKeys = currentMenu
    ? Object.keys(currentMenu).filter((k) => k !== "implemented" && k !== "action" && k !== "payload")
    : [];

  return (
    <div className="cw-panel">
      {/* 헤더 */}
      <div className="cw-head">
        <div className="cw-head-title">
          <span className="cw-dot" />
          FDS Radar 상담
          {adminMode && <span className="cw-live">상담원 연결됨</span>}
        </div>
        <div className="cw-head-btns">
          <button className="cw-newchat" onClick={handleNewChat}>
            {adminMode ? "상담 종료" : "새 대화"}
          </button>
          <button className="cw-close" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="cw-body" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="cw-empty">무엇을 도와드릴까요?<br />아래 메뉴에서 선택하거나 직접 입력해 주세요.</div>
        )}
        {messages.map((msg, idx) => {
          const isUser = msg.senderType === "USER";
          return (
            <div key={idx} className={`cw-msg ${isUser ? "user" : "bot"}`}>
              <div className="cw-bubble">
                {msg.content}
                {msg.navActions?.length > 0 && (
                  <div className="cw-navs">
                    {msg.navActions.map((nav, i) => (
                      <button key={`${nav.path}-${i}`} className="cw-nav-btn" onClick={() => handleNavigateClick(nav)}>
                        {nav.label} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 메뉴 버튼 (관리자 모드 아닐 때만) */}
      {!adminMode && (
        <div className="cw-menu">
          {menuPath.length > 0 && (
            <button className="cw-back" onClick={handleMenuBack}>← 이전</button>
          )}
          <div className="cw-menu-btns">
            {menuKeys.map((key) => (
              <button key={key} className="cw-menu-btn" onClick={() => handleMenuClick(key)}>
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div className="cw-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              adminMode ? handleSendAdminMessage() : handleSendFreeText();
            }
          }}
        />
        <button
          className="cw-send"
          onClick={adminMode ? handleSendAdminMessage : handleSendFreeText}
          disabled={sending}
        >
          {sending ? "…" : "전송"}
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;