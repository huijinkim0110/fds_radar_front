import { apiFetch } from "../apiClient";

// 담당자 배정 드롭다운용: ADMIN 목록 조회
export async function getAssignableAdmins() {
    return apiFetch(`/api/admin/fraud-cases/assignable-admins`);
}

// 관리자 마이페이지: 내 담당 사건 목록
export async function getMyCases(adminId) {
    return apiFetch(`/api/admin/fraud-cases/mypage/my-cases?adminId=${adminId}`);
}

// 5차: 사건 목록 조회 (페이징)
export async function getFraudCaseList(page = 0, size = 20) {
    return apiFetch(`/api/admin/fraud-cases?page=${page}&size=${size}`);
}

// 5차: 사건 상세 조회
export async function getFraudCaseDetail(fraudCaseId) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}`);
}

// 6차: 사건 상태 변경
export async function updateFraudCaseStatus(fraudCaseId, caseStatus) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ caseStatus }),
    });
}

// 6차: 담당 관리자 배정
export async function assignFraudCaseAdmin(fraudCaseId, adminId) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}/assignee`, {
        method: 'PATCH',
        body: JSON.stringify({ adminId }),
    });
}

// 7차: 처리이력 조회
export async function getFraudCaseHistories(fraudCaseId) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}/histories`);
}

// 9차: 최종 판정
export async function finalizeFraudDecision(fraudCaseId, decision) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
    });
}

// 8차: 카드/계좌 잠금 요청
export async function requestFraudCaseLock(fraudCaseId, targetType, requestReason) {
    return apiFetch(`/api/admin/fraud-cases/${fraudCaseId}/lock`, {
        method: 'POST',
        body: JSON.stringify({ targetType, requestReason }),
    });
}