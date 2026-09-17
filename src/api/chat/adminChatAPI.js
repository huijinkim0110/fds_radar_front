import { apiFetch } from '../apiClient';

// 상담 목록 - statuses 생략 시 전체, myOnly=true면 "내 상담"만
export async function getSessions(statuses, myOnly = false) {
    const params = new URLSearchParams();
    (statuses || []).forEach((s) => params.append('status', s));
    if (myOnly) params.append('myOnly', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/admin/chats${query}`);
}

// 세션 열람 처리 - WAITING -> IN_PROGRESS 전환
export async function markSessionInProgress(sessionId) {
    return apiFetch(`/admin/chats/${sessionId}/read`, { method: 'PATCH' });
}

// 세션 ID로 직접 조회(메시지 이력 포함)
export async function getSessionById(sessionId) {
    return apiFetch(`/chat/sessions/${sessionId}`);
}