// 관리자용, 도메인 분리
import axios from "axios";

const BASE_URL = 'http://localhost:9090';

// 상담 목록 - statuses 생략 시 전체(WAITING + IN_PROGRESS + CLOSED), adminId 있으면 "내 상담"만
export async function getSessions(statuses, adminId) {
    const response = await axios.get(`${BASE_URL}/admin/chats`, {
        params: {
            status: statuses,
            adminId,
        },
    });
    return response.data;
}

// 세션 열람 처리 - WAITING -> IN_PROGRESS 전환
export async function markSessionInProgress(sessionId, adminId) {
    await axios.patch(`${BASE_URL}/admin/chats/${sessionId}/read`, null, {
        params: { adminId },
    });
}

// 세션 ID로 직접 조회(메시지 이력 포함)
export async function getSessionById(sessionId) {
    const response = await axios.get(`${BASE_URL}/chat/sessions/${sessionId}`);
    return response.data;
}