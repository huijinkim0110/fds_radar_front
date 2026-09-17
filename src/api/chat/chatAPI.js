import { apiFetch } from '../apiClient';

const AI_BASE_URL = 'http://localhost:8002';

// 활성 세션 조회 or 생성
export async function getOrCreateSession(guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions${query}`);
}

// 상담원 관련 진행 중 세션 있는지 확인
export async function getActiveAdminSession(guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/active-admin${query}`);
}

// 상담원 세션 조회 or 생성
export async function getOrCreateAdminSession(guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/admin${query}`);
}

// 새 대화 시작 - 현재 세션 닫기
export async function closeSession(sessionId, guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/${sessionId}/close${query}`, { method: 'POST' });
}

// 자유입력 메시지 -> FastAPI 챗봇 서버 (백엔드 인증과 무관, 그대로 axios 유지 가능)
export async function sendFreeTextMessage(sessionId, message, guestId) {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${AI_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId, message, guestId: token ? null : guestId }),
    });
    return response.json();
}

// 메시지 저장(USER/BOT 공용)
export async function saveChatMessage(sessionId, senderType, senderId, content, guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/${sessionId}/messages${query}`, {
        method: 'POST',
        body: JSON.stringify({ senderType, senderId, content }),
    });
}

// 상담원 연결 요청
export async function requestAdmin(sessionId, guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/${sessionId}/request-admin${query}`, { method: 'POST' });
}

// 관리자 답장 읽음 처리
export async function markUserRead(sessionId, guestId) {
    const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : '';
    return apiFetch(`/chat/sessions/${sessionId}/user-read${query}`, { method: 'PATCH' });
}

// 내 상담 내역 조회 (로그인 필수 - 게스트 지원 안 함)
export async function getSessionHistory() {
    return apiFetch('/chat/sessions/history');
}