import { apiFetch } from "../apiClient";

// 회원정보 조회
export async function getUserProfile(userId) {
  return apiFetch(`/api/users/${userId}`);
}

// 회원정보 수정
export async function updateUserProfile(userId, userData) {
  return apiFetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}