import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getOrCreateSession,
  getActiveAdminSession,
  getOrCreateAdminSession,
  closeSession,
  sendFreeTextMessage,
  saveChatMessage,
  requestAdmin,
  markUserRead,
} from "../../api/chat/chatAPI";
import { connectChatSocket, sendChatSocketMessage, disconnectChatSocket } from "../../api/chat/chatSocket";
import { CHAT_MENU_TREE, NOT_IMPLEMENTED_MESSAGE, REQUIRES_AUTH_MESSAGE } from "../../constants/chat/chatMenuTree";
import { useChatActions } from "../../hooks/chat/useChatActions";
import { useChatWidget } from "../../context/ChatWidgetContext";

function ChatWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.userId ?? 1;
  const isLoggedIn = !!user;

  const { open, setOpen, pendingAdminConnect, clearPendingAdminConnect } = useChatWidget();

  // 봇 대화(OPEN 세션) - 위젯 열면 항상 자동으로 이어감
  const [botSession, setBotSession] = useState(null);
  const [botMessages, setBotMessages] = useState([]);
  const [menuPath, setMenuPath] = useState([]);

  // 상담원 대화(WAITING/IN_PROGRESS 세션) - 봇과 별개 트랙, "상담원 연결" 액션 시에만 생성/로드
  const [showAdminTab, setShowAdminTab] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminBanner, setAdminBanner] = useState(false); // 탭이 뜨기 전, 진행 중인 상담이 있음을 알리는 배너

  const [activeTab, setActiveTab] = useState("bot"); // 'bot' | 'admin'
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  function addLocalMessage(senderType, content, navActions = []) {
    setBotMessages((prev) => [...prev, { senderType, content, navActions, createdAt: new Date().toISOString() }]);
  }

  const { runAction } = useChatActions(addLocalMessage, () => setMenuPath([]), connectAdmin);

  // 봇 세션은 위젯을 열면 항상 자동으로 불러옴(기존 동작 그대로)
  useEffect(() => {
    if (!open || botSession) return;
    getOrCreateSession(userId).then((data) => {
      setBotSession(data);
      setBotMessages(data.messages || []);
    });
  }, [open, botSession]);

  // 상담원 세션은 자동으로 안 불러오고, 진행 중인 상담이 있는지만 가볍게 확인해서 배너로 알림
  useEffect(() => {
    if (!open || showAdminTab) return;
    getActiveAdminSession(userId).then((data) => {
      setAdminBanner(data.hasActiveSession);
    });
  }, [open, showAdminTab]);

  // 위젯을 열면(상담원 탭이 있으면) 관리자 답장 읽음 처리
  useEffect(() => {
    if (open && adminSession) markUserRead(adminSession.sessionId);
  }, [open, adminSession]);

  useEffect(() => {
    return () => disconnectChatSocket(socketRef.current);
  }, []);

  // 고객센터 등 다른 페이지에서 "상담원 연결" 요청이 예약되어 있으면 자동 연결
  useEffect(() => {
    if (pendingAdminConnect) {
      connectAdmin();
      clearPendingAdminConnect();
    }
  }, [pendingAdminConnect]);

  // 메시지 늘어나면 맨 아래로 스크롤(현재 보고 있는 탭 기준)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [botMessages, adminMessages, activeTab]);

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
      addLocalMessage("BOT", REQUIRES_AUTH_MESSAGE, [{ path: "/login", label: "로그인하러 가기" }]);
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
    if (!inputText.trim() || !botSession) return;
    const text = inputText;
    addLocalMessage("USER", text);
    setInputText("");
    setSending(true);
    saveChatMessage(botSession.sessionId, "USER", userId, text);

    sendFreeTextMessage(userId, botSession.sessionId, text)
      .then((result) => {
        addLocalMessage("BOT", result.reply, result.navActions);
        saveChatMessage(botSession.sessionId, "BOT", null, result.reply);
        if (result.needsAdmin) connectAdmin();
      })
      .catch(() => addLocalMessage("BOT", "오류가 발생했어요. 다시 시도해주세요."))
      .finally(() => setSending(false));
  }

  // 상담원 연결 - 배너 클릭 / 봇의 needsAdmin / 고객센터 페이지 요청 / 종료 후 재연결에서 공통으로 호출
  function connectAdmin() {
    setShowAdminTab(true);
    setAdminBanner(false);
    setActiveTab("admin");

    getOrCreateAdminSession(userId).then((data) => {
      setAdminSession(data);
      setAdminMessages(data.messages || []);
      requestAdmin(data.sessionId).catch(() => {});

      disconnectChatSocket(socketRef.current);
      socketRef.current = connectChatSocket(data.sessionId, (msg) => {
        setAdminMessages((prev) => [...prev, msg]);
        if (open) markUserRead(data.sessionId);
      });
    });
  }

  function handleSendAdminMessage() {
    if (!inputText.trim() || !socketRef.current || !adminSession) return;
    sendChatSocketMessage(socketRef.current, adminSession.sessionId, "USER", userId, inputText);
    setInputText("");
  }

  // 봇 대화 초기화 - 상담원 탭에는 영향 없음
  function handleNewChat() {
    if (!botSession) return;
    if (!window.confirm("새 대화를 시작하시겠어요? 현재 대화는 이력에 저장돼요.")) return;

    closeSession(botSession.sessionId).then(() => {
      setBotSession(null);
      setBotMessages([]);
      setMenuPath([]);
    });
  }

  // 상담원 대화 종료 - 탭은 남기고 세션만 종료 표시
  function handleEndAdminChat() {
    if (!adminSession) return;
    if (!window.confirm("상담을 종료하시겠어요? 현재 대화는 이력에 저장돼요.")) return;

    disconnectChatSocket(socketRef.current);
    socketRef.current = null;

    closeSession(adminSession.sessionId).then(() => {
      setAdminSession((prev) => (prev ? { ...prev, status: "CLOSED" } : prev));
    });
  }

  // 닫힌 상태 : 플로팅 버튼
  if (!open) {
    return (
      <button className="cw-fab" onClick={() => setOpen(true)} aria-label="상담 챗봇 열기">
        💬
      </button>
    );
  }

  const currentMenu = getCurrentMenu();
  const menuKeys = currentMenu ? Object.keys(currentMenu).filter((k) => k !== "implemented" && k !== "action" && k !== "payload") : [];

  const isAdminEnded = adminSession?.status === "CLOSED";

  return (
    <div className="cw-panel">
      {/* 헤더 */}
      <div className="cw-head">
        <div className="cw-head-title">
          <span className="cw-dot" />
          FDS Radar 상담
          {activeTab === "admin" && adminSession?.status === "IN_PROGRESS" && (
            <span className="cw-live">상담원 연결됨</span>
          )}
        </div>
        <div className="cw-head-btns">
          {activeTab === "bot" && (
            <button className="cw-newchat" onClick={handleNewChat}>새 대화</button>
          )}
          {activeTab === "admin" && !isAdminEnded && (
            <button className="cw-newchat" onClick={handleEndAdminChat}>상담 종료</button>
          )}
          <button className="cw-close" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>

      {/* 탭 - 상담원 세션이 한 번이라도 생긴 뒤에만 표시 */}
      {showAdminTab && (
        <div className="cw-tabs">
          <button className={activeTab === "bot" ? "cw-tab on" : "cw-tab"} onClick={() => setActiveTab("bot")}>
            봇 상담
          </button>
          <button className={activeTab === "admin" ? "cw-tab on" : "cw-tab"} onClick={() => setActiveTab("admin")}>
            상담원 상담
          </button>
        </div>
      )}

      {/* 진행 중인 상담원 세션 배너 - 탭이 아직 없을 때만 노출 */}
      {!showAdminTab && adminBanner && (
        <div className="cw-banner" onClick={connectAdmin}>
          진행 중인 상담이 있어요 · 이어서 상담하기
        </div>
      )}

      {activeTab === "bot" ? (
        <>
          {/* 메시지 영역 */}
          <div className="cw-body" ref={scrollRef}>
            {botMessages.length === 0 && (
              <div className="cw-empty">무엇을 도와드릴까요?<br />아래 메뉴에서 선택하거나 직접 입력해주세요.</div>
            )}
            {botMessages.map((msg, idx) => {
              if (msg.senderType === "SYSTEM") {
                return <div key={idx} className="cw-system">{msg.content}</div>;
              }
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

          {/* 메뉴 버튼 */}
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

          {/* 입력창 */}
          <div className="cw-input">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="메시지를 입력하세요"
              onKeyDown={(e) => {if (e.key === "Enter") handleSendFreeText();}}
            />
            <button className="cw-send" onClick={handleSendFreeText} disabled={sending}>
              {sending ? "..." : "전송"}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 상담원 대화 메시지 영역 */}
          <div className="cw-body" ref={scrollRef}>
            {!adminSession && (
              <div className="cw-empty">상담원 세션을 불러오는 중이에요...</div>
            )}
            {adminMessages.map((msg, idx) => {
              if (msg.senderType === "SYSTEM") {
                return <div key={idx} className="cw-system">{msg.content}</div>;
              }
              const isUser = msg.senderType === "USER";
              return (
                <div key={idx} className={`cw-msg ${isUser ? "user" : "bot"}`}>
                  <div className="cw-bubble">{msg.content}</div>
                </div>
              );
            })}
            {isAdminEnded && <div className="cw-system">상담이 종료되었습니다.</div>}
          </div>

          {isAdminEnded ? (
            <div className="cw-menu">
              <button className="cw-menu-btn" onClick={connectAdmin}>상담원 다시 연결하기</button>
            </div>
          ) : (
            <div className="cw-input">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="메시지를 입력하세요"
                onKeyDown={(e) => { if (e.key === "Enter") handleSendAdminMessage(); }}
              />
              <button className="cw-send" onClick={handleSendAdminMessage} disabled={sending}>
                전송
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ChatWidget;