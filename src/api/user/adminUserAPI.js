import { apiFetch } from "../apiClient";

// [D파트 담당자 추가] 관리자 - 전체 회원 목록 조회
export async function getAllUsers() {
  return apiFetch(`/api/admin/users`);
}

// [D파트 담당자 추가] 관리자 - 회원 상태 변경 (정지/해제)
export async function updateUserStatus(userId, status) {
  return apiFetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}