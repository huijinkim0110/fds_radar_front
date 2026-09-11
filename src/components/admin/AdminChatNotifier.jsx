import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { connectAdminChatSocket, disconnectChatSocket } from "../../api/chat/chatSocket";
import { getActiveSession } from "../../api/chat/adminChatAPI";

const POSITION_KEY = "adminNotifFabPosition"; // 브라우저(기기) 단위 위치 저장
const DRAG_THRESHOLD = 5; // 이 픽셀 이상 움직여야 드래그로 인정(클릭과 구분)

// 관리자로 로그인해 있는 동안 어느 페이지에 있든 새 상담 요청/메시지를 토스트 + 뱃지로 알림
function AdminChatNotifier() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [unhandledCount, setUnhandledCount] = useState(0);
    const [pos, setPos] = useState(null); // { left, top } - null이면 CSS 기본 위치 사용
    const dragState = useRef(null); // 드래그 중 좌표 추적용, 리렌더 필요 없음

    const isAdmin = user?.role === "ADMIN";

    // 저장된 위치 복원
    useEffect(() => {
        if (!isAdmin) return;
        const saved = localStorage.getItem(POSITION_KEY);
        if (saved) {
            try {
                setPos(JSON.parse(saved));
            } catch {
                // 저장값이 꺠져있으면 기본 위치(null) 유지
            }
        }
    }, [isAdmin]);

    function refreshCount() {
        getActiveSession()
            .then((sessions) => {
                const count = sessions.filter((s) => s.status === "WAITING" || s.adminUnread).length;
                setUnhandledCount(count);
            })
            .catch(() => {});
    }

    // 소켓 연결 - 새 상담 요청/메시지 이벤트마다 토스트 + 뱃지 갱신
    useEffect(() => {
        if (!isAdmin) return;

        refreshCount();

        const socket = connectAdminChatSocket(() => {
            showToast("새로운 상담 요청이 있습니다", () => navigate("/mypage/admin-chats"));
        });
    
        return () => disconnectChatSocket(socket);
    }, [isAdmin]);

    // 페이지 이동할 때마다 다시 세서, 상담방에서 읽고 나온 경우 등을 반영
    useEffect(() => {
        if (!isAdmin) return;
        refreshCount;
    }, [isAdmin, location.pathname]);

    // 드래그 시작 - 클릭인지 드래그인지는 mouseup 시점에 이동거리로 판단
    function handleMouseDown(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        dragState.current = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e) {
        const d = dragState.current;
        if (!d) return;
        if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD) {
            d.moved = true;
        }
        if (d.moved) {
            setPos({ left: e.clientX - d.offsetX, top: e.clientY - d.offsetY});
        }
    }

    function handleMouseUp() {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (dragState.current?.moved) {
            setPos((current) => {
                localStorage.setItem(POSITION_KEY, JSON.stringify(current));
                return current;
            });
        }
        dragState.current = null;
    }

    function handleClick() {
        // 드래그였으면 클릭(페이지 이동) 무시
        if (dragState.current?.moved) return;
        navigate("/mypage/admin-chats");
    }

    if (!isAdmin) return null;

    const style = pos ? { left: pos.left, top: pos.top, bottom: "auto", right: "auto" } : undefined;

    return (
        <button 
            className="admin-notif-fab" 
            style={style}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            aria-label="상담 요청 알림"
        >
            🔔
            {unhandledCount > 0 && <span className="admin-notif-badge">{unhandledCount}</span>}
        </button>
    );
}

export default AdminChatNotifier;