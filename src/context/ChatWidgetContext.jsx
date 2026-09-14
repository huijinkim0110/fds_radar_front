import { createContext, useContext, useState, useCallback, useRef } from "react";
import { useToast } from "./ToastContext";

const ChatWidgetContext = createContext(null);

const CLICK_LIMIT = 5; // 이 횟수만큼 연속 클릭하면 잠금
const CLICK_WINDOW_MS = 10000; // 이 시간(10초) 안에 일어난 클릭만 셈
const COOLDOWN_MS = 30000; // 잠긴 뒤 다시 시도 가능해지기까지의 시간(30초)

// 챗봇 위젯을 다른 페이지(예: 고객센터)에서도 열고 제어할 수 있게 하는 컨텍스트
export function ChatWidgetProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [pendingAdminConnect, setPendingAdminConnect] = useState(false);
    const { showToast } = useToast();

    const clickTimestamps = useRef([]); // 최근 클릭 시각들ㄹ(윈도우 내에서만 유지)
    const cooldownUntil = useRef(0); // 이 시각까지는 무시

    // 챗봇을 열면서 바로 상담원 연결까지 요청(세션 생성은 비동기라 플래그로 예약)
    const openAdminChat = useCallback(() => {
        const now = Date.now();

        if (now < cooldownUntil.current) {
            setOpen(true);
            showToast("이미 진행 중인 상담이 있어요. 채팅창을 이용해주세요.");
            return;
        }

        clickTimestamps.current = clickTimestamps.current.filter((t) => now - t < CLICK_WINDOW_MS);
        clickTimestamps.current.push(now);

        if (clickTimestamps.current.length >= CLICK_LIMIT) {
            cooldownUntil.current = now + COOLDOWN_MS;
            clickTimestamps.current = [];
            setOpen(true);
            showToast("이미 진행 중인 상담이 있어요. 채팅창을 이용해주세요.");
        }
        
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