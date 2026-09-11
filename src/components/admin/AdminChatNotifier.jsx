import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { connectAdminChatSocket, disconnectChatSocket } from "../../api/chat/chatSocket";

// 관리자로 로그인해 있는 동안 어느 페이지에 있든 새 상담 요청/메시지를 토스트로 알림
function AdminChatNotifier() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== "ADMIN") return;

        const socket = connectAdminChatSocket(() => {
            showToast("새로운 상담 요청이 있습니다", () => navigate("/mypage/admin-chats"));
        });

        return () => disconnectChatSocket(socket);
    }, [user?.role]);

    return null;
}

export default AdminChatNotifier;