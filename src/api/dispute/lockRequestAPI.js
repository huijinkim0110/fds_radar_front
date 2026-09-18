import { apiFetch } from "../apiClient";

// 관리자 처리 대기 중인 잠금 요청 목록
export async function getPendingLockRequests() {
    return apiFetch(`/api/locks/admin/pending`);
}

// 관리자 승인/반려 처리
export async function processLockRequest(lockRequestId, requestStatus) {
    return apiFetch(`/api/locks/admin/${lockRequestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ requestStatus }),
    });
}

// 내 잠금 요청 목록 조회(챗봇 건수 안내용)
export async function getMyLockRequests(userId) {
    return apiFetch(`/api/locks?userId=${userId}`);
}

// [D파트 담당자 추가] 관리자 대시보드 상태별 필터를 위해 전체/상태별 조회 API 호출 함수 추가
export async function getAdminLockRequests(status) {
    return apiFetch(status ? `/api/locks/admin?requestStatus=${status}` : `/api/locks/admin`);
}

// [D파트 담당자 추가] 완료된 잠금 요청 해제 API 호출 함수
export async function releaseLockRequest(lockRequestId) {
    return apiFetch(`/api/locks/admin/${lockRequestId}/release`, {
        method: 'PATCH',
    });
}