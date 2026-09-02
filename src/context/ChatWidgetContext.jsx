import { createContext, useContext, useState, useCallback } from "react";

const ChatWidgetContext = createContext(null);

// 챗봇 위젯을 다른 페이지(예: 고객센터)에서도 열고 제어할 수 있게 하는 컨텍스트
export function ChatWidgetProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [pendingAdminConnect, setPendingAdminConnect] = useState(false);

    // 챗봇을 열면서 바로 상담원 연결까지 요청(세션 생성은 비동기라 플래그로 예약)
    const openAdminChat = useCallback(() => {
        setOpen(true);
        setPendingAdminConnect(true);
    }, []);

    const clearPendingAdminConnect = useCallback(() => {
        setPendingAdminConnect(false);
    }, []);

    const value = { open, setOpen, pendingAdminConnect, clearPendingAdminConnect, openAdminChat };

    return (
        <ChatWidgetContext.Provider value={value}>
            {children}
        </ChatWidgetContext.Provider>
    );
}

export function useChatWidget() {
    const ctx = useContext(ChatWidgetContext);
    if (!ctx) throw new Error("useChatWidget은 ChatWidgetProvider 안에서만 사용할 수 있습니다.");
    return ctx;
}