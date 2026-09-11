import axios from "axios";

const BASE_URL = 'http://localhost:9090';
const AI_BASE_URL = 'http://localhost:8002';

// 활성 세션 조회 or 생성
export async function getOrCreateSession(userId) {
    const response = await axios.get(`${BASE_URL}/chat/sessions`, {
        params: { userId },
    });
    return response.data;
}

// 상담원 관련 진행 중 세션 있는지 가볍게 확인(위젯 열 때 배너 표시용, 메시지 이력 없음)
export async function getActiveAdminSession(userId) {
    const response = await axios.get(`${BASE_URL}/chat/sessions/active-admin`, {
        params: { userId },
    });
    return response.data; // { hasActiveSession, sessionId, status}
}

// 상담원 세션 조회 or 생성 - "상담원 연결" 액션(배너/고객센터)에서 호출
export async function getOrCreateAdminSession(userId) {
    const response = await axios.get(`${BASE_URL}/chat/sessions/admin`, {
        params: { userId },
    });
    return response.data;
}

// 새 대화 시작 - 현재 세션 닫기
export async function closeSession(sessionId) {
    await axios.post(`${BASE_URL}/chat/sessions/${sessionId}/close`)
}

// 자유입력 메시지 -> FastAPI 챗봇 서버로 전송 (의도분류 + 답변)
export async function sendFreeTextMessage(userId, sessionId, message) {
    const response = await axios.post(`${AI_BASE_URL}/chat`, {
        userId,
        sessionId,
        message
    });
    return response.data; // { reply, needsAdmin, navActions: [{path, label}] }
}

// 자유입력 메시지 저장(USER/BOT 공용) - FastAPI 응답 받은 후 호출해서 DB에 이력 남기기
export async function saveChatMessage(sessionId, senderType, senderId, content) {
    const response = await axios.post(`${BASE_URL}/chat/sessions/${sessionId}/messages`, {
        senderType,
        senderId,
        content
    });
    return response.data;
}

// 상담원 연결 요청 - 서버가 가장 한가한 관리자로 자동 배정
export async function requestAdmin(sessionId) {
    await axios.post(`${BASE_URL}/chat/sessions/${sessionId}/request-admin`);
}

// 사용자가 챗봇 위젯 열람 - 관리자 답장 읽음 처리
export async function markUserRead(sessionId) {
    await axios.patch(`${BASE_URL}/chat/sessions/${sessionId}/user-read`);
}