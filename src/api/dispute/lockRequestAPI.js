import axios from "axios";

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