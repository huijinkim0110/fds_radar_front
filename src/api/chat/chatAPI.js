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
    return response.data; // { reply, needsAdmin }
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