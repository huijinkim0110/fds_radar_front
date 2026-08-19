import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 담당자 배정 드롭다운용: ADMIN 목록 조회
export async function getAssignableAdmins() {
    const response = await axios.get(`${BASE_URL}/api/admin/fraud-cases/assignable-admins`);
    return response.data;
}

// 5차: 사건 목록 조회 (페이징)
export async function getFraudCaseList(page = 0, size = 20) {
    const response = await axios.get(`${BASE_URL}/api/admin/fraud-cases`, {
        params: { page, size },
    });
    return response.data;
}

// 5차: 사건 상세 조회
export async function getFraudCaseDetail(fraudCaseId) {
    const response = await axios.get(`${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}`);
    return response.data;
}

// 6차: 사건 상태 변경
export async function updateFraudCaseStatus(fraudCaseId, caseStatus) {
    const response = await axios.patch(
        `${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}/status`,
        { caseStatus }
    );
    return response.data;
}

// 6차: 담당 관리자 배정
export async function assignFraudCaseAdmin(fraudCaseId, adminId) {
    const response = await axios.patch(
        `${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}/assignee`,
        { adminId }
    );
    return response.data;
}

// 7차: 처리이력 조회
export async function getFraudCaseHistories(fraudCaseId) {
    const response = await axios.get(
        `${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}/histories`
    );
    return response.data;
}

// 9차: 최종 판정
export async function finalizeFraudDecision(fraudCaseId, decision) {
    const response = await axios.patch(
        `${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}/decision`,
        { decision }
    );
    return response.data;
}

// 8차: 카드/계좌 잠금 요청
export async function requestFraudCaseLock(fraudCaseId, targetType, requestReason) {
    const response = await axios.post(
        `${BASE_URL}/api/admin/fraud-cases/${fraudCaseId}/lock`,
        { targetType, requestReason }
    );
    return response.data;
}