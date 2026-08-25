// 관리자용, 도메인 분리
import axios from "axios";

const BASE_URL = 'http://localhost:9090';

// 미완료(WAITING + IN_PROGRESS) 세션 목록
export async function getActiveSession() {
    const response = await axios.get(`${BASE_URL}/admin/chats`);
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