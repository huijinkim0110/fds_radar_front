import axios from 'axios';

const BASE_URL = "http://localhost:9090";

// 관리자 처리 대기 중인 잠금 요청 목록
export async function getPendingLockRequests() {
    const response = await axios.get(`${BASE_URL}/api/locks/admin/pending`);
    return response.data;
}

// 관리자 승인/반려 처리
export async function processLockRequest(lockRequestId, requestStatus) {
    const response = await axios.patch(
        `${BASE_URL}/api/locks/admin/${lockRequestId}`,
        { requestStatus}
    );
    return response.data;
}

// 내 잠금 요청 목록 조회(챗봇 건수 안내용)
export async function getMyLockRequests(userId) {
    const response = await axios.get(`${BASE_URL}/api/locks`, {
        params: { userId },
    });
    return response.data;
}

// [D파트 담당자 추가] 관리자 대시보드 상태별 필터를 위해 전체/상태별 조회 API 호출 함수 추가
export async function getAdminLockRequests(status) {
    const response = await axios.get(`${BASE_URL}/api/locks/admin`, {
        params: status ? { requestStatus: status } : {},
    });
    return response.data;
}